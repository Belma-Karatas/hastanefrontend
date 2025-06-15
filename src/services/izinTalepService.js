// src/services/izinTalepService.js
import apiClient from './api';

const getAllIzinTalepleri = (params) => {
  // params: { durum: 'BEKLIYOR' } gibi filtreleme için
  return apiClient.get('/izintalepleri', { params });
};

const getIzinTalepById = (id) => {
  return apiClient.get(`/izintalepleri/${id}`);
};

const updateIzinTalepDurumu = (id, durumData) => {
  // durumData = { yeniDurum: "ONAYLANDI" } veya { yeniDurum: "REDDEDILDI" }
  return apiClient.put(`/izintalepleri/${id}/durum`, durumData);
};

// Personelin kendi izin taleplerini alması için (ileride personel arayüzünde kullanılabilir)
const getMyIzinTalepleri = () => {
    return apiClient.get('/izintalepleri/personel/mevcut');
};

const izinTalepService = {
  getAllIzinTalepleri,
  getIzinTalepById,
  updateIzinTalepDurumu,
  getMyIzinTalepleri, // Admin panelinde doğrudan kullanılmayacak ama servis dosyasında bulunabilir
};

export default izinTalepService;