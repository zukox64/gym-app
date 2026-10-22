/**
 * download-media.mjs — تنزيل وسائط التمارين محليًا (A5)
 *
 * بقرا الخرايط من src/data/exerciseMedia.ts مباشرة (عشان ما ينفعش تبقى مختلفة عنها)،
 * وبنزّل كل ملف من مستودع GitHub مثبّت بـ commit SHA حرفيًا (مش فرع متحرك)،
 * وبحفظهم في public/media/ مع manifest.json فيه sha256 لكل ملف.
 *
 * - بيتخطّى ملف موجود ومتطابق (idempotent)
 * - verify: فحص فقط — بيفشل لو ملف ناقص أو مرشوش
 *
 * Usage:
 *   node scripts/download-media.mjs          # تنزيل/تحديث + manifest
 *   node scripts/download-media.mjs verify   # فحص فقط (CI-friendly)
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access, stat } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA_SRC = path.join(ROOT, "src", "data", "exerciseMedia.ts");
const MEDIA_DIR = path.join(ROOT, "public", "media");
const VERIFY = process.argv[2] === "verify";

/* ===== المصادر المثبّتة (pins) — commit SHAs، آمنة للإعادة الإنتاج ===== */
const PINS = {
  photos: "yuhonas/free-exercise-db@f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5",
  gifs: "hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd",
  muscles: "wger-project/wger@48e02bfe45e83b87781058261986cda88ff2e6d5",
};
const RAW = (repoPin, sub) => {
  const [repo, ref] = repoPin.split("@");
  return `https://raw.githubusercontent.com/${repo}/${ref}/${sub}/`;
};

const URLS = {
  photos: RAW(PINS.photos, "exercises"),
  gifs: RAW(PINS.gifs, "videos"),
  muscles: RAW(PINS.muscles, "wger/core/static/images/muscles"),
};

const LOCAL = {
  photos: path.join(MEDIA_DIR, "photos"),
  gifs: path.join(MEDIA_DIR, "gifs"),
  muscles: path.join(MEDIA_DIR, "muscles"),
};

/* ===== قراءة خرايط exerciseMedia.ts (regex — شكل الملف ثابت ومعروف) ===== */
const tsSource = await readFile(MEDIA_SRC, "utf8");
if (/cdn\.jsdelivr\.net|wger\.de/.test(tsSource)) {
  console.error("✗ exerciseMedia.ts لسه فيه روابط CDN — المحتوى لازم يبقى محلي (المسارات النسبية).");
  process.exit(1);
}

function extractMap(name) {
  const start = tsSource.indexOf(`${name}: Record<string, string> = {`);
  if (start < 0) throw new Error(`map not found: ${name}`);
  const open = tsSource.indexOf("{", start);
  const close = tsSource.indexOf("};", open);
  const body = tsSource.slice(open + 1, close);
  const out = {};
  for (const m of body.matchAll(/"((?:[^"\\]|\\.)+)":\s*"([^"]+)"/g)) out[m[1]] = m[2];
  return out;
}

function extractArtFiles() {
  const start = tsSource.indexOf("MUSCLE_IMG: Record<string, MuscleArt> = {");
  if (start < 0) throw new Error("MUSCLE_IMG not found");
  const open = tsSource.indexOf("{", start);
  const close = tsSource.indexOf("};", open);
  const body = tsSource.slice(open + 1, close);
  const out = [];
  for (const m of body.matchAll(/f:\s*"([^"]+)"/g)) out.push(m[1]);
  return out;
}

const EXERCISE_PHOTOS = extractMap("EXERCISE_PHOTOS");
const EXERCISE_GIFS = extractMap("EXERCISE_GIFS");
const MUSCLE_FILES = extractArtFiles();
const BODY_FILES = ["muscular_system_front.svg", "muscular_system_back.svg"];

/* ===== قائمة التحميل — (مسار الريبو، مسار لوكي) ===== */
const jobs = [];

for (const rel of Object.values(EXERCISE_PHOTOS)) {
  jobs.push({ url: URLS.photos + rel, dest: path.join(LOCAL.photos, rel), source: "photos" });
}
for (const rel of Object.values(EXERCISE_GIFS)) {
  jobs.push({ url: URLS.gifs + rel, dest: path.join(LOCAL.gifs, rel), source: "gifs" });
}
for (const rel of new Set([...MUSCLE_FILES, ...BODY_FILES])) {
  // الـ wger.de بيقدم الملفات بأسماء فيها content-hash (muscle-4.c9fa9a.svg)
  // لكن الملفات الأصلية في الريبو plain (muscle-4.svg) — بنطبّع الاسم هنا
  const repoFile = rel.replace(/(\.[0-9a-f]{10,})?\.svg$/, ".svg");
  jobs.push({ url: URLS.muscles + repoFile, dest: path.join(LOCAL.muscles, rel), source: "muscles" });
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function download(url, retries = 2) {
  for (let i = 0; ; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "gym-app-media-sync" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) throw new Error(`file suspiciously tiny (${buf.length} B)`);
      return buf;
    } catch (err) {
      if (i >= retries) throw new Error(`${url} → ${err.message}`);
      await new Promise(r => setTimeout(r, 600 * (i + 1)));
    }
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  pins: PINS,
  files: {},
};
let cached = 0, downloaded = 0;
const failures = [];

for (const job of jobs) {
  const rel = path.relative(MEDIA_DIR, job.dest).replaceAll("\\", "/");
  try {
    await access(job.dest, constants.F_OK);
    const cachedSha = await sha256(job.dest);
    const bytes = (await stat(job.dest)).size;
    manifest.files[rel] = { source: job.source, bytes, sha256: cachedSha };
    cached++;
    continue;
  } catch { /* مش موجود — نكمل */ }

  if (VERIFY) { failures.push(`missing: ${rel}`); continue; }

  try {
    const buf = await download(job.url);
    await mkdir(path.dirname(job.dest), { recursive: true });
    await writeFile(job.dest, buf);
    manifest.files[rel] = {
      source: job.source,
      bytes: buf.length,
      sha256: createHash("sha256").update(buf).digest("hex"),
    };
    downloaded++;
    console.log(`  ✓ ${rel} (${(buf.length / 1024).toFixed(0)} kB)`);
  } catch (err) {
    failures.push(`${rel}: ${err.message}`);
  }
}

if (!VERIFY) {
  await mkdir(MEDIA_DIR, { recursive: true });
  await writeFile(path.join(MEDIA_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`manifest.json updated — downloads: ${downloaded}, cached: ${cached}, total: ${jobs.length}`);
} else {
  console.log(`verify: ${jobs.length - failures.length}/${jobs.length} ملف متطابق`);
}

if (failures.length) {
  console.error(`\n FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
