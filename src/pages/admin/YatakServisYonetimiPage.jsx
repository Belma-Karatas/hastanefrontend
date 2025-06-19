// src/pages/admin/YatakServisYonetimiPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import katService from '../../services/katService';
import odaService from '../../services/odaService';
import yatakService from '../../services/yatakService';
import yatisService from '../../services/yatisService';
import hastaService from '../../services/hastaService';
import personelService from '../../services/personelService';
import { format, parseISO } from 'date-fns'; // Tarih formatlama için eklendi

const YatakServisYonetimiPage = () => {
  const [katlar, setKatlar] = useState([]);
  const [selectedKatId, setSelectedKatId] = useState('');
  
  const [odalar, setOdalar] = useState([]);
  const [selectedOda, setSelectedOda] = useState(null);
  
  const [yataklar, setYataklar] = useState([]);
  const [selectedYatakForYatis, setSelectedYatakForYatis] = useState(null);

  const [isLoadingKatlar, setIsLoadingKatlar] = useState(false);
  const [isLoadingOdalar, setIsLoadingOdalar] = useState(false);
  const [isLoadingYataklar, setIsLoadingYataklar] = useState(false);
  const [error, setError] = useState('');
  
  const [showOdaModal, setShowOdaModal] = useState(false);
  const [editOda, setEditOda] = useState(null);
  const [odaFormData, setOdaFormData] = useState({ odaNumarasi: '', kapasite: 1 });
  const [isOdaFormLoading, setIsOdaFormLoading] = useState(false);
  const [odaFormError, setOdaFormError] = useState('');
  const [odaSuccessMessage, setOdaSuccessMessage] = useState('');

  const [showYatakModal, setShowYatakModal] = useState(false);
  const [editYatak, setEditYatak] = useState(null);
  const [yatakFormData, setYatakFormData] = useState({ yatakNumarasi: '' });
  const [isYatakFormLoading, setIsYatakFormLoading] = useState(false);
  const [yatakFormError, setYatakFormError] = useState('');
  const [yatakSuccessMessage, setYatakSuccessMessage] = useState('');

  const [showYatisModal, setShowYatisModal] = useState(false);
  const [yatisFormData, setYatisFormData] = useState({ hastaId: '', sorumluDoktorId: '', yatisNedeni: '' });
  const [isYatisFormLoading, setIsYatisFormLoading] = useState(false);
  const [yatisFormError, setYatisFormError] = useState('');
  const [yatisSuccessMessage, setYatisSuccessMessage] = useState('');
  const [hastalarListesi, setHastalarListesi] = useState([]);
  const [doktorlarListesi, setDoktorlarListesi] = useState([]);

  // --- HEMŞİRE ATA MODALI İÇİN STATE'LER ---
  const [showHemsireAtaModal, setShowHemsireAtaModal] = useState(false);
  const [selectedYatisForHemsire, setSelectedYatisForHemsire] = useState(null); // Yatış DTO'sunu tutacak
  const [hemsirelerListesi, setHemsirelerListesi] = useState([]); // Sistemdeki tüm hemşireler
  const [selectedHemsireForAtama, setSelectedHemsireForAtama] = useState(''); // Dropdown'dan seçilen hemşire ID'si
  const [isHemsireFormLoading, setIsHemsireFormLoading] = useState(false);
  const [hemsireFormError, setHemsireFormError] = useState('');
  const [hemsireSuccessMessage, setHemsireSuccessMessage] = useState('');
  // -----------------------------------------

  const clearMessages = () => {
    setError('');
    setOdaSuccessMessage('');
    setYatakSuccessMessage('');
    setYatisSuccessMessage('');
    setHemsireSuccessMessage(''); // Eklendi
    setOdaFormError('');
    setYatakFormError('');
    setYatisFormError('');
    setHemsireFormError(''); // Eklendi
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingKatlar(true); clearMessages();
      try {
        const [katRes, hastaRes, personelRes] = await Promise.all([
          katService.getAllKatlar(),
          hastaService.getAllHastalar(),
          personelService.getAllPersoneller()
        ]);
        setKatlar(katRes.data || []);
        setHastalarListesi(hastaRes.data || []);
        
        const allPersonel = personelRes.data || [];
        
        const doktorlar = allPersonel.filter(p => 
          p.roller && 
          (Array.isArray(p.roller) ? p.roller.includes('ROLE_DOKTOR') : p.roller.has?.('ROLE_DOKTOR'))
        );
        setDoktorlarListesi(doktorlar);

        // Hemşireleri filtrele
        const hemsireler = allPersonel.filter(p =>
          p.roller &&
          (Array.isArray(p.roller) ? p.roller.includes('ROLE_HEMSIRE') : p.roller.has?.('ROLE_HEMSIRE'))
        );
        setHemsirelerListesi(hemsireler);

      } catch (err) { 
        console.error("Başlangıç verileri getirilirken hata:", err);
        setError(err.response?.data?.message || err.message || 'Veriler yüklenemedi.'); 
      }
      setIsLoadingKatlar(false);
    };
    fetchInitialData();
  }, []);

  const fetchOdalarByKat = useCallback(async (katId) => {
    if (!katId) { setOdalar([]); setSelectedOda(null); setYataklar([]); return; }
    setIsLoadingOdalar(true); clearMessages();
    try {
      const response = await odaService.getAllOdalar(katId);
      setOdalar(response.data || []); setSelectedOda(null); setYataklar([]);
    } catch (err) { 
      console.error(`Kat ${katId} için odalar getirilirken hata:`, err);
      setError(err.response?.data?.message || err.message || 'Odalar yüklenemedi.'); 
      setOdalar([]); 
    }
    setIsLoadingOdalar(false);
  }, []);

  useEffect(() => {
    if (selectedKatId) { fetchOdalarByKat(selectedKatId);
    } else { setOdalar([]); setSelectedOda(null); setYataklar([]); }
  }, [selectedKatId, fetchOdalarByKat]);

  const fetchYataklarByOda = useCallback(async (odaId) => {
    if (!odaId) { setYataklar([]); return; }
    setIsLoadingYataklar(true); clearMessages();
    try {
      const response = await yatakService.getYataklarByOdaId(odaId);
      setYataklar(response.data || []);
    } catch (err) { 
      console.error(`Oda ${odaId} için yataklar getirilirken hata:`, err);
      setError(err.response?.data?.message || err.message || 'Yataklar yüklenemedi.'); 
      setYataklar([]); 
    }
    setIsLoadingYataklar(false);
  }, []);

  useEffect(() => { 
    if (selectedOda) { fetchYataklarByOda(selectedOda.id); } 
    else { setYataklar([]); } 
  }, [selectedOda, fetchYataklarByOda]);

  const handleKatChange = (e) => { clearMessages(); setSelectedKatId(e.target.value); };
  const handleOdaSec = (oda) => { clearMessages(); setSelectedOda(oda); };
  
  // Oda CRUD işlemleri (Mevcut kodunuzdaki gibi)
  const resetOdaForm = () => { setOdaFormData({ odaNumarasi: '', kapasite: 1 }); setEditOda(null); setOdaFormError(''); };
  const openOdaEkleModal = () => { if (!selectedKatId) { setError("Lütfen önce bir kat seçin."); return; } clearMessages(); resetOdaForm(); setShowOdaModal(true); };
  const openOdaDuzenleModal = (oda) => { clearMessages(); resetOdaForm(); setEditOda(oda); setOdaFormData({ odaNumarasi: oda.odaNumarasi, kapasite: oda.kapasite }); setShowOdaModal(true); };
  const handleOdaFormInputChange = (e) => { const { name, value } = e.target; setOdaFormData(prev => ({ ...prev, [name]: value })); };
  const handleOdaFormSubmit = async (e) => { e.preventDefault(); if (!odaFormData.odaNumarasi.trim() || !odaFormData.kapasite) { setOdaFormError('Oda numarası ve kapasite boş olamaz.'); return; } const kapasiteNum = parseInt(odaFormData.kapasite, 10); if (isNaN(kapasiteNum) || kapasiteNum <= 0) { setOdaFormError('Kapasite pozitif bir sayı olmalıdır.'); return; } setIsOdaFormLoading(true); setOdaFormError(''); clearMessages(); const payload = { odaNumarasi: odaFormData.odaNumarasi, kapasite: kapasiteNum, katId: parseInt(selectedKatId) }; try { if (editOda) { await odaService.updateOda(editOda.id, payload); setOdaSuccessMessage(`'${payload.odaNumarasi}' odası başarıyla güncellendi.`); } else { await odaService.createOda(payload); setOdaSuccessMessage(`'${payload.odaNumarasi}' odası başarıyla eklendi.`); } setShowOdaModal(false); fetchOdalarByKat(selectedKatId); } catch (err) { console.error("Oda işlemi hatası:", err); setOdaFormError(err.response?.data?.message || err.response?.data?.error || err.message || 'Oda işlemi sırasında bir hata oluştu.'); } setIsOdaFormLoading(false); };
  const handleOdaSil = async (odaId, odaNumarasi) => { if (window.confirm(`'${odaNumarasi}' numaralı odayı silmek istediğinizden emin misiniz?`)) { setIsLoadingOdalar(true); clearMessages(); try { await odaService.deleteOda(odaId); setOdaSuccessMessage(`'${odaNumarasi}' numaralı oda başarıyla silindi.`); fetchOdalarByKat(selectedKatId); if(selectedOda?.id === odaId) setSelectedOda(null); } catch (err) { console.error("Oda silme hatası:", err); setOdaFormError(err.response?.data?.message || err.message || 'Oda silinemedi.'); } setIsLoadingOdalar(false); } };

  // Yatak CRUD işlemleri (Mevcut kodunuzdaki gibi)
  const resetYatakForm = () => { setYatakFormData({ yatakNumarasi: '' }); setEditYatak(null); setYatakFormError(''); };
  const openYatakEkleModal = () => { if (!selectedOda) { setError("Önce bir oda seçin."); return; } clearMessages(); resetYatakForm(); setShowYatakModal(true); };
  const openYatakDuzenleModal = (yatak) => { clearMessages(); resetYatakForm(); setEditYatak(yatak); setYatakFormData({ yatakNumarasi: yatak.yatakNumarasi }); setShowYatakModal(true); };
  const handleYatakFormInputChange = (e) => { const { name, value } = e.target; setYatakFormData(prev => ({ ...prev, [name]: value })); };
  const handleYatakFormSubmit = async (e) => { e.preventDefault(); if (!yatakFormData.yatakNumarasi.trim()) { setYatakFormError('Yatak numarası boş olamaz.'); return; } setIsYatakFormLoading(true); setYatakFormError(''); clearMessages(); const payload = { yatakNumarasi: yatakFormData.yatakNumarasi, odaId: selectedOda.id }; try { if (editYatak) { const updatePayload = { ...payload, doluMu: editYatak.doluMu }; await yatakService.updateYatak(editYatak.id, updatePayload); setYatakSuccessMessage(`'${payload.yatakNumarasi}' numaralı yatak başarıyla güncellendi.`); } else { const createPayload = { ...payload, doluMu: false }; await yatakService.createYatak(createPayload); setYatakSuccessMessage(`'${payload.yatakNumarasi}' numaralı yatak başarıyla eklendi.`); } setShowYatakModal(false); fetchYataklarByOda(selectedOda.id); } catch (err) { console.error("Yatak işlemi hatası:", err); setYatakFormError(err.response?.data?.message || err.response?.data?.error || err.message || 'Yatak işlemi sırasında bir hata oluştu.');} setIsYatakFormLoading(false); };
  const handleYatakSil = async (yatakId, yatakNumarasi) => { if (window.confirm(`Oda ${selectedOda?.odaNumarasi} içindeki '${yatakNumarasi}' numaralı yatağı silmek istediğinizden emin misiniz?`)) { setIsLoadingYataklar(true); clearMessages(); try { await yatakService.deleteYatak(yatakId); setYatakSuccessMessage(`'${yatakNumarasi}' numaralı yatak başarıyla silindi.`); fetchYataklarByOda(selectedOda.id); } catch (err) { console.error("Yatak silme hatası:", err); setYatakFormError(err.response?.data?.message || err.message || 'Yatak silinemedi.');} setIsLoadingYataklar(false); } };
  
  // Yatış Yapma ve Taburcu Etme (Mevcut kodunuzdaki gibi)
  const resetYatisForm = () => { setYatisFormData({ hastaId: '', sorumluDoktorId: '', yatisNedeni: '' }); setSelectedYatakForYatis(null); setYatisFormError(''); };
  const openYatisYapModal = (yatak) => { if (yatak.doluMu) { setError("Bu yatak zaten dolu, yeni yatış yapılamaz."); return; } clearMessages(); resetYatisForm(); setSelectedYatakForYatis(yatak); setShowYatisModal(true); };
  const handleYatisFormInputChange = (e) => { const { name, value } = e.target; setYatisFormData(prev => ({ ...prev, [name]: value })); };
  const handleYatisYapSubmit = async (e) => { e.preventDefault(); if (!yatisFormData.hastaId || !yatisFormData.sorumluDoktorId || !yatisFormData.yatisNedeni.trim()) { setYatisFormError('Lütfen hasta, sorumlu doktor seçin ve yatış nedenini girin.'); return; } if (!selectedYatakForYatis) { setYatisFormError('Yatış yapılacak yatak seçilemedi.'); return; } setIsYatisFormLoading(true); setYatisFormError(''); clearMessages(); const payload = { ...yatisFormData, yatakId: selectedYatakForYatis.id }; try { await yatisService.hastaYatisiYap(payload); setYatisSuccessMessage(`Hasta başarıyla ${selectedYatakForYatis.yatakNumarasi} numaralı yatağa yatırıldı.`); setShowYatisModal(false); fetchYataklarByOda(selectedOda.id); } catch (err) { console.error("Yatış işlemi hatası:", err); setYatisFormError(err.response?.data?.message || err.response?.data?.error || err.message || 'Yatış işlemi sırasında bir hata oluştu.');} setIsYatisFormLoading(false); };
  const handleTaburcuEt = async (yatak) => { if (!yatak.doluMu || !yatak.aktifYatisId) { setError("Bu yatakta taburcu edilecek aktif bir yatış bulunmuyor."); return; } if (window.confirm(`${yatak.yatanHastaAdiSoyadi || 'Bilinmeyen Hasta'} adlı hastayı ${yatak.yatakNumarasi} numaralı yataktan taburcu etmek istediğinizden emin misiniz?`)) { setIsLoadingYataklar(true); clearMessages(); try { await yatisService.hastaTaburcuEt(yatak.aktifYatisId); setYatisSuccessMessage("Hasta başarıyla taburcu edildi."); fetchYataklarByOda(selectedOda.id); } catch (err) { console.error("Taburcu etme hatası:", err); setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Taburcu işlemi sırasında bir hata oluştu.');} setIsLoadingYataklar(false); } };

  // --- HEMŞİRE ATAMA FONKSİYONLARI ---
  const openHemsireAtaModal = async (yatak) => {
    if (!yatak.aktifYatisId) {
      setError("Bu yatakta aktif bir yatış bulunmuyor, hemşire atanamaz.");
      return;
    }
    clearMessages();
    setIsHemsireFormLoading(true); // Modal yüklenirken
    try {
      const response = await yatisService.getYatisById(yatak.aktifYatisId);
      setSelectedYatisForHemsire(response.data); // Backend'den gelen YatisGoruntuleDTO'yu set et
      setShowHemsireAtaModal(true);
    } catch (err) {
      console.error("Yatış detayları getirilirken hata:", err);
      setHemsireFormError("Yatışa ait hemşire bilgileri yüklenemedi.");
    }
    setIsHemsireFormLoading(false);
  };

  const handleHemsireAta = async () => {
    if (!selectedYatisForHemsire || !selectedHemsireForAtama) {
      setHemsireFormError("Lütfen bir hemşire seçin.");
      return;
    }
    setIsHemsireFormLoading(true);
    setHemsireFormError('');
    setHemsireSuccessMessage('');
    try {
      const payload = { hemsirePersonelId: parseInt(selectedHemsireForAtama) };
      const response = await yatisService.hemsireAta(selectedYatisForHemsire.id, payload);
      setSelectedYatisForHemsire(response.data); // Güncellenmiş yatış bilgisini al
      setHemsireSuccessMessage("Hemşire başarıyla atandı.");
      setSelectedHemsireForAtama(''); // Dropdown'ı sıfırla
      fetchYataklarByOda(selectedOda.id); // Yatak listesini yenileyerek yatan hasta için hemşireleri güncelle
    } catch (err) {
      console.error("Hemşire atama hatası:", err);
      setHemsireFormError(err.response?.data?.message || err.message || "Hemşire atanamadı.");
    }
    setIsHemsireFormLoading(false);
  };

  const handleHemsireKaldir = async (yatisHemsireAtamaId) => {
    if (!selectedYatisForHemsire) return;
    if (window.confirm("Bu hemşireyi yatıştan kaldırmak istediğinizden emin misiniz?")) {
      setIsHemsireFormLoading(true);
      setHemsireFormError('');
      setHemsireSuccessMessage('');
      try {
        const response = await yatisService.hemsireAtamasiniKaldir(selectedYatisForHemsire.id, yatisHemsireAtamaId);
        setSelectedYatisForHemsire(response.data); // Güncellenmiş yatış bilgisini al
        setHemsireSuccessMessage("Hemşire başarıyla kaldırıldı.");
        fetchYataklarByOda(selectedOda.id); 
      } catch (err) {
        console.error("Hemşire kaldırma hatası:", err);
        setHemsireFormError(err.response?.data?.message || err.message || "Hemşire kaldırılamadı.");
      }
      setIsHemsireFormLoading(false);
    }
  };
  // -----------------------------------

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Yatak ve Servis Operasyonları</h1>

      {/* Kat Seçimi, Oda Listesi, Yatak Listesi ve ilgili Modallar (Mevcut kodunuzdaki gibi) */}
      {isLoadingKatlar && <p className="text-center text-gray-600 py-2">Katlar yükleniyor...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {odaSuccessMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{odaSuccessMessage}</p>}
      {yatakSuccessMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{yatakSuccessMessage}</p>}
      {yatisSuccessMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{yatisSuccessMessage}</p>}
      {hemsireSuccessMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{hemsireSuccessMessage}</p>}


      {!isLoadingKatlar && katlar.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
          <label htmlFor="katSecimi" className="block text-lg font-semibold text-gray-700 mb-2">Kat Seçiniz</label>
          <select id="katSecimi" value={selectedKatId} onChange={handleKatChange} className="mt-1 block w-full md:w-1/2 lg:w-1/3 select-style">
            <option value="">-- Bir Kat Seçin --</option>
            {katlar.map(kat => (<option key={kat.id} value={kat.id}>{kat.ad}</option>))}
          </select>
        </div>
      )}
      {!isLoadingKatlar && katlar.length === 0 && !error && (<p className="text-gray-500 text-center py-4">Sistemde kayıtlı kat bulunmamaktadır.</p>)}

      {selectedKatId && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              {katlar.find(k => k.id.toString() === selectedKatId)?.ad || ''} Katı - Odalar
            </h2>
            <button onClick={openOdaEkleModal} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md text-sm" disabled={isLoadingOdalar}>
              Bu Kata Yeni Oda Ekle
            </button>
          </div>
          {isLoadingOdalar && <p className="text-gray-600 py-2">Odalar yükleniyor...</p>}
          {odaFormError && <p className="text-center text-red-500 bg-red-100 p-2 rounded my-2">{odaFormError}</p>}
          {!isLoadingOdalar && !odaFormError && odalar.length === 0 && (<p className="text-gray-500 text-center py-2">Bu katta kayıtlı oda bulunmamaktadır.</p>)}
          {!isLoadingOdalar && odalar.length > 0 && (
            <div className="overflow-x-auto bg-white rounded-lg shadow mt-2">
              <table className="min-w-full leading-normal">
                <thead><tr><th className="th-style">Oda No</th><th className="th-style text-center">Kapasite</th><th className="th-style">İşlemler</th></tr></thead>
                <tbody>
                  {odalar.map((oda) => (
                    <tr key={oda.id} className={`hover:bg-gray-100 cursor-pointer ${selectedOda?.id === oda.id ? 'bg-indigo-100' : ''}`} onClick={() => handleOdaSec(oda)}>
                      <td className="td-style">{oda.odaNumarasi}</td>
                      <td className="td-style text-center">{oda.kapasite}</td>
                      <td className="td-style space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); openOdaDuzenleModal(oda); }} className="btn-xs-blue">Düzenle</button>
                        <button onClick={(e) => { e.stopPropagation(); handleOdaSil(oda.id, oda.odaNumarasi); }} className="btn-xs-red">Sil</button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedOda && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Oda {selectedOda.odaNumarasi} - Yataklar</h2>
            <button onClick={openYatakEkleModal} className="mr-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md text-sm" disabled={isLoadingYataklar}>
              Bu Odaya Yatak Ekle
            </button>
          </div>
          {isLoadingYataklar && <p className="text-gray-600 py-2">Yataklar yükleniyor...</p>}
          {yatakFormError && <p className="text-center text-red-500 bg-red-100 p-2 rounded my-2">{yatakFormError}</p>}
          {!isLoadingYataklar && !yatakFormError && yataklar.length === 0 && (<p className="text-gray-500 text-center py-2">Bu odada yatak yok.</p>)}
          {!isLoadingYataklar && yataklar.length > 0 && (
            <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
              <table className="min-w-full leading-normal">
                <thead><tr><th className="th-style">Yatak No</th><th className="th-style text-center">Durum</th><th className="th-style">Yatan Hasta</th><th className="th-style">İşlemler</th></tr></thead>
                <tbody>
                  {yataklar.map((yatak) => (
                    <tr key={yatak.id} className={`hover:bg-gray-100 ${yatak.doluMu ? 'bg-red-50' : 'bg-green-50'}`}>
                      <td className="td-style">{yatak.yatakNumarasi}</td>
                      <td className="td-style text-center"><span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${yatak.doluMu ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>{yatak.doluMu ? 'Dolu' : 'Boş'}</span></td>
                      <td className="td-style">{yatak.doluMu ? (yatak.yatanHastaAdiSoyadi || 'Bilinmiyor') : '-'}</td>
                      <td className="td-style space-x-1">
                        {yatak.doluMu ? (
                          <>
                            <button className="btn-xs-blue" onClick={() => alert(`Yatış ID: ${yatak.aktifYatisId}`)} disabled={!yatak.aktifYatisId}>Yatış Detay</button>
                            {/* HEMŞİRE ATA BUTONU */}
                            <button 
                                onClick={() => openHemsireAtaModal(yatak)} 
                                className="btn-xs-purple" 
                                disabled={!yatak.aktifYatisId || isLoadingYataklar}
                            >
                                Hemşire Ata
                            </button>
                            <button onClick={() => handleTaburcuEt(yatak)} className="btn-xs-orange" disabled={isLoadingYataklar}>Taburcu Et</button>
                          </>
                        ) : (
                          <button onClick={() => openYatisYapModal(yatak)} className="btn-xs-green" disabled={isLoadingYataklar}>Yatış Yap</button>
                        )}
                        <button onClick={() => openYatakDuzenleModal(yatak)} className="btn-xs-gray ml-2" disabled={isLoadingYataklar || yatak.doluMu}>Yatak Düz.</button>
                        <button onClick={() => handleYatakSil(yatak.id, yatak.yatakNumarasi)} className="btn-xs-red" disabled={isLoadingYataklar || yatak.doluMu}>Yatak Sil</button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Oda Ekle/Düzenle Modalı (Mevcut kodunuzdaki gibi) */}
      {showOdaModal && ( <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"><h2 className="text-2xl font-semibold mb-6 text-gray-800">{editOda ? 'Odayı Düzenle' : `Kat ${katlar.find(k => k.id.toString() === selectedKatId)?.ad || ''} - Yeni Oda Ekle`}</h2>{odaFormError && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{odaFormError}</p>}<form onSubmit={handleOdaFormSubmit} className="space-y-4"><div><label htmlFor="odaNumarasi" className="block text-sm font-medium text-gray-700">Oda Numarası</label><input type="text" name="odaNumarasi" id="odaNumarasi" value={odaFormData.odaNumarasi} onChange={handleOdaFormInputChange} required className="mt-1 block w-full input-style" disabled={isOdaFormLoading} /></div><div><label htmlFor="kapasite" className="block text-sm font-medium text-gray-700">Kapasite</label><input type="number" name="kapasite" id="kapasite" value={odaFormData.kapasite} onChange={handleOdaFormInputChange} required min="1" className="mt-1 block w-full input-style" disabled={isOdaFormLoading} /></div><div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={() => { setShowOdaModal(false); resetOdaForm(); }} className="btn-cancel" disabled={isOdaFormLoading}>İptal</button><button type="submit" className="btn-primary" disabled={isOdaFormLoading}>{isOdaFormLoading ? 'İşleniyor...' : (editOda ? 'Güncelle' : 'Kaydet')}</button></div></form></div></div>)}
      {/* Yatak Ekle/Düzenle Modalı (Mevcut kodunuzdaki gibi) */}
      {showYatakModal && ( <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"><h2 className="text-2xl font-semibold mb-6 text-gray-800">{editYatak ? 'Yatağı Düzenle' : `Oda ${selectedOda?.odaNumarasi} - Yeni Yatak Ekle`}</h2>{yatakFormError && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{yatakFormError}</p>}<form onSubmit={handleYatakFormSubmit} className="space-y-4"><div><label htmlFor="yatakNumarasi" className="block text-sm font-medium text-gray-700">Yatak Numarası</label><input type="text" name="yatakNumarasi" id="yatakNumarasi" value={yatakFormData.yatakNumarasi} onChange={handleYatakFormInputChange} required className="mt-1 block w-full input-style" disabled={isYatakFormLoading} /></div><div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={() => { setShowYatakModal(false); resetYatakForm(); }} className="btn-cancel" disabled={isYatakFormLoading}>İptal</button><button type="submit" className="btn-primary" disabled={isYatakFormLoading}>{isYatakFormLoading ? 'İşleniyor...' : (editYatak ? 'Güncelle' : 'Kaydet')}</button></div></form></div></div>)}
      {/* Yatış Yap Modalı (Mevcut kodunuzdaki gibi) */}
      {showYatisModal && selectedYatakForYatis && ( <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg"><h2 className="text-2xl font-semibold mb-6 text-gray-800">Oda {selectedOda?.odaNumarasi} / Yatak {selectedYatakForYatis.yatakNumarasi} - Yeni Hasta Yatışı</h2>{yatisFormError && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{yatisFormError}</p>}<form onSubmit={handleYatisYapSubmit} className="space-y-4"><div><label htmlFor="hastaId" className="block text-sm font-medium text-gray-700">Hasta Seçin</label><select name="hastaId" id="hastaId" value={yatisFormData.hastaId} onChange={handleYatisFormInputChange} required className="mt-1 block w-full select-style" disabled={isYatisFormLoading || hastalarListesi.length === 0}><option value="">-- Hasta Seçin --</option>{hastalarListesi.map(h => <option key={h.id} value={h.id}>{h.ad} {h.soyad} (TC: {h.tcKimlikNo || 'N/A'})</option>)}</select>{hastalarListesi.length === 0 && !isLoadingKatlar && <p className="text-xs text-red-500 mt-1">Sistemde kayıtlı hasta bulunamadı.</p>}</div><div><label htmlFor="sorumluDoktorId" className="block text-sm font-medium text-gray-700">Sorumlu Doktor Seçin</label><select name="sorumluDoktorId" id="sorumluDoktorId" value={yatisFormData.sorumluDoktorId} onChange={handleYatisFormInputChange} required className="mt-1 block w-full select-style" disabled={isYatisFormLoading || doktorlarListesi.length === 0}><option value="">-- Doktor Seçin --</option>{doktorlarListesi.map(d => <option key={d.id} value={d.id}>{d.ad} {d.soyad} ({d.bransAdi || 'Branş Yok'})</option>)}</select>{doktorlarListesi.length === 0 && !isLoadingKatlar && <p className="text-xs text-red-500 mt-1">Sistemde kayıtlı doktor bulunamadı.</p>}</div><div><label htmlFor="yatisNedeni" className="block text-sm font-medium text-gray-700">Yatış Nedeni</label><textarea name="yatisNedeni" id="yatisNedeni" value={yatisFormData.yatisNedeni} onChange={handleYatisFormInputChange} required rows="3" className="mt-1 block w-full input-style" disabled={isYatisFormLoading}></textarea></div><div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={() => { setShowYatisModal(false); resetYatisForm(); }} className="btn-cancel" disabled={isYatisFormLoading}>İptal</button><button type="submit" className="btn-primary" disabled={isYatisFormLoading || !yatisFormData.hastaId || !yatisFormData.sorumluDoktorId || !yatisFormData.yatisNedeni.trim()}>{isYatisFormLoading ? 'Yatış Yapılıyor...' : 'Hastayı Yatır'}</button></div></form></div></div>)}

      {/* --- HEMŞİRE ATA MODALI --- */}
      {showHemsireAtaModal && selectedYatisForHemsire && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Hasta: {selectedYatisForHemsire.hastaAdiSoyadi} (Yatak: {selectedYatisForHemsire.yatakNumarasi}) - Hemşire Yönetimi
            </h3>
            
            {hemsireFormError && <p className="text-red-500 bg-red-100 p-2 rounded mb-3">{hemsireFormError}</p>}
            {hemsireSuccessMessage && <p className="text-green-600 bg-green-100 p-2 rounded mb-3">{hemsireSuccessMessage}</p>}

            {/* Atanmış Hemşireler Listesi */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Atanmış Hemşireler:</h4>
              {isHemsireFormLoading && selectedYatisForHemsire.hemsireler?.length === 0 && <p className="text-xs text-gray-500">Yükleniyor...</p>}
              {!isHemsireFormLoading && selectedYatisForHemsire.hemsireler?.length === 0 && <p className="text-sm text-gray-500 italic">Bu yatışa henüz hemşire atanmamış.</p>}
              {selectedYatisForHemsire.hemsireler && selectedYatisForHemsire.hemsireler.length > 0 && (
                <ul className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {selectedYatisForHemsire.hemsireler.map(atama => (
                    <li key={atama.yatisHemsireAtamaId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{atama.hemsireAdiSoyadi} <span className="text-xs text-gray-400">(ID: {atama.hemsirePersonelId})</span></span>
                      <button 
                        onClick={() => handleHemsireKaldir(atama.yatisHemsireAtamaId)}
                        className="btn-xs-red"
                        disabled={isHemsireFormLoading}
                      >
                        Kaldır
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Yeni Hemşire Atama Formu */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-700 mb-2">Yeni Hemşire Ata:</h4>
              <div className="flex items-end space-x-2">
                <div className="flex-grow">
                  <label htmlFor="selectedHemsireForAtama" className="sr-only">Hemşire Seç</label>
                  <select 
                    id="selectedHemsireForAtama" 
                    value={selectedHemsireForAtama} 
                    onChange={(e) => setSelectedHemsireForAtama(e.target.value)}
                    className="block w-full select-style"
                    disabled={isHemsireFormLoading || hemsirelerListesi.length === 0}
                  >
                    <option value="">-- Hemşire Seçin --</option>
                    {hemsirelerListesi.map(h => (
                      <option 
                        key={h.id} 
                        value={h.id}
                        // Eğer hemşire zaten atanmışsa listede disable edilebilir (opsiyonel)
                        disabled={selectedYatisForHemsire.hemsireler?.some(ah => ah.hemsirePersonelId === h.id)}
                      >
                        {h.ad} {h.soyad}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  type="button" 
                  onClick={handleHemsireAta} 
                  className="btn-primary"
                  disabled={isHemsireFormLoading || !selectedHemsireForAtama}
                >
                  {isHemsireFormLoading ? 'Atanıyor...' : 'Ata'}
                </button>
              </div>
              {hemsirelerListesi.length === 0 && !isLoadingKatlar && (
                <p className="text-xs text-red-500 mt-1">Sistemde kayıtlı hemşire bulunamadı.</p>
              )}
            </div>

            <div className="mt-6 text-right">
              <button 
                type="button" 
                onClick={() => { setShowHemsireAtaModal(false); setSelectedYatisForHemsire(null); setHemsireFormError(''); setHemsireSuccessMessage(''); setSelectedHemsireForAtama('');}} 
                className="btn-cancel"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------------------------- */}
    </div>
  );
};

export default YatakServisYonetimiPage;