// src/pages/admin/IlacYonetimiPage.jsx
import React, { useState, useEffect } from 'react';
import ilacService from '../../services/ilacService';

const IlacYonetimiPage = () => {
  const [ilaclar, setIlaclar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editIlac, setEditIlac] = useState(null); // Düzenlenecek ilaç
  const [formData, setFormData] = useState({
    ad: '',
    barkod: '', // Opsiyonel
    form: '',   // Opsiyonel (Tablet, Şurup, Kapsül vb.)
    etkenMadde: '', // Opsiyonel
  });

  useEffect(() => {
    fetchIlaclar();
  }, []);

  const fetchIlaclar = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await ilacService.getAllIlaclar();
      setIlaclar(response.data);
    } catch (err) {
      console.error("İlaçlar getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'İlaçlar yüklenemedi.');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ ad: '', barkod: '', form: '', etkenMadde: '' });
    setEditIlac(null);
    setError('');
    setSuccessMessage('');
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (ilac) => {
    resetForm();
    setEditIlac(ilac);
    setFormData({
      ad: ilac.ad,
      barkod: ilac.barkod || '',
      form: ilac.form || '',
      etkenMadde: ilac.etkenMadde || '',
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ad.trim()) {
      setError('İlaç adı boş olamaz.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      ad: formData.ad,
      barkod: formData.barkod || null, // Boşsa null gönder
      form: formData.form || null,
      etkenMadde: formData.etkenMadde || null,
    };

    try {
      if (editIlac) {
        await ilacService.updateIlac(editIlac.id, payload);
        setSuccessMessage(`'${payload.ad}' ilacı başarıyla güncellendi.`);
      } else {
        await ilacService.createIlac(payload);
        setSuccessMessage(`'${payload.ad}' ilacı başarıyla eklendi.`);
      }
      setShowModal(false);
      fetchIlaclar();
    } catch (err) {
      console.error("İlaç işlemi hatası:", err);
      setError(err.response?.data?.message || err.message || 'İlaç işlemi sırasında bir hata oluştu.');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id, ad) => {
    if (window.confirm(`'${ad}' adlı ilacı silmek istediğinizden emin misiniz? Bu ilaç reçetelerde kullanılıyorsa silme işlemi başarısız olabilir.`)) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        await ilacService.deleteIlac(id);
        setSuccessMessage(`'${ad}' ilacı başarıyla silindi.`);
        fetchIlaclar();
      } catch (err) {
        console.error("İlaç silme hatası:", err);
        setError(err.response?.data?.message || err.message || 'İlaç silinemedi. Reçetelerde kullanılıyor olabilir.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">İlaç Yönetimi</h1>
        <button
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
        >
          Yeni İlaç Ekle
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-600 py-4">Yükleniyor...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{successMessage}</p>}

      {!isLoading && !error && ilaclar.length === 0 && (
        <p className="text-center text-gray-500 py-4">Henüz ilaç bulunmamaktadır.</p>
      )}

      {!isLoading && ilaclar.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ad</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Barkod</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Form</th>
                {/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Etken Madde</th> */}
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {ilaclar.map((ilac) => (
                <tr key={ilac.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{ilac.id}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{ilac.ad}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{ilac.barkod || '-'}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{ilac.form || '-'}</td>
                  {/* <td className="px-5 py-4 border-b border-gray-200 text-sm">{ilac.etkenMadde || '-'}</td> */}
                  <td className="px-5 py-4 border-b border-gray-200 text-sm space-x-2">
                    <button onClick={() => openEditModal(ilac)} className="text-indigo-600 hover:text-indigo-900 font-semibold">Düzenle</button>
                    <button onClick={() => handleDelete(ilac.id, ilac.ad)} className="text-red-600 hover:text-red-900 font-semibold">Sil</button>
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
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg"> {/* max-w-lg yapıldı */}
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {editIlac ? 'İlacı Düzenle' : 'Yeni İlaç Ekle'}
            </h2>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="ad" className="block text-sm font-medium text-gray-700">İlaç Adı</label>
                <input type="text" name="ad" id="ad" value={formData.ad} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
              </div>
              <div>
                <label htmlFor="barkod" className="block text-sm font-medium text-gray-700">Barkod (Opsiyonel)</label>
                <input type="text" name="barkod" id="barkod" value={formData.barkod} onChange={handleInputChange} className="mt-1 block w-full input-style" />
              </div>
              <div>
                <label htmlFor="form" className="block text-sm font-medium text-gray-700">Form (Tablet, Şurup vb. - Opsiyonel)</label>
                <input type="text" name="form" id="form" value={formData.form} onChange={handleInputChange} className="mt-1 block w-full input-style" />
              </div>
              <div>
                <label htmlFor="etkenMadde" className="block text-sm font-medium text-gray-700">Etken Madde (Opsiyonel)</label>
                <textarea name="etkenMadde" id="etkenMadde" value={formData.etkenMadde} onChange={handleInputChange} rows="3" className="mt-1 block w-full input-style"></textarea>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border"
                  disabled={isLoading}>
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md" disabled={isLoading}>
                  {isLoading ? 'İşleniyor...' : (editIlac ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IlacYonetimiPage;