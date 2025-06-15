// src/services/duyuruService.js
import apiClient from './api'; // Merkezi Axios instance'ımızı kullanıyoruz

const getAllDuyurular = () => {
  return apiClient.get('/duyurular'); // Backend endpoint'i /api/duyurular
};

const getDuyuruById = (id) => {
  return apiClient.get(`/duyurular/${id}`);
};

const createDuyuru = (duyuruData) => {
  // duyuruData = { baslik: "...", icerik: "..." }
  // yayinlayanPersonelId backend'de JWT'den alınacak
  return apiClient.post('/duyurular', duyuruData);
};

const updateDuyuru = (id, duyuruData) => {
  // duyuruData = { baslik: "...", icerik: "..." }
  return apiClient.put(`/duyurular/${id}`, duyuruData);
};

const deleteDuyuru = (id) => {
  return apiClient.delete(`/duyurular/${id}`);
};

const duyuruService = {
  getAllDuyurular,
  getDuyuruById,
  createDuyuru,
  updateDuyuru,
  deleteDuyuru,
};

export default duyuruService;