// src/services/ilacService.js
import apiClient from './api'; // Merkezi Axios instance'ımızı kullanıyoruz

const getAllIlaclar = () => {
  return apiClient.get('/ilaclar'); // Backend endpoint'i /api/ilaclar
};

const getIlacById = (id) => {
  // Bu fonksiyon şu an IlacYonetimiPage'de direkt kullanılmıyor olabilir,
  // ama ileride veya düzenleme formunu doldururken gerekebilir.
  return apiClient.get(`/ilaclar/${id}`);
};

const createIlac = (ilacData) => {
  // ilacData DTO'su backend'deki IlacDTO ile uyumlu olmalı.
  // Örnek: { ad: "Parol", barkod: "12345", form: "Tablet", etkenMadde: "Parasetamol" }
  return apiClient.post('/ilaclar', ilacData);
};

const updateIlac = (id, ilacData) => {
  return apiClient.put(`/ilaclar/${id}`, ilacData);
};

const deleteIlac = (id) => {
  return apiClient.delete(`/ilaclar/${id}`);
};

const searchIlacByAd = (searchTerm) => {
  // Bu fonksiyon, doktorların reçete yazarken ilaç araması yapması için kullanılabilir.
  // Backend'de GET /api/ilaclar endpoint'inin bir 'search' query parametresini
  // desteklediğini varsayıyoruz (IlacController'da böyle bir mantık vardı).
  return apiClient.get('/ilaclar', { params: { search: searchTerm } });
};

const ilacService = {
  getAllIlaclar,
  getIlacById,
  createIlac,
  updateIlac,
  deleteIlac,
  searchIlacByAd, // Arama fonksiyonunu da ekledik
};

export default ilacService; // EN ÖNEMLİ KISIM: Varsayılan olarak export et