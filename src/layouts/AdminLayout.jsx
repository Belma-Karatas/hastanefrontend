// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, Link, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
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
  { name: 'Yatak ve Servis Yönetimi', to: '/admin/yatak-servis-yonetimi' }, // YENİ LİNK
  // { name: 'Oda Yönetimi', to: '/admin/odalar' }, // Artık YatakServisYonetimi içinde
  // { name: 'Yatak Yönetimi', to: '/admin/yataklar' }, // Artık YatakServisYonetimi içinde
  { name: 'Acil Durum Kayıtları', to: '/admin/acil-durum-kayitlari' },
];

const AdminLayout = () => {
  const { isAuthenticated, userRoles, logoutContext } = useAuth();

  const isAdmin = userRoles.includes('ROLE_ADMIN');
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#023E8A] text-white flex flex-col shadow-lg">
        <div className="p-6 text-center border-b border-blue-700">
          <Link to="/admin/dashboard" className="text-white hover:text-indigo-300 transition-colors">
            <h1 className="text-3xl font-bold leading-tight tracking-wide">Karataş</h1>
            <span className="text-xl font-semibold tracking-wider">HEALTH</span>
          </Link>
        </div>
        <nav className="flex-grow px-2 py-4 overflow-y-auto">
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

export default AdminLayout;