import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { PointDetailPage } from './pages/PointDetailPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { api } from './services/api';

import { ErrorBoundary } from './components/common/ErrorBoundary';

import { CitizenReportModal } from './components/citizen/CitizenReportModal';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getActiveAlerts()
      .then((res) => setActiveAlertCount(res.data?.length || 0))
      .catch(() => setActiveAlertCount(0));
  }, []);

  const handleReportSuccess = (report: any) => {
    setToastMessage(`Đã gửi báo cáo thành công tại "${report.address}". Cảm ơn đóng góp của bạn!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Trang bản đồ /map chiếm trọn màn hình nên ẩn Footer
  const isMapPage = location.pathname === '/map';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 relative">
      <Navbar
        activeAlertCount={activeAlertCount}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* TOAST THÔNG BÁO THÀNH CÔNG */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[2000] bg-emerald-600 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <span>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODAL BÁO NGẬP CỘNG ĐỒNG */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={handleReportSuccess}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/points/:id" element={<PointDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </main>
      {!isMapPage && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
