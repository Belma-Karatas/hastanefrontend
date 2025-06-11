import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // RegisterPage'i import et
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Korumalı bir yol bileşeni
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center">Yükleniyor...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Örnek bir Dashboard sayfası
const DashboardPage = () => {
  const { logoutContext, userToken } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">Dashboard</h1>
        <p className="text-gray-700 mb-2">Hoş geldiniz! Giriş başarılı.</p>
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
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center">Oturum kontrol ediliyor...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      {/* YENİ ROUTE EKLENDİ */}
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
      {/* <Route path="*" element={<div>404 - Sayfa Bulunamadı</div>} /> */}
    </Routes>
  );
};

export default App;