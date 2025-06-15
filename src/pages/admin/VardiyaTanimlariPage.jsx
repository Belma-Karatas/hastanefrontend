// src/pages/admin/VardiyaTanimlariPage.jsx
import React, { useState, useEffect } from 'react';
import vardiyaService from '../../services/vardiyaService'; // Servisi import et

const VardiyaTanimlariPage = () => {
  const [vardiyalar, setVardiyalar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Yeni vardiya formu için state'ler
  const [showModal, setShowModal] = useState(false);
  const [editVardiya, setEditVardiya] = useState(null); // Düzenlenecek vardiya {id, ad, baslangicSaati, bitisSaati}
  const [formData, setFormData] = useState({
    ad: '',
    baslangicSaati: '', // HH:mm formatında string
    bitisSaati: '',     // HH:mm formatında string
  });

  useEffect(() => {
    fetchVardiyalar();
  }, []);

  const fetchVardiyalar = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await vardiyaService.getAllVardiyalar();
      setVardiyalar(response.data);
    } catch (err) {
      console.error("Vardiyalar getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Vardiya tanımları yüklenemedi.');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ ad: '', baslangicSaati: '', bitisSaati: '' });
    setEditVardiya(null);
    setError('');
    setSuccessMessage('');
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (vardiya) => {
    resetForm();
    setEditVardiya(vardiya);
    setFormData({ 
      ad: vardiya.ad, 
      baslangicSaati: vardiya.baslangicSaati, // Backend'den HH:mm formatında geldiğini varsayıyoruz
      bitisSaati: vardiya.bitisSaati         // Backend'den HH:mm formatında geldiğini varsayıyoruz
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ad.trim() || !formData.baslangicSaati || !formData.bitisSaati) {
      setError('Vardiya adı, başlangıç ve bitiş saati boş olamaz.');
      return;
    }
    // Saat formatı kontrolü (basit bir kontrol)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(formData.baslangicSaati) || !timeRegex.test(formData.bitisSaati)) {
        setError('Saatler HH:mm formatında olmalıdır (örn: 08:00).');
        return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const payload = {
        ad: formData.ad,
        baslangicSaati: formData.baslangicSaati, // String olarak gönderilecek (Backend LocalTime'a çevirecek)
        bitisSaati: formData.bitisSaati,
    };

    try {
      if (editVardiya) {
        await vardiyaService.updateVardiya(editVardiya.id, payload);
        setSuccessMessage(`'${payload.ad}' vardiyası başarıyla güncellendi.`);
      } else {
        await vardiyaService.createVardiya(payload);
        setSuccessMessage(`'${payload.ad}' vardiyası başarıyla eklendi.`);
      }
      setShowModal(false);
      fetchVardiyalar(); // Listeyi yenile
    } catch (err) {
      console.error("Vardiya işlemi hatası:", err);
      setError(err.response?.data?.message || err.message || 'Vardiya işlemi sırasında bir hata oluştu.');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id, ad) => {
    if (window.confirm(`'${ad}' adlı vardiya tanımını silmek istediğinizden emin misiniz?`)) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        await vardiyaService.deleteVardiya(id);
        setSuccessMessage(`'${ad}' vardiyası başarıyla silindi.`);
        fetchVardiyalar(); // Listeyi yenile
      } catch (err) {
        console.error("Vardiya silme hatası:", err);
        setError(err.response?.data?.message || err.message || 'Vardiya silinemedi. Personele atanmış olabilir.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Vardiya Tanımları Yönetimi</h1>
        <button
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
        >
          Yeni Vardiya Tanımı Ekle
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-600 py-4">Yükleniyor...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{successMessage}</p>}

      {!isLoading && !error && vardiyalar.length === 0 && (
        <p className="text-center text-gray-500 py-4">Henüz vardiya tanımı bulunmamaktadır.</p>
      )}

      {!isLoading && vardiyalar.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vardiya Adı</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Başlangıç Saati</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Bitiş Saati</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {vardiyalar.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{v.id}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{v.ad}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-center">{v.baslangicSaati}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm text-center">{v.bitisSaati}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm space-x-2">
                    <button onClick={() => openEditModal(v)} className="text-indigo-600 hover:text-indigo-900 font-semibold">Düzenle</button>
                    <button onClick={() => handleDelete(v.id, v.ad)} className="text-red-600 hover:text-red-900 font-semibold">Sil</button>
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
              {editVardiya ? 'Vardiyayı Düzenle' : 'Yeni Vardiya Tanımı Ekle'}
            </h2>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="ad" className="block text-sm font-medium text-gray-700">Vardiya Adı</label>
                <input type="text" name="ad" id="ad" value={formData.ad} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="baslangicSaati" className="block text-sm font-medium text-gray-700">Başlangıç Saati</label>
                  <input type="time" name="baslangicSaati" id="baslangicSaati" value={formData.baslangicSaati} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
                </div>
                <div>
                  <label htmlFor="bitisSaati" className="block text-sm font-medium text-gray-700">Bitiş Saati</label>
                  <input type="time" name="bitisSaati" id="bitisSaati" value={formData.bitisSaati} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border"
                  disabled={isLoading}>
                  İptal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md" disabled={isLoading}>
                  {isLoading ? 'İşleniyor...' : (editVardiya ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VardiyaTanimlariPage;