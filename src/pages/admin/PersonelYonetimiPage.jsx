// src/pages/admin/PersonelYonetimiPage.jsx
import React, { useState, useEffect } from 'react';
import personelService from '../../services/personelService';
import departmanService from '../../services/departmanService';
import bransService from '../../services/bransService';
import rolService from '../../services/rolService';

const PersonelYonetimiPage = () => {
  const [personeller, setPersoneller] = useState([]);
  const [departmanlar, setDepartmanlar] = useState([]);
  const [branslar, setBranslar] = useState([]);
  const [roller, setRoller] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editPersonelId, setEditPersonelId] = useState(null);
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    sifre: '',
    telefon: '',
    departmanId: '',
    roller: [], // Bu bir Set veya Array olabilir, backend DTO'suna göre handle edilecek
    bransId: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [personelRes, deptRes, bransRes, rolRes] = await Promise.all([
        personelService.getAllPersoneller(),
        departmanService.getAllDepartmanlar(),
        bransService.getAllBranslar(),
        rolService.getAllRoller(),
      ]);
      setPersoneller(personelRes.data || []); // response.data null ise boş array ata
      setDepartmanlar(deptRes.data || []);
      setBranslar(bransRes.data || []);
      setRoller(rolRes.data || []);
    } catch (err) {
      console.error("Veriler getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Gerekli veriler yüklenemedi.');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRolChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentRoles = prev.roller || [];
      if (checked) {
        // Backend'e "ROLE_" ön ekiyle göndermemiz gerekiyor olabilir,
        // ya da backend bu ön eki kendi ekliyor/kaldırıyor olabilir.
        // Şimdilik frontend'de "ROLE_DOKTOR" gibi tam adını saklayalım.
        return { ...prev, roller: [...currentRoles, value] };
      } else {
        return { ...prev, roller: currentRoles.filter(rol => rol !== value) };
      }
    });
  };
  
  // formData.roller bir Set veya Array olabilir. includes Set üzerinde çalışmaz.
  const isDoktorSecili = Array.isArray(formData.roller) 
    ? formData.roller.includes('ROLE_DOKTOR') || formData.roller.includes('DOKTOR') 
    : formData.roller instanceof Set 
      ? formData.roller.has('ROLE_DOKTOR') || formData.roller.has('DOKTOR')
      : false;


  const resetForm = () => {
    setFormData({
      ad: '', soyad: '', email: '', sifre: '', telefon: '',
      departmanId: '', roller: [], bransId: '',
    });
    setEditPersonelId(null);
    setError('');
    setSuccessMessage('');
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (personelDto) => { // Parametre artık backend'den gelen DTO
    resetForm();
    setEditPersonelId(personelDto.id);
    setFormData({
      ad: personelDto.ad || '',
      soyad: personelDto.soyad || '',
      email: personelDto.email || '', // DTO'dan direkt email
      sifre: '', 
      telefon: personelDto.telefon || '',
      departmanId: personelDto.departmanId || '', 
      // Backend'den gelen roller (örn: ["ADMIN", "DOKTOR"])
      // Modal'daki checkbox'lar "ROLE_ADMIN" gibi değerler bekliyorsa ona göre ayarla
      roller: personelDto.roller ? Array.from(personelDto.roller).map(r => `ROLE_${r}`) : [], 
      bransId: personelDto.bransId || '', 
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const payload = { ...formData };
    if (!payload.sifre && !editPersonelId) {
      setError('Yeni personel için şifre gereklidir.');
      setIsLoading(false);
      return;
    }
    if (!payload.sifre && editPersonelId) {
        delete payload.sifre;
    }

    // Roller backend'e "ROLE_DOKTOR" gibi gitmeli. formData.roller şu an ["DOKTOR"] gibi olabilir.
    // Backend PersonelDTO'sundaki Set<String> roller alanı "ROLE_" ön ekiyle mi bekliyor?
    // Eğer PersonelController'daki convertToPersonelDTO "ROLE_" ön ekini kaldırıyorsa,
    // burada create/update için gönderirken bu ön eki eklememiz gerekebilir.
    // Şimdilik backend'in "ROLE_ADMIN", "ROLE_DOKTOR" gibi tam isimleri beklediğini varsayıyoruz.
    // (handleRolChange buna göre ayarlanmıştı.)

    if (payload.roller.includes('ROLE_DOKTOR') && (!payload.bransId || payload.bransId === "" || payload.bransId === 0)) {
        setError('Doktor rolü için branş seçimi zorunludur.');
        setIsLoading(false);
        return;
    }
    if (!payload.roller.includes('ROLE_DOKTOR')) {
        payload.bransId = null; 
    }
    if (payload.departmanId === '' || payload.departmanId === 0) {
        payload.departmanId = null;
    }

    try {
      if (editPersonelId) {
        await personelService.updatePersonel(editPersonelId, payload);
        setSuccessMessage('Personel başarıyla güncellendi.');
      } else {
        await personelService.createPersonel(payload);
        setSuccessMessage('Personel başarıyla eklendi.');
      }
      setShowModal(false);
      fetchAllData();
    } catch (err) {
      console.error("Personel işlemi hatası:", err);
      setError(err.response?.data?.message || err.response?.data || err.message || 'Personel işlemi sırasında bir hata oluştu.');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id, personelAdi) => {
    if (window.confirm(`${personelAdi} adlı personeli silmek istediğinizden emin misiniz?`)) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        await personelService.deletePersonel(id);
        setSuccessMessage(`${personelAdi} adlı personel başarıyla silindi.`);
        fetchAllData();
      } catch (err) {
        console.error("Personel silme hatası:", err);
        setError(err.response?.data?.message || err.message || 'Personel silinemedi.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Personel Yönetimi</h1>
        <button
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
        >
          Yeni Personel Ekle
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-600 py-4">Yükleniyor...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md my-4">{error}</p>}
      {successMessage && <p className="text-center text-green-600 bg-green-100 p-3 rounded-md my-4">{successMessage}</p>}
      
      {!isLoading && personeller.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow mt-6">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ad Soyad</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Departman</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roller</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Branş</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {personeller.map((p) => ( // p burada PersonelDTO tipinde
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{p.id}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{p.ad} {p.soyad}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{p.email || '-'}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{p.departmanAdi || '-'}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">
                    {p.roller && p.roller.size > 0 // DTO'daki roller Set olduğu için .size
                      ? Array.from(p.roller).join(', ') 
                      : '-'}
                  </td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm">{p.bransAdi || '-'}</td>
                  <td className="px-5 py-4 border-b border-gray-200 text-sm space-x-2">
                    <button 
                        onClick={() => openEditModal(p)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                    >
                        Düzenle
                    </button>
                    <button 
                        onClick={() => handleDelete(p.id, `${p.ad} ${p.soyad}`)} 
                        className="text-red-600 hover:text-red-900 font-semibold"
                    >
                        Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {editPersonelId ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
            </h2>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ad" className="block text-sm font-medium text-gray-700">Ad</label>
                  <input type="text" name="ad" id="ad" value={formData.ad} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
                </div>
                <div>
                  <label htmlFor="soyad" className="block text-sm font-medium text-gray-700">Soyad</label>
                  <input type="text" name="soyad" id="soyad" value={formData.soyad} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full input-style" />
              </div>
              <div>
                <label htmlFor="sifre" className="block text-sm font-medium text-gray-700">Şifre {editPersonelId && "(Değiştirmek istemiyorsanız boş bırakın)"}</label>
                <input type="password" name="sifre" id="sifre" value={formData.sifre} onChange={handleInputChange} placeholder={editPersonelId ? "Yeni şifre" : "Şifre"} className="mt-1 block w-full input-style" />
              </div>
              <div>
                <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">Telefon</label>
                <input type="tel" name="telefon" id="telefon" value={formData.telefon} onChange={handleInputChange} className="mt-1 block w-full input-style" />
              </div>
              <div>
                <label htmlFor="departmanId" className="block text-sm font-medium text-gray-700">Departman</label>
                <select name="departmanId" id="departmanId" value={formData.departmanId} onChange={handleInputChange} className="mt-1 block w-full select-style">
                  <option value="">Departman Seçiniz...</option>
                  {departmanlar.map(d => <option key={d.id} value={d.id}>{d.ad}</option>)}
                </select>
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-700">Roller</span>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {roller.map(rol => ( // rol objesi {id, ad} şeklinde geliyor
                    <label key={rol.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="roller"
                        value={rol.ad} // Backend'e "ROLE_ADMIN" gibi tam adını gönderiyoruz
                        checked={formData.roller.includes(rol.ad)}
                        onChange={handleRolChange}
                        className="form-checkbox h-4 w-4 text-indigo-600"
                      />
                      {/* Kullanıcıya gösterirken "ROLE_" ön ekini kaldırabiliriz */}
                      <span>{rol.ad ? rol.ad.replace('ROLE_', '') : 'Bilinmeyen Rol'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {isDoktorSecili && (
                <div>
                  <label htmlFor="bransId" className="block text-sm font-medium text-gray-700">Branş (Doktor için)</label>
                  <select name="bransId" id="bransId" value={formData.bransId} onChange={handleInputChange} className="mt-1 block w-full select-style" required={isDoktorSecili}>
                    <option value="">Branş Seçiniz...</option>
                    {branslar.map(b => <option key={b.id} value={b.id}>{b.ad}</option>)}
                  </select>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border">İptal</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md" disabled={isLoading}>
                  {isLoading ? 'İşleniyor...' : (editPersonelId ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonelYonetimiPage;