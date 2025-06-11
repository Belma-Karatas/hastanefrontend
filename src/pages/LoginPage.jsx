import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link'i de import ettik
import authService from '../services/authService';   // API servisimizi import ediyoruz
import { useAuth } from '../contexts/AuthContext';     // Auth context'imizi import ediyoruz

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Sayfa yönlendirmesi için hook
  const { loginContext } = useAuth(); // AuthContext'ten login fonksiyonunu alıyoruz

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // authService.login fonksiyonuna { email, sifre } objesi gönderiyoruz
      // Backend'deki LoginRequestDTO'nuzda alan adı "sifre" ise bu şekilde kalmalı.
      const data = await authService.login({ email: email, sifre: password });

      if (data && data.accessToken) {
        // Başarılı login durumunda:
        loginContext(data.accessToken); // AuthContext'i güncelle (token'ı sakla, isAuthenticated'ı true yap)
        navigate('/dashboard');        // Kullanıcıyı dashboard'a yönlendir
      } else {
        // Backend'den token gelmediyse veya beklenmedik bir cevap varsa:
        setError(data.message || 'Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err) {
      // API çağrısı sırasında bir hata oluşursa (örn: ağ hatası, 401, 500)
      console.error("Login Hatası - LoginPage:", err); // Hatanın detayını konsola yazdır
      setError(err.message || err.error || 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      // İstek tamamlansın veya hata alınsın, yükleme durumunu false yap
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
              disabled={loading} // Yükleme sırasında inputları disable et
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
              disabled={loading} // Yükleme sırasında inputları disable et
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
              {/* Şimdilik bu linki basit bir # yapalım veya ileride bir sayfa oluştururuz */}
              <Link to="#" className="font-medium text-indigo-600 hover:text-indigo-500">
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
          {/* Şimdilik bu linki basit bir # yapalım veya ileride bir sayfa oluştururuz */}
          <Link to="/register" className="font-medium text-teal-600 hover:text-teal-700">
            Hemen Kayıt Olun
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;