// src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Link eklemek için
import acilDurumKaydiService from '../../services/acilDurumKaydiService';
import { format, parseISO, isValid } from 'date-fns';
import tr from 'date-fns/locale/tr';
// import { useAuth } from '../../contexts/AuthContext'; // Admin olduğu için token kontrolü API katmanında yapılıyor, burada zorunlu değil ama eklenebilir.

const AdminDashboardPage = () => {
  const [aktifAcilDurumlar, setAktifAcilDurumlar] = useState([]);
  const [isLoadingAcilDurumlar, setIsLoadingAcilDurumlar] = useState(true);
  const [acilDurumError, setAcilDurumError] = useState('');

  const fetchAktifAcilDurumlarAdmin = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setIsLoadingAcilDurumlar(true);
    setAcilDurumError('');
    try {
      // Hem "AKTIF" hem de "MÜDAHALE EDİLİYOR" durumundakileri çekelim
      const paramsAktif = { durum: 'AKTIF' };
      const paramsMudahale = { durum: 'MÜDAHALE EDİLİYOR' };
      
      const [responseAktif, responseMudahale] = await Promise.all([
        acilDurumKaydiService.getAllAcilDurumKayitlari(paramsAktif),
        acilDurumKaydiService.getAllAcilDurumKayitlari(paramsMudahale)
      ]);

      const aktifKayitlar = responseAktif.data || [];
      const mudahaleKayitlar = responseMudahale.data || [];
      
      const birlesikListe = [...aktifKayitlar, ...mudahaleKayitlar];
      
      // Tarihe göre en yeniden eskiye sırala
      birlesikListe.sort((a, b) => new Date(b.olayZamani) - new Date(a.olayZamani));
      
      setAktifAcilDurumlar(birlesikListe);

    } catch (err) {
      console.error("Admin için aktif acil durumlar getirilirken hata:", err);
      setAcilDurumError(err.response?.data?.message || err.message || 'Aktif acil durumlar yüklenemedi.');
      setAktifAcilDurumlar([]);
    }
    if (showLoadingIndicator) setIsLoadingAcilDurumlar(false);
  }, []);

  useEffect(() => {
    fetchAktifAcilDurumlarAdmin(true); // İlk yükleme

    const intervalId = setInterval(() => {
      console.log("Admin için acil durumlar periyodik olarak çekiliyor...");
      fetchAktifAcilDurumlarAdmin(false); // Arka planda güncelle
    }, 30000); // 30 saniyede bir

    return () => clearInterval(intervalId);
  }, [fetchAktifAcilDurumlarAdmin]);

  const durumRenkleriAcil = {
    AKTIF: 'bg-red-100 text-red-800 border-red-400',
    'MÜDAHALE EDİLİYOR': 'bg-yellow-100 text-yellow-800 border-yellow-400',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Gösterge Paneli</h1>
      <p className="text-gray-600">
        Karataş Health Yönetim Sistemine hoş geldiniz. Bu panel üzerinden temel sistem ayarlarını ve veri yönetimini yapabilirsiniz.
      </p>
      
      {/* Aktif Acil Durumlar Bölümü */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Aktif ve Müdahale Edilen Acil Durumlar</h2>
            <Link 
                to="/admin/acil-durum-kayitlari" 
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
                Tümünü Gör & Yönet →
            </Link>
        </div>
        {acilDurumError && (
          <p className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{acilDurumError}</p>
        )}
        {isLoadingAcilDurumlar && aktifAcilDurumlar.length === 0 && <p className="text-gray-600">Acil durumlar yükleniyor...</p>}
        {!isLoadingAcilDurumlar && aktifAcilDurumlar.length === 0 && !acilDurumError && (
          <p className="text-gray-500">Şu anda aktif veya müdahale edilen acil durum kaydı bulunmamaktadır.</p>
        )}
        {!isLoadingAcilDurumlar && aktifAcilDurumlar.length > 0 && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2"> {/* max-h-72 ve pr-2 eklendi */}
            {aktifAcilDurumlar.map((kayit) => (
              <div key={kayit.id} className={`p-3 rounded-md border-l-4 ${durumRenkleriAcil[kayit.durum] || 'border-gray-300 bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">{kayit.hastaAdiSoyadi ? `Hasta: ${kayit.hastaAdiSoyadi}` : (kayit.konum || 'Genel Acil Durum')}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${durumRenkleriAcil[kayit.durum] || 'bg-gray-200 text-gray-700'}`}>
                        {kayit.durum}
                    </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Açıklama: {kayit.aciklama}</p>
                <p className="text-xs text-gray-500">Konum: {kayit.konum}</p>
                <p className="text-xs text-gray-500">
                    Zaman: {kayit.olayZamani && isValid(parseISO(kayit.olayZamani)) ? format(parseISO(kayit.olayZamani), 'dd.MM.yyyy HH:mm', { locale: tr }) : '-'}
                </p>
                <p className="text-xs text-gray-500">Tetikleyen: {kayit.tetikleyenPersonelAdiSoyadi || '-'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mevcut Örnek Kartlar */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-indigo-600">Personel Yönetimi</h2>
          <p className="text-gray-700 mt-2">Yeni personel ekleyin, mevcut personelleri düzenleyin.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-indigo-600">Departman & Branş</h2>
          <p className="text-gray-700 mt-2">Hastane departmanlarını ve doktor branşlarını yönetin.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold text-indigo-600">Sistem Ayarları</h2>
          <p className="text-gray-700 mt-2">Genel sistem yapılandırmalarını buradan yapın.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;