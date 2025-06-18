import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { loginContext } = useAuth(); // AuthContext'ten loginContext fonksiyonunu alıyoruz

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login({ email: email, sifre: password });
      // data objesinin backend'deki LoginResponseDTO ile aynı yapıda olması beklenir:
      // { accessToken, tokenType, roller, hastaId?, email?, kullaniciId? }

      if (data && data.accessToken) {
        let roles = [];
        // Backend'den gelen rollerin formatını kontrol et (List<String> olmalı)
        if (data.roller && Array.isArray(data.roller)) {
            roles = data.roller;
        } else if (data.authorities && Array.isArray(data.authorities)) { // Spring Security varsayılanı
            roles = data.authorities.map(auth => 
                typeof auth === 'string' ? auth : (auth && auth.authority ? auth.authority : null)
            ).filter(Boolean);
        }
        
        const hastaId = data.hastaId || null;
        const kullaniciEmail = data.email || email; // Email'i yanıttan al veya formdan kullan
        const kullaniciId = data.kullaniciId || null;

        console.log("LoginPage - Gelen Data:", data);
        console.log("LoginPage - Alınan Roller:", roles);
        console.log("LoginPage - Alınan Hasta ID:", hastaId);
        console.log("LoginPage - Alınan Email:", kullaniciEmail);
        console.log("LoginPage - Alınan Kullanıcı ID:", kullaniciId);
        
        // AuthContext'teki loginContext fonksiyonunu çağırarak kullanıcı bilgilerini set et
        loginContext(data.accessToken, roles, hastaId, kullaniciEmail, kullaniciId);

        // Yönlendirme App.jsx içindeki AppRoutes tarafından yapılacak.
        // useNavigate() ile bir sonraki render döngüsünde yönlendirme gerçekleşir.
        // Eğer hemen yönlendirme isteniyorsa navigate() çağrısı burada kalabilir.
        // navigate('/dashboard'); // Bu satır yerine AppRoutes'un yönlendirmesine güvenmek daha iyi olabilir
                                // Çünkü AppRoutes zaten isAuthenticated durumuna göre doğru yere yönlendirir.
      } else {
        setError(data?.message || 'Giriş başarısız oldu veya beklenmedik bir yanıt alındı.');
      }
    } catch (err) {
      console.error("Login Hatası - LoginPage:", err);
      const errorMessage = 
        (err.response && err.response.data && (typeof err.response.data === 'string' ? err.response.data : err.response.data.message || err.response.data.error)) || 
        err.message || 
        'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/hospital-background.png')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">
          Karataş Health
        </h2>
        <h3 className="text-2xl font-semibold text-center text-gray-700 mb-8">
          Giriş Yap
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
            >
              E-posta Adresi
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="eposta@adresiniz.com"
              disabled={loading}
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
            >
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Şifreniz"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Beni Hatırla
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Şifreni mi unuttun?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                          ${loading 
                            ? 'bg-indigo-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                          }`}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="font-medium text-teal-600 hover:text-teal-700">
            Hemen Kayıt Olun
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;