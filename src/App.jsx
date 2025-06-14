import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'; // Link'i ekledik
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Admin sayfalarını import et
import AdminLayout from './layouts/AdminLayout'; // YENİ LAYOUT
import AdminDashboardPage from './pages/admin/AdminDashboardPage'; // YENİ SAYFA
// DepartmanYonetimiPage eklendiğinde buraya import edilecek
// import DepartmanYonetimiPage from './pages/admin/DepartmanYonetimiPage';

// Korumalı bir yol bileşeni (Rol kontrolü eklendi)
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, userRoles } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center text-xl font-semibold">Oturum bilgileri yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Eğer bir rol gerekiyorsa ve kullanıcı o role sahip değilse
  if (requiredRole && !userRoles.includes(requiredRole)) {
    console.warn(`Yetkisiz erişim denemesi: ${requiredRole} rolü gerekli. Kullanıcının rolleri: ${userRoles.join(', ')}`);
    // Yetkisiz kullanıcıları genel dashboard'a veya özel bir "Yetkisiz Erişim" sayfasına yönlendirebiliriz.
    // Şimdilik genel dashboard'a yönlendirelim.
    return <Navigate to="/dashboard" replace />;
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
    // Bu yükleme göstergesi AuthProvider içinde de var, burada tekrar gerek olmayabilir
    // ama AppRoutes ilk render olduğunda AuthContext henüz hazır olmayabilir.
    return <div className="min-h-screen flex justify-center items-center text-xl font-semibold">Yönlendirme yapılıyor...</div>;
  }

  const isAdmin = userRoles.includes('ROLE_ADMIN');
  const defaultAuthenticatedPath = isAdmin ? "/admin/dashboard" : "/dashboard";

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultAuthenticatedPath} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={defaultAuthenticatedPath} replace /> : <RegisterPage />}
      />

      {/* Genel Dashboard (Admin olmayan ve giriş yapmış kullanıcılar için) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute> {/* Sadece giriş yapmış olması yeterli */}
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Rotaları */}
      <Route
        path="/admin" // Ana admin yolu
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN"> {/* Sadece ROLE_ADMIN erişebilir */}
            <AdminLayout /> {/* AdminLayout tüm /admin/* alt rotalarını sarar */}
          </ProtectedRoute>
        }
      >
        {/* AdminLayout içindeki <Outlet />'e render edilecek nested route'lar */}
        <Route index element={<Navigate to="dashboard" replace />} /> {/* /admin -> /admin/dashboard */}
        <Route path="dashboard" element={<AdminDashboardPage />} />
        {/* 
          Örnek Departman Yönetimi Rotası (henüz sayfası oluşturulmadı):
          <Route path="departmanlar" element={<DepartmanYonetimiPage />} /> 
        */}
        {/* Diğer admin sayfaları buraya <Route path="..." element={...} /> olarak eklenecek */}
      </Route>

      {/* Ana Sayfa Yönlendirmesi */}
      <Route
        path="/"
        element={
          <Navigate 
            to={isAuthenticated ? defaultAuthenticatedPath : "/login"} 
            replace 
          />
        }
      />
      {/* Bulunamayan Sayfalar İçin */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-500">404</h1>
            <p className="text-2xl font-semibold text-gray-700 mt-4">Sayfa Bulunamadı</p>
            <p className="text-gray-500 mt-2">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
            <Link to="/" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default App;