import { weatherService } from '../services/weather.service.js';
import { supabaseAdmin } from '../config/supabase.js';

// Danh sách các trạm quan trắc trọng điểm toàn quốc (Đặc biệt rốn lũ Miền Trung)
export const MONITORING_REGIONS = [
  { code: 'HUE', name: 'Thừa Thiên Huế', lat: 16.4637, lng: 107.5909, type: 'CENTRAL_FLOOD_BASIN' },
  { code: 'LE_THUY', name: 'Lệ Thủy, Quảng Bình', lat: 17.2167, lng: 106.7833, type: 'CENTRAL_FLOOD_BASIN' },
  { code: 'QUANG_TRI', name: 'Đông Hà, Quảng Trị', lat: 16.8167, lng: 107.1000, type: 'CENTRAL_FLOOD_BASIN' },
  { code: 'DA_NANG', name: 'Đà Nẵng & Quảng Nam', lat: 16.0544, lng: 108.2022, type: 'CENTRAL_URBAN' },
  { code: 'HA_TINH', name: 'Hương Khê, Hà Tĩnh', lat: 18.1750, lng: 105.7100, type: 'CENTRAL_FLOOD_BASIN' },
  { code: 'HA_NOI', name: 'Thủ đô Hà Nội', lat: 21.0285, lng: 105.8542, type: 'NORTH_URBAN' },
  { code: 'HO_CHI_MINH', name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297, type: 'SOUTH_TIDAL' },
];

let ingestionTimer: NodeJS.Timeout | null = null;

export const ingestionWorker = {
  async runIngestionCycle(): Promise<{ checked: number; alertsGenerated: number }> {
    let alertsGenerated = 0;
    const now = new Date();

    for (const region of MONITORING_REGIONS) {
      try {
        const weather = await weatherService.getCurrentWeather(region.lat, region.lng);

        // 1. Nếu có mưa thực tế (> 0 mm/h)
        if (weather.precipitation_mm_h > 0) {
          console.log(`[IngestionWorker] Ghi nhận mưa thực tế tại ${region.name}: ${weather.precipitation_mm_h} mm/h`);

          // Ghi nhận vào CSDL quan trắc lượng mưa thực tế
          try {
            let stationId: string | null = null;
            const { data: existingStation } = await supabaseAdmin
              .from('rainfall_stations')
              .select('id')
              .eq('station_name', `[Vệ tinh] ${region.name}`)
              .limit(1)
              .maybeSingle();

            if (existingStation?.id) {
              stationId = existingStation.id;
            } else {
              const { data: createdStation } = await supabaseAdmin
                .from('rainfall_stations')
                .insert({
                  station_name: `[Vệ tinh] ${region.name}`,
                  location: `POINT(${region.lng} ${region.lat})`,
                })
                .select('id')
                .single();
              if (createdStation?.id) stationId = createdStation.id;
            }

            if (stationId) {
              await supabaseAdmin.from('rainfall_observations').insert({
                station_id: stationId,
                observed_at: now.toISOString(),
                rainfall_mm: weather.precipitation_mm_h,
                duration_minutes: 60,
              });
              console.log(`[IngestionWorker] Đã ghi nhận bản ghi đo mưa thực tế vào CSDL (${weather.precipitation_mm_h} mm)`);
            }
          } catch (obsErr: any) {
            console.warn(`[IngestionWorker] Ghi nhận đo mưa lỗi nhẹ:`, obsErr?.message);
          }

          // 2. Nếu lượng mưa đạt ngưỡng cảnh báo (>= 20 mm/h)
          if (weather.precipitation_mm_h >= 20) {
            const alertLevel = weather.precipitation_mm_h >= 50 ? 'RED' : 'ORANGE';
            const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 tiếng sau

            // Kiểm tra xem đã có cảnh báo đang hiệu lực chưa để tránh duplicate
            const { data: existingAlerts } = await supabaseAdmin
              .from('flood_alerts')
              .select('id')
              .eq('title', `[Vệ tinh Khí tượng] Cảnh báo mưa lớn tại ${region.name}`)
              .gt('expires_at', now.toISOString())
              .limit(1);

            if (!existingAlerts || existingAlerts.length === 0) {
              await supabaseAdmin.from('flood_alerts').insert({
                title: `[Vệ tinh Khí tượng] Cảnh báo mưa lớn tại ${region.name}`,
                message: `Dữ liệu vệ tinh ghi nhận lượng mưa ${weather.precipitation_mm_h} mm/h (${weather.weather_description}). Nguy cơ dâng nước ngập úng cao!`,
                alert_level: alertLevel,
                alert_type: 'RAINFALL_THRESHOLD',
                verification_status: 'VERIFIED',
                started_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
              });
              alertsGenerated++;
              console.log(`[IngestionWorker] Đã tự động tạo cảnh báo mưa lớn tại ${region.name}`);
            }
          }
        }
      } catch (err: any) {
        console.warn(`[IngestionWorker] Lỗi quét trạm ${region.name}:`, err.message);
      }
    }

    return { checked: MONITORING_REGIONS.length, alertsGenerated };
  },

  start() {
    console.log('🌧️ [IngestionWorker] Khởi động tiến trình quan trắc vệ tinh tự động 24/7...');
    // Chạy chu kỳ đầu tiên sau 10 giây khởi động
    setTimeout(() => {
      this.runIngestionCycle().catch(console.error);
    }, 10000);

    // Chu kỳ định kỳ mỗi 15 phút
    ingestionTimer = setInterval(() => {
      this.runIngestionCycle().catch(console.error);
    }, 15 * 60 * 1000);
  },

  stop() {
    if (ingestionTimer) {
      clearInterval(ingestionTimer);
      ingestionTimer = null;
    }
  },
};
