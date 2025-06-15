// src/services/yatisService.js
import apiClient from './api';

const hastaYatisiYap = (yatisData) => {
  // yatisData = { hastaId, yatakId, sorumluDoktorId, yatisNedeni }
  return apiClient.post('/yatislar/yatir', yatisData); // Backend endpoint'i /api/yatislar/yatir
};

const hastaTaburcuEt = (yatisId) => {
  return apiClient.put(`/yatislar/${yatisId}/taburcu`);
};

const getYatisById = (yatisId) => {
  return apiClient.get(`/yatislar/${yatisId}`);
};

const getAktifYatisByHastaId = (hastaId) => {
  return apiClient.get(`/yatislar/hasta/${hastaId}/aktif`);
};

const getAktifYatisByYatakId = (yatakId) => {
    return apiClient.get(`/yatislar/yatak/${yatakId}/aktif`);
};

const getTumAktifYatislar = () => {
  return apiClient.get('/yatislar/aktif');
};

// Yatışa hemşire atama/çıkarma (AdminLayout'taki YatisController'a göre)
const hemsireAta = (yatisId, hemsireData) => {
    // hemsireData = { hemsirePersonelId: ... }
    return apiClient.post(`/yatislar/${yatisId}/hemsireler`, hemsireData);
};

const hemsireAtamasiniKaldir = (yatisId, yatisHemsireAtamaId) => {
    return apiClient.delete(`/yatislar/${yatisId}/hemsireler/${yatisHemsireAtamaId}`);
};


const yatisService = {
  hastaYatisiYap,
  hastaTaburcuEt,
  getYatisById,
  getAktifYatisByHastaId,
  getAktifYatisByYatakId,
  getTumAktifYatislar,
  hemsireAta,
  hemsireAtamasiniKaldir,
};

export default yatisService; // BU SATIR ÇOK ÖNEMLİ