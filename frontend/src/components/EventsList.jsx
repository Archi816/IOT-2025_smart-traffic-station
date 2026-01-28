'use client';

import React from 'react';

export default function EventsList({ events }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Recent Sensor Events</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.slice(-10).reverse().map((entry, i) => (
          <div 
            key={i} 
            className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                entry.vibration_event ? 'bg-red-500' : 'bg-green-500'
              }`} />
              <span className="text-sm text-gray-300">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-orange-400">{entry.temperature?.toFixed(1)}°C</span>
              <span className="text-blue-400">{entry.humidity?.toFixed(1)}%</span>
              <span className="text-purple-400">🔊 {entry.sound_level}</span>
              {entry.vibration_event && (
                <span className="text-red-400 font-bold">⚠️ VIBRATION</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}