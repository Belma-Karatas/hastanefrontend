// src/pages/admin/BransYonetimiPage.jsx
import React, { useState, useEffect } from 'react';
import bransService from '../../services/bransService'; // DEĞİŞTİ: bransService import edildi

const BransYonetimiPage = () => {
  const [branslar, setBranslar] = useState([]); // DEĞİŞTİ: state adı
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [yeniBransAdi, setYeniBransAdi] = useState(''); // DEĞİŞTİ: state adı
  const [editBrans, setEditBrans] = useState(null); // DEĞİŞTİ: state adı

  useEffect(() => {
    fetchBranslar(); // DEĞİŞTİ: fonksiyon adı
  }, []);

  const fetchBranslar = async () => { // DEĞİŞTİ: fonksiyon adı
    setIsLoading(true);
    setError('');
    try {
      const response = await bransService.getAllBranslar(); // DEĞİŞTİ: servis çağrısı
      setBranslar(response.data); // DEĞİŞTİ: state set etme
    } catch (err) {
      console.error("Branşlar getirilirken hata:", err); // DEĞİŞTİ: log mesajı
      setError(err.response?.data?.message || err.message || 'Branşlar yüklenemedi.'); // DEĞİŞTİ: hata mesajı
    }
    setIsLoading(false);
  };

  const handleYeniBransSubmit = async (e) => { // DEĞİŞTİ: fonksiyon adı
    e.preventDefault();
    if (!yeniBransAdi.trim()) {
      setError('Branş adı boş olamaz.'); // DEĞİŞTİ: hata mesajı
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      if (editBrans) {
        await bransService.updateBrans(editBrans.id, { ad: yeniBransAdi }); // DEĞİŞTİ: servis çağrısı
      } else {
        await bransService.createBrans({ ad: yeniBransAdi }); // DEĞİŞTİ: servis çağrısı
      }
      setYeniBransAdi('');
      setShowModal(false);
      setEditBrans(null);
      fetchBranslar(); // DEĞİŞTİ: fonksiyon adı
    } catch (err) {
      console.error("Branş kaydetme/güncelleme hatası:", err); // DEĞİŞTİ: log mesajı
      setError(err.response?.data?.message || err.message || 'Branş kaydedilemedi/güncellenemedi.'); // DEĞİŞTİ: hata mesajı
    }
    setIsLoading(false);
  };

  const handleDuzenle = (brans) => { // DEĞİŞTİ: parametre adı
    setEditBrans(brans); // DEĞİŞTİ: state set etme
    setYeniBransAdi(brans.ad); // DEĞİŞTİ: state set etme
    setShowModal(true);
    setError('');
  };

  const handleSil = async (id) => {
    if (window.confirm('Bu branşı silmek istediğinizden emin misiniz?')) { // DEĞİŞTİ: onay mesajı
      setIsLoading(true);
      setError('');
      try {
        await bransService.deleteBrans(id); // DEĞİŞTİ: servis çağrısı
        fetchBranslar(); // DEĞİŞTİ: fonksiyon adı
      } catch (err) {
        console.error("Branş silme hatası:", err); // DEĞİŞTİ: log mesajı
        setError(err.response?.data?.message || err.message || 'Branş silinemedi.'); // DEĞİŞTİ: hata mesajı
      }
      setIsLoading(false);
    }
  };

  const openModalForNew = () => {
    setEditBrans(null);
    setYeniBransAdi('');
    setShowModal(true);
    setError('');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Branş Yönetimi</h1> {/* DEĞİŞTİ: Başlık */}
        <button
          onClick={openModalForNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Yeni Branş Ekle {/* DEĞİŞTİ: Buton Metni */}
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-600">Yükleniyor...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

      {!isLoading && !error && branslar.length === 0 && (
        <p className="text-center text-gray-500">Henüz branş bulunmamaktadır.</p> /* DEĞİŞTİ: Mesaj */
      )}

      {!isLoading && branslar.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Branş Adı {/* DEĞİŞTİ: Sütun Başlığı */}
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {branslar.map((brans) => ( // DEĞİŞTİ: değişken adı
                <tr key={brans.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{brans.id}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{brans.ad}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm space-x-2">
                    <button
                      onClick={() => handleDuzenle(brans)} // DEĞİŞTİ: parametre
                      className="text-indigo-600 hover:text-indigo-900 font-semibold"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleSil(brans.id)}
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
              {editBrans ? 'Branşı Düzenle' : 'Yeni Branş Ekle'} {/* DEĞİŞTİ: Modal Başlığı */}
            </h2>
            {error && <p className="text-center text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleYeniBransSubmit}> {/* DEĞİŞTİ: fonksiyon adı */}
              <div>
                <label htmlFor="bransAdi" className="block text-sm font-medium text-gray-700">
                  Branş Adı {/* DEĞİŞTİ: Label */}
                </label>
                <input
                  type="text"
                  id="bransAdi" // DEĞİŞTİ: id
                  value={yeniBransAdi} // DEĞİŞTİ: state
                  onChange={(e) => setYeniBransAdi(e.target.value)} // DEĞİŞTİ: state
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditBrans(null); setError(''); }}
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
                  {isLoading ? 'Kaydediliyor...' : (editBrans ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BransYonetimiPage;
