// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService'; // Bir önceki adımda oluşturduğumuz servis

// 1. Context'i oluştur
const AuthContext = createContext(null);

// 2. Provider Bileşenini Oluştur
export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Başlangıçta token kontrolü için yükleme durumu

  // Uygulama ilk yüklendiğinde localStorage'dan token'ı kontrol et
  useEffect(() => {
    const token = authService.getCurrentToken();
    if (token) {
      setUserToken(token);
      // İleride: Token'ın geçerliliğini backend'de doğrulamak daha iyi olur.
    }
    setIsLoading(false); // Token kontrolü bitti
  }, []);

  // Login işlemi için fonksiyon
  const loginContext = (token) => {
    setUserToken(token);
    // localStorage.setItem('userToken', token); // Bu satır authService.login içinde zaten yapılıyor
  };

  // Logout işlemi için fonksiyon
  const logoutContext = () => {
    authService.logout(); // localStorage'dan token'ı siler
    setUserToken(null);
  };

  // Context aracılığıyla paylaşılacak değerler
  const value = {
    userToken,
    isAuthenticated: !!userToken, // userToken varsa true, yoksa false
    isLoading, // Yükleme durumunu da paylaşabiliriz
    loginContext,
    logoutContext,
  };

  // Yükleme bitene kadar hiçbir şey render etme (veya bir yükleme göstergesi)
  // Bu, sayfa ilk açıldığında token kontrol edilirken anlık bir "login değilmiş gibi" görünmeyi engeller.
  if (isLoading) {
    return <div>Yükleniyor...</div>; // Basit bir yükleme göstergesi
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Context'i kullanmak için özel bir hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth hook, bir AuthProvider içinde kullanılmalıdır.');
  }
  return context;
};