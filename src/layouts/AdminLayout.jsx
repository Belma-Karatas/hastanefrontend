import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { isAuthenticated, userRoles, logoutContext } = useAuth();

  // Bu kontrol aslında ProtectedRoute içinde de yapılıyor,
  // ancak burada ek bir güvenlik katmanı veya layout'a özel mantık için tutulabilir.
  // Eğer ProtectedRoute'a güveniyorsak bu kısım opsiyoneldir.
  const isAdmin = userRoles.includes('ROLE_ADMIN');
  if (!isAuthenticated || !isAdmin) {
    // Kullanıcı giriş yapmamışsa veya admin değilse login'e yönlendir.
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-800 text-indigo-100 flex flex-col">
        <div className="p-6">
          <Link to="/admin/dashboard" className="text-2xl font-semibold text-white hover:text-indigo-300 transition-colors">
            Admin Paneli
          </Link>
        </div>
        <nav className="flex-grow px-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/admin/dashboard" 
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700 hover:text-white"
              >
                Gösterge Paneli
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/departmanlar" 
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700 hover:text-white"
              >
                Departman Yönetimi
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/branslar" 
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700 hover:text-white"
              >
                Branş Yönetimi
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/personel" 
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700 hover:text-white"
              >
                Personel Yönetimi
              </Link>
            </li>
            {/* Diğer admin linkleri buraya eklenecek */}
            {/*
            <li>
              <Link to="/admin/ilaclar" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700 hover:text-white">
                İlaç Yönetimi
              </Link>
            </li>
            <li>
              <Link to="/admin/izin-talepleri" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700 hover:text-white">
                İzin Talepleri
              </Link>
            </li>
            */}
          </ul>
        </nav>
        <div className="p-4 mt-auto">
          <button
            onClick={logoutContext}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet /> {/* Alt rotaların component'leri burada render edilecek */}
      </main>
    </div>
  );
};

export default AdminLayout;