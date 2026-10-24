import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Download,
  Upload,
  MapPin,
  X,
  Check,
  Search,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FloodPoint, FloodAlert } from '../types';
import { LeafletMap } from '../components/map/LeafletMap';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, token, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'points' | 'alerts' | 'geojson'>('points');
  const [points, setPoints] = useState<FloodPoint[]>([]);
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Thêm / Sửa Điểm ngập
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<FloodPoint | null>(null);
  const [pointForm, setPointForm] = useState({
    name: '',
    address: '',
    description: '',
    latitude: 21.0268,
    longitude: 105.7942,
    frequency_score: 70,
    depth_score: 70,
    duration_score: 70,
    is_demo: false,
  });

  // State Modal Cảnh báo mới
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    alert_level: 'RED' as 'RED' | 'ORANGE' | 'YELLOW',
    expires_hours: 4,
  });

  // Kiểm tra quyền Admin
  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, isAuthLoading, navigate]);

  // Tải dữ liệu ban đầu
  async function loadData() {
    setIsLoading(true);
    try {
      const [pointsRes, alertsRes] = await Promise.all([
        api.getFloodPoints({ limit: 100 }),
        api.getAllAlerts(),
      ]);
      setPoints(pointsRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Mở modal thêm điểm
  const handleOpenAddPoint = () => {
    setEditingPoint(null);
    setPointForm({
      name: '',
      address: '',
      description: '',
      latitude: 21.0268,
      longitude: 105.7942,
      frequency_score: 70,
      depth_score: 70,
      duration_score: 70,
      is_demo: false,
    });
    setIsPointModalOpen(true);
  };

  // Mở modal sửa điểm
  const handleOpenEditPoint = (p: FloodPoint) => {
    setEditingPoint(p);
    setPointForm({
      name: p.name,
      address: p.address,
      description: p.description || '',
      latitude: p.latitude,
      longitude: p.longitude,
      frequency_score: p.frequency_score,
      depth_score: p.depth_score,
      duration_score: p.duration_score,
      is_demo: p.is_demo,
    });
    setIsPointModalOpen(true);
  };

  // Lưu điểm ngập
  const handleSavePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPoint) {
        await api.updateFloodPoint(editingPoint.id, pointForm, token || undefined);
      } else {
        await api.createFloodPoint(pointForm, token || undefined);
      }
      setIsPointModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Lỗi khi lưu điểm ngập: ' + err.message);
    }
  };

  // Xóa điểm ngập
  const handleDeletePoint = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa điểm ngập "${name}" khỏi cơ sở dữ liệu?`)) {
      try {
        await api.deleteFloodPoint(id, token || undefined);
        loadData();
      } catch (err: any) {
        alert('Lỗi xóa điểm: ' + err.message);
      }
    }
  };

  // Lưu cảnh báo mới
  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expiresAt = new Date(Date.now() + alertForm.expires_hours * 60 * 60 * 1000).toISOString();
      await api.createAlert(
        {
          title: alertForm.title,
          message: alertForm.message,
          alert_level: alertForm.alert_level,
          expires_at: expiresAt,
        },
        token || undefined
      );
      setIsAlertModalOpen(false);
      setAlertForm({ title: '', message: '', alert_level: 'RED', expires_hours: 4 });
      loadData();
    } catch (err: any) {
      alert('Lỗi tạo cảnh báo: ' + err.message);
    }
  };

  // Hủy cảnh báo
  const handleDeleteAlert = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn thu hồi/hủy bản tin cảnh báo này?')) {
      try {
        await api.deleteAlert(id, token || undefined);
        loadData();
      } catch (err: any) {
        alert('Lỗi hủy cảnh báo: ' + err.message);
      }
    }
  };

  const filteredPoints = points.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-600" />
            Cổng Quản Trị Hệ Thống WebGIS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý dữ liệu không gian PostGIS, bản tin cảnh báo khẩn cấp và phân quyền dữ liệu
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'points' && (
            <button
              onClick={handleOpenAddPoint}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Thêm điểm ngập mới
            </button>
          )}

          {activeTab === 'alerts' && (
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Phát hành cảnh báo
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('points')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'points'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📍 Danh mục Điểm ngập ({points.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'alerts'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🚨 Quản lý Cảnh báo ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('geojson')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'geojson'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🌐 Xuất / Nhập GeoJSON
        </button>
      </div>

      {/* TAB 1: DANH SÁCH ĐIỂM NGẬP */}
      {activeTab === 'points' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên phố hoặc địa chỉ..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <span className="text-xs text-slate-500">Hiển thị: {filteredPoints.length} điểm</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Tên điểm ngập</th>
                  <th className="py-2.5 px-3">Địa chỉ & Tọa độ</th>
                  <th className="py-2.5 px-3">Mức nguy cơ</th>
                  <th className="py-2.5 px-3">Điểm số</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPoints.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {p.name}
                      {p.is_demo && <span className="ml-2 text-[9px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded">DEMO</span>}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="truncate max-w-xs">{p.address}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          p.risk_level === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : p.risk_level === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{p.risk_score}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditPoint(p)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePoint(p.id, p.name)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa điểm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: QUẢN LÝ CẢNH BÁO */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border space-y-2 ${
                  alert.alert_level === 'RED'
                    ? 'bg-red-50/70 border-red-200'
                    : alert.alert_level === 'ORANGE'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-yellow-50/70 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      alert.alert_level === 'RED'
                        ? 'bg-red-600 text-white'
                        : alert.alert_level === 'ORANGE'
                        ? 'bg-amber-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }`}
                  >
                    Mức {alert.alert_level}
                  </span>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 p-1"
                  >
                    Thu hồi
                  </button>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{alert.title}</h4>
                <p className="text-xs text-slate-600">{alert.message}</p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                  Hết hiệu lực lúc: {new Date(alert.expires_at).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: XUẤT NHẬP GEOJSON */}
      {activeTab === 'geojson' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-base text-slate-900">Xuất dữ liệu bản đồ (GeoJSON)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tải về toàn bộ cơ sở dữ liệu không gian điểm ngập chuẩn RFC 7946 để mở và phân tích trong phần mềm QGIS hoặc ArcGIS.
            </p>
            <div className="pt-3">
              <a
                href={api.getExportGeoJSONUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" /> Tải về file hanoi-flood-points.geojson
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA ĐIỂM NGẬP (KÈM MAP PINPOINTER CHỌN TỌA ĐỘ) */}
      {isPointModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingPoint ? 'Chỉnh sửa điểm ngập' : 'Thêm điểm nguy cơ ngập mới'}
              </h3>
              <button onClick={() => setIsPointModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePoint} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên điểm ngập *</label>
                  <input
                    type="text"
                    required
                    value={pointForm.name}
                    onChange={(e) => setPointForm({ ...pointForm, name: e.target.value })}
                    placeholder="Ví dụ: Phố Hoa Bằng (Yên Hòa)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Địa chỉ đầy đủ *</label>
                  <input
                    type="text"
                    required
                    value={pointForm.address}
                    onChange={(e) => setPointForm({ ...pointForm, address: e.target.value })}
                    placeholder="Ví dụ: Phố Hoa Bằng, Phường Yên Hòa, Cầu Giấy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* BẢN ĐỒ CON CHỌN TỌA ĐỘ BẰNG CÁCH CLICK (PINPOINTER) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" /> Nhấp chuột trên bản đồ con để lấy tọa độ tự động:
                  </label>
                  <span className="font-mono text-[11px] text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded">
                    {pointForm.latitude.toFixed(4)}, {pointForm.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 relative">
                  <LeafletMap
                    points={[
                      {
                        ...pointForm,
                        id: 'temp',
                        risk_level: 'HIGH',
                        risk_score: 70,
                        verification_status: 'VERIFIED',
                        created_at: '',
                        updated_at: '',
                      } as any,
                    ]}
                    center={[pointForm.latitude, pointForm.longitude]}
                    zoom={14}
                    onMapClick={(lat, lng) => setPointForm({ ...pointForm, latitude: lat, longitude: lng })}
                    isPinpointMode={true}
                  />
                </div>
              </div>

              {/* ĐIỂM THÀNH PHẦN */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tần suất (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pointForm.frequency_score}
                    onChange={(e) => setPointForm({ ...pointForm, frequency_score: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Độ sâu (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pointForm.depth_score}
                    onChange={(e) => setPointForm({ ...pointForm, depth_score: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời gian rút (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pointForm.duration_score}
                    onChange={(e) => setPointForm({ ...pointForm, duration_score: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPointModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {editingPoint ? 'Lưu thay đổi' : 'Tạo điểm ngập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PHÁT HÀNH CẢNH BÁO */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Phát hành Bản tin Cảnh báo Mới</h3>
              <button onClick={() => setIsAlertModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlert} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mức độ cảnh báo</label>
                <select
                  value={alertForm.alert_level}
                  onChange={(e: any) => setAlertForm({ ...alertForm, alert_level: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="RED">🔴 Mức ĐỎ (Cực kỳ nguy hiểm - Ngập &gt; 40cm)</option>
                  <option value="ORANGE">🟠 Mức CAM (Nguy hiểm - Ngập 20 - 40cm)</option>
                  <option value="YELLOW">🟡 Mức VÀNG (Cảnh báo khuyến cáo)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiêu đề cảnh báo *</label>
                <input
                  type="text"
                  required
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  placeholder="Ví dụ: CẢNH BÁO: Ngập sâu trên trục đường Nguyễn Trãi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nội dung khuyến cáo *</label>
                <textarea
                  rows={3}
                  required
                  value={alertForm.message}
                  onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                  placeholder="Nêu rõ tình trạng ngập và hướng dẫn lộ trình tránh ngập cho người dân..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Thời hạn hiệu lực (tiếng)</label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={alertForm.expires_hours}
                  onChange={(e) => setAlertForm({ ...alertForm, expires_hours: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Phát hành ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
