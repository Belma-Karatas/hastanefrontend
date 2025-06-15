import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Admin sayfalarını import et
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import DepartmanYonetimiPage from './pages/admin/DepartmanYonetimiPage';
import BransYonetimiPage from './pages/admin/BransYonetimiPage';
import PersonelYonetimiPage from './pages/admin/PersonelYonetimiPage';
import DuyuruYonetimiPage from './pages/admin/DuyuruYonetimiPage';
import IzinTuruYonetimiPage from './pages/admin/IzinTuruYonetimiPage';
import IzinTalepYonetimiPage from './pages/admin/IzinTalepYonetimiPage';
import VardiyaTanimlariPage from './pages/admin/VardiyaTanimlariPage';
import PersonelVardiyalariPage from './pages/admin/PersonelVardiyalariPage';
import IlacYonetimiPage from './pages/admin/IlacYonetimiPage';
import KatYonetimiPage from './pages/admin/KatYonetimiPage';
import YatakServisYonetimiPage from './pages/admin/YatakServisYonetimiPage'; // YENİ İMPORT

// Korumalı bir yol bileşeni (Rol kontrolü eklendi)
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, userRoles } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center text-xl font-semibold">Oturum bilgileri yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !userRoles.includes(requiredRole)) {
    console.warn(`Yetkisiz erişim denemesi: ${requiredRole} rolü gerekli. Kullanıcının rolleri: ${userRoles.join(', ')}`);
    return <Navigate to="/dashboard" replace />; // Veya uygun bir "Yetkisiz Erişim" sayfasına
  }

  return children;
};

// Örnek bir Genel Dashboard sayfası (admin olmayanlar için)
const DashboardPage = () => {
  const { logoutContext, userToken, userRoles } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-6 rounded-lg shadow-md text-center w-full max-w-lg">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">Genel Dashboard</h1>
        <p className="text-gray-700 mb-2">Hoş geldiniz! Sistemdeki rolleriniz: {userRoles.join(', ')}</p>
        {userToken && (
          <div className="my-4 p-2 bg-gray-50 rounded border">
            <p className="text-xs text-gray-500">Mevcut Token (Test Amaçlı):</p>
            <p className="text-sm text-gray-700 break-all">{userToken}</p>
          </div>
        )}
        <button
          onClick={logoutContext}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

// Ana Uygulama Bileşeni
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

// Route'ları yöneten bileşen
const AppRoutes = () => {
  const { isAuthenticated, isLoading, userRoles } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center text-xl font-semibold">Yönlendirme yapılıyor...</div>;
  }

  const isAdmin = userRoles.includes('ROLE_ADMIN');
  const defaultAuthenticatedPath = isAdmin ? "/admin/dashboard" : "/dashboard";

  return (
    <Routes>
      {/* Temel Rotalar */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultAuthenticatedPath} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={defaultAuthenticatedPath} replace /> : <RegisterPage />}
      />

      {/* Genel Kullanıcı Dashboard'u */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute> {/* Sadece giriş yapmış olması yeterli, rol belirtilmedi */}
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Korumalı Rotalar */}
      <Route
        path="/admin" // Ana admin yolu
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN"> {/* Sadece ROLE_ADMIN erişebilir */}
            <AdminLayout /> {/* AdminLayout tüm /admin/* alt rotalarını sarar */}
          </ProtectedRoute>
        }
      >
        {/* AdminLayout içindeki <Outlet />'e render edilecek nested route'lar */}
        <Route index element={<Navigate to="dashboard" replace />} /> {/* /admin için varsayılan olarak dashboard'a yönlendir */}
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="departmanlar" element={<DepartmanYonetimiPage />} />
        <Route path="branslar" element={<BransYonetimiPage />} />
        <Route path="personel" element={<PersonelYonetimiPage />} />
        <Route path="duyurular" element={<DuyuruYonetimiPage />} />
        <Route path="izin-turleri" element={<IzinTuruYonetimiPage />} />
        <Route path="izin-talepleri" element={<IzinTalepYonetimiPage />} />
        <Route path="vardiya-tanimlari" element={<VardiyaTanimlariPage />} />
        <Route path="personel-vardiyalari" element={<PersonelVardiyalariPage />} />
        <Route path="ilaclar" element={<IlacYonetimiPage />} />
        <Route path="katlar" element={<KatYonetimiPage />} />
        <Route path="yatak-servis-yonetimi" element={<YatakServisYonetimiPage />} /> {/* YATAK VE SERVİS YÖNETİMİ ROTASI */}
        {/* 
          Oda ve Yatak yönetimi artık YatakServisYonetimiPage içinde ele alınacağı için
          ayrı "/admin/odalar" ve "/admin/yataklar" rotalarına genellikle gerek kalmaz.
          Eğer hala ayrı tutmak istersen, onları da buraya ekleyebilirsin.
        */}
      </Route>

      {/* Uygulama Ana Sayfası Yönlendirmesi */}
      <Route
        path="/"
        element={
          <Navigate 
            to={isAuthenticated ? defaultAuthenticatedPath : "/login"} 
            replace 
          />
        }
      />

      {/* Bulunamayan Sayfalar İçin 404 Rotası */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-6xl font-bold text-red-500">404</h1>
            <p className="text-2xl font-semibold text-gray-700 mt-4">Sayfa Bulunamadı</p>
            <p className="text-gray-500 mt-2">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
            <Link to="/" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-150 ease-in-out">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default App;