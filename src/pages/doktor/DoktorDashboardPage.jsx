// src/pages/doktor/DoktorDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Link yerine navigate kullanacağız
import randevuService from '../../services/randevuService';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO } from 'date-fns'; // Tarih formatlama için

const DoktorDashboardPage = () => {
  const [bugunkuRandevular, setBugunkuRandevular] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { aktifPersonelId, userToken } = useAuth(); // aktifPersonelId'yi doktor ID'si olarak kullanacağız
  const navigate = useNavigate();

  const fetchBugunkuRandevular = useCallback(async () => {
    if (!aktifPersonelId) {
      setError("Doktor kimlik bilgileri bulunamadı. Lütfen tekrar giriş yapın.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const bugunTarihiStr = format(new Date(), 'yyyy-MM-dd');
      // Backend'e doktor ID'si (aktifPersonelId) ve günün tarihi gönderilecek.
      const response = await randevuService.getRandevularByDoktorIdAndGun(aktifPersonelId, bugunTarihiStr);
      
      if (response.data && Array.isArray(response.data)) {
        // Randevuları saate göre sırala
        const siraliRandevular = response.data.sort((a, b) => 
          new Date(a.randevuTarihiSaati) - new Date(b.randevuTarihiSaati)
        );
        setBugunkuRandevular(siraliRandevular);
      } else {
        console.warn("API'dan beklenen randevu listesi formatı gelmedi:", response.data);
        setBugunkuRandevular([]);
      }
    } catch (err) {
      console.error("Bugünkü randevular getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Bugünkü randevular yüklenemedi.');
      setBugunkuRandevular([]);
    }
    setIsLoading(false);
  }, [aktifPersonelId]);

  useEffect(() => {
    // Sadece userToken ve aktifPersonelId varsa veri çek
    if (userToken && aktifPersonelId) {
      fetchBugunkuRandevular();
    } else if (!userToken) {
      setIsLoading(false);
      setError("Randevuları görmek için lütfen giriş yapın.");
    } else if (!aktifPersonelId && userToken) {
      setIsLoading(false);
      setError("Doktor profili bulunamadı. Lütfen yönetici ile iletişime geçin.");
    }
  }, [userToken, aktifPersonelId, fetchBugunkuRandevular]);

  const handleMuayeneGit = (randevuId) => {
    navigate(`/doktor/muayene/${randevuId}`);
  };

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl text-center">
            <p className="text-xl font-semibold text-gray-700">Bugünkü randevular yükleniyor...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Doktor Gösterge Paneli</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Hata: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Bugünkü Randevularınız ({format(new Date(), 'dd.MM.yyyy')})
        </h2>
        {bugunkuRandevular.length === 0 && !error ? (
          <p className="text-gray-500">Bugün için planlanmış randevunuz bulunmamaktadır.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="th-style">Saat</th>
                  <th className="th-style">Hasta</th>
                  <th className="th-style">Durum</th>
                  <th className="th-style">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {bugunkuRandevular.map((randevu) => (
                  <tr key={randevu.id} className="hover:bg-gray-50">
                    <td className="td-style">{format(parseISO(randevu.randevuTarihiSaati), 'HH:mm')}</td>
                    <td className="td-style">{randevu.hastaAdiSoyadi}</td>
                    <td className="td-style">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${randevu.durum === 'PLANLANDI' ? 'bg-blue-100 text-blue-800' : 
                          randevu.durum === 'TAMAMLANDI' ? 'bg-green-100 text-green-800' :
                          randevu.durum === 'IPTAL EDILDI' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {randevu.durum}
                      </span>
                    </td>
                    <td className="td-style">
                      {randevu.durum === 'PLANLANDI' && (
                        <button
                          onClick={() => handleMuayeneGit(randevu.id)}
                          className="btn-xs-green"
                        >
                          Muayeneyi Başlat
                        </button>
                      )}
                      {randevu.durum === 'TAMAMLANDI' && (
                         <button
                            onClick={() => handleMuayeneGit(randevu.id)}
                            className="btn-xs-blue"
                        >
                            Muayeneyi Görüntüle
                        </button>
                      )}
                       {/* İptal edilmiş randevular için bir işlem butonu göstermeyebiliriz veya farklı bir aksiyon olabilir */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoktorDashboardPage;