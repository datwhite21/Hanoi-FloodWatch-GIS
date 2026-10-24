import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Waves,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Map as MapIcon,
  ArrowRight,
  Clock,
  ExternalLink,
  Droplets,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { StatisticsOverview, FloodAlert, FloodPoint } from '../types';
import { LeafletMap } from '../components/map/LeafletMap';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatisticsOverview | null>(null);
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [samplePoints, setSamplePoints] = useState<FloodPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, alertsRes, pointsRes] = await Promise.all([
          api.getStatistics().catch(() => ({ data: null })),
          api.getActiveAlerts().catch(() => ({ data: [] })),
          api.getFloodPoints({ limit: 30 }).catch(() => ({ data: [] })),
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (alertsRes.data) setAlerts(alertsRes.data);
        if (pointsRes.data) setSamplePoints(pointsRes.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu Dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const riskPieData = stats
    ? [
        { name: 'Nguy cơ Cao', value: stats.high_risk_count, color: '#dc2626' },
        { name: 'Nguy cơ Trung bình', value: stats.medium_risk_count, color: '#f59e0b' },
        { name: 'Nguy cơ Thấp', value: stats.low_risk_count, color: '#10b981' },
      ]
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. LIVE ALERT TICKER BANNER (BĂNG CHỮ CẢNH BÁO KHẨN CẤP) */}
      {alerts.length > 0 && (
        <div className="bg-red-600 text-white text-xs py-2.5 px-4 shadow-md flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-extrabold uppercase bg-red-800 px-2.5 py-1 rounded-full text-[10px] tracking-wider shrink-0 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> Khẩn cấp
            </span>
            <div className="overflow-hidden whitespace-nowrap text-xs font-medium">
              <div className="inline-block animate-marquee">
                {alerts.map((a, idx) => (
                  <span key={a.id} className="mr-8">
                    <strong>{a.title}:</strong> {a.message} (Hiệu lực đến {new Date(a.expires_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})
                    {idx < alerts.length - 1 && '  •  '}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/map" className="shrink-0 text-white underline font-semibold text-xs hover:text-red-100 hidden sm:block">
              Xem trên bản đồ &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-brand-950 to-brand-900 p-8 sm:p-12 text-white shadow-2xl overflow-hidden border border-slate-800">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <Waves className="w-96 h-96 text-white" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-sky-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              Nền tảng WebGIS Giám Sát Đô Thị Thông Minh
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Theo dõi & Cảnh báo <br />
              <span className="bg-gradient-to-r from-sky-400 to-blue-200 bg-clip-text text-transparent">
                Nguy cơ Ngập úng Hà Nội
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Ứng dụng hệ thống thông tin địa lý (GIS) và công nghệ cơ sở dữ liệu không gian <strong>PostgreSQL / PostGIS</strong> để hỗ trợ người dân và cơ quan chức năng tra cứu lộ trình an toàn, phân tích bán kính ngập úng trong mùa mưa bão.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/map"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-brand-500/30 hover:scale-102 transition-all"
              >
                <MapIcon className="w-4 h-4" />
                Mở Bản đồ WebGIS Toàn màn hình
              </Link>
              <a
                href="#stats"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
              >
                <span>Xem thống kê khu vực</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KPI METRIC CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Điểm nguy cơ theo dõi
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats?.total_points || 27}
              </span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                Điểm ngập trọng điểm
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Khảo sát thực tế tại Cầu Giấy, Thanh Xuân, Hà Đông...</p>
          </div>

          {/* CARD 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nguy cơ ngập cao (&gt;40cm)
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-600">
                {stats?.high_risk_count || 12}
              </span>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                Giao thông tê liệt
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Hoa Bằng, Phan Văn Trường, Nguyễn Trãi, Ba La...</p>
          </div>

          {/* CARD 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cảnh báo đang hiệu lực
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600">
                {alerts.length}
              </span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Thời gian thực
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Tự động kết thúc khi hết thời hạn cảnh báo</p>
          </div>

          {/* CARD 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Độ chính xác không gian
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">
                100%
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                EPSG:4326 PostGIS
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Khoảng cách tính theo mét trắc địa WGS 84</p>
          </div>
        </div>
      </section>

      {/* 4. OVERVIEW MINI-MAP & LIVE ALERTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BẢN ĐỒ TỔNG QUAN HÀ NỘI */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-sm text-slate-900">Bản đồ Tổng quan Phân bố Điểm ngập Hà Nội</h3>
              </div>
              <Link
                to="/map"
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
              >
                Mở rộng <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="h-[420px] w-full relative">
              <LeafletMap points={samplePoints} center={[21.0268, 105.7942]} zoom={12} />
            </div>
          </div>

          {/* DANH SÁCH CẢNH BÁO MỚI NHẤT */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-sm text-slate-900">Bản tin Cảnh báo Mới</h3>
              </div>
              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                {alerts.length} bản tin
              </span>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-3 max-h-[380px] pr-1">
              {alerts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
                  <span>Hiện tại không có bản tin cảnh báo ngập úng khẩn cấp nào.</span>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                      alert.alert_level === 'RED'
                        ? 'bg-red-50/60 border-red-200'
                        : alert.alert_level === 'ORANGE'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-yellow-50/60 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          alert.alert_level === 'RED'
                            ? 'bg-red-600 text-white'
                            : alert.alert_level === 'ORANGE'
                            ? 'bg-amber-600 text-white'
                            : 'bg-yellow-600 text-white'
                        }`}
                      >
                        {alert.alert_level === 'RED' ? 'Mức Đỏ' : alert.alert_level === 'ORANGE' ? 'Mức Cam' : 'Mức Vàng'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Hết hạn: {new Date(alert.expires_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-snug">{alert.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. THỐNG KÊ BIỂU ĐỒ (RECHARTS) */}
      <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BIỂU ĐỒ CỘT: SỐ ĐIỂM NGẬP THEO QUẬN */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Phân bố Điểm nguy cơ ngập theo Quận/Huyện</h3>
                <p className="text-xs text-slate-500">Thống kê số lượng điểm ngập tại các quận trọng điểm Hà Nội</p>
              </div>
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
                Dữ liệu HSDC 2024
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.points_by_area || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="area_name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`${val} điểm ngập`, 'Số lượng']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="point_count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Tổng số điểm" />
                  <Bar dataKey="high_risk_count" fill="#dc2626" radius={[6, 6, 0, 0]} name="Nguy cơ cao" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BIỂU ĐỒ TRÒN: TỶ LỆ MỨC ĐỘ NGUY CƠ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tỷ lệ Phân cấp Nguy cơ</h3>
              <p className="text-xs text-slate-500">Đánh giá theo thang điểm RiskScore chuẩn hóa</p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} điểm`, 'Số lượng']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-3">
              Mô hình: $RiskScore = 0.40 \times F + 0.35 \times D + 0.25 \times T$
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
