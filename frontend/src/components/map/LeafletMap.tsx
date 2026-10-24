import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FloodPoint, RiskLevel } from '../../types';

interface LeafletMapProps {
  points: FloodPoint[];
  center?: [number, number];
  zoom?: number;
  radiusCenter?: [number, number] | null;
  radiusMeters?: number;
  selectedPointId?: string | null;
  onMapClick?: (lat: number, lng: number) => void;
  onPointSelect?: (point: FloodPoint) => void;
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

export const LeafletMap: React.FC<LeafletMapProps> = ({
  points,
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

    // Đặt Google Maps làm lớp bản đồ hiển thị mặc định
    googleRoadLayer.addTo(map);

    // Bộ chọn lớp bản đồ nền (Base Layers Control) đa dạng
    L.control.layers(
      {
        '🗺️ Google Maps': googleRoadLayer,
        '🎨 CartoDB Đô thị': voyagerLayer,
        '🛰️ Google Vệ tinh': googleHybridLayer,
        '🌍 Esri Vệ tinh': satelliteLayer,
        '📍 OpenStreetMap': osmLayer,
      },
      undefined,
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

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
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

  // 4. Render Vòng tròn Bán kính Không gian (Spatial Circle)
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
