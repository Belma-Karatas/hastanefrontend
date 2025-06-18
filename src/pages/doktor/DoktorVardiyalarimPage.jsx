// src/pages/doktor/DoktorVardiyalarimPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import personelVardiyaService from '../../services/personelVardiyaService';
import { format, parseISO, isValid } from 'date-fns';
import tr from 'date-fns/locale/tr'; // Türkçe gün isimleri için

const DoktorVardiyalarimPage = () => {
  const { aktifPersonelId, userToken } = useAuth();
  const [vardiyalar, setVardiyalar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVardiyalarim = useCallback(async () => {
    if (!userToken || !aktifPersonelId) {
      setError("Vardiyalarınızı görmek için giriş yapmanız gerekmektedir.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await personelVardiyaService.getMyYaklasanVardiyalar();
      setVardiyalar(response.data || []);
    } catch (err) {
      console.error("Yaklaşan vardiyalar getirilirken hata:", err);
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Yaklaşan Vardiyalarım</h1>

      {isLoading && <p className="text-center text-gray-600 py-4">Vardiyalarınız yükleniyor...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md my-4">{error}</p>}

      {!isLoading && !error && vardiyalar.length === 0 && (
        <p className="text-gray-500 text-center py-4">Yaklaşan bir vardiyanız bulunmamaktadır.</p>
      )}

      {!isLoading && !error && vardiyalar.length > 0 && (
        <div className="space-y-4">
          {vardiyalar.map((vardiya) => (
            <div key={vardiya.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
              <p className="text-lg font-semibold text-indigo-700">{vardiya.vardiyaAdi}</p>
              <p className="text-md text-gray-700">
                Tarih: {vardiya.tarih && isValid(parseISO(vardiya.tarih)) 
                          ? format(parseISO(vardiya.tarih), 'dd MMMM yyyy, EEEE', { locale: tr }) 
                          : 'Bilinmiyor'}
              </p>
              <p className="text-sm text-gray-600">
                Saatler: {vardiya.vardiyaBaslangicSaati} - {vardiya.vardiyaBitisSaati}
              </p>
              {/* PersonelVardiyaGoruntuleDTO'da personelAdiSoyadi varsa gösterilebilir, 
                  ancak doktor kendi vardiyalarına baktığı için bu bilgiye gerek olmayabilir.
                  Eğer DTO'da varsa ve göstermek isterseniz:
              {vardiya.personelAdiSoyadi && ( 
                <p className="text-xs text-gray-500 mt-1">Personel: {vardiya.personelAdiSoyadi}</p>
              )}
              */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoktorVardiyalarimPage;