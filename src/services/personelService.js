// src/services/personelService.js
import apiClient from './api';

const getAllPersoneller = () => {
  return apiClient.get('/personeller');
};

const getPersonelById = (id) => {
  return apiClient.get(`/personeller/${id}`);
};

const createPersonel = (personelData) => {
  return apiClient.post('/personeller', personelData);
};

const updatePersonel = (id, personelData) => {
  return apiClient.put(`/personeller/${id}`, personelData);
};

const deletePersonel = (id) => {
  return apiClient.delete(`/personeller/${id}`);
};

// YENİ EKLENEN FONKSİYON
const getDoktorlarByBrans = (bransId) => {
  // Backend'deki /api/personeller/doktorlar endpoint'ine bransId parametresi ile istek atar
  return apiClient.get('/personeller/doktorlar', { params: { bransId: bransId } });
};

// Eğer sadece ROLE_DOKTOR olan tüm doktorları getirmek için ayrı bir fonksiyon isterseniz:
const getAllDoktorlar = () => {
    return apiClient.get('/personeller/doktorlar'); // bransId olmadan
}

const personelService = {
  getAllPersoneller,
  getPersonelById,
  createPersonel,
  updatePersonel,
  deletePersonel,
  getDoktorlarByBrans, // Export edildiğinden emin olun
  getAllDoktorlar,    // Bunu da ekleyebilirsiniz
};

export default personelService;