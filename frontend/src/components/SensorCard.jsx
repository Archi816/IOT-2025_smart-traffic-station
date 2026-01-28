'use client';

import React from 'react';

export default function SensorCard({ icon: Icon, title, value, unit, subtitle, gradient, iconColor }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} backdrop-blur-lg border ${iconColor.replace('text-', 'border-')}/20 rounded-2xl p-6 hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${iconColor}`} />
        <span className="text-xs text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-5xl font-bold text-white mb-2">
        {value}{unit}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-400">
          {subtitle}
        </div>
      )}
    </div>
  );
}