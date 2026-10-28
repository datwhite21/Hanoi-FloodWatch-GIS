import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FloodPoint, RiskLevel, CitizenReport } from '../../types';

interface LeafletMapProps {
  points: FloodPoint[];
  citizenReports?: CitizenReport[];
  weatherStations?: import('../../types').WeatherStation[];
  center?: [number, number];
  zoom?: number;
  radiusCenter?: [number, number] | null;
  radiusMeters?: number;
  selectedPointId?: string | null;
  onMapClick?: (lat: number, lng: number) => void;
  onPointSelect?: (point: FloodPoint) => void;
  onCitizenUpvote?: (id: string) => void;
  className?: string;
  isPinpointMode?: boolean;
}

// Hàm tạo SVG Marker tùy biến theo mức độ nguy cơ
function createCustomMarkerIcon(riskLevel: RiskLevel, isSelected: boolean = false, isHighRisk: boolean = false): L.DivIcon {
  let bgColor = '#6B7280'; // Xám
  let ringColor = 'rgba(107, 114, 128, 0.4)';

  if (riskLevel === 'HIGH') {
    bgColor = '#DC2626'; // Đỏ
    ringColor = 'rgba(220, 38, 38, 0.4)';
  } else if (riskLevel === 'MEDIUM') {
    bgColor = '#F59E0B'; // Cam
    ringColor = 'rgba(245, 158, 11, 0.4)';
  } else if (riskLevel === 'LOW') {
    bgColor = '#10B981'; // Xanh lá
    ringColor = 'rgba(16, 185, 129, 0.4)';
  }

  const animationClass = isHighRisk ? 'marker-high-risk' : '';
  const scale = isSelected ? 'transform: scale(1.25);' : '';

  const html = `
    <div class="relative flex items-center justify-center ${animationClass}" style="width: 32px; height: 32px; border-radius: 9999px; ${scale}">
      <div style="background-color: ${bgColor}; box-shadow: 0 0 10px ${ringColor};" class="w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// Icon cho tâm vòng tròn quét bán kính
const centerPinIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center" style="width: 28px; height: 28px;">
      <div class="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-ping absolute"></div>
      <div class="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-md relative z-10 flex items-center justify-center text-white">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  `,
  className: 'center-pin-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Icon sóng radar cho Báo cáo Ngập Cộng đồng thời gian thực
function createCitizenMarkerIcon(waterDepthLevel: string): L.DivIcon {
  const isFloodDeep = waterDepthLevel === 'FLOOD_DEEP';
  const color = isFloodDeep ? '#ef4444' : waterDepthLevel === 'HALF_WHEEL' ? '#f59e0b' : '#10b981';
  const ringColor = isFloodDeep ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)';

  const html = `
    <div class="relative flex items-center justify-center" style="width: 36px; height: 36px;">
      <div style="background-color: ${ringColor};" class="w-9 h-9 rounded-full animate-ping absolute"></div>
      <div style="background-color: ${color}; box-shadow: 0 0 12px ${ringColor};" class="w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-xl relative z-10 font-bold text-xs">
        <span>📢</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'citizen-radar-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function createWeatherStationIcon(name: string, temp: number): L.DivIcon {
  const shortName = name.replace('Thủ đô ', '').replace('TP. ', '').split(',')[0];
  const html = `
    <div class="relative flex items-center justify-center group" style="width: 36px; height: 36px;">
      <span class="absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60 animate-ping"></span>
      <div class="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 text-white flex items-center justify-center border-2 border-white shadow-xl text-sm font-bold">
        🛰️
      </div>
      <div class="absolute -bottom-5 whitespace-nowrap bg-slate-900/90 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none font-semibold border border-slate-700 backdrop-blur-xs">
        ${shortName} ${temp}°C
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-weather-station-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  points,
  citizenReports = [],
  weatherStations = [],
  center = [21.0285, 105.8542], // Tọa độ trung tâm Hà Nội
  zoom = 13,
  radiusCenter = null,
  radiusMeters = 0,
  selectedPointId = null,
  onMapClick,
  onPointSelect,
  className = 'h-full w-full',
  isPinpointMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const citizenLayerRef = useRef<L.LayerGroup | null>(null);
  const weatherLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const centerMarkerRef = useRef<L.Marker | null>(null);

  // 1. Khởi tạo Bản đồ Leaflet một lần duy nhất
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
    });

    // 1. Bản đồ Google Maps Đường bộ (Chuẩn Việt Nam, tốc độ cao, không bị chặn)
    const googleRoadLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      subdomains: '0123',
      maxZoom: 20,
    });

    // 2. Bản đồ nền Đô thị CartoDB Voyager
    const voyagerLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    });

    // 3. Bản đồ Vệ tinh Google Maps Hybrid (kèm tên đường)
    const googleHybridLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      subdomains: '0123',
      maxZoom: 20,
    });

    // 4. Bản đồ nền Vệ tinh Esri World Imagery
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 18,
    });

    // 5. Bản đồ OpenStreetMap chuẩn
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    // Đặt CartoDB Voyager làm lớp bản đồ hiển thị mặc định hợp pháp
    voyagerLayer.addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    const citizenLayer = L.layerGroup().addTo(map);
    citizenLayerRef.current = citizenLayer;

    const weatherLayer = L.layerGroup().addTo(map);
    weatherLayerRef.current = weatherLayer;

    // Bộ chọn lớp bản đồ nền & lớp phủ sự kiện
    L.control.layers(
      {
        '🎨 CartoDB Voyager (Mặc định)': voyagerLayer,
        '📍 OpenStreetMap': osmLayer,
        '🌍 Esri Vệ tinh': satelliteLayer,
        '🗺️ Google Maps (Tham khảo)': googleRoadLayer,
        '🛰️ Google Vệ tinh (Tham khảo)': googleHybridLayer,
      },
      {
        '🛰️ Điểm Giám sát Mô hình ECMWF': weatherLayer,
        '📢 Báo cáo Cộng đồng': citizenLayer,
      },
      { position: 'topright' }
    ).addTo(map);

    // Zoom control ở góc dưới bên phải
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Thước đo tỷ lệ (Scale bar)
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

    // Lắng nghe sự kiện click trên bản đồ
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });
    mapInstanceRef.current = map;

    // Cập nhật lại kích thước bản đồ theo các mốc thời gian để đảm bảo hiển thị đủ 100%
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 300);
    setTimeout(() => map.invalidateSize(), 800);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Cập nhật vị trí khi center thay đổi
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  // 3. Render các Marker điểm ngập
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    points.forEach((point) => {
      const lat = Number(point.latitude);
      const lng = Number(point.longitude);
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

      const isSelected = selectedPointId === point.id;
      const isHighRisk = point.risk_level === 'HIGH';
      const icon = createCustomMarkerIcon(point.risk_level, isSelected, isHighRisk);

      const marker = L.marker([lat, lng], { icon });

      // Nội dung Popup chi tiết đẹp mắt
      const riskBadgeColor =
        point.risk_level === 'HIGH'
          ? 'bg-red-100 text-red-800 border-red-200'
          : point.risk_level === 'MEDIUM'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-200';

      const riskLabel =
        point.risk_level === 'HIGH' ? 'Nguy cơ Cao' : point.risk_level === 'MEDIUM' ? 'Nguy cơ Trung bình' : 'Nguy cơ Thấp';

      const distanceHtml =
        point.distance_meters !== undefined
          ? `<div class="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mb-1">
               Cách tâm: ${point.distance_meters >= 1000 ? (point.distance_meters / 1000).toFixed(2) + ' km' : point.distance_meters + ' m'}
             </div>`
          : '';

      const demoTag = point.is_demo
        ? `<span class="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-200">DEMO</span>`
        : '';

      const popupHtml = `
        <div class="p-3.5 space-y-2 min-w-[240px] max-w-[280px]">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${riskBadgeColor}">
              ${riskLabel}
            </span>
            ${demoTag}
          </div>
          <h3 class="font-bold text-sm text-slate-900 leading-snug">${point.name}</h3>
          <p class="text-xs text-slate-500 flex items-start gap-1">
            <span>📍</span><span>${point.address}</span>
          </p>
          ${distanceHtml}
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500">Điểm số: <strong class="text-slate-800">${point.risk_score}</strong></span>
            <a href="/points/${point.id}" class="inline-flex items-center text-brand-600 hover:text-brand-800 font-semibold underline text-xs">
              Xem hồ sơ &rarr;
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });

      marker.on('click', () => {
        if (onPointSelect) {
          onPointSelect(point);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [points, selectedPointId]);

  // 3b. Render các Marker Báo cáo Cộng đồng Thời gian thực (Pulsating Radar Pins)
  useEffect(() => {
    if (!mapInstanceRef.current || !citizenLayerRef.current) return;

    citizenLayerRef.current.clearLayers();

    citizenReports.forEach((report) => {
      const lat = Number(report.latitude);
      const lng = Number(report.longitude);
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

      const icon = createCitizenMarkerIcon(report.water_depth_level);
      const marker = L.marker([lat, lng], { icon });

      const depthLabel =
        report.water_depth_level === 'FLOOD_DEEP'
          ? '🔴 Lũ sâu nguy hiểm (> 1m)'
          : report.water_depth_level === 'HALF_WHEEL'
          ? '🟡 Nửa bánh xe (~35cm)'
          : '🟢 Mắt cá chân (~15cm)';

      const timeAgo = report.created_at
        ? new Date(report.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : 'Vừa xong';

      const popupHtml = `
        <div class="p-3.5 space-y-2 min-w-[240px] max-w-[280px]">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              📢 Báo cáo Cộng đồng
            </span>
            <span class="text-[10px] text-slate-400">${timeAgo}</span>
          </div>
          <h3 class="font-bold text-sm text-slate-900 leading-snug">${report.address}</h3>
          <p class="text-xs font-semibold text-slate-700">${depthLabel}</p>
          ${report.description ? `<p class="text-[11px] text-slate-500 italic">"${report.description}"</p>` : ''}
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-[10px] text-slate-400">Báo bởi: <strong>${report.reporter_name || 'Người dân'}</strong></span>
            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              👍 ${report.upvotes || 1} xác nhận
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });
      citizenLayerRef.current?.addLayer(marker);
    });
  }, [citizenReports]);

  // 4. Render Các Trạm Quan Trắc Vệ Tinh Trực Tiếp (Live Satellite Stations)
  useEffect(() => {
    if (!weatherLayerRef.current) return;

    weatherLayerRef.current.clearLayers();

    weatherStations.forEach((st) => {
      const lat = Number(st.lat);
      const lng = Number(st.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const icon = createWeatherStationIcon(st.name, st.weather?.temperature_c || 25);
      const marker = L.marker([lat, lng], { icon });

      const isRain = (st.weather?.precipitation_mm_h || 0) > 0;
      const popupHtml = `
        <div class="p-3 text-slate-800 space-y-2 min-w-[240px]">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span class="text-xl">🛰️</span>
            <div>
              <h4 class="font-bold text-xs text-slate-900">${st.name}</h4>
              <span class="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">Điểm Giám Sát Mô Hình ECMWF (NWP)</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span class="text-[10px] text-slate-400 block font-medium">Nhiệt độ</span>
              <span class="font-extrabold text-slate-800 text-sm">${st.weather?.temperature_c !== undefined ? st.weather.temperature_c : '--'}°C ${st.weather?.weather_icon || ''}</span>
            </div>
            <div class="bg-blue-50/60 p-2 rounded-lg border border-blue-100">
              <span class="text-[10px] text-blue-600 block font-medium">Lượng mưa</span>
              <span class="font-extrabold text-blue-700 text-sm">${st.weather?.precipitation_mm_h !== undefined ? st.weather.precipitation_mm_h.toFixed(1) : '--'} mm/h</span>
            </div>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span class="text-[10px] text-slate-400 block font-medium">Độ ẩm</span>
              <span class="font-bold text-slate-700">${st.weather?.relative_humidity !== undefined ? st.weather.relative_humidity : '--'}%</span>
            </div>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span class="text-[10px] text-slate-400 block font-medium">Gió</span>
              <span class="font-bold text-slate-700">${st.weather?.wind_speed_kmh !== undefined ? st.weather.wind_speed_kmh : '--'} km/h</span>
            </div>
          </div>
          <div class="text-[11px] text-slate-600 font-medium">
            Tình trạng: <strong>${st.weather?.weather_description || 'Bình thường'}</strong>
          </div>
          <div class="pt-1.5 border-t border-slate-100 text-[9px] text-slate-400 flex items-center justify-between">
            <span>Nguồn: Mô hình ECMWF / Open-Meteo</span>
            <span class="text-emerald-600 font-bold">● Dữ liệu số trị</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });
      weatherLayerRef.current?.addLayer(marker);
    });
  }, [weatherStations]);

  // 5. Render Vòng tròn Bán kính Không gian (Spatial Circle)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Xóa vòng tròn và marker tâm cũ
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }
    if (centerMarkerRef.current) {
      centerMarkerRef.current.remove();
      centerMarkerRef.current = null;
    }

    if (radiusCenter && radiusMeters > 0) {
      // Đặt marker tâm
      const centerMarker = L.marker(radiusCenter, { icon: centerPinIcon }).addTo(mapInstanceRef.current);
      centerMarkerRef.current = centerMarker;

      // Vẽ vòng tròn bán kính mờ với đường viền nét đứt
      const circle = L.circle(radiusCenter, {
        radius: radiusMeters,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6, 6',
      }).addTo(mapInstanceRef.current);

      radiusCircleRef.current = circle;

      // Tự động căn chỉnh khung hình (fit bounds) để nhìn thấy trọn vẹn vòng tròn
      mapInstanceRef.current.fitBounds(circle.getBounds(), { padding: [40, 40], animate: true });
    }
  }, [radiusCenter, radiusMeters]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Thông báo chế độ chọn tọa độ (Pinpoint mode) */}
      {isPinpointMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-slate-700 flex items-center gap-2 animate-bounce">
          <span>🎯</span>
          <span>Nhấp chuột lên vị trí mặt đường để chọn tọa độ</span>
        </div>
      )}
    </div>
  );
};
