'use client';

import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function StatusIndicator({ status }) {
  const isOnline = status?.state === 'online';
  
  return (
    <div className={`flex items-center gap-3 px-6 py-3 rounded-full ${
      isOnline ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
    }`}>
      {isOnline ? 
        <Wifi className="w-6 h-6 text-green-400" /> : 
        <WifiOff className="w-6 h-6 text-red-400" />
      }
      <div>
        <div className={`text-sm font-bold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>
        <div className="text-xs text-gray-400">
          {status?.last_seen ? new Date(status.last_seen).toLocaleTimeString() : 'Unknown'}
        </div>
      </div>
    </div>
  );
}