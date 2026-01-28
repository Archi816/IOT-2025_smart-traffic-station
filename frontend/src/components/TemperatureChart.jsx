'use client';
import React from 'react';

export default function TemperatureChart({ data }) {
  const temps = data.map(d => d.temperature).filter(v => typeof v === 'number');
  const slice = temps.slice(-30);

  const minT = Math.min(...slice);
  const maxT = Math.max(...slice);
  const range = Math.max(maxT - minT, 0.1); // чтобы не делить на 0

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Temperature History</h3>
      <div className="h-48 flex items-end gap-1">
        {slice.map((t, i) => {
          const pct = ((t - minT) / range) * 100;
          const height = 10 + pct * 0.9; // min 10% чтобы было видно
          return (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
              style={{ height: `${height}%` }}
              title={`${t.toFixed(1)}°C`}
            />
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-2 text-center">Last 30 readings</div>
    </div>
  );
}
