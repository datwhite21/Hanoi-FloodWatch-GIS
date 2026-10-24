import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 text-xs overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 font-bold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-brand-600" /> Chú giải bản đồ
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="p-3 space-y-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 shadow-xs shrink-0 animate-pulse" />
            <span className="text-slate-700"><strong>Nguy cơ Cao:</strong> Ngập &gt; 40cm</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs shrink-0" />
            <span className="text-slate-700"><strong>Nguy cơ TB:</strong> Ngập 20 – 40cm</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shrink-0" />
            <span className="text-slate-700"><strong>Nguy cơ Thấp:</strong> Ngập &lt; 20cm</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400 shadow-xs shrink-0" />
            <span className="text-slate-700"><strong>Chưa xác minh / Demo</strong></span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <span className="w-3 h-3 rounded-full border-2 border-dashed border-blue-600 bg-blue-100 shrink-0" />
            <span className="text-slate-600 text-[11px]">Vùng bán kính phân tích GIS</span>
          </div>
        </div>
      )}
    </div>
  );
};
