import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Waves, Map, LayoutDashboard, Shield, LogIn, LogOut, Menu, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeAlertCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeAlertCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO & BRAND */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Hanoi FloodWatch
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">
                  GIS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Giám sát & Cảnh báo ngập úng đô thị
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION LINKS */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Tổng quan
            </Link>

            <Link
              to="/map"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/map')
                  ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Map className="w-4 h-4 text-brand-500" />
              Bản đồ WebGIS
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/admin')
                    ? 'bg-amber-50 text-amber-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Quản trị hệ thống
              </Link>
            )}
          </nav>

          {/* USER ACTIONS & LIVE ALERT TICKER BADGE */}
          <div className="hidden md:flex items-center gap-3">
            {activeAlertCount > 0 && (
              <Link
                to="/map"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-semibold hover:bg-red-100 transition-colors animate-pulse"
                title={`${activeAlertCount} cảnh báo đang hiệu lực`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>{activeAlertCount} Cảnh báo</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-800">
                    {user.display_name || user.email?.split('@')[0]}
                  </p>
                  <span className="text-[10px] text-amber-700 font-bold uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                Đăng nhập Admin
              </Link>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LayoutDashboard className="w-4 h-4" />
            Tổng quan Dashboard
          </Link>
          <Link
            to="/map"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Map className="w-4 h-4 text-brand-500" />
            Bản đồ WebGIS
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-800 bg-amber-50"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              Quản trị hệ thống
            </Link>
          )}
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất ({user.display_name || user.email})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
