// src/services/hastaService.js
import apiClient from './api';

const getAllHastalar = () => {
  return apiClient.get('/hastalar'); // Backend'deki GET /api/hastalar endpoint'i
};

const getHastaById = (id) => {
  return apiClient.get(`/hastalar/${id}`);
};

// İleride hasta ile ilgili başka servis çağrıları da buraya eklenebilir
// Örneğin, TC ile hasta arama, hasta güncelleme vb.
// const getHastaByTcKimlikNo = (tcKimlikNo) => {
//   return apiClient.get(`/hastalar/tc/${tcKimlikNo}`);
// };

const hastaService = {
  getAllHastalar,
  getHastaById,
  // getHastaByTcKimlikNo,
};

export default hastaService;