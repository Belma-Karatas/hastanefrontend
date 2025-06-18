// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));
  const [userRoles, setUserRoles] = useState(() => {
    const storedRoles = localStorage.getItem('userRoles');
    try {
      return storedRoles ? JSON.parse(storedRoles) : [];
    } catch (e) {
      console.error("Roller localStorage'dan parse edilirken hata:", e);
      localStorage.removeItem('userRoles');
      return [];
    }
  });
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [aktifKullaniciId, setAktifKullaniciId] = useState(() => {
    const storedId = localStorage.getItem('aktifKullaniciId');
    return storedId ? parseInt(storedId, 10) : null;
  });
  const [aktifPersonelId, setAktifPersonelId] = useState(() => {
    const storedId = localStorage.getItem('aktifPersonelId');
    return storedId ? parseInt(storedId, 10) : null;
  });
  const [aktifHastaId, setAktifHastaId] = useState(() => {
    const storedId = localStorage.getItem('aktifHastaId');
    return storedId ? parseInt(storedId, 10) : null;
  });
  
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // Sadece isLoading'i yönetmek için. State'ler zaten useState içinde localStorage'dan okunuyor.
    setIsLoading(false); 
  }, []);

  // loginContext parametre sırası backend LoginResponseDTO'daki alan sırasına göre düzenlendi
  const loginContext = (token, roles = [], email = null, kullaniciId = null, personelId = null, hastaId = null) => {
    console.log("AuthContext - loginContext ÇAĞRILDI. Gelen Değerler:");
    console.log("  token:", token ? 'VAR' : 'YOK');
    console.log("  roles:", roles);
    console.log("  email:", email);
    console.log("  kullaniciId:", kullaniciId);
    console.log("  personelId:", personelId); 
    console.log("  hastaId:", hastaId);

    localStorage.setItem('userToken', token);
    localStorage.setItem('userRoles', JSON.stringify(roles));
    
    setUserToken(token);
    setUserRoles(roles);

    if (email) {
      localStorage.setItem('userEmail', email);
      setUserEmail(email);
    } else {
      localStorage.removeItem('userEmail');
      setUserEmail(null);
    }

    if (kullaniciId) {
      localStorage.setItem('aktifKullaniciId', kullaniciId.toString());
      setAktifKullaniciId(kullaniciId);
    } else {
      localStorage.removeItem('aktifKullaniciId');
      setAktifKullaniciId(null);
    }
    
    if (personelId) {
      localStorage.setItem('aktifPersonelId', personelId.toString());
      setAktifPersonelId(personelId);
      console.log("AuthContext - aktifPersonelId state'i set edildi:", personelId);
    } else {
      localStorage.removeItem('aktifPersonelId');
      setAktifPersonelId(null);
    }

    if (hastaId) {
      localStorage.setItem('aktifHastaId', hastaId.toString());
      setAktifHastaId(hastaId);
    } else {
      localStorage.removeItem('aktifHastaId');
      setAktifHastaId(null);
    }
  };

  const logoutContext = () => {
    authService.logout(); 
    localStorage.removeItem('userRoles'); 
    localStorage.removeItem('aktifHastaId');
    localStorage.removeItem('aktifPersonelId');
    localStorage.removeItem('aktifKullaniciId');
    localStorage.removeItem('userEmail');
    
    setUserToken(null);
    setUserRoles([]); 
    setAktifHastaId(null);
    setAktifPersonelId(null);
    setAktifKullaniciId(null);
    setUserEmail(null);
  };

  const value = {
    userToken,
    userRoles, 
    userEmail,
    aktifKullaniciId,
    aktifPersonelId,
    aktifHastaId,
    isAuthenticated: !!userToken,
    isLoading,
    loginContext,
    logoutContext,
    getEmailFromToken: () => {
        if (userToken) {
            try {
                const payload = JSON.parse(atob(userToken.split('.')[1]));
                return payload.sub;
            } catch (e) {
                console.error("Token parse edilirken hata:", e);
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