/**
 * المصغّر التمرين — سلسلة fallback: GIF → صورة → أناتومي → إيموجي العضلة.
 * منقول حرفيًا من App (A4) — التحميل الكسول بيظبطه في A5.
 */

import * as React from "react";
import { useState } from "react";
import {
  BODY_IMG,
  EXERCISE_GIFS,
  EXERCISE_PHOTOS,
  GIF_BASE,
  MUSCLE_EMOJI,
  MUSCLE_IMG,
  MUSCLE_IMG_BASE,
  PHOTO_BASE,
} from "../data/exerciseMedia";
import type { MuscleArt } from "../data/exerciseMedia";

interface ThumbProps {
  name: string;
  muscle: string;
  size?: number;
  mode?: "photo" | "anatomy";
}

export const ExerciseThumb: React.FC<ThumbProps> = ({ name, muscle, size = 46, mode = "photo" }) => {
  const [failedPhoto, setFailedPhoto] = useState(false);
  const [failedGif, setFailedGif] = useState(false);
  const [failedArt, setFailedArt] = useState(false);
  const gif = EXERCISE_GIFS[name];
  const photo = EXERCISE_PHOTOS[name];
  const art: MuscleArt | undefined = MUSCLE_IMG[muscle];

  if (mode === "anatomy" && art && !failedArt) {
    return (
      <div className="ex-thumb ex-thumb-art" style={{ width: size, height: size }} title={name}>
        <div className="ex-thumb-zoom" style={{ transform: `scale(${art.z})`, transformOrigin: `${art.x}% ${art.y}%` }}>
          <img className="ex-art-body" src={art.back ? BODY_IMG.back : BODY_IMG.front} alt="" loading="lazy" decoding="async" onError={() => setFailedArt(true)} />
          <img className="ex-art-muscle" src={MUSCLE_IMG_BASE + art.f} alt={name} loading="lazy" decoding="async" onError={() => setFailedArt(true)} />
        </div>
      </div>
    );
  }

  const mediaSrc = gif && !failedGif ? GIF_BASE + gif : photo && !failedPhoto ? PHOTO_BASE + photo : null;
  if (mediaSrc) {
    return (
      <div className="ex-thumb ex-thumb-media" style={{ width: size, height: size }} title={name}>
        <img
          className="ex-art-media"
          src={mediaSrc}
          alt={name}
          loading="eager"
          decoding="async"
          onError={() => { if (gif && !failedGif && mediaSrc === GIF_BASE + gif) setFailedGif(true); else setFailedPhoto(true); }}
        />
      </div>
    );
  }

  return (
    <div className="ex-icon ex-icon-fallback" style={{ width: size, height: size }}>
      {MUSCLE_EMOJI[muscle] || "🏋️"}
    </div>
  );
};
