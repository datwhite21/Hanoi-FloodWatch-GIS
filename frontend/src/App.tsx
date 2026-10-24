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

const AppLayout: React.FC = () => {
  const location = useLocation();
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  useEffect(() => {
    api.getActiveAlerts()
      .then((res) => setActiveAlertCount(res.data?.length || 0))
      .catch(() => setActiveAlertCount(0));
  }, []);

  // Trang bản đồ /map chiếm trọn màn hình nên ẩn Footer
  const isMapPage = location.pathname === '/map';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar activeAlertCount={activeAlertCount} />
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
