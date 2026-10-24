// ==============================================================================
// VIETNAM FLOODWATCH GIS - WEATHER SERVICE (OPEN-METEO LIVE SATELLITE API)
// Dịch vụ quan trắc thời tiết & lượng mưa vệ tinh thời gian thực không giới hạn
// ==============================================================================

interface WeatherResponse {
  latitude: number;
  longitude: number;
  temperature_c: number;
  relative_humidity: number;
  precipitation_mm_h: number;
  rain_mm_h: number;
  wind_speed_kmh: number;
  weather_code: number;
  weather_description: string;
  weather_icon: string;
  risk_level: 'SAFE' | 'ADVISORY' | 'WARNING' | 'DANGER';
  updated_at: string;
  source: string;
}

// Bộ nhớ đệm tạm thời (Cache 5 phút) để giảm thiểu gọi API dư thừa
const weatherCache = new Map<string, { data: WeatherResponse; expiresAt: number }>();

function getWeatherDescription(code: number): { desc: string; icon: string } {
  switch (code) {
    case 0:
      return { desc: 'Trời quang đãng, tạnh ráo', icon: '☀️' };
    case 1:
    case 2:
      return { desc: 'Ít mây, trời nắng nhẹ', icon: '🌤️' };
    case 3:
      return { desc: 'Nhiều mây, âm u', icon: '☁️' };
    case 45:
    case 48:
      return { desc: 'Sương mù, tầm nhìn hạn chế', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { desc: 'Mưa phùn rải rác', icon: '🌦️' };
    case 61:
    case 63:
      return { desc: 'Mưa vừa', icon: '🌧️' };
    case 65:
      return { desc: 'Mưa to diện rộng', icon: '🌧️' };
    case 80:
    case 81:
      return { desc: 'Mưa rào nặng hạt', icon: '⛈️' };
    case 82:
      return { desc: 'Mưa rào cực đoan, nguy cơ ngập úng cao', icon: '🌊' };
    case 95:
    case 96:
    case 99:
      return { desc: 'Dông bão, gió giật mạnh và mưa lớn nguy hiểm', icon: '⚡' };
    default:
      return { desc: 'Thời tiết bình thường', icon: '🌤️' };
  }
}

function calculateRainRisk(precipitationMmH: number): 'SAFE' | 'ADVISORY' | 'WARNING' | 'DANGER' {
  if (precipitationMmH >= 50) return 'DANGER';    // > 50mm/h: Báo động ngập lụt khẩn cấp
  if (precipitationMmH >= 25) return 'WARNING';   // 25 - 50mm/h: Nguy cơ ngập sâu đường phố
  if (precipitationMmH >= 10) return 'ADVISORY';  // 10 - 25mm/h: Chú ý di chuyển, nước dồn chậm
  return 'SAFE';                                   // < 10mm/h: An toàn
}

export const weatherService = {
  async getCurrentWeather(lat: number, lng: number): Promise<WeatherResponse> {
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    const now = Date.now();

    const cached = weatherCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FBangkok`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Vietnam-FloodWatch-GIS' } });

      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP error: ${res.status}`);
      }

      const json = (await res.json()) as any;
      const current = json.current;

      const { desc, icon } = getWeatherDescription(current.weather_code);
      const precip = Number(current.precipitation) || 0;
      const risk = calculateRainRisk(precip);

      const result: WeatherResponse = {
        latitude: lat,
        longitude: lng,
        temperature_c: Number(current.temperature_2m) || 25,
        relative_humidity: Number(current.relative_humidity_2m) || 80,
        precipitation_mm_h: precip,
        rain_mm_h: Number(current.rain) || 0,
        wind_speed_kmh: Number(current.wind_speed_10m) || 0,
        weather_code: current.weather_code,
        weather_description: desc,
        weather_icon: icon,
        risk_level: risk,
        updated_at: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
        source: 'Open-Meteo Global Satellite & Radar Feed (WMO/ECMWF)',
      };

      // Lưu cache 5 phút
      weatherCache.set(cacheKey, { data: result, expiresAt: now + 5 * 60 * 1000 });
      return result;
    } catch (error: any) {
      console.warn(`[WeatherService] Không thể kết nối Open-Meteo cho (${lat}, ${lng}):`, error.message);
      // Fallback an toàn nếu mạng ngắt kết nối
      return {
        latitude: lat,
        longitude: lng,
        temperature_c: 26,
        relative_humidity: 85,
        precipitation_mm_h: 0,
        rain_mm_h: 0,
        wind_speed_kmh: 5,
        weather_code: 0,
        weather_description: 'Trời quang, tạnh ráo',
        weather_icon: '☀️',
        risk_level: 'SAFE',
        updated_at: new Date().toISOString(),
        source: 'Open-Meteo Offline Fallback',
      };
    }
  },
};
