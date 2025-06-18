// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [aktifHastaId, setAktifHastaId] = useState(null); // YENİ STATE
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = authService.getCurrentToken();
    const storedRoles = localStorage.getItem('userRoles'); 
    const storedHastaId = localStorage.getItem('aktifHastaId'); // YENİ

    if (token) {
      setUserToken(token);
      if (storedRoles) {
        try { setUserRoles(JSON.parse(storedRoles)); } 
        catch (e) { localStorage.removeItem('userRoles'); }
      }
      if (storedHastaId) { // YENİ
        setAktifHastaId(parseInt(storedHastaId, 10));
      }
    }
    setIsLoading(false); 
  }, []);

  const loginContext = (token, roles = [], hastaId = null) => { // hastaId parametresi eklendi
    setUserToken(token);
    setUserRoles(roles); 
    localStorage.setItem('userToken', token);
    localStorage.setItem('userRoles', JSON.stringify(roles)); 
    if (hastaId) { // YENİ
      setAktifHastaId(hastaId);
      localStorage.setItem('aktifHastaId', hastaId.toString());
    } else {
      setAktifHastaId(null);
      localStorage.removeItem('aktifHastaId');
    }
  };

  const logoutContext = () => {
    authService.logout(); 
    localStorage.removeItem('userRoles'); 
    localStorage.removeItem('aktifHastaId'); // YENİ
    setUserToken(null);
    setUserRoles([]); 
    setAktifHastaId(null); // YENİ
  };

  const value = {
    userToken,
    userRoles, 
    aktifHastaId, // YENİ
    isAuthenticated: !!userToken,
    isLoading,
    loginContext,
    logoutContext,
    // JWT'den kullanıcı ID'sini (Kullanici entity ID) almak için bir helper eklenebilir.
    // Bu, "talepEdenKullaniciId" olarak backend'e gönderilebilir, ancak hasta randevusu için
    // özellikle HASTA_ID'si gerekiyorsa, loginContext'te ayrıca alınmalı.
    kullaniciIdFromToken: () => {
        if (userToken) {
            try {
                const payload = JSON.parse(atob(userToken.split('.')[1]));
                // Backend JWT 'sub' alanında email gönderiyordu, eğer ID gönderiyorsa direkt onu alın.
                // Şimdilik ID'yi JWT'den almıyoruz, bu sadece örnek.
                // return payload.userId; // JWT'de userId varsa
                return null; // Veya backend'den gelen email'i döndürün: payload.sub
            } catch (e) {
                return null;
            }
        }
        return null;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center text-xl font-semibold">Oturum kontrol ediliyor...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth hook, bir AuthProvider içinde kullanılmalıdır.');
  }
  return context;
};