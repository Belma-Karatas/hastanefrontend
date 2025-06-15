// src/pages/admin/IzinTuruYonetimiPage.jsx
import React, { useState, useEffect } from 'react';
import izinTuruService from '../../services/izinTuruService'; // Servisi import et

const IzinTuruYonetimiPage = () => {
  const [izinTurleri, setIzinTurleri] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Yeni izin türü formu için state'ler
  const [showModal, setShowModal] = useState(false);
  const [yeniIzinTuruAdi, setYeniIzinTuruAdi] = useState('');
  const [editIzinTuru, setEditIzinTuru] = useState(null); // Düzenlenecek izin türü

  useEffect(() => {
    fetchIzinTurleri();
  }, []);

  const fetchIzinTurleri = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await izinTuruService.getAllIzinTurleri();
      setIzinTurleri(response.data);
    } catch (err) {
      console.error("İzin Türleri getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'İzin türleri yüklenemedi.');
    }
    setIsLoading(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!yeniIzinTuruAdi.trim()) {
      setError('İzin türü adı boş olamaz.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (editIzinTuru) { // Düzenleme modu
        await izinTuruService.updateIzinTuru(editIzinTuru.id, { ad: yeniIzinTuruAdi });
        setSuccessMessage(`'${yeniIzinTuruAdi}' izin türü başarıyla güncellendi.`);
      } else { // Ekleme modu
        await izinTuruService.createIzinTuru({ ad: yeniIzinTuruAdi });
        setSuccessMessage(`'${yeniIzinTuruAdi}' izin türü başarıyla eklendi.`);
      }
      setYeniIzinTuruAdi('');
      setShowModal(false);
      setEditIzinTuru(null);
      fetchIzinTurleri(); // Listeyi yenile
    } catch (err) {
      console.error("İzin türü kaydetme/güncelleme hatası:", err);
      setError(err.response?.data?.message || err.message || 'İzin türü kaydedilemedi/güncellenemedi.');
    }
    setIsLoading(false);
  };

  const openEditModal = (izinTuru) => {
    setEditIzinTuru(izinTuru);
    setYeniIzinTuruAdi(izinTuru.ad);
    setShowModal(true);
    setError('');
    setSuccessMessage('');
  };

  const openNewModal = () => {
    setEditIzinTuru(null);
    setYeniIzinTuruAdi('');
    setShowModal(true);
    setError('');
    setSuccessMessage('');
  };

  const handleDelete = async (id, ad) => {
    if (window.confirm(`'${ad}' adlı izin türünü silmek istediğinizden emin misiniz?`)) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        await izinTuruService.deleteIzinTuru(id);
        setSuccessMessage(`'${ad}' izin türü başarıyla silindi.`);
        fetchIzinTurleri(); // Listeyi yenile
      } catch (err) {
        console.error("İzin türü silme hatası:", err);
        // Backend'den gelen "Bu izin türü aktif izin taleplerinde kullanıldığı için silinemez."
        // gibi bir mesajı yakalamak ve göstermek iyi olur.
        setError(err.response?.data?.message || err.message || 'İzin türü silinemedi. Başka kayıtlarda kullanılıyor olabilir.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">İzin Türü Yönetimi</h1>
        <button
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Yeni İzin Türü Ekle
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-600 py-4">Yükleniyor...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{successMessage}</p>}

      {!isLoading && !error && izinTurleri.length === 0 && (
        <p className="text-center text-gray-500 py-4">Henüz izin türü bulunmamaktadır.</p>
      )}

      {!isLoading && izinTurleri.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  İzin Türü Adı
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {izinTurleri.map((tur) => (
                <tr key={tur.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{tur.id}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{tur.ad}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm space-x-2">
                    <button
                      onClick={() => openEditModal(tur)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(tur.id, tur.ad)}
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
              {editIzinTuru ? 'İzin Türünü Düzenle' : 'Yeni İzin Türü Ekle'}
            </h2>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
            <form onSubmit={handleFormSubmit}>
              <div>
                <label htmlFor="izinTuruAdi" className="block text-sm font-medium text-gray-700">
                  İzin Türü Adı
                </label>
                <input
                  type="text"
                  id="izinTuruAdi"
                  value={yeniIzinTuruAdi}
                  onChange={(e) => setYeniIzinTuruAdi(e.target.value)}
                  required
                  className="mt-1 block w-full input-style" // Bu class'ın index.css'te tanımlı olduğundan emin ol
                  disabled={isLoading}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditIzinTuru(null); setError(''); setSuccessMessage('');}}
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
                  {isLoading ? 'İşleniyor...' : (editIzinTuru ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IzinTuruYonetimiPage;