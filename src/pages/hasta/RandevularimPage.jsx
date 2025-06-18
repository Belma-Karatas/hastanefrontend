// src/pages/hasta/RandevularimPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import randevuService from '../../services/randevuService';
import { useAuth } from '../../contexts/AuthContext'; // Giriş yapmış kullanıcı ID'sini almak için
import { format, parseISO, isPast, isFuture, isEqual, startOfDay } from 'date-fns'; // Tarih işlemleri için

const RandevularimPage = () => {
  const [randevular, setRandevular] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // İptal işlemi için

  const { userToken } = useAuth(); // Sadece token varlığı kontrolü için değil,
                                 // aslında backend'in hasta ID'sini JWT'den alması daha iyi olur.
                                 // Veya AuthContext'ten hasta ID'sini alacak bir yapı kurmalıyız.
                                 // Şimdilik, backend'in `/api/randevular/hasta/mevcut` gibi bir endpoint'i
                                 // desteklediğini ve JWT'den hasta ID'sini aldığını varsayacağız.
                                 // Eğer backend `/api/randevular/hasta/{hastaId}` bekliyorsa,
                                 // AuthContext'ten hastaId'yi alıp burada kullanmalıyız.

  const fetchRandevularim = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      // İdeal senaryo: Backend'de `/api/randevular/hasta/mevcut` gibi bir endpoint olur
      // ve bu endpoint JWT'den hasta ID'sini alarak o hastanın randevularını döner.
      // Şimdilik, `randevuService` içinde böyle bir metot olmadığını varsayarak,
      // eğer `AuthContext` içinde `kullanici.hastaProfili.id` gibi bir bilgi varsa onu kullanırız,
      // yoksa bu kısmı backend'e göre uyarlamanız gerekir.
      // Bu örnekte, backend'in /api/randevular/hasta/mevcut endpoint'ini beklediğini varsayıyoruz.
      const response = await randevuService.getRandevularim(); // Yeni servis metodu
      setRandevular(response.data || []);
    } catch (err) {
      console.error("Randevularım getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Randevularınız yüklenemedi.');
      setRandevular([]);
    }
    setIsLoading(false);
  }, []); // userToken bağımlılığı şimdilik kaldırıldı, çünkü backend JWT'den ID almalı.

  useEffect(() => {
    if (userToken) { // Sadece kullanıcı giriş yapmışsa randevuları çek
      fetchRandevularim();
    }
  }, [userToken, fetchRandevularim]);

  const handleRandevuIptal = async (randevuId) => {
    if (window.confirm("Bu randevuyu iptal etmek istediğinizden emin misiniz?")) {
      setIsLoading(true); // Veya butona özel bir loading state
      setError('');
      setSuccessMessage('');
      try {
        await randevuService.randevuIptalEt(randevuId); // Bu servis metodu zaten vardı
        setSuccessMessage('Randevu başarıyla iptal edildi.');
        fetchRandevularim(); // Listeyi yenile
      } catch (err) {
        console.error("Randevu iptal etme hatası:", err);
        setError(err.response?.data?.message || err.message || 'Randevu iptal edilemedi.');
      }
      setIsLoading(false);
    }
  };

  const bugun = startOfDay(new Date());

  const gelecekRandevular = randevular.filter(r => !isPast(parseISO(r.randevuTarihiSaati)) && r.durum !== 'IPTAL EDILDI' && r.durum !== 'TAMAMLANDI').sort((a,b) => new Date(a.randevuTarihiSaati) - new Date(b.randevuTarihiSaati));
  const gecmisRandevular = randevular.filter(r => isPast(parseISO(r.randevuTarihiSaati)) || r.durum === 'IPTAL EDILDI' || r.durum === 'TAMAMLANDI').sort((a,b) => new Date(b.randevuTarihiSaati) - new Date(a.randevuTarihiSaati));


  const renderRandevuKarti = (randevu) => {
    const randevuTarihi = parseISO(randevu.randevuTarihiSaati);
    const isGecmis = isPast(randevuTarihi) || randevu.durum === 'IPTAL EDILDI' || randevu.durum === 'TAMAMLANDI';
    const isBugun = isEqual(startOfDay(randevuTarihi), bugun) && !isGecmis;

    return (
      <div key={randevu.id} className={`p-4 rounded-lg shadow-md border-l-4 ${
          isGecmis ? 'bg-gray-100 border-gray-400' : 
          isBugun ? 'bg-blue-50 border-blue-500' : 'bg-white border-indigo-500'
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-semibold text-gray-800">
              {randevu.doktorAdiSoyadi} - <span className="text-indigo-600">{randevu.doktorBransAdi}</span>
            </p>
            <p className="text-sm text-gray-600">
              Tarih: {format(randevuTarihi, 'dd.MM.yyyy HH:mm')}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            randevu.durum === 'PLANLANDI' ? 'bg-blue-100 text-blue-800' :
            randevu.durum === 'IPTAL EDILDI' ? 'bg-red-100 text-red-800' :
            randevu.durum === 'TAMAMLANDI' ? 'bg-green-100 text-green-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {randevu.durum}
          </span>
        </div>
        {isFuture(randevuTarihi) && randevu.durum === 'PLANLANDI' && (
          <div className="mt-3 text-right">
            <button 
              onClick={() => handleRandevuIptal(randevu.id)}
              className="btn-xs-red"
              disabled={isLoading}
            >
              İptal Et
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Randevularım</h1>

      {isLoading && <p className="text-center text-gray-600 py-4">Randevularınız yükleniyor...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{successMessage}</p>}

      {!isLoading && !error && randevular.length === 0 && (
        <p className="text-center text-gray-500 py-4">Henüz bir randevunuz bulunmamaktadır.</p>
      )}

      {!isLoading && randevular.length > 0 && (
        <div className="space-y-6">
          {gelecekRandevular.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Gelecek Randevularınız</h2>
              <div className="space-y-4">
                {gelecekRandevular.map(renderRandevuKarti)}
              </div>
            </div>
          )}

          {gecmisRandevular.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Geçmiş Randevularınız</h2>
              <div className="space-y-4">
                {gecmisRandevular.map(renderRandevuKarti)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RandevularimPage;