import React from 'react';
import { Target, Navigation, X, AlertCircle } from 'lucide-react';
import { FloodPoint } from '../../types';

interface RadiusToolProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  radiusMeters: number;
  onRadiusChange: (meters: number) => void;
  centerCoords: [number, number] | null;
  onLocateMe: () => void;
  onReset: () => void;
  results: FloodPoint[];
  onSelectResult: (point: FloodPoint) => void;
}

export const RadiusTool: React.FC<RadiusToolProps> = ({
  isActive,
  onToggle,
  radiusMeters,
  onRadiusChange,
  centerCoords,
  onLocateMe,
  onReset,
  results,
  onSelectResult,
}) => {
  const radiusOptions = [
    { label: '500 m', value: 500 },
    { label: '1 km', value: 1000 },
    { label: '2 km', value: 2000 },
    { label: '3 km', value: 3000 },
    { label: '5 km', value: 5000 },
  ];

  if (!isActive) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-white/95 backdrop-blur-md text-slate-800 rounded-xl shadow-lg border border-slate-200/80 font-semibold text-xs hover:bg-brand-50 hover:text-brand-700 transition-all duration-200"
        title="Công cụ phân tích bán kính không gian"
      >
        <Target className="w-4 h-4 text-brand-600" />
        <span>Quét bán kính</span>
      </button>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200/90 w-80 max-h-[85vh] flex flex-col space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-sm text-slate-900">Phân tích Bán kính GIS</h3>
        </div>
        <button
          onClick={() => {
            onReset();
            onToggle(false);
          }}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CHỌN BÁN KÍNH */}
      <div>
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
          Chọn bán kính quét:
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {radiusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onRadiusChange(opt.value)}
              className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                radiusMeters === opt.value
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* TÂM QUÉT & ĐỊNH VỊ GPS */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">
            {centerCoords ? (
              <span className="text-brand-700 font-semibold flex items-center gap-1">
                📍 {centerCoords[0].toFixed(4)}, {centerCoords[1].toFixed(4)}
              </span>
            ) : (
              <span className="text-slate-500 italic">Nhấp chuột lên bản đồ để đặt tâm</span>
            )}
          </span>
          <button
            onClick={onLocateMe}
            className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs"
            title="Sử dụng GPS định vị của thiết bị"
          >
            <Navigation className="w-3 h-3" />
            Vị trí của tôi
          </button>
        </div>
      </div>

      {/* KẾT QUẢ QUÉT BÁN KÍNH */}
      {centerCoords && (
        <div className="flex-1 overflow-hidden flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-0.5">
            <span>Tìm thấy: <strong className="text-brand-700">{results.length}</strong> điểm ngập</span>
            {results.length > 0 && (
              <span className="text-[11px] text-slate-500 font-normal">Sắp xếp theo khoảng cách</span>
            )}
          </div>

          <div className="overflow-y-auto space-y-2 pr-1 max-h-56">
            {results.length === 0 ? (
              <div className="p-4 text-center bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex flex-col items-center gap-1">
                <span className="text-base">🛡️</span>
                <span className="font-semibold">Khu vực an toàn</span>
                <span className="text-[11px] text-emerald-700">Không có điểm nguy cơ ngập nào trong bán kính {radiusMeters}m</span>
              </div>
            ) : (
              results.map((point) => (
                <div
                  key={point.id}
                  onClick={() => onSelectResult(point)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-brand-500 hover:shadow-sm cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 truncate">{point.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        point.risk_level === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : point.risk_level === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {point.risk_level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{point.address}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="font-semibold text-brand-600">
                      Cách tâm: {point.distance_meters !== undefined ? `${point.distance_meters} m` : 'N/A'}
                    </span>
                    <span className="text-slate-400 text-[10px]">Điểm: {point.risk_score}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
