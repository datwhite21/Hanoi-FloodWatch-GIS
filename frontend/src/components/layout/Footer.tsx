import React from 'react';
import { Waves, Github, ExternalLink, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* CỘT 1: THÔNG TIN DỰ ÁN */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Waves className="w-5 h-5" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">
                Hanoi FloodWatch GIS
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Hệ thống WebGIS trực tuyến nghiên cứu và hỗ trợ theo dõi, phân tích không gian và cảnh báo nguy cơ ngập úng đô thị tại Hà Nội bằng công nghệ mã nguồn mở (Leaflet, PostgreSQL/PostGIS, Supabase).
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-lg max-w-md">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Dữ liệu phục vụ nghiên cứu học thuật đồ án CNTT. Không thay thế các khuyến cáo chính thức từ Ban chỉ huy PCTT&TKCN TP Hà Nội.</span>
            </div>
          </div>

          {/* CỘT 2: TRỌNG TÂM ĐỊA BÀN */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Trọng tâm nghiên cứu
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-slate-200 transition-colors">Quận Cầu Giấy (Hoa Bằng, Phan Văn Trường...)</li>
              <li className="hover:text-slate-200 transition-colors">Quận Thanh Xuân (Nguyễn Trãi, Bùi Xương Trạch...)</li>
              <li className="hover:text-slate-200 transition-colors">Quận Hà Đông (Quang Trung, KĐT Geleximco...)</li>
              <li className="hover:text-slate-200 transition-colors">Hầm chui Đại lộ Thăng Long</li>
            </ul>
          </div>

          {/* CỘT 3: CÔNG NGHỆ & LIÊN KẾT */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Tài nguyên đồ án
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/datwhite21/Hanoi-FloodWatch-GIS"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub Repository
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <span className="text-slate-400">PostGIS Spatial Engine (EPSG:4326)</span>
              </li>
              <li>
                <span className="text-slate-400">Supabase PostgreSQL 15+</span>
              </li>
              <li>
                <span className="text-slate-400">OpenStreetMap & Leaflet</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 Hanoi FloodWatch GIS. Đồ án Chuyên ngành Công nghệ Thông tin.</p>
        </div>
      </div>
    </footer>
  );
};
