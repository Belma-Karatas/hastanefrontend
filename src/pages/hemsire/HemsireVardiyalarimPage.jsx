// src/pages/hemsire/HemsireVardiyalarimPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import personelVardiyaService from '../../services/personelVardiyaService';
import { format, parseISO, isValid } from 'date-fns';
import tr from 'date-fns/locale/tr'; 

const HemsireVardiyalarimPage = () => {
  const { aktifPersonelId, userToken } = useAuth();
  const [vardiyalar, setVardiyalar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVardiyalarim = useCallback(async () => {
    if (!userToken || !aktifPersonelId) {
      setError("Vardiyalarınızı görmek için giriş yapmanız ve personel bilgilerinizin olması gerekmektedir.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Backend'den /api/personelvardiyalari/personel/mevcut/yaklasan endpoint'ini çağırıyoruz.
      // Bu endpoint, JWT'den giriş yapmış personelin (hemşirenin) ID'sini alıp,
      // o personele ait yaklaşan vardiyaları (örn: bugünden itibaren 1 hafta) getirmeli.
      const response = await personelVardiyaService.getMyYaklasanVardiyalar();
      setVardiyalar(response.data || []);
    } catch (err) {
      console.error("Hemşirenin yaklaşan vardiyaları getirilirken hata:", err);
      setError(err.response?.data?.message || err.message || 'Vardiyalarınız yüklenemedi.');
      setVardiyalar([]);
    }
    setIsLoading(false);
  }, [userToken, aktifPersonelId]);

  useEffect(() => {
    fetchVardiyalarim();
  }, [fetchVardiyalarim]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Yaklaşan Vardiyalarım (Hemşire)</h1>

      {isLoading && <p className="text-center text-gray-600 py-4">Vardiyalarınız yükleniyor...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md my-4">{error}</p>}

      {!isLoading && !error && vardiyalar.length === 0 && (
        <p className="text-gray-500 text-center py-4">Yaklaşan bir vardiyanız bulunmamaktadır.</p>
      )}

      {!isLoading && !error && vardiyalar.length > 0 && (
        <div className="space-y-4">
          {vardiyalar.map((vardiya) => (
            <div key={vardiya.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
              <p className="text-lg font-semibold text-purple-700">{vardiya.vardiyaAdi}</p>
              <p className="text-md text-gray-700">
                Tarih: {vardiya.tarih && isValid(parseISO(vardiya.tarih)) 
                          ? format(parseISO(vardiya.tarih), 'dd MMMM yyyy, EEEE', { locale: tr }) 
                          : 'Bilinmiyor'}
              </p>
              <p className="text-sm text-gray-600">
                Saatler: {vardiya.vardiyaBaslangicSaati} - {vardiya.vardiyaBitisSaati}
              </p>
              {/* PersonelVardiyaGoruntuleDTO'da personelAdiSoyadi varsa ve gerekirse gösterilebilir */}
              {/* {vardiya.personelAdiSoyadi && ( 
                <p className="text-xs text-gray-500 mt-1">Personel: {vardiya.personelAdiSoyadi}</p>
              )} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HemsireVardiyalarimPage;