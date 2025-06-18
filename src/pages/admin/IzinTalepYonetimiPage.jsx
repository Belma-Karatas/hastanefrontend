// src/pages/admin/IzinTalepYonetimiPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import izinTalepService from '../../services/izinTalepService';
import { format, parseISO, isValid } from 'date-fns'; // parseISO ve isValid eklendi

const IzinTalepYonetimiPage = () => {
  const [izinTalepleri, setIzinTalepleri] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filtreDurum, setFiltreDurum] = useState('');

  const fetchIzinTalepleri = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const params = {};
      if (filtreDurum) {
        params.durum = filtreDurum;
      }
      // DEĞİŞİKLİK BURADA: Fonksiyon adı düzeltildi
      const response = await izinTalepService.getAllIzinTalepleriForAdmin(params); 
      setIzinTalepleri(response.data || []); // response.data null ise boş array ata
    } catch (err) {
      console.error("İzin Talepleri getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'İzin talepleri yüklenemedi.');
      setIzinTalepleri([]); // Hata durumunda listeyi boşalt
    }
    setIsLoading(false);
  }, [filtreDurum]);

  useEffect(() => {
    fetchIzinTalepleri();
  }, [fetchIzinTalepleri]);

  const handleDurumGuncelle = async (talepId, yeniDurum, personelAdi) => {
    const onayMesaji = yeniDurum === 'ONAYLANDI' 
      ? `${personelAdi} adlı personelin izin talebini ONAYLAMAK istediğinizden emin misiniz?`
      : `${personelAdi} adlı personelin izin talebini REDDETMEK istediğinizden emin misiniz?`;

    if (window.confirm(onayMesaji)) {
      setIsLoading(true); 
      setError('');
      setSuccessMessage('');
      try {
        // DEĞİŞİKLİK BURADA: Fonksiyon adı düzeltildi (eğer servis dosyasında da bu isimle varsa)
        await izinTalepService.updateIzinTalepDurumuForAdmin(talepId, { yeniDurum }); 
        setSuccessMessage(`Personel ${personelAdi}'in izin talebi başarıyla '${yeniDurum}' olarak güncellendi.`);
        fetchIzinTalepleri(); 
      } catch (err) {
        console.error("İzin talep durumu güncelleme hatası:", err);
        setError(err.response?.data?.message || err.message || 'Durum güncellenemedi.');
      }
      setIsLoading(false);
    }
  };

  const durumRenkleri = {
    BEKLIYOR: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    ONAYLANDI: 'bg-green-100 text-green-800 border-green-400',
    REDDEDILDI: 'bg-red-100 text-red-800 border-red-400',
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

      {!isLoading && !error && izinTalepleri.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="th-style">Personel</th>
                <th className="th-style">İzin Türü</th>
                <th className="th-style">Başlangıç</th>
                <th className="th-style">Bitiş</th>
                <th className="th-style text-center">Gün</th>
                <th className="th-style">Talep Tarihi</th>
                <th className="th-style text-center">Durum</th>
                <th className="th-style">Onaylayan</th>
                <th className="th-style">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {izinTalepleri.map((talep) => (
                <tr key={talep.id} className="hover:bg-gray-50">
                  <td className="td-style">{talep.talepEdenPersonelAdiSoyadi}</td>
                  <td className="td-style">{talep.izinTuruAdi}</td>
                  <td className="td-style">
                    {talep.baslangicTarihi && isValid(parseISO(talep.baslangicTarihi)) 
                        ? format(parseISO(talep.baslangicTarihi), 'dd.MM.yyyy') 
                        : 'N/A'}
                  </td>
                  <td className="td-style">
                    {talep.bitisTarihi && isValid(parseISO(talep.bitisTarihi)) 
                        ? format(parseISO(talep.bitisTarihi), 'dd.MM.yyyy') 
                        : 'N/A'}
                  </td>
                  <td className="td-style text-center">{talep.gunSayisi}</td>
                  <td className="td-style">
                    {talep.talepTarihi && isValid(parseISO(talep.talepTarihi)) 
                        ? format(parseISO(talep.talepTarihi), 'dd.MM.yyyy HH:mm') 
                        : 'N/A'}
                  </td>
                  <td className="td-style text-center">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs border ${durumRenkleri[talep.durum] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                      {talep.durum}
                    </span>
                  </td>
                  <td className="td-style">{talep.onaylayanYoneticiAdiSoyadi || (talep.durum !== 'BEKLIYOR' ? 'Sistem/Admin' : '-')}</td>
                  <td className="td-style">
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