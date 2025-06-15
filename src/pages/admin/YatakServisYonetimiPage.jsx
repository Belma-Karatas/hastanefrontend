// src/pages/admin/YatakServisYonetimiPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import katService from '../../services/katService';
import odaService from '../../services/odaService';
import yatakService from '../../services/yatakService';
// import yatisService from '../../services/yatisService'; // Yatış işlemleri eklendiğinde kullanılacak
import { format, parseISO } from 'date-fns'; // Eğer tarih formatlama kullanıyorsanız

const YatakServisYonetimiPage = () => {
  const [katlar, setKatlar] = useState([]);
  const [selectedKatId, setSelectedKatId] = useState('');
  
  const [odalar, setOdalar] = useState([]);
  const [selectedOda, setSelectedOda] = useState(null);
  
  const [yataklar, setYataklar] = useState([]);

  const [isLoadingKatlar, setIsLoadingKatlar] = useState(false);
  const [isLoadingOdalar, setIsLoadingOdalar] = useState(false);
  const [isLoadingYataklar, setIsLoadingYataklar] = useState(false);
  const [error, setError] = useState(''); // Genel sayfa hataları
  
  // Oda Modalı State'leri
  const [showOdaModal, setShowOdaModal] = useState(false);
  const [editOda, setEditOda] = useState(null);
  const [odaFormData, setOdaFormData] = useState({ odaNumarasi: '', kapasite: 1 });
  const [isOdaFormLoading, setIsOdaFormLoading] = useState(false);
  const [odaFormError, setOdaFormError] = useState('');
  const [odaSuccessMessage, setOdaSuccessMessage] = useState('');

  // Yatak Modalı State'leri
  const [showYatakModal, setShowYatakModal] = useState(false);
  const [editYatak, setEditYatak] = useState(null);
  const [yatakFormData, setYatakFormData] = useState({ yatakNumarasi: '' });
  const [isYatakFormLoading, setIsYatakFormLoading] = useState(false);
  const [yatakFormError, setYatakFormError] = useState('');
  const [yatakSuccessMessage, setYatakSuccessMessage] = useState('');

  // 1. Katları Çek
  useEffect(() => {
    const fetchKatlar = async () => {
      setIsLoadingKatlar(true); setError('');
      try {
        const response = await katService.getAllKatlar();
        setKatlar(response.data);
      } catch (err) { 
        console.error("Katlar getirilirken hata:", err);
        setError(err.response?.data?.message || err.message || 'Katlar yüklenemedi.'); 
      }
      setIsLoadingKatlar(false);
    };
    fetchKatlar();
  }, []);

  // 2. Seçili Kat Değiştiğinde Odaları Çek
  const fetchOdalarByKat = useCallback(async (katId) => {
    if (!katId) { setOdalar([]); setSelectedOda(null); setYataklar([]); return; }
    setIsLoadingOdalar(true); setError(''); setOdaFormError(''); setOdaSuccessMessage('');
    try {
      const response = await odaService.getAllOdalar(katId);
      setOdalar(response.data); setSelectedOda(null); setYataklar([]);
    } catch (err) { 
      console.error(`Kat ${katId} için odalar getirilirken hata:`, err);
      setError(err.response?.data?.message || err.message || 'Odalar yüklenemedi.'); 
      setOdalar([]); 
    }
    setIsLoadingOdalar(false);
  }, []);

  useEffect(() => {
    if (selectedKatId) {
      fetchOdalarByKat(selectedKatId);
    } else {
      setOdalar([]); // Kat seçimi kaldırılırsa odaları temizle
      setSelectedOda(null); // Ve seçili odayı
      setYataklar([]); // Ve yatakları
    }
  }, [selectedKatId, fetchOdalarByKat]);

  // 3. Seçili Oda Değiştiğinde Yatakları Çek
  const fetchYataklarByOda = useCallback(async (odaId) => {
    if (!odaId) { setYataklar([]); return; }
    setIsLoadingYataklar(true); setError(''); setYatakFormError(''); setYatakSuccessMessage('');
    try {
      const response = await yatakService.getYataklarByOdaId(odaId);
      setYataklar(response.data);
    } catch (err) { 
      console.error(`Oda ${odaId} için yataklar getirilirken hata:`, err);
      setError(err.response?.data?.message || err.message || 'Yataklar yüklenemedi.'); 
      setYataklar([]); 
    }
    setIsLoadingYataklar(false);
  }, []);

  useEffect(() => { 
    if (selectedOda) { 
      fetchYataklarByOda(selectedOda.id); 
    } else { 
      setYataklar([]); 
    } 
  }, [selectedOda, fetchYataklarByOda]);

  const handleKatChange = (e) => setSelectedKatId(e.target.value);
  const handleOdaSec = (oda) => setSelectedOda(oda);
  
  // --- ODA MODALI FONKSİYONLARI ---
  const resetOdaForm = () => { setOdaFormData({ odaNumarasi: '', kapasite: 1 }); setEditOda(null); setOdaFormError(''); setOdaSuccessMessage(''); };
  const openOdaEkleModal = () => { if (!selectedKatId) { setError("Lütfen önce bir kat seçin."); return; } resetOdaForm(); setShowOdaModal(true); };
  const openOdaDuzenleModal = (oda) => { resetOdaForm(); setEditOda(oda); setOdaFormData({ odaNumarasi: oda.odaNumarasi, kapasite: oda.kapasite }); setShowOdaModal(true); };
  const handleOdaFormInputChange = (e) => { const { name, value } = e.target; setOdaFormData(prev => ({ ...prev, [name]: value })); };

  const handleOdaFormSubmit = async (e) => {
    e.preventDefault();
    if (!odaFormData.odaNumarasi.trim() || !odaFormData.kapasite) { setOdaFormError('Oda numarası ve kapasite boş olamaz.'); return; }
    const kapasiteNum = parseInt(odaFormData.kapasite, 10);
    if (isNaN(kapasiteNum) || kapasiteNum <= 0) { setOdaFormError('Kapasite pozitif bir sayı olmalıdır.'); return; }
    setIsOdaFormLoading(true); setOdaFormError(''); setOdaSuccessMessage('');
    const payload = { odaNumarasi: odaFormData.odaNumarasi, kapasite: kapasiteNum, katId: parseInt(selectedKatId) };
    try {
      if (editOda) { await odaService.updateOda(editOda.id, payload); setOdaSuccessMessage(`'${payload.odaNumarasi}' odası başarıyla güncellendi.`); }
      else { await odaService.createOda(payload); setOdaSuccessMessage(`'${payload.odaNumarasi}' odası başarıyla eklendi.`); }
      setShowOdaModal(false); fetchOdalarByKat(selectedKatId);
    } catch (err) { console.error("Oda işlemi hatası:", err); setOdaFormError(err.response?.data?.message || err.response?.data?.error || err.message || 'Oda işlemi sırasında bir hata oluştu.'); }
    setIsOdaFormLoading(false);
  };

  const handleOdaSil = async (odaId, odaNumarasi) => {
    if (window.confirm(`'${odaNumarasi}' numaralı odayı silmek istediğinizden emin misiniz?`)) {
      setIsLoadingOdalar(true); setOdaFormError(''); setOdaSuccessMessage('');
      try {
        await odaService.deleteOda(odaId); setOdaSuccessMessage(`'${odaNumarasi}' numaralı oda başarıyla silindi.`); fetchOdalarByKat(selectedKatId);
        if(selectedOda?.id === odaId) setSelectedOda(null);
      } catch (err) { console.error("Oda silme hatası:", err); setOdaFormError(err.response?.data?.message || err.message || 'Oda silinemedi.'); }
      setIsLoadingOdalar(false);
    }
  };

  // --- YATAK MODALI FONKSİYONLARI ---
  const resetYatakForm = () => { setYatakFormData({ yatakNumarasi: '' }); setEditYatak(null); setYatakFormError(''); setYatakSuccessMessage(''); };
  const openYatakEkleModal = () => { if (!selectedOda) { setError("Önce bir oda seçin."); return; } resetYatakForm(); setShowYatakModal(true); };
  const openYatakDuzenleModal = (yatak) => { resetYatakForm(); setEditYatak(yatak); setYatakFormData({ yatakNumarasi: yatak.yatakNumarasi }); setShowYatakModal(true); };
  const handleYatakFormInputChange = (e) => { const { name, value } = e.target; setYatakFormData(prev => ({ ...prev, [name]: value })); };

  const handleYatakFormSubmit = async (e) => {
    e.preventDefault();
    if (!yatakFormData.yatakNumarasi.trim()) {
      setYatakFormError('Yatak numarası boş olamaz.');
      return;
    }
    setIsYatakFormLoading(true);
    setYatakFormError('');
    setYatakSuccessMessage('');

    const payload = {
      yatakNumarasi: yatakFormData.yatakNumarasi,
      odaId: selectedOda.id,
    };

    try {
      if (editYatak) {
        // Düzenleme sırasında doluMu durumu payload'a eklenip eklenmeyeceği backend DTO'suna bağlı.
        // Genellikle yatak düzenleme doluMu'yu değiştirmez.
        // Eğer backend YatakDTO'su update için doluMu bekliyorsa ve mevcut değeri korumak istiyorsanız:
        // payload.doluMu = editYatak.doluMu; 
        await yatakService.updateYatak(editYatak.id, payload);
        setYatakSuccessMessage(`'${payload.yatakNumarasi}' numaralı yatak başarıyla güncellendi.`);
      } else {
        // Yeni yatak eklerken doluMu: false gönderiyoruz.
        // Backend'deki YatakDTO'da doluMu alanı create için @NotNull ise bu gereklidir.
        const createPayload = { ...payload, doluMu: false };
        await yatakService.createYatak(createPayload);
        setYatakSuccessMessage(`'${payload.yatakNumarasi}' numaralı yatak başarıyla eklendi.`);
      }
      setShowYatakModal(false);
      fetchYataklarByOda(selectedOda.id); // Yatak listesini yenile
    } catch (err) {
      console.error("Yatak işlemi hatası:", err);
      setYatakFormError(err.response?.data?.message || err.response?.data?.error || err.message || 'Yatak işlemi sırasında bir hata oluştu.');
    }
    setIsYatakFormLoading(false);
  };

  const handleYatakSil = async (yatakId, yatakNumarasi) => {
    if (window.confirm(`Oda ${selectedOda?.odaNumarasi} içindeki '${yatakNumarasi}' numaralı yatağı silmek istediğinizden emin misiniz?`)) {
      setIsLoadingYataklar(true); setYatakFormError(''); setYatakSuccessMessage('');
      try {
        await yatakService.deleteYatak(yatakId);
        setYatakSuccessMessage(`'${yatakNumarasi}' numaralı yatak başarıyla silindi.`);
        fetchYataklarByOda(selectedOda.id);
      } catch (err) {
        console.error("Yatak silme hatası:", err);
        setYatakFormError(err.response?.data?.message || err.message || 'Yatak silinemedi.');
      }
      setIsLoadingYataklar(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Yatak ve Servis Operasyonları</h1>

      {isLoadingKatlar && <p className="text-gray-600 py-2">Katlar yükleniyor...</p>}
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {odaSuccessMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md my-4">{odaSuccessMessage}</p>}
      {yatakSuccessMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md my-4">{yatakSuccessMessage}</p>}

      {/* Kat Seçimi */}
      {!isLoadingKatlar && katlar.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
          <label htmlFor="katSecimi" className="block text-lg font-semibold text-gray-700 mb-2">Kat Seçiniz</label>
          <select id="katSecimi" value={selectedKatId} onChange={handleKatChange} className="mt-1 block w-full md:w-1/2 lg:w-1/3 select-style">
            <option value="">-- Bir Kat Seçin --</option>
            {katlar.map(kat => (<option key={kat.id} value={kat.id}>{kat.ad}</option>))}
          </select>
        </div>
      )}
      {!isLoadingKatlar && katlar.length === 0 && !error && (<p className="text-gray-500 text-center py-4">Sistemde kayıtlı kat bulunmamaktadır. Lütfen önce Kat Yönetimi sayfasından kat ekleyiniz.</p>)}

      {/* Oda Listesi ve Yönetimi */}
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
          {odaFormError && <p className="text-red-500 bg-red-100 p-2 rounded my-2">{odaFormError}</p>}
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

      {/* Yatak Listesi ve Yönetimi (Seçili Oda İçin) */}
      {selectedOda && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Oda {selectedOda.odaNumarasi} - Yataklar</h2>
            <div>
              <button onClick={openYatakEkleModal} className="mr-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md text-sm" disabled={isLoadingYataklar}>
                Bu Odaya Yatak Ekle
              </button>
              <button disabled className="bg-blue-300 text-white font-semibold py-2 px-3 rounded-lg shadow-md text-sm cursor-not-allowed">
                Yeni Hasta Yatışı {/* Yatış Modalı Sonra Eklenecek */}
              </button>
            </div>
          </div>
          {isLoadingYataklar && <p className="text-gray-600 py-2">Yataklar yükleniyor...</p>}
          {yatakFormError && <p className="text-red-500 bg-red-100 p-2 rounded my-2">{yatakFormError}</p>}
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
                      <td className="td-style">{yatak.doluMu ? (yatak.yatanHastaAdi || 'Bilinmiyor') : '-'}</td> {/* yatanHastaAdi DTO'dan gelmeli */}
                      <td className="td-style space-x-1">
                        {yatak.doluMu ? (
                          <><button className="btn-xs-blue">Yatış Detay</button><button className="btn-xs-purple">Hemşire Ata</button><button className="btn-xs-orange">Taburcu Et</button></>
                        ) : (<button className="btn-xs-green">Yatış Yap</button>)}
                        <button onClick={() => openYatakDuzenleModal(yatak)} className="btn-xs-gray ml-2">Yatak Düz.</button>
                        <button onClick={() => handleYatakSil(yatak.id, yatak.yatakNumarasi)} className="btn-xs-red">Yatak Sil</button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Oda Ekleme/Düzenleme Modalı */}
      {showOdaModal && ( <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"><h2 className="text-2xl font-semibold mb-6 text-gray-800">{editOda ? 'Odayı Düzenle' : 'Yeni Oda Ekle'}</h2>{odaFormError && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{odaFormError}</p>}<form onSubmit={handleOdaFormSubmit} className="space-y-4"><div><label htmlFor="odaNumarasi" className="block text-sm font-medium text-gray-700">Oda Numarası</label><input type="text" name="odaNumarasi" id="odaNumarasi" value={odaFormData.odaNumarasi} onChange={handleOdaFormInputChange} required className="mt-1 block w-full input-style" disabled={isOdaFormLoading} /></div><div><label htmlFor="kapasite" className="block text-sm font-medium text-gray-700">Kapasite</label><input type="number" name="kapasite" id="kapasite" value={odaFormData.kapasite} onChange={handleOdaFormInputChange} required min="1" className="mt-1 block w-full input-style" disabled={isOdaFormLoading} /></div><div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={() => { setShowOdaModal(false); resetOdaForm(); }} className="btn-cancel" disabled={isOdaFormLoading}>İptal</button><button type="submit" className="btn-primary" disabled={isOdaFormLoading}>{isOdaFormLoading ? 'İşleniyor...' : (editOda ? 'Güncelle' : 'Kaydet')}</button></div></form></div></div>)}
      
      {/* Yatak Ekleme/Düzenleme Modalı */}
      {showYatakModal && ( <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"><h2 className="text-2xl font-semibold mb-6 text-gray-800">{editYatak ? 'Yatağı Düzenle' : `Oda ${selectedOda?.odaNumarasi} - Yeni Yatak Ekle`}</h2>{yatakFormError && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{yatakFormError}</p>}<form onSubmit={handleYatakFormSubmit} className="space-y-4"><div><label htmlFor="yatakNumarasi" className="block text-sm font-medium text-gray-700">Yatak Numarası</label><input type="text" name="yatakNumarasi" id="yatakNumarasi" value={yatakFormData.yatakNumarasi} onChange={handleYatakFormInputChange} required className="mt-1 block w-full input-style" disabled={isYatakFormLoading} /></div><div className="mt-6 flex justify-end space-x-3"><button type="button" onClick={() => { setShowYatakModal(false); resetYatakForm(); }} className="btn-cancel" disabled={isYatakFormLoading}>İptal</button><button type="submit" className="btn-primary" disabled={isYatakFormLoading}>{isYatakFormLoading ? 'İşleniyor...' : (editYatak ? 'Güncelle' : 'Kaydet')}</button></div></form></div></div>)}
    
      {/* Yeni Yatış Oluşturma Modalı ve Hemşire Atama Modalı buraya eklenecek */}
    </div>
  );
};

// Stil class'larını (th-style, td-style, btn-xs-..., btn-primary, btn-cancel) 
// index.css veya App.css dosyanıza eklemeyi unutmayın.
// Örnek:
// .th-style { @apply px-3 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
// .td-style { @apply px-3 py-4 border-b border-gray-200 text-sm; }
// .btn-primary { @apply px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500; }
// .btn-cancel { @apply px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300; }
// Diğer btn-xs-... stilleri de benzer şekilde Tailwind @apply direktifleriyle tanımlanabilir.

export default YatakServisYonetimiPage;