import React from 'react';
import { Thermometer, Droplets, Volume2, Activity, Radio } from 'lucide-react';
import { useSensorData } from './hooks/useSensorData';
import SensorCard from './components/SensorCard';
import StatusIndicator from './components/StatusIndicator';
import TemperatureChart from './components/TemperatureChart';
import HumidityChart from './components/HumidityChart';
import SoundChart from './components/SoundChart';
import EventsList from './components/EventsList';

export default function App() {
  const { status, latest, history, loading, error } = useSensorData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  const tempData = history.map(d => d.temperature);
  const humidityData = history.map(d => d.humidity);
  const soundData = history.map(d => d.sound_level);

  const avgTemp = (tempData.reduce((a, b) => a + b, 0) / tempData.length).toFixed(1);
  const avgHumidity = (humidityData.reduce((a, b) => a + b, 0) / humidityData.length).toFixed(1);
  const maxSound = Math.max(...soundData);
  const avgSound = (soundData.reduce((a, b) => a + b, 0) / soundData.length).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Radio className="w-10 h-10 text-purple-400" />
              IoT Sensor Station
            </h1>
            <p className="text-purple-300">Raspberry Pi Pico • Real-time monitoring</p>
          </div>
          <StatusIndicator status={status} />
        </div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SensorCard
            icon={Thermometer}
            title="Temperature"
            value={latest?.temperature?.toFixed(1)}
            unit="°"
            subtitle={`Avg: ${avgTemp}°C`}
            gradient="from-orange-500/10 to-red-500/10"
            iconColor="text-orange-400"
          />
          
          <SensorCard
            icon={Droplets}
            title="Humidity"
            value={latest?.humidity?.toFixed(1)}
            unit="%"
            subtitle={`Avg: ${avgHumidity}%`}
            gradient="from-blue-500/10 to-cyan-500/10"
            iconColor="text-blue-400"
          />
          
          <SensorCard
            icon={Volume2}
            title="Sound Level"
            value={latest?.sound_level}
            unit=""
            subtitle={`Max: ${maxSound} • Avg: ${avgSound}`}
            gradient="from-purple-500/10 to-pink-500/10"
            iconColor="text-purple-400"
          />
          
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg border border-green-500/20 rounded-2xl p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Vibration</span>
            </div>
            <div className="text-5xl font-bold text-white mb-2">
              {latest?.vibration_strength}
            </div>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs ${
                latest?.vibration_detected ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {latest?.vibration_detected ? 'DETECTED' : 'NONE'}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                latest?.vibration_event ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {latest?.vibration_event ? 'EVENT' : 'NORMAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TemperatureChart data={history} />
          <HumidityChart data={history} />
        </div>

        <div className="mb-8">
          <SoundChart data={history} />
        </div>

        {/* Events */}
        <EventsList events={history} />
      </div>
    </div>
  );
}