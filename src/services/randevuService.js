// src/services/randevuService.js
import apiClient from './api';

const createRandevu = (randevuData) => {
  return apiClient.post('/randevular', randevuData);
};

const getRandevuById = (randevuId) => {
  return apiClient.get(`/randevular/${randevuId}`);
};

// HASTANIN KENDİ RANDEVULARINI GETİREN FONKSİYON
const getRandevularim = () => {
  // Backend'de bu endpoint'in JWT'den hasta bilgisini alıp,
  // o hastaya ait randevuları döndürmesi beklenir: GET /api/randevular/hasta/mevcut
  return apiClient.get('/randevular/hasta/mevcut');
};

// DOKTORUN TÜM RANDEVULARINI GETİREN YENİ FONKSİYON
const getTumRandevularimDoktor = () => {
  // Backend'de bu endpoint'in JWT'den doktor bilgisini alıp,
  // o doktora ait tüm randevuları döndürmesi beklenir: GET /api/randevular/doktor/tum
  return apiClient.get('/randevular/doktor/tum'); // Bu endpoint backend'de oluşturulacak/ayarlanacak
};

const getRandevularByHastaId = (hastaId) => { // Bu admin veya doktor için kullanılabilir
  return apiClient.get(`/randevular/hasta/${hastaId}`);
};

const getRandevularByDoktorIdAndGun = (doktorId, gun) => { // gun YYYY-MM-DD formatında
  return apiClient.get(`/randevular/doktor/${doktorId}`, { params: { gun } });
};

const randevuDurumGuncelle = (randevuId, yeniDurumData) => { // yeniDurumData = { yeniDurum: "..." }
  // Backend'deki endpoint'e göre düzenle, eğer query param bekliyorsa:
  // return apiClient.put(`/randevular/${randevuId}/durum?yeniDurum=${yeniDurumData.yeniDurum}`);
  // Eğer body'de bekliyorsa (genellikle PUT için daha iyi):
  return apiClient.put(`/randevular/${randevuId}/durum`, yeniDurumData); 
};

const randevuIptalEt = (randevuId) => {
  return apiClient.put(`/randevular/${randevuId}/iptal`);
};

const randevuService = {
  createRandevu,
  getRandevuById,
  getRandevularim,
  getTumRandevularimDoktor, // Yeni fonksiyon eklendi
  getRandevularByHastaId,
  getRandevularByDoktorIdAndGun,
  randevuDurumGuncelle,
  randevuIptalEt,
};

export default randevuService;