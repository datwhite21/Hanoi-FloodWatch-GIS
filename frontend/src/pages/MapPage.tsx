import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FloodPoint } from '../types';
import { LeafletMap } from '../components/map/LeafletMap';
import { MapSidebar } from '../components/map/MapSidebar';
import { RadiusTool } from '../components/map/RadiusTool';
import { MapLegend } from '../components/map/MapLegend';
import { Download, Compass, RefreshCw } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [points, setPoints] = useState<FloodPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<FloodPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<FloodPoint | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0268, 105.7942]); // Yên Hòa, Cầu Giấy
  const [mapZoom, setMapZoom] = useState(13);

  // Bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');

  // Công cụ bán kính
  const [isRadiusActive, setIsRadiusActive] = useState(false);
  const [radiusMeters, setRadiusMeters] = useState(2000);
  const [radiusCenter, setRadiusCenter] = useState<[number, number] | null>(null);
  const [radiusResults, setRadiusResults] = useState<FloodPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Tải danh sách điểm ngập ban đầu
  async function loadPoints() {
    setIsLoading(true);
    try {
      const res = await api.getFloodPoints({ limit: 100 });
      setPoints(res.data);
      setFilteredPoints(res.data);
    } catch (err) {
      console.error('Lỗi tải điểm ngập:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPoints();
  }, []);

  // 2. Xử lý bộ lọc phía Client
  useEffect(() => {
    let result = [...points];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      );
    }

    if (selectedDistrict !== 'all') {
      result = result.filter(
        (p) => (p.area_name && p.area_name.includes(selectedDistrict)) || p.address.includes(selectedDistrict)
      );
    }

    if (selectedRisk !== 'all') {
      result = result.filter((p) => p.risk_level === selectedRisk);
    }

    setFilteredPoints(result);
  }, [searchQuery, selectedDistrict, selectedRisk, points]);

  // 3. Xử lý sự kiện click lên bản đồ
  const handleMapClick = async (lat: number, lng: number) => {
    if (isRadiusActive) {
      setRadiusCenter([lat, lng]);
      try {
        const res = await api.getNearby(lat, lng, radiusMeters);
        setRadiusResults(res.points);
      } catch (err) {
        console.error('Lỗi truy vấn bán kính:', err);
      }
    }
  };

  // 4. Khi người dùng đổi bán kính quét
  const handleRadiusChange = async (meters: number) => {
    setRadiusMeters(meters);
    if (radiusCenter) {
      try {
        const res = await api.getNearby(radiusCenter[0], radiusCenter[1], meters);
        setRadiusResults(res.points);
      } catch (err) {
        console.error('Lỗi cập nhật bán kính:', err);
      }
    }
  };

  // 5. GPS Định vị vị trí người dùng
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter([lat, lng]);
          setMapZoom(14);
          setRadiusCenter([lat, lng]);
          setIsRadiusActive(true);

          try {
            const res = await api.getNearby(lat, lng, radiusMeters);
            setRadiusResults(res.points);
          } catch (err) {
            console.error('Lỗi quét vị trí GPS:', err);
          }
        },
        () => {
          alert('Không thể truy cập GPS của thiết bị. Vui lòng cấp quyền định vị trong trình duyệt.');
        }
      );
    }
  };

  // 6. Reset công cụ bán kính
  const handleResetRadius = () => {
    setRadiusCenter(null);
    setRadiusResults([]);
  };

  // 7. Chọn điểm từ Sidebar hoặc Radius tool
  const handleSelectPoint = (point: FloodPoint) => {
    setSelectedPoint(point);
    setMapCenter([point.latitude, point.longitude]);
    setMapZoom(16);
  };

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden flex">
      {/* SIDEBAR TÌM KIẾM & BỘ LỌC */}
      <MapSidebar
        points={filteredPoints}
        selectedPointId={selectedPoint?.id}
        onSelectPoint={handleSelectPoint}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDistrict={selectedDistrict}
        onDistrictChange={setSelectedDistrict}
        selectedRisk={selectedRisk}
        onRiskChange={setSelectedRisk}
      />

      {/* BẢN ĐỒ KHÔNG GIAN LEAFLET CHÍNH */}
      <div className="flex-1 relative h-full w-full">
        <LeafletMap
          points={isRadiusActive && radiusCenter ? radiusResults : filteredPoints}
          center={mapCenter}
          zoom={mapZoom}
          radiusCenter={radiusCenter}
          radiusMeters={isRadiusActive ? radiusMeters : 0}
          selectedPointId={selectedPoint?.id}
          onMapClick={handleMapClick}
          onPointSelect={handleSelectPoint}
          isPinpointMode={isRadiusActive && !radiusCenter}
        />

        {/* CÔNG CỤ BÁN KÍNH NẰM GÓC TRÊN BÊN PHẢI */}
        <div className="absolute top-4 right-4 z-[400]">
          <RadiusTool
            isActive={isRadiusActive}
            onToggle={setIsRadiusActive}
            radiusMeters={radiusMeters}
            onRadiusChange={handleRadiusChange}
            centerCoords={radiusCenter}
            onLocateMe={handleLocateMe}
            onReset={handleResetRadius}
            results={radiusResults}
            onSelectResult={handleSelectPoint}
          />
        </div>

        {/* CHÚ GIẢI BẢN ĐỒ GÓC DƯỚI BÊN TRÁI */}
        <div className="absolute bottom-6 left-4 z-[400] max-w-xs">
          <MapLegend />
        </div>

        {/* THANH CÔNG CỤ NHANH GÓC TRÊN BÊN TRÁI */}
        <div className="absolute top-4 left-4 z-[400] flex items-center gap-2">
          <button
            onClick={loadPoints}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md text-slate-700 rounded-xl shadow-md border border-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors"
            title="Làm mới dữ liệu từ CSDL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <a
            href={api.getExportGeoJSONUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md text-slate-700 rounded-xl shadow-md border border-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors"
            title="Tải về file GeoJSON để mở trên QGIS"
          >
            <Download className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Xuất GeoJSON</span>
          </a>
        </div>
      </div>
    </div>
  );
};
