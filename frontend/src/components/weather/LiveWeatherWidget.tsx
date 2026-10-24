import React, { useEffect, useState } from 'react';
import { CloudRain, Wind, Droplets, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { LiveWeatherData } from '../../types';

interface LiveWeatherWidgetProps {
  currentLat?: number;
  currentLng?: number;
  locationName?: string;
  className?: string;
}

export const LiveWeatherWidget: React.FC<LiveWeatherWidgetProps> = ({
  currentLat = 21.0285,
  currentLng = 105.8542,
  locationName = 'Hà Nội',
  className = '',
}) => {
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const res = await api.getLiveWeather(currentLat, currentLng);
      if (res && res.data) {
        setWeather(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải thời tiết vệ tinh:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Tự động làm mới mỗi 10 phút
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentLat, currentLng]);

  if (!weather && loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs animate-pulse ${className}`}>
        <CloudRain className="w-3.5 h-3.5 text-blue-500" />
        <span>Đang quét vệ tinh...</span>
      </div>
    );
  }

  if (!weather) return null;

  const isRainy = weather.precipitation_mm_h > 0;
  const isHeavyRain = weather.precipitation_mm_h >= 25;

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium border shadow-xs transition-all ${
        isHeavyRain
          ? 'bg-red-50 text-red-800 border-red-300 animate-pulse'
          : isRainy
          ? 'bg-amber-50 text-amber-800 border-amber-300'
          : 'bg-white/90 backdrop-blur-xs text-slate-700 border-slate-200'
      } ${className}`}
      title={`Cập nhật từ vệ tinh Open-Meteo lúc ${new Date(weather.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
    >
      <div className="flex items-center gap-1">
        <span className="text-sm">{weather.weather_icon}</span>
        <span className="font-bold">{weather.temperature_c}°C</span>
      </div>

      <span className="text-slate-300">|</span>

      <div className="flex items-center gap-1">
        <CloudRain className={`w-3.5 h-3.5 ${isRainy ? 'text-blue-600' : 'text-slate-400'}`} />
        <span>
          Mưa: <strong>{weather.precipitation_mm_h.toFixed(1)} mm/h</strong>
        </span>
      </div>

      <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-500">
        <Droplets className="w-3 h-3 text-cyan-500" />
        <span>{weather.relative_humidity}%</span>
      </span>

      <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-500">
        <Wind className="w-3 h-3 text-teal-500" />
        <span>{weather.wind_speed_kmh} km/h</span>
      </span>

      <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" title="Vệ tinh đang kết nối Live" />
    </div>
  );
};
