// src/services/randevuService.js
import apiClient from './api';

const createRandevu = (randevuData) => {
  // Backend'deki RandevuOlusturDTO'nun hastaId bekleyip beklemediğine dikkat edin.
  // Eğer bekliyorsa, randevuData içinde hastaId olmalı.
  // Eğer JWT'den alıyorsa, frontend'den göndermeye gerek yok.
  return apiClient.post('/randevular', randevuData);
};

const getRandevuById = (randevuId) => {
  return apiClient.get(`/randevular/${randevuId}`);
};

// HASTANIN KENDİ RANDEVULARINI GETİREN YENİ FONKSİYON
const getRandevularim = () => {
  // Backend'de bu endpoint'in JWT'den hasta bilgisini alıp,
  // o hastaya ait randevuları döndürmesi beklenir.
  // Örnek: GET /api/randevular/hasta/mevcut
  // Eğer backend farklı bir yapı bekliyorsa (örn: /api/randevular/hasta/{hastaId}),
  // o zaman AuthContext'ten hasta ID'sini alıp buraya parametre olarak geçmelisiniz.
  return apiClient.get('/randevular/hasta/mevcut'); // Bu endpoint'i backend'de oluşturmanız gerekebilir
};


const getRandevularByHastaId = (hastaId) => { // Bu admin veya doktor için kullanılabilir
  return apiClient.get(`/randevular/hasta/${hastaId}`);
};

const getRandevularByDoktorIdAndGun = (doktorId, gun) => { // gun YYYY-MM-DD formatında
  return apiClient.get(`/randevular/doktor/${doktorId}`, { params: { gun } });
};

const randevuDurumGuncelle = (randevuId, yeniDurumData) => { // yeniDurumData = { yeniDurum: "..." }
  return apiClient.put(`/randevular/${randevuId}/durum`, yeniDurumData); // Veya query param ile: `/randevular/${randevuId}/durum?yeniDurum=${yeniDurum}`
};

const randevuIptalEt = (randevuId) => {
  return apiClient.put(`/randevular/${randevuId}/iptal`);
};

const randevuService = {
  createRandevu,
  getRandevuById,
  getRandevularim, // YENİ EKLENDİ
  getRandevularByHastaId,
  getRandevularByDoktorIdAndGun,
  randevuDurumGuncelle,
  randevuIptalEt,
};

export default randevuService;