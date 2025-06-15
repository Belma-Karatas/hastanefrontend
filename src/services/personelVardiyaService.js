// src/services/personelVardiyaService.js
import apiClient from './api';

const vardiyaAta = (personelVardiyaData) => {
  // personelVardiyaData = { personelId: ..., vardiyaId: ..., tarih: "YYYY-MM-DD" }
  return apiClient.post('/personelvardiyalari', personelVardiyaData);
};

const getVardiyalarByPersonelId = (personelId) => {
  return apiClient.get(`/personelvardiyalari/personel/${personelId}`);
};

const getVardiyalarByTarih = (tarih) => { // tarih "YYYY-MM-DD" formatında string
  return apiClient.get(`/personelvardiyalari/tarih/${tarih}`);
};

const vardiyaAtamasiniKaldir = (personelVardiyaId) => {
  return apiClient.delete(`/personelvardiyalari/${personelVardiyaId}`);
};

// Personelin kendi yaklaşan vardiyalarını getirmek için (Admin panelinde direkt kullanılmayabilir)
const getMyYaklasanVardiyalar = () => {
    return apiClient.get('/personelvardiyalari/personel/mevcut/yaklasan');
};


const personelVardiyaService = {
  vardiyaAta,
  getVardiyalarByPersonelId,
  getVardiyalarByTarih,
  vardiyaAtamasiniKaldir,
  getMyYaklasanVardiyalar,
};

export default personelVardiyaService;