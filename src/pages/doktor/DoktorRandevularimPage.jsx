// src/pages/doktor/DoktorRandevularimPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import randevuService from '../../services/randevuService';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO, isPast, isFuture, isEqual, startOfDay, endOfDay } from 'date-fns';

const DoktorRandevularimPage = () => {
  const [tumRandevular, setTumRandevular] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { aktifPersonelId, userToken } = useAuth();
  const navigate = useNavigate();

  const fetchTumRandevularim = useCallback(async () => {
    if (!aktifPersonelId || !userToken) {
        setIsLoading(false);
        setError("Randevuları görmek için doktor bilgileri veya oturum bulunamadı.");
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Backend'den doktorun tüm randevularını çekecek servis çağrısı
      // Bu endpoint'in backend'de JWT'den doktor ID'sini alması beklenir.
      const response = await randevuService.getTumRandevularimDoktor(); 
      if (response.data && Array.isArray(response.data)) {
        setTumRandevular(response.data.sort((a, b) => new Date(a.randevuTarihiSaati) - new Date(b.randevuTarihiSaati)));
      } else {
        setTumRandevular([]);
      }
    } catch (err) {
      console.error("Tüm randevularım getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Randevular yüklenemedi.');
      setTumRandevular([]);
    }
    setIsLoading(false);
  }, [aktifPersonelId, userToken]);

  useEffect(() => {
    fetchTumRandevularim();
  }, [fetchTumRandevularim]);

  const handleMuayeneGit = (randevuId) => {
    navigate(`/doktor/muayene/${randevuId}`);
  };

  const bugun = startOfDay(new Date());

  const gelecekRandevular = tumRandevular.filter(r => isFuture(parseISO(r.randevuTarihiSaati)) && !isEqual(startOfDay(parseISO(r.randevuTarihiSaati)), bugun) && r.durum === 'PLANLANDI');
  const bugunkuRandevular = tumRandevular.filter(r => isEqual(startOfDay(parseISO(r.randevuTarihiSaati)), bugun));
  const gecmisRandevular = tumRandevular.filter(r => isPast(parseISO(r.randevuTarihiSaati)) && !isEqual(startOfDay(parseISO(r.randevuTarihiSaati)), bugun) || (r.durum !== 'PLANLANDI' && !isEqual(startOfDay(parseISO(r.randevuTarihiSaati)), bugun) ) ).sort((a,b) => new Date(b.randevuTarihiSaati) - new Date(a.randevuTarihiSaati));


  const renderRandevuListesi = (randevularList, baslik) => (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">{baslik}</h2>
      {randevularList.length === 0 ? (
        <p className="text-gray-500">Bu kategoride randevu bulunmamaktadır.</p>
      ) : (
        <div className="space-y-4">
          {randevularList.map((randevu) => (
            <div key={randevu.id} className={`p-4 rounded-lg shadow-md border-l-4 
              ${randevu.durum === 'TAMAMLANDI' ? 'bg-green-50 border-green-500' : 
                randevu.durum === 'IPTAL EDILDI' ? 'bg-red-50 border-red-500' : 
                'bg-white border-indigo-500'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-md font-semibold text-gray-800">
                    Hasta: {randevu.hastaAdiSoyadi}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tarih: {format(parseISO(randevu.randevuTarihiSaati), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  randevu.durum === 'PLANLANDI' ? 'bg-blue-100 text-blue-800' : 
                  randevu.durum === 'TAMAMLANDI' ? 'bg-green-100 text-green-800' :
                  randevu.durum === 'IPTAL EDILDI' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'}`}>
                  {randevu.durum}
                </span>
              </div>
              {(randevu.durum === 'PLANLANDI' || randevu.durum === 'TAMAMLANDI') && (
                 <div className="mt-3 text-right">
                    <button
                        onClick={() => handleMuayeneGit(randevu.id)}
                        className={randevu.durum === 'PLANLANDI' ? "btn-xs-green" : "btn-xs-blue"}
                    >
                        {randevu.durum === 'PLANLANDI' ? 'Muayeneyi Başlat' : 'Muayeneyi Görüntüle'}
                    </button>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center text-xl font-semibold">Randevularınız yükleniyor...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tüm Randevularım</h1>
      {renderRandevuListesi(bugunkuRandevular, "Bugünkü Randevularınız")}
      {renderRandevuListesi(gelecekRandevular, "Gelecek Randevularınız")}
      {renderRandevuListesi(gecmisRandevular, "Geçmiş Randevularınız")}
    </div>
  );
};

export default DoktorRandevularimPage;