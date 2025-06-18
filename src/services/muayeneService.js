// src/services/muayeneService.js
import apiClient from './api';

const getMuayeneByRandevuId = (randevuId) => {
  // Backend'de bu endpoint'in /api/muayeneler/randevu/{randevuId} gibi olması beklenir
  // ve bu randevuya ait (varsa) tek bir muayene kaydını dönmesi gerekir.
  // Eğer birden fazla dönebiliyorsa veya filtreleme gerekiyorsa endpoint/parametreler değişebilir.
  return apiClient.get(`/muayeneler/randevu/${randevuId}`); 
};

const muayeneOlustur = (muayeneData) => {
  // muayeneData: { randevuId, hastaId, tani, tedaviNotlari, muayeneTarihiSaati }
  // doktorId backend'de JWT'den veya aktifPersonelId'den alınacak.
  return apiClient.post('/muayeneler', muayeneData);
};

const muayeneGuncelle = (muayeneId, muayeneData) => {
  // muayeneData: { tani, tedaviNotlari, ... }
  return apiClient.put(`/muayeneler/${muayeneId}`, muayeneData);
};


const muayeneService = {
  getMuayeneByRandevuId,
  muayeneOlustur,
  muayeneGuncelle,
  // Diğer muayene ile ilgili servis fonksiyonları buraya eklenebilir
};

export default muayeneService;