// src/pages/doktor/DoktorMuayenePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import randevuService from '../../services/randevuService';
import muayeneService from '../../services/muayeneService'; // Bu servisi ve metodunu oluşturmanız gerekecek
import ilacService from '../../services/ilacService';
import { format, parseISO, isValid } from 'date-fns'; // isValid eklendi

const DoktorMuayenePage = () => {
  const { randevuId } = useParams();
  const navigate = useNavigate();
  const { aktifPersonelId } = useAuth();

  const [randevuDetay, setRandevuDetay] = useState(null);
  const [mevcutMuayene, setMevcutMuayene] = useState(null);
  
  const [tani, setTani] = useState('');
  const [tedaviNotlari, setTedaviNotlari] = useState('');
  const [receteIlaclari, setReceteIlaclari] = useState([]); // [{ ilacId, ilacAdi, kullanimSekli, receteIlacId? }]

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // İlaç Ekleme Modalı State'leri
  const [showIlacModal, setShowIlacModal] = useState(false);
  const [ilacAramaTerimi, setIlacAramaTerimi] = useState('');
  const [arananIlaclar, setArananIlaclar] = useState([]);
  const [secilenIlacModal, setSecilenIlacModal] = useState(null); // Modal için seçilen ilaç
  const [kullanimSekliModal, setKullanimSekliModal] = useState(''); // Modal için kullanım şekli

  const fetchRandevuVeMuayeneDetaylari = useCallback(async () => {
    if (!randevuId || !aktifPersonelId) return;
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      console.log(`Muayene sayfası için veri çekiliyor: Randevu ID ${randevuId}`);
      const randevuResponse = await randevuService.getRandevuById(randevuId);
      if (!randevuResponse.data) throw new Error("Randevu detayları alınamadı.");
      setRandevuDetay(randevuResponse.data);
      console.log("Randevu Detayı:", randevuResponse.data);

      // Doktorun bu randevuya ait muayene yapma yetkisi var mı? (Randevunun doktoru mu?)
      if (randevuResponse.data.doktorId !== aktifPersonelId) {
          setError("Bu randevu için muayene kaydı oluşturma/görüntüleme yetkiniz yok.");
          setIsLoading(false);
          // navigate("/doktor/dashboard"); // veya yetkisiz bir sayfaya
          return;
      }

      try {
        // Backend'de /api/muayeneler/randevu/{randevuId} endpoint'i olmalı
        const muayeneResponse = await muayeneService.getMuayeneByRandevuId(randevuId); 
        if (muayeneResponse.data) {
          console.log("Mevcut Muayene Kaydı:", muayeneResponse.data);
          setMevcutMuayene(muayeneResponse.data);
          setTani(muayeneResponse.data.tani || '');
          setTedaviNotlari(muayeneResponse.data.tedaviNotlari || '');
          // Backend'den gelen muayene DTO'su reçete ve ilaçları içeriyorsa:
          // Örnek: muayeneResponse.data.recete.ilaclar (DTO yapınıza göre güncelleyin)
          // const recete = muayeneResponse.data.recete;
          // if (recete && recete.ilaclar) {
          //   setReceteIlaclari(recete.ilaclar.map(ri => ({
          //     ilacId: ri.ilacId,
          //     ilacAdi: ri.ilacAdi,
          //     kullanimSekli: ri.kullanimSekli,
          //     receteIlacId: ri.receteIlacId // Silme/güncelleme için önemli
          //   })));
          // }
        } else {
          console.log("Bu randevu için önceden kaydedilmiş muayene bulunmuyor.");
          setMevcutMuayene(null); // Mevcut muayene yoksa null yap
          setTani(''); // Formu temizle
          setTedaviNotlari('');
          setReceteIlaclari([]);
        }
      } catch (muayeneErr) {
        if (muayeneErr.response && muayeneErr.response.status === 404) {
          console.log("Bu randevu için mevcut muayene kaydı bulunamadı (404).");
          setMevcutMuayene(null);
          setTani(''); 
          setTedaviNotlari('');
          setReceteIlaclari([]);
        } else {
          console.error("Mevcut muayene bilgileri çekilirken hata:", muayeneErr);
          // Hata mesajını direkt göstermek yerine daha kullanıcı dostu bir mesaj verilebilir.
          // setError("Mevcut muayene bilgileri yüklenirken bir sorun oluştu.");
        }
      }
    } catch (err) {
      console.error("Randevu detayları getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || "Randevu bilgileri yüklenemedi.");
      // navigate('/doktor/dashboard'); // Opsiyonel: Hata durumunda dashboard'a dön
    }
    setIsLoading(false);
  }, [randevuId, aktifPersonelId, navigate]);

  useEffect(() => {
    fetchRandevuVeMuayeneDetaylari();
  }, [fetchRandevuVeMuayeneDetaylari]);
  
  // ... (handleMuayeneKaydet, ilaç arama/ekleme/kaldırma fonksiyonları ve JSX kısmı sonraki adımlarda eklenecek) ...

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center text-xl font-semibold">Muayene Bilgileri Yükleniyor...</div>;
  }

  if (error && !randevuDetay) { // Eğer randevu detayı hiç yüklenemediyse ve hata varsa
    return (
        <div className="container mx-auto p-8 text-center">
            <p className="text-red-600 bg-red-100 p-4 rounded-md">{error}</p>
            <button onClick={() => navigate(-1)} className="mt-4 btn-primary">Geri Dön</button>
        </div>
    );
  }
  
  if (!randevuDetay) { // Randevu detayı hala yüklenmemişse (hata yokken bu olmamalı ama bir fallback)
      return <div className="container mx-auto p-8 text-center">Randevu bilgisi bulunamadı.</div>;
  }


  // JSX (Form ve diğer elementler buraya gelecek)
  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        ← Geri
      </button>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Muayene Ekranı</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
        <p className="text-lg">Hasta: <span className="font-semibold">{randevuDetay.hastaAdiSoyadi}</span></p>
        <p className="text-md">
          Randevu: <span className="font-semibold">
            {randevuDetay.randevuTarihiSaati && isValid(parseISO(randevuDetay.randevuTarihiSaati)) 
              ? format(parseISO(randevuDetay.randevuTarihiSaati), 'dd.MM.yyyy HH:mm') 
              : 'Geçersiz Tarih'}
          </span>
        </p>
        <p className="text-sm">Doktor: <span className="font-semibold">{randevuDetay.doktorAdiSoyadi} ({randevuDetay.doktorBransAdi})</span></p>
      </div>

      {/* Hata ve başarı mesajları için genel bir alan */}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">{successMessage}</div>}
      
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <p className="text-gray-600">Muayene formu ve reçete bölümü buraya eklenecek.</p>
        {/* Form Alanları, İlaç Ekleme Modalı, Kaydet Butonu vs. */}
      </div>
    </div>
  );
};

export default DoktorMuayenePage;