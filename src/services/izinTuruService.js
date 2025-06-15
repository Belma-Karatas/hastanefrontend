// src/services/izinTuruService.js
import apiClient from './api';

const getAllIzinTurleri = () => {
  return apiClient.get('/izinturleri');
};

const getIzinTuruById = (id) => {
  return apiClient.get(`/izinturleri/${id}`);
};

const createIzinTuru = (izinTuruData) => {
  // izinTuruData = { ad: "Yeni İzin Türü Adı" }
  return apiClient.post('/izinturleri', izinTuruData);
};

const updateIzinTuru = (id, izinTuruData) => {
  // izinTuruData = { ad: "Güncellenmiş Ad" }
  return apiClient.put(`/izinturleri/${id}`, izinTuruData);
};

const deleteIzinTuru = (id) => {
  return apiClient.delete(`/izinturleri/${id}`);
};

const izinTuruService = {
  getAllIzinTurleri,
  getIzinTuruById,
  createIzinTuru,
  updateIzinTuru,
  deleteIzinTuru,
};

export default izinTuruService;