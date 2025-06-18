// src/layouts/AppLayout.jsx (Eski AdminLayout.jsx)
import React from 'react';
import { Outlet, Link, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// BU BİLEŞEN ARTIK PROP'LAR ALACAK
const AppLayout = ({ layoutTitle, layoutSubtitle, menuItems, requiredRole }) => {
  const { isAuthenticated, userRoles, logoutContext } = useAuth();

  // Yetkilendirme kontrolü (ProtectedRoute'da zaten yapılıyor ama burada da bir katman olabilir)
  // Veya ProtectedRoute direkt bu layout'u sarmalayabilir. App.jsx'te öyle yapacağız.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && !userRoles.includes(requiredRole)) {
    console.warn(`AppLayout: Yetkisiz erişim denemesi. ${requiredRole} rolü gerekli. Kullanıcının rolleri: ${userRoles.join(', ')}`);
    // Eğer buraya kadar gelmişse ve rol uymuyorsa, bir önceki dashboard'a veya login'e yönlendirelim.
    // App.jsx'teki ProtectedRoute bu durumu zaten yakalamalı.
    const isAdmin = userRoles.includes('ROLE_ADMIN');
    const defaultPath = isAdmin ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={userRoles.length > 0 ? defaultPath : "/login"} replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#023E8A] text-white flex flex-col shadow-lg">
        <div className="p-6 text-center border-b border-blue-700">
          <Link to={userRoles.includes('ROLE_ADMIN') ? "/admin/dashboard" : "/hasta/dashboard"} className="text-white hover:text-indigo-300 transition-colors">
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
                        ? 'bg-[#0077B6] text-white shadow-inner'
                        : 'text-indigo-100 hover:bg-[#005f8e] hover:text-white'
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
          backgroundImage: "url('/sayfalar.png')", // Aynı arka plan görseli
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
        }}
      >
        <Outlet /> {/* Nested route'lar buraya render edilecek */}
      </main>
    </div>
  );
};

export default AppLayout;