// src/pages/doktor/DoktorDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import randevuService from '../../services/randevuService';
import acilDurumKaydiService from '../../services/acilDurumKaydiService'; // <<<--- YENİ IMPORT
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO, isValid } from 'date-fns'; // isValid eklendi
import tr from 'date-fns/locale/tr'; // Türkçe gün isimleri için

const DoktorDashboardPage = () => {
  const [bugunkuRandevular, setBugunkuRandevular] = useState([]);
  const [acilDurumlar, setAcilDurumlar] = useState([]); // <<<--- YENİ STATE
  const [isLoadingRandevular, setIsLoadingRandevular] = useState(true);
  const [isLoadingAcilDurumlar, setIsLoadingAcilDurumlar] = useState(true); // <<<--- YENİ STATE
  const [error, setError] = useState('');
  const { aktifPersonelId, userToken } = useAuth();
  const navigate = useNavigate();

  const fetchBugunkuRandevular = useCallback(async () => {
    if (!aktifPersonelId) {
      // setError("Doktor kimlik bilgileri bulunamadı. Lütfen tekrar giriş yapın."); // Bu genel error'u etkilemesin
      setIsLoadingRandevular(false);
      return;
    }
    setIsLoadingRandevular(true);
    // setError(''); // Genel error'u burada temizlemeyelim, acil durumlar için de kullanılabilir
    try {
      const bugunTarihiStr = format(new Date(), 'yyyy-MM-dd');
      const response = await randevuService.getRandevularByDoktorIdAndGun(aktifPersonelId, bugunTarihiStr);
      
      if (response.data && Array.isArray(response.data)) {
        const siraliRandevular = response.data.sort((a, b) => 
          new Date(a.randevuTarihiSaati) - new Date(b.randevuTarihiSaati)
        );
        setBugunkuRandevular(siraliRandevular);
      } else {
        setBugunkuRandevular([]);
      }
    } catch (err) {
      console.error("Bugünkü randevular getirilirken hata:", err);
      setError(prev => prev + (prev ? "\n" : "") + (err.response?.data?.message || err.message || 'Bugünkü randevular yüklenemedi.'));
      setBugunkuRandevular([]);
    }
    setIsLoadingRandevular(false);
  }, [aktifPersonelId]);

  const fetchAcilDurumlar = useCallback(async () => {
    if (!userToken || !aktifPersonelId) {
      setIsLoadingAcilDurumlar(false);
      return;
    }
    setIsLoadingAcilDurumlar(true);
    // setError(''); // Genel error'u burada temizlemeyelim
    try {
      const response = await acilDurumKaydiService.getAktifVeMudahaleEdilenAcilDurumlarDoktor();
      setAcilDurumlar(response.data || []);
    } catch (err) {
      console.error("Aktif acil durumlar getirilirken hata:", err);
      setError(prev => prev + (prev ? "\n" : "") + (err.response?.data?.message || err.message || 'Aktif acil durumlar yüklenemedi.'));
      setAcilDurumlar([]);
    }
    setIsLoadingAcilDurumlar(false);
  }, [userToken, aktifPersonelId]);

  useEffect(() => {
    setError(''); // Her yüklemede genel hatayı temizle
    if (userToken && aktifPersonelId) {
      fetchBugunkuRandevular();
      fetchAcilDurumlar();
    } else {
      setIsLoadingRandevular(false);
      setIsLoadingAcilDurumlar(false);
      if (!userToken) setError("Bilgileri görmek için lütfen giriş yapın.");
      else if (!aktifPersonelId) setError("Doktor profili bulunamadı. Lütfen yönetici ile iletişime geçin.");
    }
  }, [userToken, aktifPersonelId, fetchBugunkuRandevular, fetchAcilDurumlar]);

  const handleMuayeneGit = (randevuId) => {
    navigate(`/doktor/muayene/${randevuId}`);
  };
  
  const durumRenkleriAcil = {
    AKTIF: 'bg-red-100 text-red-800 border-red-400',
    'MÜDAHALE EDİLİYOR': 'bg-yellow-100 text-yellow-800 border-yellow-400',
    SONLANDIRILDI: 'bg-green-100 text-green-800 border-green-400', // Bu durum normalde burada listelenmeyecek
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Doktor Gösterge Paneli</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 whitespace-pre-line" role="alert">
          <strong className="font-bold">Hata: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bugünkü Randevular Bölümü */}
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Bugünkü Randevularınız ({format(new Date(), 'dd.MM.yyyy')})
          </h2>
          {isLoadingRandevular && <p className="text-gray-600">Randevular yükleniyor...</p>}
          {!isLoadingRandevular && bugunkuRandevular.length === 0 && !error && (
            <p className="text-gray-500">Bugün için planlanmış randevunuz bulunmamaktadır.</p>
          )}
          {!isLoadingRandevular && bugunkuRandevular.length > 0 && (
            <div className="overflow-x-auto max-h-96"> {/* Kaydırma eklendi */}
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
                      <td className="td-style">{randevu.randevuTarihiSaati && isValid(parseISO(randevu.randevuTarihiSaati)) ? format(parseISO(randevu.randevuTarihiSaati), 'HH:mm') : '-'}</td>
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
                        {(randevu.durum === 'PLANLANDI' || randevu.durum === 'TAMAMLANDI') && (
                          <button
                            onClick={() => handleMuayeneGit(randevu.id)}
                            className={randevu.durum === 'PLANLANDI' ? "btn-xs-green" : "btn-xs-blue"}
                          >
                            {randevu.durum === 'PLANLANDI' ? 'Muayeneyi Başlat' : 'Muayeneyi Görüntüle'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Aktif Acil Durum Kayıtları Bölümü */}
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Aktif Acil Durumlar
          </h2>
          {isLoadingAcilDurumlar && <p className="text-gray-600">Acil durumlar yükleniyor...</p>}
          {!isLoadingAcilDurumlar && acilDurumlar.length === 0 && !error && (
            <p className="text-gray-500">Şu anda aktif veya müdahale edilen acil durum kaydı bulunmamaktadır.</p>
          )}
          {!isLoadingAcilDurumlar && acilDurumlar.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {acilDurumlar.map((kayit) => (
                <div key={kayit.id} className={`p-3 rounded-md border-l-4 ${durumRenkleriAcil[kayit.durum] || 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                      <p className="font-semibold">{kayit.hastaAdiSoyadi ? `Hasta: ${kayit.hastaAdiSoyadi}` : (kayit.konum || 'Genel Acil Durum')}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${durumRenkleriAcil[kayit.durum] || 'bg-gray-200 text-gray-700'}`}>
                          {kayit.durum}
                      </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">Açıklama: {kayit.aciklama}</p>
                  <p className="text-xs text-gray-500">Konum: {kayit.konum}</p>
                  <p className="text-xs text-gray-500">
                      Zaman: {kayit.olayZamani && isValid(parseISO(kayit.olayZamani)) ? format(parseISO(kayit.olayZamani), 'dd.MM.yyyy HH:mm', { locale: tr }) : '-'}
                  </p>
                  <p className="text-xs text-gray-500">Tetikleyen: {kayit.tetikleyenPersonelAdiSoyadi || '-'}</p>
                  {/* Buraya acil durum detayına gitmek için bir link veya buton eklenebilir */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoktorDashboardPage;