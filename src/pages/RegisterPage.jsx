// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService'; // authService'i import ediyoruz

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    sifre: '',
    tcKimlikNo: '',
    dogumTarihi: '',
    cinsiyet: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Backend'deki HastaKayitDTO'ya uygun olduğundan emin olalım.
      // Özellikle dogumTarihi formatı önemli olabilir.
      // HTML date input'u YYYY-MM-DD formatında verir, bu genellikle Spring Boot LocalDate için uygundur.
      
      const response = await authService.registerHasta(formData);
      
      // Backend'den gelen cevaba göre mesaj gösterelim.
      // Spring Boot controller'ımız genellikle başarılı kayıtta bir mesaj veya oluşturulan nesneyi döner.
      // Şimdilik basit bir başarı mesajı varsayalım veya response'u loglayalım.
      console.log('Kayıt Cevabı:', response); 

      setSuccessMessage('Kayıt başarıyla tamamlandı! Lütfen giriş yapın.');
      setLoading(false);

      // Kullanıcıyı 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error("Kayıt Hatası - RegisterPage:", err);
      // err objesi backend'den gelen hata mesajını (örn: err.message veya err.error) içerebilir
      // veya bir string mesaj olabilir.
      let errorMessage = 'Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && err.message) {
        errorMessage = err.message;
      } else if (err && err.error) {
        errorMessage = err.error; // Backend'den gelen spesifik hata mesajı alanı
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  // JSX kısmı (return ifadesi) aynı kalacak, bir önceki mesajdaki gibi
  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/hospital-background.png')" }}
    >
      <div className="bg-white bg-opacity-95 p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">
          Karataş Health
        </h2>
        <h3 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Yeni Hasta Kaydı
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ad ve Soyad yan yana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ad" className="block text-sm font-medium text-gray-700 mb-1 text-left">Ad</label>
              <input type="text" name="ad" id="ad" required value={formData.ad} onChange={handleChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="soyad" className="block text-sm font-medium text-gray-700 mb-1 text-left">Soyad</label>
              <input type="text" name="soyad" id="soyad" required value={formData.soyad} onChange={handleChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          {/* E-posta */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-left">E-posta Adresi</label>
            <input type="email" name="email" id="email" autoComplete="email" required value={formData.email} onChange={handleChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="eposta@adresiniz.com" />
          </div>

          {/* Şifre */}
          <div>
            <label htmlFor="sifre" className="block text-sm font-medium text-gray-700 mb-1 text-left">Şifre</label>
            <input type="password" name="sifre" id="sifre" autoComplete="new-password" required value={formData.sifre} onChange={handleChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="En az 6 karakter" />
          </div>
          
          {/* TC Kimlik No */}
          <div>
            <label htmlFor="tcKimlikNo" className="block text-sm font-medium text-gray-700 mb-1 text-left">T.C. Kimlik Numarası</label>
            <input type="text" name="tcKimlikNo" id="tcKimlikNo" value={formData.tcKimlikNo} onChange={handleChange} maxLength="11" disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          {/* Doğum Tarihi ve Cinsiyet yan yana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dogumTarihi" className="block text-sm font-medium text-gray-700 mb-1 text-left">Doğum Tarihi</label>
              <input type="date" name="dogumTarihi" id="dogumTarihi" value={formData.dogumTarihi} onChange={handleChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="cinsiyet" className="block text-sm font-medium text-gray-700 mb-1 text-left">Cinsiyet</label>
              <select name="cinsiyet" id="cinsiyet" value={formData.cinsiyet} onChange={handleChange} disabled={loading} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="">Seçiniz...</option>
                <option value="KADIN">Kadın</option>
                <option value="ERKEK">Erkek</option>
                <option value="BELIRTILMEMIS">Belirtmek İstemiyorum</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                          ${loading 
                            ? 'bg-indigo-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                          }`}
            >
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Zaten bir hesabın var mı?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;