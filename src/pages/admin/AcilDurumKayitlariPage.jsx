// src/pages/admin/AcilDurumKayitlariPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import acilDurumKaydiService from '../../services/acilDurumKaydiService';
import { format, parseISO } from 'date-fns';

const AcilDurumKayitlariPage = () => {
  const [kayitlar, setKayitlar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [filtreDurum, setFiltreDurum] = useState('');
  const [filtreTarih, setFiltreTarih] = useState(''); // YYYY-MM-DD formatında

  const [showDurumModal, setShowDurumModal] = useState(false);
  const [guncellenecekKayit, setGuncellenecekKayit] = useState(null);
  const [yeniDurum, setYeniDurum] = useState('');
  const [isDurumGuncelleLoading, setIsDurumGuncelleLoading] = useState(false);

  const durumRenkleri = {
    AKTIF: 'bg-red-100 text-red-800 border-red-300',
    'MÜDAHALE EDİLİYOR': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    SONLANDIRILDI: 'bg-green-100 text-green-800 border-green-300',
  };
  const durumSecenekleri = ["AKTIF", "MÜDAHALE EDİLİYOR", "SONLANDIRILDI"];


  const fetchKayitlar = useCallback(async () => {
    setIsLoading(true); setError(''); setSuccessMessage('');
    try {
      const params = {};
      if (filtreDurum) params.durum = filtreDurum;
      if (filtreTarih) params.tarih = filtreTarih;
      const response = await acilDurumKaydiService.getAllAcilDurumKayitlari(params);
      setKayitlar(response.data || []);
    } catch (err) {
      console.error("Acil durum kayıtları getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Kayıtlar yüklenemedi.');
      setKayitlar([]);
    }
    setIsLoading(false);
  }, [filtreDurum, filtreTarih]);

  useEffect(() => {
    fetchKayitlar();
  }, [fetchKayitlar]);

  const openDurumGuncelleModal = (kayit) => {
    setGuncellenecekKayit(kayit);
    setYeniDurum(kayit.durum); // Mevcut durumu modalda göster
    setShowDurumModal(true);
    setError(''); setSuccessMessage('');
  };

  const handleDurumGuncelleSubmit = async (e) => {
    e.preventDefault();
    if (!yeniDurum || !guncellenecekKayit) return;
    setIsDurumGuncelleLoading(true); setError(''); setSuccessMessage('');
    try {
      await acilDurumKaydiService.updateAcilDurumKaydiDurumu(guncellenecekKayit.id, { yeniDurum });
      setSuccessMessage(`Kayıt ID ${guncellenecekKayit.id} durumu '${yeniDurum}' olarak güncellendi.`);
      setShowDurumModal(false);
      setGuncellenecekKayit(null);
      fetchKayitlar();
    } catch (err) {
      console.error("Durum güncelleme hatası:", err);
      setError(err.response?.data?.message || err.message || 'Durum güncellenemedi.');
    }
    setIsDurumGuncelleLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Acil Durum Kayıtları</h1>

      {/* Filtreleme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
        <div>
          <label htmlFor="filtreDurum" className="block text-sm font-medium text-gray-700">Duruma Göre Filtrele:</label>
          <select id="filtreDurum" value={filtreDurum} onChange={(e) => setFiltreDurum(e.target.value)} className="mt-1 block w-full select-style">
            <option value="">Tümü</option>
            {durumSecenekleri.map(durum => <option key={durum} value={durum}>{durum}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filtreTarih" className="block text-sm font-medium text-gray-700">Tarihe Göre Filtrele:</label>
          <input type="date" id="filtreTarih" value={filtreTarih} onChange={(e) => setFiltreTarih(e.target.value)} className="mt-1 block w-full input-style" />
        </div>
      </div>

      {isLoading && <p className="text-center text-gray-600 py-4">Yükleniyor...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{successMessage}</p>}

      {!isLoading && !error && kayitlar.length === 0 && (
        <p className="text-center text-gray-500 py-4">Gösterilecek acil durum kaydı bulunmamaktadır.</p>
      )}

      {!isLoading && kayitlar.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="th-style">ID</th>
                <th className="th-style">Olay Zamanı</th>
                <th className="th-style">Açıklama</th>
                <th className="th-style">Konum</th>
                <th className="th-style">Durum</th>
                <th className="th-style">Tetikleyen Personel</th>
                <th className="th-style">Hasta</th>
                <th className="th-style">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {kayitlar.map((kayit) => (
                <tr key={kayit.id} className="hover:bg-gray-50">
                  <td className="td-style">{kayit.id}</td>
                  <td className="td-style">{format(parseISO(kayit.olayZamani), 'dd.MM.yyyy HH:mm')}</td>
                  <td className="td-style whitespace-normal break-words max-w-xs">{kayit.aciklama}</td>
                  <td className="td-style">{kayit.konum}</td>
                  <td className="td-style text-center">
                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs border ${durumRenkleri[kayit.durum] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                      {kayit.durum}
                    </span>
                  </td>
                  <td className="td-style">{kayit.tetikleyenPersonelAdiSoyadi || '-'}</td>
                  <td className="td-style">{kayit.hastaAdiSoyadi || '-'}</td>
                  <td className="td-style">
                    <button 
                      onClick={() => openDurumGuncelleModal(kayit)}
                      className="btn-xs-blue"
                      disabled={kayit.durum === 'SONLANDIRILDI'} // Sonlandırılmışsa butonu disable et
                    >
                      Durum Güncelle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Durum Güncelleme Modalı */}
      {showDurumModal && guncellenecekKayit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Kayıt ID: {guncellenecekKayit.id} - Durum Güncelle</h2>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
            <form onSubmit={handleDurumGuncelleSubmit} className="space-y-4">
              <div>
                <label htmlFor="yeniDurum" className="block text-sm font-medium text-gray-700">Yeni Durum</label>
                <select name="yeniDurum" id="yeniDurum" value={yeniDurum} onChange={(e) => setYeniDurum(e.target.value)} required className="mt-1 block w-full select-style" disabled={isDurumGuncelleLoading}>
                  {durumSecenekleri.map(durum => (
                    <option key={durum} value={durum} disabled={guncellenecekKayit.durum === 'SONLANDIRILDI' && durum !== 'SONLANDIRILDI'}>
                      {durum}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowDurumModal(false); setGuncellenecekKayit(null); }} className="btn-cancel" disabled={isDurumGuncelleLoading}>İptal</button>
                <button type="submit" className="btn-primary" disabled={isDurumGuncelleLoading || (guncellenecekKayit.durum === 'SONLANDIRILDI' && yeniDurum !== 'SONLANDIRILDI')}>
                  {isDurumGuncelleLoading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcilDurumKayitlariPage;