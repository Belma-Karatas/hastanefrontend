// src/services/bransService.js
import apiClient from './api'; // Merkezi Axios instance'ımızı kullanıyoruz

const getAllBranslar = () => {
  return apiClient.get('/branslar');
};

const getBransById = (id) => {
  return apiClient.get(`/branslar/${id}`);
};

const createBrans = (bransData) => {
  // bransData = { ad: "Yeni Branş Adı" } gibi olmalı
  return apiClient.post('/branslar', bransData);
};

const updateBrans = (id, bransData) => {
  // bransData = { ad: "Güncellenmiş Ad" } gibi olmalı
  return apiClient.put(`/branslar/${id}`, bransData);
};

const deleteBrans = (id) => {
  return apiClient.delete(`/branslar/${id}`);
};

const bransService = {
  getAllBranslar,
  getBransById,
  createBrans,
  updateBrans,
  deleteBrans,
};

export default bransService;