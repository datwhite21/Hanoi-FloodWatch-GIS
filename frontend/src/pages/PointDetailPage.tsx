import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  AlertTriangle,
  Clock,
  Waves,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Layers,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { FloodPoint } from '../types';
import { LeafletMap } from '../components/map/LeafletMap';

export const PointDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [point, setPoint] = useState<FloodPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await api.getFloodPointById(id);
        setPoint(res.data);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin điểm ngập');
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const handleCopyCoords = () => {
    if (!point) return;
    navigator.clipboard.writeText(`${point.latitude}, ${point.longitude}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Đang tải hồ sơ điểm ngập...</p>
      </div>
    );
  }

  if (error || !point) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Không tìm thấy điểm ngập</h2>
        <p className="text-xs text-slate-500">{error || 'Điểm ngập không tồn tại hoặc đã bị xóa.'}</p>
        <Link to="/map" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 underline">
          &larr; Quay lại bản đồ WebGIS
        </Link>
      </div>
    );
  }

  const riskColor =
    point.risk_level === 'HIGH'
      ? 'bg-red-500 text-white'
      : point.risk_level === 'MEDIUM'
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-500 text-white';

  const observations = point.observations || [];
  const chartData = observations
    .map((obs) => ({
      date: new Date(obs.observed_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      depth: obs.water_depth_cm,
      duration: obs.duration_minutes || 0,
    }))
    .reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800">Trang chủ</Link>
        <span>/</span>
        <Link to="/map" className="hover:text-slate-800">Bản đồ WebGIS</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{point.name}</span>
      </div>

      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full shadow-xs ${riskColor}`}>
              {point.risk_level === 'HIGH' ? 'Nguy cơ Cao' : point.risk_level === 'MEDIUM' ? 'Nguy cơ Trung bình' : 'Nguy cơ Thấp'}
            </span>
            {point.is_demo && (
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                DỮ LIỆU MÔ PHỎNG [DEMO]
              </span>
            )}
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Đã xác minh
            </span>
          </div>

          <button
            onClick={handleCopyCoords}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{point.name}</h1>
          <p className="mt-1 text-sm text-slate-600 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{point.address}</span>
          </p>
        </div>

        {point.description && (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
            <strong>Đặc điểm địa hình & tiêu thoát:</strong> {point.description}
          </div>
        )}
      </div>

      {/* METRIC SCORE BREAKDOWN & MINI MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ĐIỂM SỐ NGUY CƠ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Chỉ số Nguy cơ Ngập</h3>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
              Thang 0 - 100
            </span>
          </div>

          <div className="text-center py-2">
            <div className="text-5xl font-black tracking-tight text-slate-900">{point.risk_score}</div>
            <p className="text-xs text-slate-400 mt-1">Điểm rủi ro tổng hợp ($RiskScore$)</p>
          </div>

          {/* CÁC THÀNH PHẦN TRỌNG SỐ */}
          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-600 mb-1">
                <span>Tần suất ngập (40%)</span>
                <strong>{point.frequency_score}/100</strong>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${point.frequency_score}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-600 mb-1">
                <span>Độ sâu mực nước (35%)</span>
                <strong>{point.depth_score}/100</strong>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${point.depth_score}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-600 mb-1">
                <span>Thời gian rút nước (25%)</span>
                <strong>{point.duration_score}/100</strong>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${point.duration_score}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Nguồn trích dẫn: {point.source_name || 'Công ty TNHH MTV Thoát nước Hà Nội (HSDC)'}
          </div>
        </div>

        {/* BẢN ĐỒ VỊ TRÍ KHÔNG GIAN */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-600" /> Vị trí không gian trên bản đồ
            </span>
            <a
              href={`https://www.google.com/maps?q=${point.latitude},${point.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              Mở Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="h-72 w-full relative">
            <LeafletMap points={[point]} center={[point.latitude, point.longitude]} zoom={15} />
          </div>
        </div>
      </div>

      {/* HISTORICAL OBSERVATIONS & CHART */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Lịch sử Quan trắc Ngập úng Thực tế</h3>
            <p className="text-xs text-slate-500">Mực nước ngập đo được (cm) qua các trận bão và mưa lớn</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            {observations.length} lần ghi nhận
          </span>
        </div>

        {observations.length > 0 && chartData.length > 1 && (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis unit="cm" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} cm`, 'Độ sâu ngập']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="depth" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4 }} name="Độ sâu ngập" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* BẢNG LỊCH SỬ CHI TIẾT */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Thời điểm quan trắc</th>
                <th className="py-2.5 px-3">Độ sâu (cm)</th>
                <th className="py-2.5 px-3">Thời gian ngập (phút)</th>
                <th className="py-2.5 px-3">Tình trạng</th>
                <th className="py-2.5 px-3">Ghi chú hiện trường</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {observations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Chưa có số liệu quan trắc lịch sử chi tiết cho điểm này.
                  </td>
                </tr>
              ) : (
                observations.map((obs) => (
                  <tr key={obs.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(obs.observed_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-3 font-bold text-red-600">
                      {obs.water_depth_cm} cm
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {obs.duration_minutes ? `${obs.duration_minutes} phút` : 'Đang cập nhật'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {obs.flood_status === 'RECEDED' ? 'Đã rút nước' : obs.flood_status === 'PEAK' ? 'Đỉnh ngập' : 'Đang ngập'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {obs.notes || 'Không có ghi chú'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
