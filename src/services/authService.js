// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/'; // Temel API URL'sini /api/ olarak değiştirdik

// Login fonksiyonu
const login = async (userData) => {
  try {
    // login endpoint'i /api/auth/ altında
    const response = await axios.post(API_URL + 'auth/login', userData);
    if (response.data && response.data.accessToken) {
      localStorage.setItem('userToken', response.data.accessToken);
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

// YENİ: Hasta Kayıt fonksiyonu
// Aldığı 'hastaData' parametresi backend'deki HastaKayitDTO'ya uygun olmalı
const registerHasta = async (hastaData) => {
  try {
    // Hasta kayıt endpoint'i /api/hastalar/ altında
    const response = await axios.post(API_URL + 'hastalar/register', hastaData);
    // Başarılı kayıt sonrası backend'den gelen cevabı döndür
    // Bu cevap genellikle oluşturulan hasta nesnesini veya bir başarı mesajını içerir.
    return response.data;
  } catch (error) {
    // Hata durumunda
    if (error.response && error.response.data) {
      // Backend'den gelen spesifik hata mesajını fırlat
      // (örn: "Bu e-posta zaten kullanılıyor", "TC Kimlik No zaten kayıtlı")
      throw error.response.data; 
    } else {
      // Genel ağ veya sunucu hatası
      throw new Error(error.message || 'Kayıt sırasında sunucuya bağlanırken bir hata oluştu.');
    }
  }
};

// Logout fonksiyonu
const logout = () => {
  localStorage.removeItem('userToken');
};

// Mevcut token'ı almak için bir yardımcı fonksiyon
const getCurrentToken = () => {
  return localStorage.getItem('userToken');
};

// Servis objesi (dışa aktarılacak fonksiyonları içerir)
const authService = {
  login,
  registerHasta, // Yeni fonksiyonu buraya ekledik
  logout,
  getCurrentToken,
};

export default authService;