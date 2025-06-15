// src/services/rolService.js
import apiClient from './api';

const getAllRoller = () => {
  return apiClient.get('/roller'); // Backend'deki GET /api/roller endpoint'i
};

const rolService = {
  getAllRoller,
};

export default rolService;