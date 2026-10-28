// ==============================================================================
// VIETNAM FLOODWATCH GIS - WEATHER SERVICE (OPEN-METEO LIVE SATELLITE API)
// Dịch vụ quan trắc thời tiết & lượng mưa vệ tinh thời gian thực không giới hạn
// ==============================================================================

export interface WeatherResponse {
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
  valid_at: string;
  fetched_at: string;
  updated_at: string;
  source: string;
  data_source?: string;
  quality_status: 'VALID' | 'DRY';
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
  if (precipitationMmH >= 50) return 'DANGER';    // > 50mm/h: Báo động mưa cực đoan
  if (precipitationMmH >= 25) return 'WARNING';   // 25 - 50mm/h: Mưa rất lớn
  if (precipitationMmH >= 10) return 'ADVISORY';  // 10 - 25mm/h: Mưa vừa đến to
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
        throw new Error(`Open-Meteo HTTP ${res.status}`);
      }

      const json = (await res.json()) as any;
      const current = json.current;

      const { desc, icon } = getWeatherDescription(current.weather_code);
      const precip = Number(current.precipitation) || 0;
      const risk = calculateRainRisk(precip);
      const validAt = current.time ? new Date(current.time).toISOString() : new Date().toISOString();
      const fetchedAt = new Date().toISOString();

      const result: WeatherResponse = {
        latitude: lat,
        longitude: lng,
        temperature_c: Number(current.temperature_2m) || 0,
        relative_humidity: Number(current.relative_humidity_2m) || 0,
        precipitation_mm_h: precip,
        rain_mm_h: Number(current.rain) || 0,
        wind_speed_kmh: Number(current.wind_speed_10m) || 0,
        weather_code: current.weather_code,
        weather_description: desc,
        weather_icon: icon,
        risk_level: risk,
        valid_at: validAt,
        fetched_at: fetchedAt,
        updated_at: validAt,
        source: 'Mô hình Dự báo Số trị ECMWF IFS / Open-Meteo (NWP Grid Model)',
        data_source: 'Mô hình Dự báo Số trị ECMWF IFS / Open-Meteo (NWP Grid Model)',
        quality_status: precip === 0 ? 'DRY' : 'VALID',
      };

      // Lưu cache 5 phút
      weatherCache.set(cacheKey, { data: result, expiresAt: now + 5 * 60 * 1000 });
      return result;
    } catch (error: any) {
      console.warn(`[WeatherService] Lỗi kết nối Open-Meteo cho (${lat}, ${lng}):`, error.message);
      // Không trả về dữ liệu giả - ném lỗi rõ ràng theo nguyên tắc Zero Mock Data
      const err: any = new Error(`Không thể lấy dữ liệu thời tiết thực tế: ${error.message}`);
      err.statusCode = 502;
      err.source = 'Open-Meteo';
      throw err;
    }
  },
};
