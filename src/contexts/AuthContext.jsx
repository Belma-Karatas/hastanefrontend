// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userRoles, setUserRoles] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = authService.getCurrentToken();
    const storedRoles = localStorage.getItem('userRoles'); 

    if (token) {
      setUserToken(token);
      if (storedRoles) {
        try {
          setUserRoles(JSON.parse(storedRoles));
        } catch (e) {
          console.error("localStorage'dan roller parse edilirken hata:", e);
          localStorage.removeItem('userRoles'); 
        }
      } else {
        
        console.warn("Token var ama localStorage'da userRoles bulunamadı.");
      }
    }
    setIsLoading(false); 
  }, []);

  const loginContext = (token, roles = []) => { 
    setUserToken(token);
    setUserRoles(roles); 
    localStorage.setItem('userToken', token);
    localStorage.setItem('userRoles', JSON.stringify(roles)); 
  };

  const logoutContext = () => {
    authService.logout(); 
    localStorage.removeItem('userRoles'); 
    setUserToken(null);
    setUserRoles([]); 
  };

  const value = {
    userToken,
    userRoles, 
    isAuthenticated: !!userToken,
    isLoading,
    loginContext,
    logoutContext,
  };

  // Yükleme bitene kadar hiçbir şey render etme (veya bir yükleme göstergesi)
  if (isLoading) {
    // Daha iyi bir yükleme göstergesi eklenebilir.
    return <div className="min-h-screen flex justify-center items-center text-xl font-semibold">Oturum kontrol ediliyor...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Bu hata genellikle AuthProvider'ın uygulama ağacının tepesinde olmamasından kaynaklanır.
    throw new Error('useAuth hook, bir AuthProvider içinde kullanılmalıdır.');
  }
  return context;
};