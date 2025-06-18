// src/pages/doktor/DoktorIzinTalepPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import izinTalepService from '../../services/izinTalepService';
import izinTuruService from '../../services/izinTuruService';
import { format, parseISO, differenceInCalendarDays, isValid } from 'date-fns'; // isValid eklendi

const DoktorIzinTalepPage = () => {
  const { aktifPersonelId, userToken } = useAuth(); 
  const [izinTurleri, setIzinTurleri] = useState([]);
  const [mevcutTalepler, setMevcutTalepler] = useState([]);
  
  const [formData, setFormData] = useState({
    izinTuruId: '',
    baslangicTarihi: '',
    bitisTarihi: '',
    aciklama: '',
    gunSayisi: 0,
  });

  const [isLoadingForm, setIsLoadingForm] = useState(false); // Form için ayrı yükleme durumu
  const [isListLoading, setIsListLoading] = useState(false);
  const [error, setError] = useState(''); // Genel hatalar için
  const [formError, setFormError] = useState(''); // Forma özel hatalar için
  const [successMessage, setSuccessMessage] = useState('');

  const fetchIzinTurleri = useCallback(async () => {
    try {
      const response = await izinTuruService.getAllIzinTurleri();
      setIzinTurleri(response.data || []);
    } catch (err) {
      console.error("İzin türleri getirilirken hata:", err);
      setError("İzin türleri yüklenemedi. Lütfen sayfayı yenileyin.");
    }
  }, []);

  const fetchMevcutTalepler = useCallback(async () => {
    if (!userToken || !aktifPersonelId) {
        // Kullanıcı giriş yapmamışsa veya personel ID yoksa erken çık.
        // Bu durum normalde ProtectedRoute tarafından ele alınır ama ekstra kontrol.
        setError("İzin taleplerinizi görmek için giriş yapmış olmanız ve personel bilgilerinizin olması gerekmektedir.");
        setIsListLoading(false);
        return;
    }
    setIsListLoading(true);
    setError(''); // Liste çekilirken genel hatayı temizle
    try {
      const response = await izinTalepService.getMyIzinTalepleri();
      setMevcutTalepler(response.data || []);
    } catch (err) {
      console.error("Mevcut izin talepleri getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'İzin talepleriniz yüklenemedi.');
      setMevcutTalepler([]);
    }
    setIsListLoading(false);
  }, [userToken, aktifPersonelId]);

  useEffect(() => {
    fetchIzinTurleri();
    fetchMevcutTalepler();
  }, [fetchIzinTurleri, fetchMevcutTalepler]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === "baslangicTarihi" || name === "bitisTarihi") {
      const { baslangicTarihi, bitisTarihi } = updatedFormData;
      if (baslangicTarihi && bitisTarihi) {
        const startDate = parseISO(baslangicTarihi);
        const endDate = parseISO(bitisTarihi);
        if (isValid(startDate) && isValid(endDate) && startDate <= endDate) {
          const gunFarki = differenceInCalendarDays(endDate, startDate) + 1;
          updatedFormData.gunSayisi = gunFarki;
        } else {
          updatedFormData.gunSayisi = 0;
        }
      } else {
        updatedFormData.gunSayisi = 0;
      }
    }
    setFormData(updatedFormData);
    setFormError(''); // Input değiştiğinde form hatasını temizle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!formData.izinTuruId || !formData.baslangicTarihi || !formData.bitisTarihi || !formData.aciklama.trim()) {
      setFormError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    if (formData.gunSayisi <= 0) {
      setFormError('Bitiş tarihi başlangıç tarihinden önce olamaz veya aynı gün seçilemez (en az 1 gün izin).');
      return;
    }

    setIsLoadingForm(true);
    const payload = {
      izinTuruId: parseInt(formData.izinTuruId),
      baslangicTarihi: formData.baslangicTarihi,
      bitisTarihi: formData.bitisTarihi,
      aciklama: formData.aciklama,
      gunSayisi: formData.gunSayisi,
    };

    try {
      await izinTalepService.createIzinTalep(payload);
      setSuccessMessage('İzin talebiniz başarıyla gönderildi. Yöneticiniz tarafından değerlendirilecektir.');
      setFormData({ izinTuruId: '', baslangicTarihi: '', bitisTarihi: '', aciklama: '', gunSayisi: 0 });
      fetchMevcutTalepler(); 
    } catch (err) {
      console.error("İzin talebi oluşturma hatası:", err);
      setFormError(err.response?.data?.message || err.message || 'İzin talebi oluşturulurken bir hata oluştu. Lütfen tarih çakışması olup olmadığını kontrol edin veya daha sonra tekrar deneyin.');
    }
    setIsLoadingForm(false);
  };
  
  const durumRenkleri = {
    BEKLIYOR: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    ONAYLANDI: 'bg-green-100 text-green-800 border-green-400',
    REDDEDILDI: 'bg-red-100 text-red-800 border-red-400',
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">İzin Taleplerim</h1>

      {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
      
      <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Yeni İzin Talebi Oluştur</h2>
        {formError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{formError}</p>}
        {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="izinTuruId" className="block text-sm font-medium text-gray-700">İzin Türü <span className="text-red-500">*</span></label>
            <select 
              name="izinTuruId" 
              id="izinTuruId" 
              value={formData.izinTuruId} 
              onChange={handleInputChange} 
              required 
              className="mt-1 block w-full select-style"
              disabled={isLoadingForm || izinTurleri.length === 0}
            >
              <option value="">İzin Türü Seçiniz...</option>
              {izinTurleri.map(tur => <option key={tur.id} value={tur.id}>{tur.ad}</option>)}
            </select>
            {izinTurleri.length === 0 && !isLoadingForm && <p className="text-xs text-gray-500 mt-1">İzin türleri yüklenemedi veya bulunmuyor.</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="baslangicTarihi" className="block text-sm font-medium text-gray-700">Başlangıç Tarihi <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="baslangicTarihi" 
                id="baslangicTarihi" 
                value={formData.baslangicTarihi} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full input-style"
                min={format(new Date(), 'yyyy-MM-dd')}
                disabled={isLoadingForm}
              />
            </div>
            <div>
              <label htmlFor="bitisTarihi" className="block text-sm font-medium text-gray-700">Bitiş Tarihi <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="bitisTarihi" 
                id="bitisTarihi" 
                value={formData.bitisTarihi} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full input-style"
                min={formData.baslangicTarihi || format(new Date(), 'yyyy-MM-dd')}
                disabled={isLoadingForm || !formData.baslangicTarihi}
              />
            </div>
            <div>
              <label htmlFor="gunSayisi" className="block text-sm font-medium text-gray-700">Gün Sayısı</label>
              <input 
                type="number" 
                name="gunSayisi" 
                id="gunSayisi" 
                value={formData.gunSayisi} 
                readOnly 
                className="mt-1 block w-full input-style bg-gray-100 cursor-not-allowed" 
              />
            </div>
          </div>

          <div>
            <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700">Açıklama <span className="text-red-500">*</span></label>
            <textarea 
              name="aciklama" 
              id="aciklama" 
              rows="3" 
              value={formData.aciklama} 
              onChange={handleInputChange} 
              required 
              className="mt-1 block w-full input-style" 
              placeholder="İzin nedeninizi kısaca belirtiniz..."
              disabled={isLoadingForm}
            ></textarea>
          </div>

          <div className="text-right">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoadingForm || !formData.izinTuruId || !formData.baslangicTarihi || !formData.bitisTarihi || formData.gunSayisi <= 0 || !formData.aciklama.trim()}
            >
              {isLoadingForm ? 'Gönderiliyor...' : 'İzin Talebi Gönder'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Geçmiş İzin Talepleriniz</h2>
        {isListLoading && <p className="text-center text-gray-600">Talepleriniz yükleniyor...</p>}
        {!isListLoading && mevcutTalepler.length === 0 && !error && (
          <p className="text-gray-500 text-center">Henüz bir izin talebiniz bulunmamaktadır.</p>
        )}
        {!isListLoading && mevcutTalepler.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="th-style">Talep Tarihi</th>
                  <th className="th-style">İzin Türü</th>
                  <th className="th-style">Başlangıç</th>
                  <th className="th-style">Bitiş</th>
                  <th className="th-style text-center">Gün</th>
                  <th className="th-style">Durum</th>
                  <th className="th-style">Açıklama</th>
                  <th className="th-style">Onaylayan</th>
                </tr>
              </thead>
              <tbody>
                {mevcutTalepler.map((talep) => (
                  <tr key={talep.id} className="hover:bg-gray-50">
                    <td className="td-style">
                      {talep.talepTarihi && isValid(parseISO(talep.talepTarihi)) 
                        ? format(parseISO(talep.talepTarihi), 'dd.MM.yyyy HH:mm') 
                        : 'N/A'}
                    </td>
                    <td className="td-style">{talep.izinTuruAdi}</td>
                    <td className="td-style">
                      {talep.baslangicTarihi && isValid(parseISO(talep.baslangicTarihi)) 
                        ? format(parseISO(talep.baslangicTarihi), 'dd.MM.yyyy') 
                        : 'N/A'}
                    </td>
                    <td className="td-style">
                      {talep.bitisTarihi && isValid(parseISO(talep.bitisTarihi)) 
                        ? format(parseISO(talep.bitisTarihi), 'dd.MM.yyyy') 
                        : 'N/A'}
                    </td>
                    <td className="td-style text-center">{talep.gunSayisi}</td>
                    <td className="td-style text-center">
                      <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs border ${durumRenkleri[talep.durum] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                        {talep.durum}
                      </span>
                    </td>
                    <td className="td-style whitespace-normal break-words max-w-xs">{talep.aciklama}</td>
                    <td className="td-style">{talep.onaylayanYoneticiAdiSoyadi || (talep.durum !== 'BEKLIYOR' ? 'Sistem' : '-')}</td>
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

export default DoktorIzinTalepPage;