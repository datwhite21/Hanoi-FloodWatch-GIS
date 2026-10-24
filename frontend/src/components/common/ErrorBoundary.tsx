import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chi tiết lỗi trong giao diện React:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border border-red-200 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
              ⚠️
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Đã phát hiện sự cố hiển thị</h2>
            <p className="text-xs text-slate-600">
              Hệ thống đã bắt được thông tin lỗi runtime bên dưới thay vì để màn hình trắng:
            </p>
            <div className="text-left bg-slate-900 text-red-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">
              {this.state.error?.stack || this.state.error?.message || 'Unknown JavaScript Runtime Error'}
            </div>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
              >
                Tải lại trang (Reload)
              </button>
              <button
                onClick={() => {
                  window.location.href = '/map';
                }}
                className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-semibold transition-all"
              >
                Vào thẳng Bản đồ (/map)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
