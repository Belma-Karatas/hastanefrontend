// src/services/receteService.js
import apiClient from './api';

const createRecete = (receteData) => {
  // receteData = { muayeneId, receteTarihi, ilaclar: [{ ilacId, kullanimSekli }] }
  // Backend'deki ReceteController'da @PostMapping("/receteler") endpoint'ine denk gelir.
  return apiClient.post('/receteler', receteData);
};

const getRecetelerByMuayeneId = (muayeneId) => {
  // Backend'deki ReceteController'da @GetMapping("/receteler/muayene/{muayeneId}") endpoint'ine denk gelir.
  return apiClient.get(`/receteler/muayene/${muayeneId}`);
};

// İleride gerekebilecek diğer fonksiyonlar:
/*
const getReceteById = (receteId) => {
  return apiClient.get(`/receteler/${receteId}`);
};

const addIlacToRecete = (receteId, ilacData) => {
  // ilacData = { ilacId, kullanimSekli }
  return apiClient.post(`/receteler/${receteId}/ilaclar`, ilacData);
};

const removeIlacFromRecete = (receteId, receteIlacId) => {
  return apiClient.delete(`/receteler/${receteId}/ilaclar/${receteIlacId}`);
};
*/

const receteService = {
  createRecete,
  getRecetelerByMuayeneId,
  // getReceteById, // İleride gerekirse açılır
  // addIlacToRecete, // İleride gerekirse açılır
  // removeIlacFromRecete, // İleride gerekirse açılır
};

export default receteService;