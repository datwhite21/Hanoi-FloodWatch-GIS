import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchProfile(userId: string, email?: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Chưa có profile, tự động tạo mặc định
        await supabase.from('profiles').insert([
          { id: userId, display_name: email?.split('@')[0] || 'User', role: 'user' }
        ]);
        setUser({ id: userId, email, role: 'user', display_name: email?.split('@')[0] });
      } else if (data) {
        setUser({ id: userId, email, role: data.role || 'user', display_name: data.display_name });
      }
    } catch (e) {
      console.error('Lỗi tải hồ sơ người dùng:', e);
      setUser({ id: userId, email, role: 'user' });
    }
  }

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    // 1. Kiểm tra session hiện tại khi tải trang
    try {
      supabase.auth
        .getSession()
        .then((res) => {
          if (!isMounted) return;
          if (res?.data?.session) {
            setToken(res.data.session.access_token);
            fetchProfile(res.data.session.user.id, res.data.session.user.email);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Supabase getSession non-fatal error:', err);
          if (isMounted) setIsLoading(false);
        });
    } catch (e) {
      console.warn('Supabase getSession exception:', e);
      setIsLoading(false);
    }

    // 2. Lắng nghe thay đổi trạng thái đăng nhập
    try {
      const authListener = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session) {
          setToken(session.access_token);
          fetchProfile(session.user.id, session.user.email);
        } else {
          setToken(null);
          setUser(null);
        }
        setIsLoading(false);
      });
      subscription = authListener?.data?.subscription;
    } catch (e) {
      console.warn('onAuthStateChange exception:', e);
    }

    return () => {
      isMounted = false;
      try {
        subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (data.session) {
      setToken(data.session.access_token);
      await fetchProfile(data.user.id, data.user.email);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
