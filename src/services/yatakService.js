// src/services/yatakService.js
import apiClient from './api';

const getYataklarByOdaId = (odaId) => {
  return apiClient.get('/yataklar', { params: { odaId: odaId } }); // Backend'in bu query param'ı desteklediğini varsayıyoruz
};

const getAllYataklar = () => { // Tüm yatakları getirmek için
    return apiClient.get('/yataklar');
};

const getYatakById = (id) => {
  return apiClient.get(`/yataklar/${id}`);
};

const createYatak = (yatakData) => {
  // yatakData = { yatakNumarasi: "A1", odaId: 1, doluMu: false }
  return apiClient.post('/yataklar', yatakData);
};

const updateYatak = (id, yatakData) => {
  return apiClient.put(`/yataklar/${id}`, yatakData);
};

const updateYatakDolulukDurumu = (id, doluMuData) => {
    // doluMuData = { doluMu: true } veya sadece boolean değer de olabilir, backend'e bağlı
    return apiClient.put(`/yataklar/${id}/doluluk`, doluMuData ); // Backend endpoint'i bu şekildeyse
};

const deleteYatak = (id) => {
  return apiClient.delete(`/yataklar/${id}`);
};

const yatakService = {
  getYataklarByOdaId,
  getAllYataklar,
  getYatakById,
  createYatak,
  updateYatak,
  updateYatakDolulukDurumu,
  deleteYatak,
};

export default yatakService; // BU SATIR ÇOK ÖNEMLİ