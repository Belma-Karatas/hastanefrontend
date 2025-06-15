// src/pages/admin/PersonelVardiyalariPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import personelService from '../../services/personelService';
import vardiyaService from '../../services/vardiyaService'; // Tanımlı vardiyaları çekmek için
import personelVardiyaService from '../../services/personelVardiyaService';
import { format, parseISO } from 'date-fns'; // Tarih formatlamak ve parse etmek için

const PersonelVardiyalariPage = () => {
  const [personeller, setPersoneller] = useState([]);
  const [vardiyaTanimlari, setVardiyaTanimlari] = useState([]);
  const [atanmisVardiyalar, setAtanmisVardiyalar] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [listIsLoading, setListIsLoading] = useState(false); // Liste için ayrı yükleme durumu
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state'leri
  const [selectedPersonelId, setSelectedPersonelId] = useState('');
  const [selectedVardiyaId, setSelectedVardiyaId] = useState('');
  const [selectedTarih, setSelectedTarih] = useState(format(new Date(), 'yyyy-MM-dd')); // Varsayılan bugün

  // Listeleme için filtre state'leri
  const [filtrePersonelId, setFiltrePersonelId] = useState('');
  const [filtreTarih, setFiltreTarih] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Tüm personelleri ve vardiya tanımlarını çek
  useEffect(() => {
    const fetchDataForForm = async () => {
      setIsLoading(true);
      try {
        const [personelRes, vardiyaTanimRes] = await Promise.all([
          personelService.getAllPersoneller(),
          vardiyaService.getAllVardiyalar(),
        ]);
        setPersoneller(personelRes.data);
        setVardiyaTanimlari(vardiyaTanimRes.data);
      } catch (err) {
        console.error("Form için veri getirilirken hata:", err);
        setError('Personel veya vardiya tanımları yüklenemedi.');
      }
      setIsLoading(false);
    };
    fetchDataForForm();
  }, []);

  // Filtreye göre atanmış vardiyaları çek
  const fetchAtanmisVardiyalar = useCallback(async () => {
    if (!filtreTarih && !filtrePersonelId) {
        setAtanmisVardiyalar([]); // Filtre yoksa listeyi boşalt veya bir uyarı göster
        // setError('Lütfen filtreleme yapmak için tarih veya personel seçin.');
        return;
    }
    setListIsLoading(true);
    setError('');
    try {
      let response;
      if (filtrePersonelId) {
        response = await personelVardiyaService.getVardiyalarByPersonelId(filtrePersonelId);
        // Bu endpoint tüm tarihleri getirebilir, filtreTarih'e göre frontend'de süzebiliriz ya da backend'e parametre ekleyebiliriz.
        // Şimdilik backend'den geldiği gibi alalım.
        if (filtreTarih) {
            setAtanmisVardiyalar(response.data.filter(v => format(parseISO(v.tarih), 'yyyy-MM-dd') === filtreTarih));
        } else {
            setAtanmisVardiyalar(response.data);
        }

      } else if (filtreTarih) {
        response = await personelVardiyaService.getVardiyalarByTarih(filtreTarih);
        setAtanmisVardiyalar(response.data);
      }
      
    } catch (err) {
      console.error("Atanmış vardiyalar getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Atanmış vardiyalar yüklenemedi.');
      setAtanmisVardiyalar([]);
    }
    setListIsLoading(false);
  }, [filtrePersonelId, filtreTarih]);

  useEffect(() => {
    // Başlangıçta veya filtreler değiştiğinde listeyi yükle
    if(filtreTarih || filtrePersonelId) { // En az bir filtre varsa yükle
        fetchAtanmisVardiyalar();
    } else {
        setAtanmisVardiyalar([]); // Filtre yoksa boşalt
    }
  }, [fetchAtanmisVardiyalar, filtreTarih, filtrePersonelId]);


  const handleVardiyaAta = async (e) => {
    e.preventDefault();
    if (!selectedPersonelId || !selectedVardiyaId || !selectedTarih) {
      setError('Lütfen personel, vardiya ve tarih seçin.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await personelVardiyaService.vardiyaAta({
        personelId: parseInt(selectedPersonelId),
        vardiyaId: parseInt(selectedVardiyaId),
        tarih: selectedTarih,
      });
      setSuccessMessage('Vardiya başarıyla atandı.');
      setSelectedPersonelId(''); // Formu temizle
      setSelectedVardiyaId('');
      // selectedTarih kalsın veya bir sonraki güne set edilebilir
      fetchAtanmisVardiyalar(); // Listeyi yenile
    } catch (err) {
      console.error("Vardiya atama hatası:", err);
      setError(err.response?.data?.message || err.message || 'Vardiya atanamadı.');
    }
    setIsLoading(false);
  };

  const handleAtamaSil = async (personelVardiyaId, personelAdi, vardiyaAdi, tarih) => {
    if (window.confirm(`${personelAdi} adlı personelin ${format(parseISO(tarih), 'dd.MM.yyyy')} tarihli '${vardiyaAdi}' vardiyasını silmek istediğinizden emin misiniz?`)) {
      setListIsLoading(true); // Liste için loading
      setError('');
      setSuccessMessage('');
      try {
        await personelVardiyaService.vardiyaAtamasiniKaldir(personelVardiyaId);
        setSuccessMessage('Vardiya ataması başarıyla silindi.');
        fetchAtanmisVardiyalar(); // Listeyi yenile
      } catch (err) {
        console.error("Vardiya ataması silme hatası:", err);
        setError(err.response?.data?.message || err.message || 'Vardiya ataması silinemedi.');
      }
      setListIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Personel Vardiyaları Yönetimi</h1>

      {/* Vardiya Atama Formu */}
      <form onSubmit={handleVardiyaAta} className="mb-10 p-6 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Yeni Vardiya Ata</h2>
        {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
        {successMessage && !error && <p className="text-green-600 bg-green-100 p-2 rounded mb-4">{successMessage}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="selectedPersonelId" className="block text-sm font-medium text-gray-700">Personel</label>
            <select
              id="selectedPersonelId"
              value={selectedPersonelId}
              onChange={(e) => setSelectedPersonelId(e.target.value)}
              required
              className="mt-1 block w-full select-style"
              disabled={isLoading}
            >
              <option value="">Personel Seçiniz...</option>
              {personeller.map(p => <option key={p.id} value={p.id}>{p.ad} {p.soyad}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="selectedVardiyaId" className="block text-sm font-medium text-gray-700">Vardiya Tanımı</label>
            <select
              id="selectedVardiyaId"
              value={selectedVardiyaId}
              onChange={(e) => setSelectedVardiyaId(e.target.value)}
              required
              className="mt-1 block w-full select-style"
              disabled={isLoading}
            >
              <option value="">Vardiya Seçiniz...</option>
              {vardiyaTanimlari.map(v => <option key={v.id} value={v.id}>{v.ad} ({v.baslangicSaati} - {v.bitisSaati})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="selectedTarih" className="block text-sm font-medium text-gray-700">Tarih</label>
            <input
              type="date"
              id="selectedTarih"
              value={selectedTarih}
              onChange={(e) => setSelectedTarih(e.target.value)}
              required
              className="mt-1 block w-full input-style"
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
          disabled={isLoading}
        >
          {isLoading ? 'Atanıyor...' : 'Vardiya Ata'}
        </button>
      </form>

      {/* Atanmış Vardiyaları Listeleme ve Filtreleme */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Atanmış Vardiyalar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
            <div>
                <label htmlFor="filtreTarih" className="block text-sm font-medium text-gray-700">Tarihe Göre Listele:</label>
                <input
                type="date"
                id="filtreTarih"
                value={filtreTarih}
                onChange={(e) => { setFiltreTarih(e.target.value); setFiltrePersonelId(''); /* Personel filtresini temizle */ }}
                className="mt-1 block w-full input-style"
                />
            </div>
            <div>
                <label htmlFor="filtrePersonelId" className="block text-sm font-medium text-gray-700">Personele Göre Listele:</label>
                <select
                id="filtrePersonelId"
                value={filtrePersonelId}
                onChange={(e) => { setFiltrePersonelId(e.target.value); /* Tarih filtresi kalabilir veya temizlenebilir*/}}
                className="mt-1 block w-full select-style"
                >
                <option value="">Tüm Personeller (Seçili Tarih İçin)...</option>
                {personeller.map(p => <option key={p.id} value={p.id}>{p.ad} {p.soyad}</option>)}
                </select>
            </div>
        </div>

        {listIsLoading && <p className="text-center text-gray-600 py-4">Liste Yükleniyor...</p>}
        {error && !listIsLoading && atanmisVardiyalar.length === 0 && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md my-4">{error}</p>}
        
        {!listIsLoading && !error && atanmisVardiyalar.length === 0 && (
          <p className="text-center text-gray-500 py-4">Seçili filtreye uygun atanmış vardiya bulunmamaktadır.</p>
        )}

        {!listIsLoading && atanmisVardiyalar.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Personel</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tarih</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vardiya Adı</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Saatler</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {atanmisVardiyalar.map((av) => (
                  <tr key={av.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 border-b border-gray-200 text-sm">{av.personelAdiSoyadi}</td>
                    <td className="px-3 py-4 border-b border-gray-200 text-sm">{format(parseISO(av.tarih), 'dd.MM.yyyy')}</td>
                    <td className="px-3 py-4 border-b border-gray-200 text-sm">{av.vardiyaAdi}</td>
                    <td className="px-3 py-4 border-b border-gray-200 text-sm text-center">{av.vardiyaBaslangicSaati} - {av.vardiyaBitisSaati}</td>
                    <td className="px-3 py-4 border-b border-gray-200 text-sm">
                      <button
                        onClick={() => handleAtamaSil(av.id, av.personelAdiSoyadi, av.vardiyaAdi, av.tarih)}
                        className="text-red-600 hover:text-red-900 font-semibold"
                        disabled={listIsLoading}
                      >
                        Sil
                      </button>
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

export default PersonelVardiyalariPage;