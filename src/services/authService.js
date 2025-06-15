// src/services/authService.js
import axios from 'axios'; // Bu import, registerHasta veya login gibi diğer fonksiyonlar için gerekebilir.
                           // Sadece token işlemleri içinse gerekmeyebilir.

const API_URL = 'http://localhost:8080/api/'; // Bu da diğer fonksiyonlar için.

const login = async (userData) => {
  try {
    const response = await axios.post(API_URL + 'auth/login', userData);
    if (response.data && response.data.accessToken) {
      // localStorage.setItem('userToken', response.data.accessToken); // Bu loginContext'e taşındı
      // localStorage.setItem('userRoles', JSON.stringify(response.data.roles || [])); // Bu loginContext'e taşındı
    }
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error(error.message || 'Sunucuya bağlanırken bir hata oluştu.');
    }
  }
};

const registerHasta = async (hastaData) => {
  try {
    const response = await axios.post(API_URL + 'hastalar/register', hastaData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error(error.message || 'Kayıt sırasında sunucuya bağlanırken bir hata oluştu.');
    }
  }
};

const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userRoles'); // Rolleri de temizle
};

const getCurrentToken = () => {
  return localStorage.getItem('userToken');
};

// Dışa aktarılacak servis objesi
const authService = {
  login,
  registerHasta,
  logout,             // logout fonksiyonu burada olmalı
  getCurrentToken,    // getCurrentToken fonksiyonu burada olmalı
};

export default authService;