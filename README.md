# Gym App — مدربك الشخصي 🏋️

تطبيق جيم عربي (RTL) يعمل بالكامل على الجهاز: خطط جاهزة، تتبع لكل كيلو، تحليلات أسبوعية — كل بياناتك في `localStorage` جهازك، بدون حسابات وبدون سيرفر.

A fully offline-first Arabic (RTL) gym tracker. All data lives in your browser's `localStorage` — no accounts, no server, no runtime CDN calls.

---

## المزايا / Features

- **Onboarding من 4 خطوات** مع تحقق فوري (`inline validation`) وحفظ آمن داخل الحدود (clamp-on-save)
- **مكتبة تمارين** (مثبتة من مصادر مفتوحة) + فلترة بالمعدات المتاحة
- **سيشن حية**: عدادات مجموعات، استراحة بتوقيت حقيقي، تعديل الوزن أثناء التمرين، شاشة ختام بحفظ تلقائي
- **التحليلات**: سلسلة الأيام المتتالية، حجم شهري بالأسابيع، تقويم، **PR لكل تمرين**، تقدم أي تمرين (آخر 5 جلسات)، **وزن الجسم**، ملخص الأسبوع مقابل السابق
- **إدارة الخطة**: إعادة ترتيب التمارين (↑/↓)، استبدال ببديل لنفس العضلة، تعديل مجموعات/تكرارات/وزن
- **بياناتك بيدك**: تصدير/استيراد نسخة JSON احتياطية، تصدير CSV يفتح في Excel، حذف سجل بتأكيد من خطوتين
- **6 ثيمات** + خط Cairo محلي + دعم `prefers-reduced-motion`، `:focus-visible`، ومودالات بـ `role="dialog"` وحبس تركيز
- **PWA**: يتنصّب على الشاشة الرئيسية ويشتغل أوفلاين (Service Worker + manifest)

## التشغيل / Getting started

```bash
npm install        # التبعيات محلية فقط (@fontsource/cairo, vite-plugin-pwa…)
npm run dev        # وضع التطوير
npm run build      # tsc -b && vite build → dist/
npm run preview    # معاينة نسخة الإنتاج (هنا بيتسجل الـ Service Worker فعليًا)
npm run test       # vitest (jsdom)
npm run lint       # oxlint
```

### الوسائط / Media pipeline

صور وGIFs التمارين مثبتة على **commit SHAs محددة** من المصادر المفتوحة — مفيش أي طلب شبكة وقت التشغيل:

```bash
node scripts/download-media.mjs          # ينزّل فعليًا الملفات إلى public/media/ + يكتب manifest.json
node scripts/download-media.mjs verify   # يتحقق من الـ sha256 لكل ملف (79/79)
```

## البنية / Architecture

```
src/
├── App.tsx              # تركيب نحيف: الحالة فوق + الـ tabs
├── strings.ts           # كل النصوص الظاهرة للمستخدم (مصرية عامية) بمكان واحد
├── config.ts            # مفاتيح التخزين، حدود الاستراحة، الافتراضيات
├── components/
│   ├── HomeTab / ScheduleTab / ProgressTab / AITab   # الشاشات (التابات الأخيرة lazy chunks)
│   ├── Onboarding / WorkoutSession                    # أول تشغيل + السيشن الحية
│   ├── SettingsModal / ThemeModal / FinishModal       # مودالات
│   ├── ui/Modal.tsx                                   # قاعدة المودال (dialog/Esc/focus-trap)
│   └── icons.tsx / ExerciseThumb / ErrorBoundary
├── hooks/               # useLocalStorage, useWorkoutSession, useWorkoutLogs, useTheme, useBodyweight
├── lib/
│   ├── migrations.ts    # sanitize + نسخة البيانات + makeBundle/parseBundle (تصدير/استيراد)
│   ├── validate.ts      # حدود الحقول (العمر/الوزن/الطول…) + clamp-on-save
│   ├── stats.ts         # دوال نقية: streak, prMap, exerciseHistory, weekSummary…
│   ├── planBuilder.ts   # توليد الخطط من القوالب
│   └── *.test.ts        # اختبارات الدوال النقية
└── data/                # مكتبة التمارين + القوالب + خريطة الوسائط المحلية
```

## التخزين والتوافق / Storage keys & migrations

| المفتاح | المحتوى |
|---|---|
| `gym-profile-v2` | الملف الشخصي (مع `restSeconds` اختياري — الاستراحة الافتراضية) |
| `gym-plan-v2` | خطة الأيام والتمارين |
| `gym-logs-v1` | سجل التمارين المنتهية |
| `gym-bodylog-v1` | وزن الجسم |
| `gym-theme-v1` | الثيم المختار |
| `gym-session-v1` | السيشن الحية (تُستأنف بعد الإغلاق) |

- كل قراءة تمر على `sanitize*` في `lib/migrations.ts` — بيانات قديمة أو تالفة لا تكسر التطبيق، ولا تُحذف أبدًا
- التصدير نسخة JSON موقوعة بـ `version: 1`؛ الاستيراد يقبل نسخ قديمة (حقل `body` اختياري) ويطبّق الأجزاء الصالحة فقط

## الميزانية والأداء / Budgets

- JS الرئيسي: **~79 kB مضغوط gz** (هدفنا < 150) + chunks تحميل مؤجل للتابات
- CSS: **~8 kB gz** — توكنات تصميم في `:root` (--font/--fs/--fw/--space/--shadow) + 6 ثيمات
- الخطوط: Cairo المحلي (woff2 ~13–15 kB لكل subset، بيتحمّل حسب `unicode-range`)
- LCP نص-أولًا، الوسائط `loading="lazy"`، كل الطلبات من نفس الأصل

## PWA

- `vite-plugin-pwa` (autoUpdate): يتنصّب ويتحدث بدون ما المستخدم يفقد بياناته
- `navigateFallback → /index.html` (أوفلاين كامل للـ SPA)
- `CacheFirst` لمسار `/media/*` (الملفات مثبتة فثابتة) + precache للـ JS/CSS/HTML/الخطوط
- المكون (dev mode ما بيسجلش SW افتراضيًا) — جرّب `npm run build && npm run preview`

## المصادر / Sources

الوسائط مثبتة على commit SHAs (قابلة للتكرار عبر الـ script):
- free-exercise-db @ `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`
- exercises-dataset @ `7455efae41b330c265e7cd4b78dfa848e7ce5ebd`
- wger-project/wger @ `48e02bfe45e83b87781058261986cda88ff2e6d5`

الترخيص: راجع ملفات المصادر أعلاه؛ كود التطبيق منفصل.
