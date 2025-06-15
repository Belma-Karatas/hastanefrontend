// src/services/katService.js
import apiClient from './api'; // Merkezi Axios instance'ımızı kullanıyoruz

const getAllKatlar = () => {
  return apiClient.get('/katlar');
};

const getKatById = (id) => { // Düzenleme için gerekebilir
  return apiClient.get(`/katlar/${id}`);
};

const createKat = (katData) => {
  // katData = { ad: "Yeni Kat Adı" }
  return apiClient.post('/katlar', katData);
};

const updateKat = (id, katData) => {
  // katData = { ad: "Güncellenmiş Ad" }
  return apiClient.put(`/katlar/${id}`, katData);
};

const deleteKat = (id) => {
  return apiClient.delete(`/katlar/${id}`);
};

const katService = {
  getAllKatlar,
  getKatById,
  createKat,
  updateKat,
  deleteKat,
};

export default katService;