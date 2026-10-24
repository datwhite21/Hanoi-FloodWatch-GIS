import React, { useState } from 'react';
import { X, MapPin, Send, Navigation, AlertTriangle, CheckCircle2, Waves } from 'lucide-react';
import { api } from '../../services/api';
import { CitizenReport } from '../../types';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReport: CitizenReport) => void;
  initialLat?: number;
  initialLng?: number;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialLat = 21.0285,
  initialLng = 105.8542,
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [address, setAddress] = useState<string>('');
  const [depthLevel, setDepthLevel] = useState<'ANKLE' | 'HALF_WHEEL' | 'FLOOD_DEEP'>('HALF_WHEEL');
  const [depthCm, setDepthCm] = useState<number>(35);
  const [description, setDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Lấy tọa độ GPS thực tế từ thiết bị di động / máy tính
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Trình duyệt của bạn không hỗ trợ định vị GPS');
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        setIsLocating(false);

        // Gợi ý địa chỉ từ Nominatim OpenStreetMap (Reverse Geocoding)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setAddress(data.display_name.split(',').slice(0, 3).join(','));
            }
          }
        } catch {
          // Bỏ qua nếu lỗi mạng
        }
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg('Không thể lấy vị trí GPS. Vui lòng cấp quyền vị trí hoặc nhập tọa độ/địa chỉ bằng tay.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDepthChange = (level: 'ANKLE' | 'HALF_WHEEL' | 'FLOOD_DEEP') => {
    setDepthLevel(level);
    if (level === 'ANKLE') setDepthCm(15);
    else if (level === 'HALF_WHEEL') setDepthCm(35);
    else setDepthCm(100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setErrorMsg('Vui lòng nhập tên đường hoặc địa chỉ đang bị ngập');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await api.submitCitizenReport({
        reporter_name: reporterName.trim() || 'Người dân',
        latitude: lat,
        longitude: lng,
        address: address.trim(),
        water_depth_level: depthLevel,
        estimated_depth_cm: depthCm,
        description: description.trim() || undefined,
      });

      if (res && res.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Báo Ngập Úng Thời Gian Thực</h3>
              <p className="text-[11px] text-blue-100">Cộng đồng chia sẻ thông tin giao thông & cứu hộ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VỊ TRÍ & NÚT LẤY GPS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Vị trí điểm ngập
              </label>
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={isLocating}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                {isLocating ? 'Đang định vị GPS...' : 'Lấy GPS của tôi'}
              </button>
            </div>

            <input
              type="text"
              required
              placeholder="VD: Cổng trường ĐH GTVT, Ngã tư Huỳnh Thúc Kháng, Đập Đá Huế..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Tọa độ: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
              <span>Định dạng chuẩn WGS84</span>
            </div>
          </div>

          {/* CHỌN MỨC ĐỘ SÂU */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Mức độ sâu nước ngập thực tế
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* MỨC 1: MẮT CÁ CHÂN */}
              <button
                type="button"
                onClick={() => handleDepthChange('ANKLE')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  depthLevel === 'ANKLE'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <span className="text-xl">🟢</span>
                  <div className="font-bold text-xs text-slate-900 mt-1">Mắt cá chân</div>
                  <div className="text-[10px] text-slate-500">~15 cm</div>
                </div>
                <div className="text-[9px] text-emerald-700 font-semibold mt-1">Xe đi chậm được</div>
              </button>

              {/* MỨC 2: NỬA BÁNH XE */}
              <button
                type="button"
                onClick={() => handleDepthChange('HALF_WHEEL')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  depthLevel === 'HALF_WHEEL'
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <span className="text-xl">🟡</span>
                  <div className="font-bold text-xs text-slate-900 mt-1">Nửa bánh xe</div>
                  <div className="text-[10px] text-slate-500">~35 cm</div>
                </div>
                <div className="text-[9px] text-amber-700 font-semibold mt-1">Dễ chết máy</div>
              </button>

              {/* MỨC 3: NGẬP SÂU NGUY HIỂM / LŨ MIỀN TRUNG */}
              <button
                type="button"
                onClick={() => handleDepthChange('FLOOD_DEEP')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  depthLevel === 'FLOOD_DEEP'
                    ? 'border-red-500 bg-red-50/60 ring-2 ring-red-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <span className="text-xl">🔴</span>
                  <div className="font-bold text-xs text-slate-900 mt-1">Lũ sâu nguy hiểm</div>
                  <div className="text-[10px] text-slate-500">&gt; 1 mét</div>
                </div>
                <div className="text-[9px] text-red-700 font-semibold mt-1">Không thể đi qua!</div>
              </button>
            </div>
          </div>

          {/* MÔ TẢ CHI TIẾT */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ghi chú thêm (Tình trạng xe cộ, dòng nước chảy xiết...)
            </label>
            <textarea
              rows={2}
              placeholder="VD: Nước chảy xiết từ ngõ ra, nhiều xe máy dắt bộ, đã có dây chăng cảnh báo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* TÊN NGƯỜI BÁO (TÙY CHỌN) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tên của bạn (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Người dân / Bác tài xế (mặc định để trống: Người dân)"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* BUTTON ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Đang gửi...' : 'Gửi cảnh báo ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
