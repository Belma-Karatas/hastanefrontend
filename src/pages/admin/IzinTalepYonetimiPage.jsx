// src/pages/admin/IzinTalepYonetimiPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import izinTalepService from '../../services/izinTalepService';
import { format } from 'date-fns'; // Tarih formatlamak için

const IzinTalepYonetimiPage = () => {
  const [izinTalepleri, setIzinTalepleri] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Başarı mesajları için
  const [filtreDurum, setFiltreDurum] = useState(''); // 'BEKLIYOR', 'ONAYLANDI', 'REDDEDILDI', '' (tümü)

  const fetchIzinTalepleri = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage(''); // Yeni veri çekilirken başarı mesajını temizle
    try {
      const params = {};
      if (filtreDurum) {
        params.durum = filtreDurum;
      }
      const response = await izinTalepService.getAllIzinTalepleri(params);
      setIzinTalepleri(response.data);
    } catch (err) {
      console.error("İzin Talepleri getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'İzin talepleri yüklenemedi.');
    }
    setIsLoading(false);
  }, [filtreDurum]); // filtreDurum değiştiğinde yeniden çalışsın

  useEffect(() => {
    fetchIzinTalepleri();
  }, [fetchIzinTalepleri]);

  const handleDurumGuncelle = async (talepId, yeniDurum, personelAdi) => {
    const onayMesaji = yeniDurum === 'ONAYLANDI' 
      ? `${personelAdi} adlı personelin izin talebini ONAYLAMAK istediğinizden emin misiniz?`
      : `${personelAdi} adlı personelin izin talebini REDDETMEK istediğinizden emin misiniz?`;

    if (window.confirm(onayMesaji)) {
      setIsLoading(true); // Butona özel loading state'i de düşünülebilir
      setError('');
      setSuccessMessage('');
      try {
        await izinTalepService.updateIzinTalepDurumu(talepId, { yeniDurum });
        setSuccessMessage(`Personel ${personelAdi}'in izin talebi başarıyla '${yeniDurum}' olarak güncellendi.`);
        fetchIzinTalepleri(); // Listeyi yenile
      } catch (err) {
        console.error("İzin talep durumu güncelleme hatası:", err);
        setError(err.response?.data?.message || err.message || 'Durum güncellenemedi.');
      }
      setIsLoading(false);
    }
  };

  const durumRenkleri = {
    BEKLIYOR: 'bg-yellow-100 text-yellow-800',
    ONAYLANDI: 'bg-green-100 text-green-800',
    REDDEDILDI: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">İzin Talepleri Yönetimi</h1>

      <div className="mb-4">
        <label htmlFor="filtreDurum" className="mr-2 font-medium text-gray-700">Duruma Göre Filtrele:</label>
        <select
          id="filtreDurum"
          value={filtreDurum}
          onChange={(e) => setFiltreDurum(e.target.value)}
          className="p-2 border border-gray-300 rounded-md select-style"
        >
          <option value="">Tümü</option>
          <option value="BEKLIYOR">Bekliyor</option>
          <option value="ONAYLANDI">Onaylandı</option>
          <option value="REDDEDILDI">Reddedildi</option>
        </select>
      </div>

      {isLoading && <p className="text-center text-gray-600 py-4">Yükleniyor...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{successMessage}</p>}

      {!isLoading && !error && izinTalepleri.length === 0 && (
        <p className="text-center text-gray-500 py-4">Gösterilecek izin talebi bulunmamaktadır.</p>
      )}

      {!isLoading && izinTalepleri.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Personel</th>
                <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İzin Türü</th>
                <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Başlangıç</th>
                <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bitiş</th>
                <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Gün</th>
                <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Talep Tarihi</th>
                <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
                <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Onaylayan</th>
                <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {izinTalepleri.map((talep) => (
                <tr key={talep.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 border-b border-gray-200 text-sm">{talep.talepEdenPersonelAdiSoyadi}</td>
                  <td className="px-3 py-4 border-b border-gray-200 text-sm">{talep.izinTuruAdi}</td>
                  <td className="px-3 py-4 border-b border-gray-200 text-sm">{format(new Date(talep.baslangicTarihi), 'dd.MM.yyyy')}</td>
                  <td className="px-3 py-4 border-b border-gray-200 text-sm">{format(new Date(talep.bitisTarihi), 'dd.MM.yyyy')}</td>
                  <td className="px-3 py-4 border-b border-gray-200 text-sm text-center">{talep.gunSayisi}</td>
                  <td className="px-3 py-4 border-b border-gray-200 text-sm">{format(new Date(talep.talepTarihi), 'dd.MM.yyyy HH:mm')}</td>
                  <td className="px-3 py-4 border-b border-gray-200 text-sm text-center">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${durumRenkleri[talep.durum] || 'bg-gray-100 text-gray-800'}`}>
                      {talep.durum}
                    </span>
                  </td>
                  <td className="px-3 py-4 border-b border-gray-200 text-sm">{talep.onaylayanYoneticiAdiSoyadi || '-'}</td>
                  <td className="px-3 py-4 border-b border-gray-200 text-sm">
                    {talep.durum === 'BEKLIYOR' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDurumGuncelle(talep.id, 'ONAYLANDI', talep.talepEdenPersonelAdiSoyadi)}
                          className="text-green-600 hover:text-green-900 font-semibold"
                          disabled={isLoading}
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => handleDurumGuncelle(talep.id, 'REDDEDILDI', talep.talepEdenPersonelAdiSoyadi)}
                          className="text-red-600 hover:text-red-900 font-semibold"
                          disabled={isLoading}
                        >
                          Reddet
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IzinTalepYonetimiPage;