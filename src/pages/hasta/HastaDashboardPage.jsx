// src/pages/hasta/HastaDashboardPage.jsx
import React from 'react';
// import { useAuth } from '../../contexts/AuthContext'; // Artık role özel bir şey göstermediğimiz için kaldırılabilir

const HastaDashboardPage = () => {
  // const { userRoles } = useAuth(); // Artık kullanılmıyor

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Hasta Gösterge Paneli</h1>
      <p className="text-gray-700 mb-4">
        Karataş Health sistemine hoş geldiniz! Bu panel üzerinden randevularınızı yönetebilir ve sağlık bilgilerinize erişebilirsiniz.
      </p>
      {/* KALDIRILAN SATIR: <p className="text-gray-600">Mevcut rolleriniz: {userRoles.join(', ')}</p> */}
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-indigo-600">Randevu Al</h2>
          <p className="text-gray-700 mt-2">Yeni bir doktor randevusu oluşturun.</p>
          {/* Linkler AppLayout'taki menüden zaten erişilebilir olduğu için buradaki linkleri yoruma alabiliriz
              veya direkt Randevu Al sayfasına yönlendiren bir buton olarak bırakabiliriz.
              Şimdilik yoruma alıyorum, menüden erişim ana yöntem olacak.
          */}
          {/* <Link to="/hasta/randevu-al" className="mt-3 inline-block text-indigo-500 hover:text-indigo-700 font-medium">Randevu Al →</Link> */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-indigo-600">Randevularım</h2>
          <p className="text-gray-700 mt-2">Geçmiş ve gelecek randevularınızı görüntüleyin.</p>
          {/* <Link to="/hasta/randevularim" className="mt-3 inline-block text-indigo-500 hover:text-indigo-700 font-medium">Randevularımı Gör →</Link> */}
        </div>
      </div>
    </div>
  );
};

export default HastaDashboardPage;