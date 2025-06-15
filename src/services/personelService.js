// src/services/personelService.js
import apiClient from './api';

const getAllPersoneller = () => {
  return apiClient.get('/personeller');
};

const getPersonelById = (id) => {
  return apiClient.get(`/personeller/${id}`);
};

// PersonelDTO backend'deki ile aynı yapıda olmalı
// PersonelDTO: { ad, soyad, telefon, departmanId, email, sifre, roller: ["ROLE_DOKTOR"], bransId? }
const createPersonel = (personelData) => {
  return apiClient.post('/personeller', personelData);
};

const updatePersonel = (id, personelData) => {
  return apiClient.put(`/personeller/${id}`, personelData);
};

const deletePersonel = (id) => {
  return apiClient.delete(`/personeller/${id}`);
};

const personelService = {
  getAllPersoneller,
  getPersonelById,
  createPersonel,
  updatePersonel,
  deletePersonel,
};

export default personelService;