import React from 'react';

const AdminDashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Gösterge Paneli</h1>
      <p className="text-gray-600">
        Karataş Health Yönetim Sistemine hoş geldiniz. Bu panel üzerinden temel sistem ayarlarını ve veri yönetimini yapabilirsiniz.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Örnek Kartlar - Bu kısımlar daha sonra dinamik verilerle doldurulabilir */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-indigo-600">Personel Yönetimi</h2>
          <p className="text-gray-700 mt-2">Yeni personel ekleyin, mevcut personelleri düzenleyin.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-indigo-600">Departman & Branş</h2>
          <p className="text-gray-700 mt-2">Hastane departmanlarını ve doktor branşlarını yönetin.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-indigo-600">Sistem Ayarları</h2>
          <p className="text-gray-700 mt-2">Genel sistem yapılandırmalarını buradan yapın.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;