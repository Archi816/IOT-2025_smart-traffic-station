"use client";

import { Star } from "lucide-react";

function starsFromSound(soundLevel) {
  const v = typeof soundLevel === "number" ? soundLevel : 0;

  if (v >= 45000) return 5;
  if (v >= 35000) return 4;
  if (v >= 25000) return 3;
  if (v >= 20000) return 2;
  return 1;
}

function levelText(stars) {
  if (stars <= 2) return "Low";
  if (stars === 3) return "Medium";
  return "High";
}

export default function CongestionStars({
  value,
  label = "Road congestion",
}) {
  const stars = starsFromSound(value);

  return (
    <div className="mb-8">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/40 backdrop-blur-md p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-slate-300">{label}</div>
            <div className="text-lg font-semibold bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-400 text-transparent bg-clip-text">
              {levelText(stars)} traffic
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < stars;

                const cls = filled
                  ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.55)]"
                  : "text-slate-600";

                return (
                  <Star
                    key={i}
                    size={22}
                    className={cls}
                    fill={filled ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={2}
                  />
                );
              })}
            </div>

            <div className="text-slate-300 text-sm tabular-nums">
              <span className="text-white font-semibold">{stars}</span>/5
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-400">
          Based on sound level:{" "}
          <span className="text-slate-200 tabular-nums">{value ?? "—"}</span>
          <span className="ml-2 text-slate-500">
            (≥45000:5, ≥35000:4, ≥25000:3, ≥20000:2)
          </span>
        </div>
      </div>
    </div>
  );
}
