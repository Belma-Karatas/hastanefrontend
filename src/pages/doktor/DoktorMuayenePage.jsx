// src/pages/doktor/DoktorMuayenePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import randevuService from '../../services/randevuService';
import muayeneService from '../../services/muayeneService';
import ilacService from '../../services/ilacService';
import receteService from '../../services/receteService';
import { format, parseISO, isValid } from 'date-fns';

const DoktorMuayenePage = () => {
  const { randevuId } = useParams();
  const navigate = useNavigate();
  const { aktifPersonelId, userToken } = useAuth();

  const [randevuDetay, setRandevuDetay] = useState(null);
  const [mevcutMuayene, setMevcutMuayene] = useState(null);
  
  const [tani, setTani] = useState('');
  const [tedaviNotlari, setTedaviNotlari] = useState('');
  const [receteIlaclari, setReceteIlaclari] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showIlacModal, setShowIlacModal] = useState(false);
  const [ilacAramaTerimi, setIlacAramaTerimi] = useState('');
  const [arananIlaclar, setArananIlaclar] = useState([]);
  const [secilenIlacModal, setSecilenIlacModal] = useState(null);
  const [kullanimSekliModal, setKullanimSekliModal] = useState('');
  const [isSearchingIlac, setIsSearchingIlac] = useState(false);
  const [mevcutReceteId, setMevcutReceteId] = useState(null);

  const fetchRandevuVeMuayeneDetaylari = useCallback(async () => {
    if (!randevuId || !aktifPersonelId || !userToken) { 
        setIsLoading(false); 
        if (!userToken) setError("Lütfen önce giriş yapın.");
        else if (!aktifPersonelId) setError("Doktor profili bulunamadı.");
        else if (!randevuId) setError("Randevu ID bulunamadı.");
        return;
    }
    
    setIsLoading(true); setError(''); setSuccessMessage('');
    
    try {
      const randevuResponse = await randevuService.getRandevuById(randevuId);
      console.log("API'den Gelen Randevu Detayı:", randevuResponse);

      if (!randevuResponse || !randevuResponse.data || typeof randevuResponse.data.id === 'undefined') {
          console.error("Randevu detayları alınamadı veya beklenmedik format:", randevuResponse);
          setError("Randevu bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.");
          setRandevuDetay(null);
          setIsLoading(false);
          return; 
      }
      setRandevuDetay(randevuResponse.data);

      if (randevuResponse.data.doktorId !== aktifPersonelId) {
          setError("Bu randevu için muayene kaydı oluşturma/görüntüleme yetkiniz yok.");
          setIsLoading(false); 
          return;
      }
      
      try {
        const muayeneResponse = await muayeneService.getMuayeneByRandevuId(randevuId); 
        console.log("API'den Gelen Muayene Detayı:", muayeneResponse);
        if (muayeneResponse.data) {
          const muayene = muayeneResponse.data;
          setMevcutMuayene(muayene);
          setTani(muayene.tani || '');
          setTedaviNotlari(muayene.tedaviNotlari || '');
          
          if (muayene.id) {
            try {
              const receteResponse = await receteService.getRecetelerByMuayeneId(muayene.id);
              console.log("API'den Gelen Reçete Detayı:", receteResponse);
              if (receteResponse.data && receteResponse.data.length > 0) {
                const ilkRecete = receteResponse.data[0]; 
                setMevcutReceteId(ilkRecete.id);
                setReceteIlaclari(ilkRecete.ilaclar?.map(ilac => ({
                  ilacId: ilac.ilacId,
                  ilacAdi: ilac.ilacAdi,
                  kullanimSekli: ilac.kullanimSekli,
                  receteIlacId: ilac.receteIlacId 
                })) || []);
              } else {
                setReceteIlaclari([]);
                setMevcutReceteId(null);
              }
            } catch (receteErr) {
              console.warn("Reçete bilgileri çekilirken hata (muhtemelen reçete yok):", receteErr);
              setReceteIlaclari([]);
              setMevcutReceteId(null);
            }
          } else {
            setReceteIlaclari([]);
            setMevcutReceteId(null);
          }
        } else {
          setMevcutMuayene(null); setTani(''); setTedaviNotlari(''); setReceteIlaclari([]); setMevcutReceteId(null);
        }
      } catch (muayeneErr) {
        if (muayeneErr.response && muayeneErr.response.status === 404) {
          setMevcutMuayene(null); setTani(''); setTedaviNotlari(''); setReceteIlaclari([]); setMevcutReceteId(null);
        } else { 
          console.error("Mevcut muayene bilgileri çekilirken hata:", muayeneErr); 
        }
      }
    } catch (err) { 
      console.error("Randevu detayları getirilirken hata:", err); 
      setError(err.response?.data?.message || err.message || "Randevu bilgileri yüklenemedi."); 
      setRandevuDetay(null);
    } finally {
        setIsLoading(false);
    }
  }, [randevuId, aktifPersonelId, userToken]);

  useEffect(() => {
    fetchRandevuVeMuayeneDetaylari();
  }, [fetchRandevuVeMuayeneDetaylari]);
  
  const handleIlacAra = async () => {
    if (!ilacAramaTerimi.trim()) { setArananIlaclar([]); return; }
    setIsSearchingIlac(true);
    try {
        const response = await ilacService.searchIlacByAd(ilacAramaTerimi);
        setArananIlaclar(response.data || []);
    } catch (err) { console.error("İlaç arama hatası:", err); setArananIlaclar([]); }
    setIsSearchingIlac(false);
  };

  const handleIlacSecModal = (ilac) => {
    setSecilenIlacModal(ilac);
    setIlacAramaTerimi(ilac.ad);
    setArananIlaclar([]);
  };

  const handleReceteyeIlacEkleModal = () => {
    if (!secilenIlacModal || !kullanimSekliModal.trim()) { alert("Lütfen bir ilaç seçin ve kullanım şeklini girin."); return; }
    if (receteIlaclari.find(item => item.ilacId === secilenIlacModal.id)) { alert("Bu ilaç zaten reçeteye eklenmiş."); return; }
    setReceteIlaclari(prev => [...prev, { ilacId: secilenIlacModal.id, ilacAdi: secilenIlacModal.ad, kullanimSekli: kullanimSekliModal }]);
    setShowIlacModal(false); setSecilenIlacModal(null); setKullanimSekliModal(''); setIlacAramaTerimi(''); setArananIlaclar([]);
  };

  const handleRecetedenIlacKaldir = (ilacIdToRemove) => {
    setReceteIlaclari(prev => prev.filter(ilac => ilac.ilacId !== ilacIdToRemove));
  };

  const handleMuayeneKaydet = async () => {
    if (!randevuDetay || !aktifPersonelId || !tani.trim()) {
      setError(!tani.trim() ? "Lütfen tanı giriniz." : "Gerekli bilgiler eksik, muayene kaydedilemiyor.");
      return;
    }
    setIsSaving(true); setError(''); setSuccessMessage('');
    const muayeneDataPayload = {
      randevuId: parseInt(randevuId),
      hastaId: randevuDetay.hastaId,
      muayeneTarihiSaati: mevcutMuayene?.muayeneTarihiSaati || randevuDetay.randevuTarihiSaati || new Date().toISOString(),
      tani: tani,
      tedaviNotlari: tedaviNotlari,
      hikaye: mevcutMuayene?.hikaye || "",
    };

    try {
      let savedMuayene;
      if (mevcutMuayene && mevcutMuayene.id) {
        const response = await muayeneService.muayeneGuncelle(mevcutMuayene.id, muayeneDataPayload);
        savedMuayene = response.data;
        setSuccessMessage("Muayene başarıyla güncellendi.");
      } else {
        const response = await muayeneService.muayeneOlustur(muayeneDataPayload);
        savedMuayene = response.data;
        setSuccessMessage("Muayene başarıyla kaydedildi.");
      }
      setMevcutMuayene(savedMuayene);

      if (savedMuayene && savedMuayene.id && receteIlaclari.length > 0) {
        const recetePayload = {
            muayeneId: savedMuayene.id,
            receteTarihi: format(new Date(), 'yyyy-MM-dd'),
            ilaclar: receteIlaclari.map(ilac => ({
                ilacId: ilac.ilacId,
                kullanimSekli: ilac.kullanimSekli
            }))
        };
        try {
            if (mevcutReceteId) {
                 console.warn("Mevcut reçete (ID: " + mevcutReceteId + ") var. Backend'in bu durumu yönetmesi (güncelleme/üzerine yazma) bekleniyor.");
                 await receteService.createRecete(recetePayload); // Veya idealde updateRecete(mevcutReceteId, recetePayload.ilaclar);
                 setSuccessMessage(prev => prev + " Reçete de güncellendi/kaydedildi.");
            } else {
                 const receteResponse = await receteService.createRecete(recetePayload);
                 if (receteResponse.data && receteResponse.data.id) {
                    setMevcutReceteId(receteResponse.data.id);
                 }
                 setSuccessMessage(prev => prev + " Reçete de başarıyla kaydedildi.");
            }
        } catch (receteErr) {
            console.error("Reçete kaydetme/güncelleme hatası:", receteErr);
            setError(prev => prev + " Muayene kaydedildi ancak reçete işlenirken bir hata oluştu: " + (receteErr.response?.data?.message || receteErr.message));
        }
      } else if (savedMuayene && savedMuayene.id && receteIlaclari.length === 0 && mevcutReceteId) {
        console.log("Reçetede ilaç kalmadı, mevcutReceteId:", mevcutReceteId, ". Backend'de silme işlemi gerekebilir.");
        // TODO: İsteğe bağlı: Backend'de bu durumda mevcut reçeteyi silmek için bir servis çağrısı yapılabilir.
        // await receteService.deleteRecete(mevcutReceteId);
        // setMevcutReceteId(null);
      }

    } catch (err) { 
      console.error("Muayene kaydetme/güncelleme hatası:", err);
      setError(err.response?.data?.message || err.message || "Muayene kaydedilirken/güncellenirken bir hata oluştu.");
    }
    setIsSaving(false);
    await fetchRandevuVeMuayeneDetaylari();
  };

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center text-xl font-semibold">Muayene Bilgileri Yükleniyor...</div>;
  }

  if (error && !randevuDetay) {
    return (
        <div className="container mx-auto p-8 text-center">
            <p className="text-red-600 bg-red-100 p-4 rounded-md">{error}</p>
            <button onClick={() => navigate(-1)} className="mt-4 btn-primary">Geri Dön</button>
        </div>
    );
  }
  
  if (!randevuDetay) {
      return (
        <div className="container mx-auto p-8 text-center">
            <p className="text-gray-600">Randevu bilgileri bulunamadı. Lütfen doktor panelinden tekrar deneyin.</p>
            <button onClick={() => navigate('/doktor/dashboard')} className="mt-4 btn-primary">Panele Dön</button>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 btn-cancel">← Geri</button>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Muayene Ekranı</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
        <p>Hasta: <span className="font-semibold">{randevuDetay.hastaAdiSoyadi || 'N/A'}</span></p>
        <p>Randevu: <span className="font-semibold">
          {(randevuDetay.randevuTarihiSaati && isValid(parseISO(randevuDetay.randevuTarihiSaati))) 
            ? format(parseISO(randevuDetay.randevuTarihiSaati), 'dd.MM.yyyy HH:mm') 
            : 'Geçersiz Tarih'}
          </span>
        </p>
        <p>Doktor: <span className="font-semibold">{randevuDetay.doktorAdiSoyadi || 'N/A'} ({randevuDetay.doktorBransAdi || 'Branş Yok'})</span></p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md">{successMessage}</div>}
      
      <div className="bg-white p-6 rounded-lg shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Muayene Bilgileri</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="tani" className="block text-sm font-medium text-gray-700">Tanı</label>
              <textarea id="tani" name="tani" rows="3" className="mt-1 block w-full input-style" value={tani} onChange={(e) => setTani(e.target.value)} placeholder="Hastanın tanısını giriniz..." disabled={isSaving} />
            </div>
            <div>
              <label htmlFor="tedaviNotlari" className="block text-sm font-medium text-gray-700">Tedavi Notları / Bulgular</label>
              <textarea id="tedaviNotlari" name="tedaviNotlari" rows="5" className="mt-1 block w-full input-style" value={tedaviNotlari} onChange={(e) => setTedaviNotlari(e.target.value)} placeholder="Muayene bulguları ve tedavi planını giriniz..." disabled={isSaving} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-700">Reçete</h2>
            <button onClick={() => setShowIlacModal(true)} className="btn-xs-blue" disabled={isSaving}>
              İlaç Ekle
            </button>
          </div>
          {receteIlaclari.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Henüz reçeteye ilaç eklenmedi.</p>
          ) : (
            <ul className="space-y-2">
              {receteIlaclari.map((ilac, index) => (
                <li key={ilac.ilacId || index} className="p-3 bg-gray-50 rounded-md shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-700">{ilac.ilacAdi}</p>
                    <p className="text-xs text-gray-500">{ilac.kullanimSekli}</p>
                  </div>
                  <button onClick={() => handleRecetedenIlacKaldir(ilac.ilacId)} className="text-red-500 hover:text-red-700 text-xs" disabled={isSaving}>
                    Kaldır
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-300 text-right">
          <button onClick={handleMuayeneKaydet} className="btn-primary" disabled={isSaving || !tani.trim()}>
            {isSaving ? 'Kaydediliyor...' : (mevcutMuayene ? 'Muayene ve Reçeteyi Güncelle' : 'Muayene ve Reçeteyi Kaydet')}
          </button>
        </div>
      </div>

      {showIlacModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reçeteye İlaç Ekle</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="ilacArama" className="block text-sm font-medium text-gray-700">İlaç Ara</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input type="text" id="ilacArama" value={ilacAramaTerimi} onChange={(e) => setIlacAramaTerimi(e.target.value)} placeholder="İlaç adı girin..." className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md input-style" />
                  <button type="button" onClick={handleIlacAra} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm" disabled={isSearchingIlac || !ilacAramaTerimi.trim()}>
                    {isSearchingIlac ? 'Aranıyor...' : 'Ara'}
                  </button>
                </div>
              </div>
              {isSearchingIlac && <p className="text-sm text-gray-500">İlaçlar aranıyor...</p>}
              {!isSearchingIlac && arananIlaclar.length > 0 && (
                <ul className="max-h-40 overflow-y-auto border border-gray-300 rounded-md divide-y divide-gray-200">
                  {arananIlaclar.map(ilac => (
                    <li key={ilac.id} onClick={() => handleIlacSecModal(ilac)} className={`p-2 hover:bg-indigo-100 cursor-pointer ${secilenIlacModal?.id === ilac.id ? 'bg-indigo-200 font-semibold' : ''}`}>
                      {ilac.ad}
                    </li>
                  ))}
                </ul>
              )}
              {!isSearchingIlac && ilacAramaTerimi.trim() && arananIlaclar.length === 0 && (
                <p className="text-sm text-red-500">Aramanızla eşleşen ilaç bulunamadı.</p>
              )}
              {secilenIlacModal && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700 mb-1">Seçilen İlaç: <span className="font-semibold text-indigo-600">{secilenIlacModal.ad}</span></p>
                  <label htmlFor="kullanimSekliModal" className="block text-sm font-medium text-gray-700">Kullanım Şekli</label>
                  <input type="text" id="kullanimSekliModal" value={kullanimSekliModal} onChange={(e) => setKullanimSekliModal(e.target.value)} placeholder="Örn: Günde 2 defa tok karnına" className="mt-1 block w-full input-style" required />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" onClick={() => { setShowIlacModal(false); setSecilenIlacModal(null); setKullanimSekliModal(''); setIlacAramaTerimi(''); setArananIlaclar([]); }} className="btn-cancel">İptal</button>
              <button type="button" onClick={handleReceteyeIlacEkleModal} className="btn-primary" disabled={!secilenIlacModal || !kullanimSekliModal.trim()}>Reçeteye Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoktorMuayenePage;