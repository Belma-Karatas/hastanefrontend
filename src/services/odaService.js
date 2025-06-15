// src/services/odaService.js
import apiClient from './api';

const getAllOdalar = (katId = null) => {
  const params = katId ? { katId: katId } : {};
  return apiClient.get('/odalar', { params });
};

const getOdaById = (id) => {
  return apiClient.get(`/odalar/${id}`);
};

const createOda = (odaData) => {
  // odaData = { odaNumarasi: "101", katId: 1, kapasite: 2 }
  return apiClient.post('/odalar', odaData);
};

const updateOda = (id, odaData) => {
  return apiClient.put(`/odalar/${id}`, odaData);
};

const deleteOda = (id) => {
  return apiClient.delete(`/odalar/${id}`);
};

const odaService = {
  getAllOdalar,
  getOdaById,
  createOda,
  updateOda,
  deleteOda,
};

export default odaService;