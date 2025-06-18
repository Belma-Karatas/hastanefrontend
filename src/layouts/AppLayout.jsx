// src/layouts/AppLayout.jsx
import React from 'react';
import { Outlet, Link, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// DOKTOR MENÜ ÖĞELERİNİ DE BURAYA EKLEYELİM VEYA AYRI BİR YERDEN IMPORT EDELİM
// Şimdilik App.jsx'te tanımladığımızı varsayıyoruz, bu sadece AppLayout'un nasıl kullanıldığına dair bir örnek
/*
const doktorMenuItems = [
  { name: 'Gösterge Paneli', to: '/doktor/dashboard' },
  { name: 'Randevularım', to: '/doktor/randevularim' },
  { name: 'İzin Taleplerim', to: '/doktor/izin-taleplerim' },
  { name: 'Vardiyalarım', to: '/doktor/vardiyalarim' },
];
*/

const AppLayout = ({ layoutTitle, layoutSubtitle, menuItems, requiredRole }) => {
  const { isAuthenticated, userRoles, logoutContext } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // requiredRole kontrolü ProtectedRoute tarafından zaten yapılıyor,
  // ama burada ek bir güvenlik katmanı olarak kalabilir.
  if (requiredRole && !userRoles.includes(requiredRole)) {
    console.warn(`AppLayout: Yetkisiz erişim denemesi. ${requiredRole} rolü gerekli. Kullanıcının rolleri: ${userRoles.join(', ')}`);
    // Yönlendirme için varsayılan path'i belirle
    const isAdmin = userRoles.includes('ROLE_ADMIN');
    const isHasta = userRoles.includes('ROLE_HASTA');
    const isDoktor = userRoles.includes('ROLE_DOKTOR'); // Doktor rolünü kontrol et

    let defaultPathForRole = "/dashboard"; // Genel bir fallback
    if (isAdmin) defaultPathForRole = "/admin/dashboard";
    else if (isHasta) defaultPathForRole = "/hasta/dashboard";
    else if (isDoktor) defaultPathForRole = "/doktor/dashboard"; // Doktor için varsayılan

    return <Navigate to={userRoles.length > 0 ? defaultPathForRole : "/login"} replace />;
  }

  // Sidebar başlık linkini role göre ayarla
  let sidebarLinkTo = "/dashboard"; // Genel varsayılan
  if (userRoles.includes('ROLE_ADMIN')) {
    sidebarLinkTo = "/admin/dashboard";
  } else if (userRoles.includes('ROLE_HASTA')) {
    sidebarLinkTo = "/hasta/dashboard";
  } else if (userRoles.includes('ROLE_DOKTOR')) {
    sidebarLinkTo = "/doktor/dashboard";
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#023E8A] text-white flex flex-col shadow-lg">
        <div className="p-6 text-center border-b border-blue-700">
          {/* GÜNCELLENEN KISIM: sidebarLinkTo kullanıldı */}
          <Link to={sidebarLinkTo} className="text-white hover:text-indigo-300 transition-colors">
            <h1 className="text-3xl font-bold leading-tight tracking-wide">{layoutTitle || "Karataş"}</h1>
            <span className="text-xl font-semibold tracking-wider">{layoutSubtitle || "HEALTH"}</span>
          </Link>
        </div>
        <nav className="flex-grow px-2 py-4 overflow-y-auto">
          {menuItems && menuItems.length > 0 ? (
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center py-2.5 px-4 rounded transition duration-200 ease-in-out
                      ${isActive
                        ? 'bg-[#0077B6] text-white shadow-inner' // Aktif link stili
                        : 'text-indigo-100 hover:bg-[#005f8e] hover:text-white' // Pasif link stili
                      }`
                    }
                  >
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-indigo-200">Menü öğesi bulunamadı.</p>
          )}
        </nav>
        <div className="p-4 mt-auto border-t border-blue-700">
          <button
            onClick={logoutContext}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 p-6 md:p-10 overflow-y-auto"
        style={{
          backgroundImage: "url('/sayfalar.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;