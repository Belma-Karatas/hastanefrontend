// src/services/vardiyaService.js
import apiClient from './api';

const getAllVardiyalar = () => {
  return apiClient.get('/vardiyalar');
};

const getVardiyaById = (id) => { // Şu an için kullanılmayacak ama ekleyebiliriz
  return apiClient.get(`/vardiyalar/${id}`);
};

const createVardiya = (vardiyaData) => {
  // vardiyaData = { ad: "...", baslangicSaati: "HH:mm", bitisSaati: "HH:mm" }
  return apiClient.post('/vardiyalar', vardiyaData);
};

const updateVardiya = (id, vardiyaData) => {
  return apiClient.put(`/vardiyalar/${id}`, vardiyaData);
};

const deleteVardiya = (id) => {
  return apiClient.delete(`/vardiyalar/${id}`);
};

const vardiyaService = {
  getAllVardiyalar,
  getVardiyaById,
  createVardiya,
  updateVardiya,
  deleteVardiya,
};

export default vardiyaService;