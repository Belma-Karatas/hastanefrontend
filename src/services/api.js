import axios from 'axios';
import authService from './authService';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getCurrentToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Yetkisiz istek veya token süresi doldu, logout yapılıyor.");
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient; // BU SATIR ÇOK ÖNEMLİ