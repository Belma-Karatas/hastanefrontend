// src/services/acilDurumKaydiService.js
import apiClient from './api';

const getAllAcilDurumKayitlari = (params = {}) => {
  // params: { durum: 'AKTIF', hastaId: 123, tarih: '2024-06-19' } gibi olabilir
  return apiClient.get('/acildurumkayitlari', { params });
};

const getAcilDurumKaydiById = (id) => {
  return apiClient.get(`/acildurumkayitlari/${id}`);
};

const createAcilDurumKaydi = (kayitData) => {
  // Bu fonksiyon genellikle hemşire arayüzünden kullanılır.
  // kayitData = { aciklama, konum, olayZamani, hastaId? }
  return apiClient.post('/acildurumkayitlari', kayitData);
};

const updateAcilDurumKaydiDurumu = (id, durumGuncelleData) => {
  // durumGuncelleData = { yeniDurum: 'SONLANDIRILDI' }
  return apiClient.put(`/acildurumkayitlari/${id}/durum`, durumGuncelleData);
};

const acilDurumKaydiService = {
  getAllAcilDurumKayitlari,
  getAcilDurumKaydiById,
  createAcilDurumKaydi,
  updateAcilDurumKaydiDurumu,
};

export default acilDurumKaydiService;