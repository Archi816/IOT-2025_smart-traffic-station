'use client';

import React from 'react';

export default function HumidityChart({ data }) {
  const humidity = data.map(d => d.humidity);
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Humidity History</h3>
      <div className="h-48 flex items-end gap-1">
        {humidity.slice(-30).map((hum, i) => (
          <div 
            key={i} 
            className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t opacity-70 hover:opacity-100 transition-opacity" 
            style={{ height: `${(hum / 100) * 100}%` }}
            title={`${hum.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2 text-center">Last 30 readings</div>
    </div>
  );
}