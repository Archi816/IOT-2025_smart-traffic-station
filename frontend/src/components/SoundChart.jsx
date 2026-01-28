'use client';

import React from 'react';

export default function SoundChart({ data }) {
  const sounds = data
    .map(d => d.sound_level)
    .filter(v => typeof v === 'number');

  const last = sounds.slice(-50);
  const maxVal = Math.max(...last, 1); // чтобы не делить на 0 [web:162]

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Sound Level Monitor</h3>

      <div className="h-64 flex items-end gap-1">
        {last.map((sound, i) => {
          const pct = (sound / maxVal) * 100; // нормализация по max [web:194]
          const isSpike = sound > 10000; // если хочешь — подберём порог

          return (
            <div
              key={i}
              className={`flex-1 ${
                isSpike
                  ? 'bg-gradient-to-t from-red-500 to-pink-500'
                  : 'bg-gradient-to-t from-purple-500 to-purple-400'
              } rounded-t opacity-70 hover:opacity-100 transition-opacity`}
              style={{ height: `${Math.min(pct, 100)}%` }}
              title={`${sound}`}
            />
          );
        })}
      </div>

      <div className="text-xs text-gray-500 mt-2 text-center">
        Last 50 readings • Red spikes indicate loud events
      </div>
    </div>
  );
}
