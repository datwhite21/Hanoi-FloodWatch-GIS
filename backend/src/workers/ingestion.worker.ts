import { weatherService } from '../services/weather.service.js';
import { supabaseAdmin } from '../config/supabase.js';

// Danh sách các điểm giám sát mô hình số trị trọng điểm toàn quốc (Đặc biệt rốn lũ Miền Trung)
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

export interface IngestionCycleResult {
  checked: number;
  recordsInserted: number;
  recordsSkipped: number;
  alertsGenerated: number;
  errors: string[];
}

export const ingestionWorker = {
  async runIngestionCycle(): Promise<IngestionCycleResult> {
    const startedAt = new Date();
    let recordsInserted = 0;
    let recordsSkipped = 0;
    let alertsGenerated = 0;
    const errors: string[] = [];

    console.log(`[IngestionWorker] Bắt đầu chu kỳ quét dữ liệu mô hình ECMWF (${startedAt.toISOString()})...`);

    for (const region of MONITORING_REGIONS) {
      try {
        const weather = await weatherService.getCurrentWeather(region.lat, region.lng);
        const observedTime = weather.valid_at || startedAt.toISOString();
        const stationName = `[Mô hình ECMWF] ${region.name}`;

        // 1. Quản lý trạm / điểm giám sát mô hình số trị
        let stationId: string | null = null;
        try {
          const { data: existingStation } = await supabaseAdmin
            .from('rainfall_stations')
            .select('id, station_name')
            .or(`station_name.eq."${stationName}",station_name.eq."[Vệ tinh] ${region.name}"`)
            .limit(1)
            .maybeSingle();

          if (existingStation?.id) {
            stationId = existingStation.id;
            // Chuẩn hóa tên trạm từ [Vệ tinh] cũ sang [Mô hình ECMWF]
            if (existingStation.station_name !== stationName) {
              await supabaseAdmin
                .from('rainfall_stations')
                .update({ station_name: stationName })
                .eq('id', stationId);
            }
          } else {
            const { data: createdStation, error: createErr } = await supabaseAdmin
              .from('rainfall_stations')
              .insert({
                station_name: stationName,
                location: `POINT(${region.lng} ${region.lat})`,
              })
              .select('id')
              .single();

            if (createErr) {
              console.warn(`[IngestionWorker] Lỗi tạo trạm ${stationName}:`, createErr.message);
            } else if (createdStation?.id) {
              stationId = createdStation.id;
            }
          }
        } catch (stErr: any) {
          console.warn(`[IngestionWorker] Kiểm tra trạm ${region.name} lỗi:`, stErr?.message);
        }

        // 2. Lưu trữ quan trắc lượng mưa (Bao gồm cả 0.0 mm/h - DRY hợp lệ)
        if (stationId) {
          try {
            // Kiểm tra trùng lặp (Idempotency) theo (station_id, observed_at)
            const { data: existingObs } = await supabaseAdmin
              .from('rainfall_observations')
              .select('id')
              .eq('station_id', stationId)
              .eq('observed_at', observedTime)
              .limit(1)
              .maybeSingle();

            if (existingObs?.id) {
              recordsSkipped++;
            } else {
              const obsPayload: any = {
                station_id: stationId,
                observed_at: observedTime,
                rainfall_mm: weather.precipitation_mm_h,
                duration_minutes: 60,
              };

              // Thêm metadata phân loại nếu bảng đã được nâng cấp (03_enhanced_schema.sql)
              if (weather.valid_at) obsPayload.valid_at = weather.valid_at;
              if (weather.fetched_at) obsPayload.fetched_at = weather.fetched_at;
              obsPayload.quality_status = weather.quality_status || (weather.precipitation_mm_h === 0 ? 'DRY' : 'VALID');

              const { error: insertErr } = await supabaseAdmin
                .from('rainfall_observations')
                .insert(obsPayload);

              if (insertErr) {
                // Nếu lỗi do cột mới chưa tồn tại trong CSDL cũ, fallback chèn bản ghi cơ bản
                if (insertErr.message?.includes('column') || insertErr.code === 'PGRST204') {
                  const fallbackPayload = {
                    station_id: stationId,
                    observed_at: observedTime,
                    rainfall_mm: weather.precipitation_mm_h,
                    duration_minutes: 60,
                  };
                  await supabaseAdmin.from('rainfall_observations').insert(fallbackPayload);
                  recordsInserted++;
                } else {
                  console.warn(`[IngestionWorker] Không thể lưu quan trắc ${region.name}:`, insertErr.message);
                }
              } else {
                recordsInserted++;
                console.log(`[IngestionWorker] Đã ghi nhận quan trắc tại ${region.name}: ${weather.precipitation_mm_h} mm/h (${obsPayload.quality_status})`);
              }
            }
          } catch (obsErr: any) {
            console.warn(`[IngestionWorker] Lỗi lưu đo mưa tại ${region.name}:`, obsErr?.message);
          }
        }

        // 3. Đánh giá ngưỡng kích hoạt cảnh báo tham khảo kỹ thuật (theo ALERT_METHODOLOGY.md)
        // Ngưỡng >= 20 mm/h: Cảnh báo theo dõi kỹ thuật (Advisory)
        if (weather.precipitation_mm_h >= 20) {
          const alertLevel = weather.precipitation_mm_h >= 50 ? 'RED' : (weather.precipitation_mm_h >= 30 ? 'ORANGE' : 'YELLOW');
          const expiresAt = new Date(startedAt.getTime() + 3 * 60 * 60 * 1000); // Hiệu lực 3 giờ
          const alertTitle = `[Tham khảo Mô hình] Ghi nhận mưa lớn tại ${region.name}`;

          // Kiểm tra xem đã có cảnh báo đang hiệu lực chưa để tránh duplicate
          const { data: existingAlerts } = await supabaseAdmin
            .from('flood_alerts')
            .select('id')
            .eq('title', alertTitle)
            .gt('expires_at', startedAt.toISOString())
            .limit(1);

          if (!existingAlerts || existingAlerts.length === 0) {
            const { error: alertErr } = await supabaseAdmin.from('flood_alerts').insert({
              title: alertTitle,
              message: `Mô hình số trị ECMWF ghi nhận cường độ mưa dự báo ${weather.precipitation_mm_h} mm/h (${weather.weather_description}). Lưu ý: Đây là chỉ số tham khảo kỹ thuật phục vụ nghiên cứu, không thay thế bản tin cảnh báo thiên tai chính thức của cơ quan KTTV.`,
              alert_level: alertLevel,
              alert_type: 'RAINFALL_THRESHOLD',
              verification_status: 'VERIFIED',
              started_at: startedAt.toISOString(),
              expires_at: expiresAt.toISOString(),
            });

            if (!alertErr) {
              alertsGenerated++;
              console.log(`[IngestionWorker] Đã tạo bản tin tham khảo mưa lớn tại ${region.name} (${alertLevel})`);
            }
          }
        }
      } catch (err: any) {
        const msg = `Lỗi quét trạm ${region.name}: ${err.message}`;
        console.warn(`[IngestionWorker] ${msg}`);
        errors.push(msg);
      }
    }

    const completedAt = new Date();
    const cycleStatus = errors.length === 0 ? 'SUCCESS' : (recordsInserted > 0 ? 'PARTIAL' : 'FAILED');

    // 4. Lưu nhật ký chu kỳ vào bảng ingestion_logs (nếu có bảng)
    try {
      await supabaseAdmin.from('ingestion_logs').insert({
        job_name: 'ecmwf_weather_ingestion',
        source_name: 'ECMWF IFS / Open-Meteo',
        started_at: startedAt.toISOString(),
        completed_at: completedAt.toISOString(),
        records_inserted: recordsInserted,
        records_skipped: recordsSkipped,
        status: cycleStatus,
        error_message: errors.length > 0 ? errors.join('; ') : null,
      });
    } catch (logErr: any) {
      // Bỏ qua nếu bảng ingestion_logs chưa được tạo trong CSDL
    }

    console.log(`[IngestionWorker] Hoàn tất chu kỳ. Đã thêm: ${recordsInserted}, Đã bỏ qua: ${recordsSkipped}, Cảnh báo mới: ${alertsGenerated}, Lỗi: ${errors.length}`);

    return {
      checked: MONITORING_REGIONS.length,
      recordsInserted,
      recordsSkipped,
      alertsGenerated,
      errors,
    };
  },

  start() {
    console.log('🌧️ [IngestionWorker] Khởi động tiến trình quan trắc mô hình khí tượng 24/7...');
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
