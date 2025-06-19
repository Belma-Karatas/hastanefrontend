// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout
import AppLayout from './layouts/AppLayout';

// Admin sayfaları
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
import YatakServisYonetimiPage from './pages/admin/YatakServisYonetimiPage';
import AcilDurumKayitlariPage from './pages/admin/AcilDurumKayitlariPage';

// Hasta sayfaları
import HastaDashboardPage from './pages/hasta/HastaDashboardPage';
import RandevuAlPage from './pages/hasta/RandevuAlPage';
import RandevularimPage from './pages/hasta/RandevularimPage';

// Doktor sayfaları
import DoktorDashboardPage from './pages/doktor/DoktorDashboardPage';
import DoktorRandevularimPage from './pages/doktor/DoktorRandevularimPage';
import DoktorMuayenePage from './pages/doktor/DoktorMuayenePage';
import DoktorIzinTalepPage from './pages/doktor/DoktorIzinTalepPage';
import DoktorVardiyalarimPage from './pages/doktor/DoktorVardiyalarimPage';

// --- HEMŞİRE SAYFALARI IMPORT ---
import HemsireDashboardPage from './pages/hemsire/HemsireDashboardPage';
import HemsireIzinTalepPage from './pages/hemsire/HemsireIzinTalepPage';
import HemsireVardiyalarimPage from './pages/hemsire/HemsireVardiyalarimPage'; // YENİ IMPORT EKLENDİ
// ---------------------------------

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, userRoles } = useAuth();
  if (isLoading) return <div className="min-h-screen flex justify-center items-center text-xl font-semibold">Oturum bilgileri yükleniyor...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (requiredRole && !userRoles.includes(requiredRole)) {
    console.warn(`ProtectedRoute: Yetkisiz erişim denemesi. ${requiredRole} rolü gerekli. Kullanıcının rolleri: ${userRoles.join(', ')}`);
    
    let fallbackPath = "/dashboard"; 
    if (userRoles.includes('ROLE_ADMIN')) fallbackPath = "/admin/dashboard";
    else if (userRoles.includes('ROLE_HEMSIRE')) fallbackPath = "/hemsire/dashboard";
    else if (userRoles.includes('ROLE_DOKTOR')) fallbackPath = "/doktor/dashboard";
    else if (userRoles.includes('ROLE_HASTA')) fallbackPath = "/hasta/dashboard";
    
    return <Navigate to={userRoles.length > 0 ? fallbackPath : "/login"} replace />;
  }
  return children;
};

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

// MENÜ ÖĞELERİ
const adminMenuItems = [
  { name: 'Gösterge Paneli', to: '/admin/dashboard' },
  { name: 'Departman Yönetimi', to: '/admin/departmanlar' },
  { name: 'Branş Yönetimi', to: '/admin/branslar' },
  { name: 'Personel Yönetimi', to: '/admin/personel' },
  { name: 'Duyuru Yönetimi', to: '/admin/duyurular' },
  { name: 'İlaç Yönetimi', to: '/admin/ilaclar' },
  { name: 'Vardiya Tanımları', to: '/admin/vardiya-tanimlari' },
  { name: 'Personel Vardiyaları', to: '/admin/personel-vardiyalari' },
  { name: 'İzin Türleri', to: '/admin/izin-turleri' },
  { name: 'İzin Talepleri', to: '/admin/izin-talepleri' },
  { name: 'Kat Yönetimi', to: '/admin/katlar' },
  { name: 'Yatak ve Servis Yönetimi', to: '/admin/yatak-servis-yonetimi' },
  { name: 'Acil Durum Kayıtları', to: '/admin/acil-durum-kayitlari' },
];

const hastaMenuItems = [
  { name: 'Gösterge Paneli', to: '/hasta/dashboard' },
  { name: 'Randevu Al', to: '/hasta/randevu-al' },
  { name: 'Randevularım', to: '/hasta/randevularim' },
];

const doktorMenuItems = [
  { name: 'Gösterge Paneli', to: '/doktor/dashboard' },
  { name: 'Randevularım', to: '/doktor/randevularim' },
  { name: 'İzin Taleplerim', to: '/doktor/izin-taleplerim' },
  { name: 'Vardiyalarım', to: '/doktor/vardiyalarim' },
];

// --- HEMŞİRE MENÜ ÖĞELERİ ---
const hemsireMenuItems = [
  { name: 'Gösterge Paneli', to: '/hemsire/dashboard' },
  { name: 'İzin Taleplerim', to: '/hemsire/izin-taleplerim' },
  { name: 'Vardiyalarım', to: '/hemsire/vardiyalarim' }, // YORUM SATIRI KALDIRILDI VE EKLENDİ
  // { name: 'Acil Durum Çağrısı', to: '/hemsire/acil-cagri' },
];
// -----------------------------


function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const { isAuthenticated, isLoading, userRoles } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center text-xl font-semibold">Yönlendirme yapılıyor...</div>;
  }

  const isAdmin = userRoles.includes('ROLE_ADMIN');
  const isHasta = userRoles.includes('ROLE_HASTA');
  const isDoktor = userRoles.includes('ROLE_DOKTOR');
  const isHemsire = userRoles.includes('ROLE_HEMSIRE');

  let defaultAuthenticatedPath = "/dashboard"; 
  if (isAdmin) {
    defaultAuthenticatedPath = "/admin/dashboard";
  } else if (isHemsire) { 
    defaultAuthenticatedPath = "/hemsire/dashboard";
  } else if (isDoktor) {
    defaultAuthenticatedPath = "/doktor/dashboard";
  } else if (isHasta) {
    defaultAuthenticatedPath = "/hasta/dashboard";
  }


  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={defaultAuthenticatedPath} replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={defaultAuthenticatedPath} replace /> : <RegisterPage />} />
      
      <Route path="/dashboard" element={ <ProtectedRoute><DashboardPage /></ProtectedRoute>} />

      {/* Admin Rotaları */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AppLayout 
              layoutTitle="Karataş" 
              layoutSubtitle="ADMİN PANELİ" 
              menuItems={adminMenuItems}
              requiredRole="ROLE_ADMIN" 
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
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
        <Route path="yatak-servis-yonetimi" element={<YatakServisYonetimiPage />} />
        <Route path="acil-durum-kayitlari" element={<AcilDurumKayitlariPage />} />
      </Route>

      {/* Hasta Rotaları */}
      <Route
        path="/hasta"
        element={
          <ProtectedRoute requiredRole="ROLE_HASTA">
            <AppLayout 
              layoutTitle="Karataş" 
              layoutSubtitle="HASTA PANELİ" 
              menuItems={hastaMenuItems} 
              requiredRole="ROLE_HASTA"
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HastaDashboardPage />} />
        <Route path="randevu-al" element={<RandevuAlPage />} />
        <Route path="randevularim" element={<RandevularimPage />} />
      </Route>

      {/* Doktor Rotaları */}
      <Route
        path="/doktor"
        element={
          <ProtectedRoute requiredRole="ROLE_DOKTOR">
            <AppLayout 
              layoutTitle="Karataş" 
              layoutSubtitle="DOKTOR PANELİ" 
              menuItems={doktorMenuItems} 
              requiredRole="ROLE_DOKTOR"
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoktorDashboardPage />} />
        <Route path="randevularim" element={<DoktorRandevularimPage />} />
        <Route path="muayene/:randevuId" element={<DoktorMuayenePage />} />
        <Route path="izin-taleplerim" element={<DoktorIzinTalepPage />} />
        <Route path="vardiyalarim" element={<DoktorVardiyalarimPage />} />
      </Route>

      {/* --- HEMŞİRE ROTALARI --- */}
      <Route
        path="/hemsire"
        element={
          <ProtectedRoute requiredRole="ROLE_HEMSIRE">
            <AppLayout 
              layoutTitle="Karataş" 
              layoutSubtitle="HEMŞİRE PANELİ" 
              menuItems={hemsireMenuItems} 
              requiredRole="ROLE_HEMSIRE"
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HemsireDashboardPage />} />
        <Route path="izin-taleplerim" element={<HemsireIzinTalepPage />} />
        <Route path="vardiyalarim" element={<HemsireVardiyalarimPage />} /> {/* YORUM SATIRI KALDIRILDI VE ROTA EKLENDİ */}
      </Route>
      {/* ------------------------ */}

      <Route path="/" element={ <Navigate to={isAuthenticated ? defaultAuthenticatedPath : "/login"} replace /> } />
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