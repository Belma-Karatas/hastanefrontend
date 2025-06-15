import apiClient from './api'; // Doğrudan axios yerine bunu import et

// API_URL'i apiClient'ın baseURL'inden aldığı için burada tekrar tanımlamaya gerek yok,
// sadece endpoint path'lerini kullanacağız.
// const API_URL = '/departmanlar/'; // baseURL'e göre göreceli path

const getAllDepartmanlar = () => {
  return apiClient.get('/departmanlar'); // Artık headers manuel eklenmiyor
};

const getDepartmanById = (id) => {
  return apiClient.get(`/departmanlar/${id}`);
};

const createDepartman = (departmanData) => {
  return apiClient.post('/departmanlar', departmanData);
};

const updateDepartman = (id, departmanData) => {
  return apiClient.put(`/departmanlar/${id}`, departmanData);
};

const deleteDepartman = (id) => {
  return apiClient.delete(`/departmanlar/${id}`);
};

const departmanService = {
  getAllDepartmanlar,
  getDepartmanById,
  createDepartman,
  updateDepartman,
  deleteDepartman,
};

export default departmanService;