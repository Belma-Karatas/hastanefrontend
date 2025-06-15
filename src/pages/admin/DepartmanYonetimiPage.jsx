// src/pages/admin/DepartmanYonetimiPage.jsx
import React, { useState, useEffect } from 'react';
import departmanService from '../../services/departmanService'; // Servisi import et
// Modal ve ikonlar için kütüphaneler eklenebilir (örn: Headless UI, Heroicons)

const DepartmanYonetimiPage = () => {
  const [departmanlar, setDepartmanlar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Yeni departman formu için state'ler
  const [showModal, setShowModal] = useState(false);
  const [yeniDepartmanAdi, setYeniDepartmanAdi] = useState('');
  const [editDepartman, setEditDepartman] = useState(null); // Düzenlenecek departman

  useEffect(() => {
    fetchDepartmanlar();
  }, []);

  const fetchDepartmanlar = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await departmanService.getAllDepartmanlar();
      setDepartmanlar(response.data);
    } catch (err) {
      console.error("Departmanlar getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Departmanlar yüklenemedi.');
    }
    setIsLoading(false);
  };

  const handleYeniDepartmanSubmit = async (e) => {
    e.preventDefault();
    if (!yeniDepartmanAdi.trim()) {
      setError('Departman adı boş olamaz.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      if (editDepartman) { // Düzenleme modu
        await departmanService.updateDepartman(editDepartman.id, { ad: yeniDepartmanAdi });
      } else { // Ekleme modu
        await departmanService.createDepartman({ ad: yeniDepartmanAdi });
      }
      setYeniDepartmanAdi('');
      setShowModal(false);
      setEditDepartman(null);
      fetchDepartmanlar(); // Listeyi yenile
    } catch (err) {
      console.error("Departman kaydetme/güncelleme hatası:", err);
      setError(err.response?.data?.message || err.message || 'Departman kaydedilemedi/güncellenemedi.');
    }
    setIsLoading(false);
  };

  const handleDuzenle = (dept) => {
    setEditDepartman(dept);
    setYeniDepartmanAdi(dept.ad);
    setShowModal(true);
    setError('');
  };

  const handleSil = async (id) => {
    if (window.confirm('Bu departmanı silmek istediğinizden emin misiniz?')) {
      setIsLoading(true);
      setError('');
      try {
        await departmanService.deleteDepartman(id);
        fetchDepartmanlar(); // Listeyi yenile
      } catch (err) {
        console.error("Departman silme hatası:", err);
        setError(err.response?.data?.message || err.message || 'Departman silinemedi.');
      }
      setIsLoading(false);
    }
  };

  const openModalForNew = () => {
    setEditDepartman(null);
    setYeniDepartmanAdi('');
    setShowModal(true);
    setError('');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Departman Yönetimi</h1>
        <button
          onClick={openModalForNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Yeni Departman Ekle
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-600">Yükleniyor...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

      {!isLoading && !error && departmanlar.length === 0 && (
        <p className="text-center text-gray-500">Henüz departman bulunmamaktadır.</p>
      )}

      {!isLoading && departmanlar.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Departman Adı
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {departmanlar.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{dept.id}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{dept.ad}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm space-x-2">
                    <button
                      onClick={() => handleDuzenle(dept)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleSil(dept.id)}
                      className="text-red-600 hover:text-red-900 font-semibold"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {editDepartman ? 'Departmanı Düzenle' : 'Yeni Departman Ekle'}
            </h2>
            {error && <p className="text-center text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleYeniDepartmanSubmit}>
              <div>
                <label htmlFor="departmanAdi" className="block text-sm font-medium text-gray-700">
                  Departman Adı
                </label>
                <input
                  type="text"
                  id="departmanAdi"
                  value={yeniDepartmanAdi}
                  onChange={(e) => setYeniDepartmanAdi(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditDepartman(null); setError(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
                  disabled={isLoading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? 'Kaydediliyor...' : (editDepartman ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmanYonetimiPage;