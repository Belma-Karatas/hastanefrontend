// src/pages/hasta/RandevuAlPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import bransService from '../../services/bransService';
import personelService from '../../services/personelService';
import randevuService from '../../services/randevuService';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO } from 'date-fns'; // Eğer parseISO kullanmıyorsanız kaldırabilirsiniz.

const RandevuAlPage = () => {
  console.log(">>>> RandevuAlPage Bileşeni Render Ediliyor (Başlangıç) <<<<");

  const [branslar, setBranslar] = useState([]);
  const [selectedBransId, setSelectedBransId] = useState('');
  
  const [doktorlar, setDoktorlar] = useState([]);
  const [selectedDoktorId, setSelectedDoktorId] = useState('');
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');

  const [isLoadingBranslar, setIsLoadingBranslar] = useState(false);
  const [isLoadingDoktorlar, setIsLoadingDoktorlar] = useState(false);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState(''); // HATA STATE'İ BURADA TANIMLI
  const [successMessage, setSuccessMessage] = useState('');

  const { aktifHastaId } = useAuth(); // AuthContext'ten aktifHastaId'yi alıyoruz

  // 1. Branşları Çek
  useEffect(() => {
    const fetchBranslar = async () => {
      setIsLoadingBranslar(true); setError('');
      try {
        const response = await bransService.getAllBranslar();
        setBranslar(response.data || []);
      } catch (err) {
        console.error("Branşlar getirilirken hata:", err);
        setError(err.response?.data?.message || err.message || 'Branşlar yüklenemedi.');
      }
      setIsLoadingBranslar(false);
    };
    fetchBranslar();
  }, []);

  // 2. Seçilen Branşa Göre Doktorları Çek
  const fetchDoktorlarByBrans = useCallback(async (bransId) => {
    if (!bransId) { setDoktorlar([]); setSelectedDoktorId(''); setAvailableTimes([]); setSelectedTime(''); return; }
    setIsLoadingDoktorlar(true); setError('');
    try {
      // Backend'den `/api/personeller/doktorlar?bransId={bransId}` endpoint'ini kullanıyoruz
      const response = await personelService.getDoktorlarByBrans(bransId);
      setDoktorlar(response.data || []);
      setSelectedDoktorId(''); 
      setAvailableTimes([]); setSelectedTime(''); 
    } catch (err) {
      console.error(`Branş ${bransId} için doktorlar getirilirken hata:`, err);
      setError(err.response?.data?.message || err.message || 'Doktorlar yüklenemedi.');
      setDoktorlar([]);
    }
    setIsLoadingDoktorlar(false);
  }, []);

  useEffect(() => {
    if (selectedBransId) {
        fetchDoktorlarByBrans(selectedBransId);
    } else {
        setDoktorlar([]);
        setSelectedDoktorId('');
        setAvailableTimes([]);
        setSelectedTime('');
    }
  }, [selectedBransId, fetchDoktorlarByBrans]);

  // 3. Seçilen Doktor ve Tarihe Göre Uygun Saatleri Çek
  const fetchAvailableTimes = useCallback(async (doktorId, tarih) => {
    if (!doktorId || !tarih) { setAvailableTimes([]); setSelectedTime(''); return; }
    setIsLoadingTimes(true); setError('');
    try {
      console.log(`Uygun saatler getiriliyor: Doktor ID ${doktorId}, Tarih ${tarih}`);
      // Backend'de /api/randevular/doktor/{doktorId}/uygun-saatler?tarih=YYYY-MM-DD endpoint'i olmalı.
      // Bu endpoint'i randevuService.js'e eklemeniz gerekecek.
      // const response = await randevuService.getUygunSaatler(doktorId, tarih);
      // setAvailableTimes(response.data || []);
      
      // ŞİMDİLİK ÖRNEK SAATLER:
      await new Promise(resolve => setTimeout(resolve, 300)); 
      setAvailableTimes(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"]);
      setSelectedTime('');
    } catch (err) {
      console.error("Uygun saatler getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Uygun saatler yüklenemedi.');
      setAvailableTimes([]);
    }
    setIsLoadingTimes(false);
  }, []);

  useEffect(() => {
    if (selectedDoktorId && selectedDate) {
        fetchAvailableTimes(selectedDoktorId, selectedDate);
    } else {
        setAvailableTimes([]);
        setSelectedTime('');
    }
  }, [selectedDoktorId, selectedDate, fetchAvailableTimes]);


  const handleRandevuSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBransId || !selectedDoktorId || !selectedDate || !selectedTime) {
      setError('Lütfen tüm alanları (branş, doktor, tarih ve saat) seçin.');
      return;
    }
    if (!aktifHastaId) {
      setError("Randevu almak için hasta bilgileri bulunamadı. Lütfen tekrar giriş yapın veya destek ile iletişime geçin.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true); setError(''); setSuccessMessage('');
    
    const randevuTarihiSaati = `${selectedDate}T${selectedTime}:00`;

    const payload = {
      hastaId: aktifHastaId, // AuthContext'ten gelen giriş yapmış hastanın ID'si
      doktorId: parseInt(selectedDoktorId),
      randevuTarihiSaati: randevuTarihiSaati,
    };
    console.log("Randevu Oluşturma Payload:", payload);

    try {
      await randevuService.createRandevu(payload);
      setSuccessMessage(`Randevunuz ${selectedDate} ${selectedTime} için Dr. ${doktorlar.find(d=>d.id === parseInt(selectedDoktorId))?.ad || ''} ${doktorlar.find(d=>d.id === parseInt(selectedDoktorId))?.soyad || ''} adına başarıyla oluşturuldu.`);
      // Formu sıfırla
      setSelectedBransId(''); 
      // Diğer seçimler zincirleme olarak sıfırlanacak (useEffect bağımlılıkları sayesinde)
    } catch (err) {
      console.error("Randevu oluşturma hatası:", err);
      const apiError = err.response?.data;
      if (typeof apiError === 'string' && apiError.includes("ConstraintViolationException")) {
          setError("Bu saatte doktorun veya sizin başka bir randevunuz bulunmaktadır. Lütfen farklı bir saat deneyin.");
      } else {
          setError(apiError?.message || apiError || err.message || 'Randevu oluşturulurken bir hata oluştu.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Yeni Randevu Al</h1>
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{successMessage}</p>}

        <form onSubmit={handleRandevuSubmit} className="space-y-6">
          <div>
            <label htmlFor="brans" className="block text-sm font-medium text-gray-700">Branş Seçiniz</label>
            <select id="brans" value={selectedBransId} onChange={(e) => setSelectedBransId(e.target.value)} required className="mt-1 block w-full select-style" disabled={isLoadingBranslar}>
              <option value="">-- Branş Seçin --</option>
              {branslar.map(b => <option key={b.id} value={b.id}>{b.ad}</option>)}
            </select>
            {isLoadingBranslar && <p className="text-xs text-gray-500 mt-1">Branşlar yükleniyor...</p>}
          </div>

          {selectedBransId && (
            <div>
              <label htmlFor="doktor" className="block text-sm font-medium text-gray-700">Doktor Seçiniz</label>
              <select id="doktor" value={selectedDoktorId} onChange={(e) => setSelectedDoktorId(e.target.value)} required className="mt-1 block w-full select-style" disabled={isLoadingDoktorlar || doktorlar.length === 0}>
                <option value="">-- Doktor Seçin --</option>
                {doktorlar.map(d => <option key={d.id} value={d.id}>{d.ad} {d.soyad}</option>)}
              </select>
              {isLoadingDoktorlar && <p className="text-xs text-gray-500 mt-1">Doktorlar yükleniyor...</p>}
              {!isLoadingDoktorlar && doktorlar.length === 0 && selectedBransId && <p className="text-xs text-red-500 mt-1">Bu branşta uygun doktor bulunamadı.</p>}
            </div>
          )}

          {selectedDoktorId && (
            <div>
              <label htmlFor="tarih" className="block text-sm font-medium text-gray-700">Tarih Seçiniz</label>
              <input type="date" id="tarih" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required className="mt-1 block w-full input-style" min={format(new Date(), 'yyyy-MM-dd')} />
            </div>
          )}

          {selectedDoktorId && selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Uygun Saatler</label>
              {isLoadingTimes && <p className="text-xs text-gray-500 mt-1">Uygun saatler yükleniyor...</p>}
              {!isLoadingTimes && availableTimes.length === 0 && <p className="text-xs text-red-500 mt-1">Seçili tarih için uygun randevu saati bulunamadı.</p>}
              {!isLoadingTimes && availableTimes.length > 0 && (
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"> {/* md:grid-cols-6 eklendi */}
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-md text-sm font-medium border transition-colors duration-150
                                  ${selectedTime === time 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                    : 'bg-white text-gray-700 hover:bg-indigo-50 border-gray-300 hover:border-indigo-400'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {selectedTime && (
            <div className="pt-4">
              <button type="submit" className="w-full btn-primary" disabled={isSubmitting || isLoadingBranslar || isLoadingDoktorlar || isLoadingTimes}>
                {isSubmitting ? 'Randevu Oluşturuluyor...' : 'Randevuyu Onayla'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RandevuAlPage;