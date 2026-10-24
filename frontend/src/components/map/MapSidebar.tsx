import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, MapPin, Eye } from 'lucide-react';
import { FloodPoint, RiskLevel } from '../../types';

interface MapSidebarProps {
  points: FloodPoint[];
  selectedPointId?: string | null;
  onSelectPoint: (point: FloodPoint) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  selectedRisk: string;
  onRiskChange: (risk: string) => void;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  points,
  selectedPointId,
  onSelectPoint,
  searchQuery,
  onSearchChange,
  selectedDistrict,
  onDistrictChange,
  selectedRisk,
  onRiskChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const districts = [
    { label: 'Tất cả quận', value: 'all' },
    { label: 'Cầu Giấy', value: 'Cầu Giấy' },
    { label: 'Thanh Xuân', value: 'Thanh Xuân' },
    { label: 'Hà Đông', value: 'Hà Đông' },
    { label: 'Đống Đa', value: 'Đống Đa' },
    { label: 'Nam Từ Liêm', value: 'Nam Từ Liêm' },
    { label: 'Bắc Từ Liêm', value: 'Bắc Từ Liêm' },
    { label: 'Hoàng Mai', value: 'Hoàng Mai' },
    { label: 'Hai Bà Trưng', value: 'Hai Bà Trưng' },
    { label: 'Tây Hồ', value: 'Tây Hồ' },
  ];

  const riskFilters = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Cao', value: 'HIGH', color: 'bg-red-500' },
    { label: 'Trung bình', value: 'MEDIUM', color: 'bg-amber-500' },
    { label: 'Thấp', value: 'LOW', color: 'bg-emerald-500' },
  ];

  return (
    <div
      className={`relative z-20 h-full bg-white/95 backdrop-blur-md border-r border-slate-200/80 shadow-xl transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-0 -ml-2' : 'w-80 sm:w-96'
      }`}
    >
      {/* NÚT THU GỌN / MỞ RỘNG SIDEBAR */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-6 z-30 w-7 h-7 bg-white rounded-full border border-slate-300 shadow-md flex items-center justify-center text-slate-600 hover:text-brand-600 transition-colors"
        title={isCollapsed ? 'Mở thanh điều khiển' : 'Thu gọn thanh điều khiển'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {!isCollapsed && (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-4 space-y-3.5">
          {/* SEARCH BOX */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên phố, địa chỉ..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          {/* BỘ LỌC QUẬN & NGUY CƠ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Bộ lọc khu vực
              </span>
            </div>

            {/* Dropdown Quận */}
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-800"
            >
              {districts.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            {/* Bộ lọc nguy cơ */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {riskFilters.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onRiskChange(r.value)}
                  className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all text-center flex items-center justify-center gap-1 ${
                    selectedRisk === r.value
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.color && <span className={`w-1.5 h-1.5 rounded-full ${r.color}`} />}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* DANH SÁCH ĐIỂM NGẬP */}
          <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between pb-2 text-xs font-semibold text-slate-600">
              <span>Danh sách điểm ({points.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {points.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không tìm thấy điểm ngập nào phù hợp bộ lọc.
                </div>
              ) : (
                points.map((point) => {
                  const isSelected = selectedPointId === point.id;
                  return (
                    <div
                      key={point.id}
                      onClick={() => onSelectPoint(point)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-brand-50/80 border-brand-500 shadow-sm'
                          : 'bg-white border-slate-200/80 hover:border-brand-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                          {point.name}
                        </h4>
                        <span
                          className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            point.risk_level === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : point.risk_level === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {point.risk_level === 'HIGH'
                            ? 'Cao'
                            : point.risk_level === 'MEDIUM'
                            ? 'TB'
                            : 'Thấp'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{point.address}</span>
                      </p>

                      <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                        <span>Điểm nguy cơ: <strong className="text-slate-700 font-semibold">{point.risk_score}</strong></span>
                        <a
                          href={`/points/${point.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold"
                        >
                          <Eye className="w-3 h-3" /> Chi tiết
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
