// src/pages/hemsire/HemsireDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import yatisService from '../../services/yatisService';
import acilDurumKaydiService from '../../services/acilDurumKaydiService'; // Acil durum servisi
import { format, parseISO, isValid } from 'date-fns';
import tr from 'date-fns/locale/tr';

const HemsireDashboardPage = () => {
  const { aktifPersonelId, userToken } = useAuth();
  const [atanmisHastalar, setAtanmisHastalar] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Genel yükleme (atanmış hastalar için)
  const [error, setError] = useState(''); // Genel hatalar
  const [successMessage, setSuccessMessage] = useState(''); // Genel başarı mesajları

  // Acil Durum Modal State'leri
  const [showAcilDurumModal, setShowAcilDurumModal] = useState(false);
  const [acilDurumFormData, setAcilDurumFormData] = useState({
    aciklama: '',
    konum: '',
    olayZamani: format(new Date(), "yyyy-MM-dd'T'HH:mm"), // Varsayılan şimdiki zaman
    hastaId: '', // Opsiyonel
  });
  const [isAcilDurumSubmitting, setIsAcilDurumSubmitting] = useState(false);
  const [acilDurumFormError, setAcilDurumFormError] = useState('');
  const [acilDurumSuccessMessage, setAcilDurumSuccessMessage] = useState('');

  const fetchAtanmisHastalar = useCallback(async () => {
    if (!userToken || !aktifPersonelId) {
      setError("Hemşire bilgilerine ulaşılamadı. Lütfen tekrar giriş yapın.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await yatisService.getHemsireninAtanmisAktifHastalari();
      setAtanmisHastalar(response.data || []);
    } catch (err) {
      console.error("Hemşireye atanmış hastalar getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Atanmış hastalarınız yüklenemedi.');
      setAtanmisHastalar([]);
    }
    setIsLoading(false);
  }, [userToken, aktifPersonelId]);

  useEffect(() => {
    fetchAtanmisHastalar();
  }, [fetchAtanmisHastalar]);

  const handleAcilDurumFormChange = (e) => {
    const { name, value } = e.target;
    setAcilDurumFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetAcilDurumForm = () => {
    setAcilDurumFormData({
      aciklama: '',
      konum: '',
      olayZamani: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      hastaId: '',
    });
    setAcilDurumFormError('');
    setAcilDurumSuccessMessage('');
  };

  const openAcilDurumModal = () => {
    resetAcilDurumForm();
    setSuccessMessage(''); // Genel başarı mesajını temizle
    setError(''); // Genel hata mesajını temizle
    setShowAcilDurumModal(true);
  };

  const handleAcilDurumSubmit = async (e) => {
    e.preventDefault();
    if (!acilDurumFormData.aciklama.trim() || !acilDurumFormData.konum.trim() || !acilDurumFormData.olayZamani) {
      setAcilDurumFormError('Açıklama, konum ve olay zamanı zorunludur.');
      return;
    }
    setIsAcilDurumSubmitting(true);
    setAcilDurumFormError('');
    setAcilDurumSuccessMessage('');

    const payload = {
      ...acilDurumFormData,
      hastaId: acilDurumFormData.hastaId ? parseInt(acilDurumFormData.hastaId, 10) : null,
      // olayZamani zaten "yyyy-MM-dd'T'HH:mm" formatında string, backend LocalDateTime'a çevirecek
    };

    try {
      await acilDurumKaydiService.createAcilDurumKaydi(payload);
      setAcilDurumSuccessMessage('Acil durum kaydı başarıyla oluşturuldu. İlgili birimlere bilgi verilecektir.');
      setShowAcilDurumModal(false);
      // İsteğe bağlı olarak, aktif acil durumlar listesini (eğer dashboard'da gösteriliyorsa) yenileyebilirsiniz.
      // fetchAktifAcilDurumlarAdmin(); // Örneğin Admin panelindeki gibi bir fonksiyon varsa
    } catch (err) {
      console.error("Acil durum kaydı oluşturma hatası:", err);
      setAcilDurumFormError(err.response?.data?.message || err.message || 'Acil durum kaydı oluşturulamadı.');
    }
    setIsAcilDurumSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hemşire Paneli</h1>
        <button
          onClick={openAcilDurumModal}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Acil Durum Başlat
        </button>
      </div>
      
      {error && <p className="text-red-600 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md my-4">{successMessage}</p>}

      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Size Atanmış Aktif Hastalar</h2>
        {isLoading && <p className="text-center text-gray-600">Hastalarınız yükleniyor...</p>}
        {!isLoading && !error && atanmisHastalar.length === 0 && (
          <p className="text-gray-500">Şu anda size atanmış aktif hasta bulunmamaktadır.</p>
        )}
        {!isLoading && atanmisHastalar.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="th-style">Hasta Adı Soyadı</th>
                  <th className="th-style">TC Kimlik No</th>
                  <th className="th-style">Yatak No</th>
                  <th className="th-style">Oda No</th>
                  <th className="th-style">Kat</th>
                  <th className="th-style">Giriş Tarihi</th>
                  <th className="th-style">Sorumlu Doktor</th>
                </tr>
              </thead>
              <tbody>
                {atanmisHastalar.map((yatis) => (
                  <tr key={yatis.id} className="hover:bg-gray-50">
                    <td className="td-style">{yatis.hastaAdiSoyadi}</td>
                    <td className="td-style">{yatis.hastaTcKimlikNo || '-'}</td>
                    <td className="td-style">{yatis.yatakNumarasi || 'Atanmamış'}</td>
                    <td className="td-style">{yatis.odaNumarasi || '-'}</td>
                    <td className="td-style">{yatis.katAdi || '-'}</td>
                    <td className="td-style">
                      {yatis.girisTarihi && isValid(parseISO(yatis.girisTarihi))
                        ? format(parseISO(yatis.girisTarihi), 'dd.MM.yyyy HH:mm', { locale: tr })
                        : 'N/A'}
                    </td>
                    <td className="td-style">{yatis.sorumluDoktorAdiSoyadi} ({yatis.sorumluDoktorBransAdi || 'Branşsız'})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acil Durum Başlatma Modalı */}
      {showAcilDurumModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-5">Yeni Acil Durum Kaydı Oluştur</h3>
            
            {acilDurumFormError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-sm">{acilDurumFormError}</p>}
            {acilDurumSuccessMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4 text-sm">{acilDurumSuccessMessage}</p>}

            <form onSubmit={handleAcilDurumSubmit} className="space-y-4">
              <div>
                <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700">Açıklama <span className="text-red-500">*</span></label>
                <textarea id="aciklama" name="aciklama" rows="3" required value={acilDurumFormData.aciklama} onChange={handleAcilDurumFormChange} className="mt-1 block w-full input-style" placeholder="Acil durumun detayları..." disabled={isAcilDurumSubmitting}></textarea>
              </div>
              <div>
                <label htmlFor="konum" className="block text-sm font-medium text-gray-700">Konum <span className="text-red-500">*</span></label>
                <input type="text" id="konum" name="konum" required value={acilDurumFormData.konum} onChange={handleAcilDurumFormChange} className="mt-1 block w-full input-style" placeholder="Örn: Koridor 3, Oda 102 yanı" disabled={isAcilDurumSubmitting} />
              </div>
              <div>
                <label htmlFor="olayZamani" className="block text-sm font-medium text-gray-700">Olay Zamanı <span className="text-red-500">*</span></label>
                <input type="datetime-local" id="olayZamani" name="olayZamani" required value={acilDurumFormData.olayZamani} onChange={handleAcilDurumFormChange} className="mt-1 block w-full input-style" disabled={isAcilDurumSubmitting} />
              </div>
              <div>
                <label htmlFor="hastaId" className="block text-sm font-medium text-gray-700">Hasta ID (Opsiyonel)</label>
                <input type="number" id="hastaId" name="hastaId" value={acilDurumFormData.hastaId} onChange={handleAcilDurumFormChange} className="mt-1 block w-full input-style" placeholder="Eğer bir hastayla ilişkiliyse ID girin" disabled={isAcilDurumSubmitting} />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAcilDurumModal(false)} className="btn-cancel" disabled={isAcilDurumSubmitting}>
                  İptal
                </button>
                <button type="submit" className="btn-primary bg-red-600 hover:bg-red-700" disabled={isAcilDurumSubmitting}>
                  {isAcilDurumSubmitting ? 'Kaydediliyor...' : 'Acil Durum Kaydı Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HemsireDashboardPage;