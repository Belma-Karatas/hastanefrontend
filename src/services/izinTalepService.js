// src/services/izinTalepService.js
import apiClient from './api';

const getAllIzinTalepleriForAdmin = (params) => { // Admin için olan fonksiyon
  return apiClient.get('/izintalepleri', { params });
};

const getIzinTalepById = (id) => {
  return apiClient.get(`/izintalepleri/${id}`);
};

// YENİ İZİN TALEBİ OLUŞTURMA FONKSİYONU (DOKTOR VE DİĞER PERSONELLER KULLANABİLİR)
const createIzinTalep = (izinTalepData) => { 
  return apiClient.post('/izintalepleri', izinTalepData);
};

const updateIzinTalepDurumuForAdmin = (id, durumData) => { // Admin için olan fonksiyon
  return apiClient.put(`/izintalepleri/${id}/durum`, durumData);
};

// DOKTORUN/PERSONELİN KENDİ İZİN TALEPLERİNİ ALMASI İÇİN
const getMyIzinTalepleri = () => {
  return apiClient.get('/izintalepleri/personel/mevcut');
};

const izinTalepService = {
  getAllIzinTalepleriForAdmin, // Adminin tüm talepleri görmesi için
  getIzinTalepById,
  createIzinTalep,               // <<<--- BU SATIRIN DOĞRU OLDUĞUNDAN EMİN OLUN
  updateIzinTalepDurumuForAdmin, // Adminin durum güncellemesi için
  getMyIzinTalepleri,            // Personelin kendi taleplerini görmesi için
};

export default izinTalepService;