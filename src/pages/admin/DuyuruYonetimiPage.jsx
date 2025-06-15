// src/pages/admin/DuyuruYonetimiPage.jsx
import React, { useState, useEffect } from 'react';
import duyuruService from '../../services/duyuruService';
import { format } from 'date-fns'; // Tarih formatlamak için (opsiyonel, npm install date-fns)

const DuyuruYonetimiPage = () => {
  const [duyurular, setDuyurular] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editDuyuru, setEditDuyuru] = useState(null); // Düzenlenecek duyuru {id, baslik, icerik, ...}
  const [formData, setFormData] = useState({
    baslik: '',
    icerik: '',
  });

  useEffect(() => {
    fetchDuyurular();
  }, []);

  const fetchDuyurular = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await duyuruService.getAllDuyurular();
      // Backend'den gelen DuyuruDTO'nun yapısına göre düzenle
      // Örneğin, yayinTarihi ve yayinlayanPersonelAdiSoyadi alanları varsa
      setDuyurular(response.data);
    } catch (err) {
      console.error("Duyurular getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Duyurular yüklenemedi.');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ baslik: '', icerik: '' });
    setEditDuyuru(null);
    setError('');
    setSuccessMessage('');
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (duyuru) => {
    resetForm();
    setEditDuyuru(duyuru);
    setFormData({ baslik: duyuru.baslik, icerik: duyuru.icerik });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.baslik.trim() || !formData.icerik.trim()) {
      setError('Başlık ve içerik boş olamaz.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (editDuyuru) {
        await duyuruService.updateDuyuru(editDuyuru.id, formData);
        setSuccessMessage(`'${formData.baslik}' başlıklı duyuru başarıyla güncellendi.`);
      } else {
        await duyuruService.createDuyuru(formData);
        setSuccessMessage(`'${formData.baslik}' başlıklı duyuru başarıyla eklendi.`);
      }
      setShowModal(false);
      fetchDuyurular();
    } catch (err) {
      console.error("Duyuru işlemi hatası:", err);
      setError(err.response?.data?.message || err.message || 'Duyuru işlemi sırasında bir hata oluştu.');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id, baslik) => {
    if (window.confirm(`'${baslik}' başlıklı duyuruyu silmek istediğinizden emin misiniz?`)) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        await duyuruService.deleteDuyuru(id);
        setSuccessMessage(`'${baslik}' başlıklı duyuru başarıyla silindi.`);
        fetchDuyurular();
      } catch (err) {
        console.error("Duyuru silme hatası:", err);
        setError(err.response?.data?.message || err.message || 'Duyuru silinemedi.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Duyuru Yönetimi</h1>
        <button
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
        >
          Yeni Duyuru Ekle
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-600 py-4">Yükleniyor...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{successMessage}</p>}
      
      {!isLoading && !error && duyurular.length === 0 && (
        <p className="text-center text-gray-500 py-4">Henüz duyuru bulunmamaktadır.</p>
      )}

      {!isLoading && duyurular.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow mt-6">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Başlık</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Yayınlayan</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Yayın Tarihi</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {duyurular.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{d.id}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{d.baslik}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{d.yayinlayanPersonelAdiSoyadi || '-'}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    {d.yayinTarihi ? format(new Date(d.yayinTarihi), 'dd.MM.yyyy HH:mm') : '-'}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm space-x-2">
                    <button onClick={() => openEditModal(d)} className="text-indigo-600 hover:text-indigo-900 font-semibold">Düzenle</button>
                    <button onClick={() => handleDelete(d.id, d.baslik)} className="text-red-600 hover:text-red-900 font-semibold">Sil</button>
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
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl"> {/* max-w-xl yapıldı */}
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {editDuyuru ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Ekle'}
            </h2>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="baslik" className="block text-sm font-medium text-gray-700">Başlık</label>
                <input type="text" name="baslik" id="baslik" value={formData.baslik} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
              </div>
              <div>
                <label htmlFor="icerik" className="block text-sm font-medium text-gray-700">İçerik</label>
                <textarea name="icerik" id="icerik" value={formData.icerik} onChange={handleInputChange} required rows="5" className="mt-1 block w-full input-style"></textarea>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border">İptal</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md" disabled={isLoading}>
                  {isLoading ? 'İşleniyor...' : (editDuyuru ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuyuruYonetimiPage;