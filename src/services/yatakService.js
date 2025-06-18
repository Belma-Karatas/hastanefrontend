// src/services/yatakService.js
import apiClient from './api';

const getYataklarByOdaId = (odaId) => {
  return apiClient.get('/yataklar', { params: { odaId: odaId } });
};

const getAllYataklar = () => {
    return apiClient.get('/yataklar');
};

const getYatakById = (id) => {
  return apiClient.get(`/yataklar/${id}`);
};

const createYatak = (yatakData) => {
  return apiClient.post('/yataklar', yatakData);
};

const updateYatak = (id, yatakData) => {
  return apiClient.put(`/yataklar/${id}`, yatakData);
};

const updateYatakDolulukDurumu = (id, doluMu) => { // Sadece boolean değer alacak şekilde güncellendi
    // Backend'e { "doluMu": true } gibi bir JSON objesi yerine
    // doğrudan query param olarak gönderebiliriz veya backend'in beklediği yapıya göre ayarlanmalı.
    // Şimdilik backend'in /yataklar/{id}/doluluk?doluMu=true gibi bir yapıyı desteklediğini varsayalım
    // veya PUT body'sinde sadece boolean bir değer (ya da {doluMu: boolean}) beklediğini.
    // Backend controller'ınızdaki @RequestParam veya @RequestBody'ye göre ayarlayın.
    // Eğer @RequestParam boolean doluMu ise:
    return apiClient.put(`/yataklar/${id}/doluluk?doluMu=${doluMu}`); 
    // Eğer @RequestBody YatakDTO veya benzeri bir obje ve içinde sadece doluMu varsa:
    // return apiClient.put(`/yataklar/${id}/doluluk`, { doluMu: doluMu });
};

const deleteYatak = (id) => {
  return apiClient.delete(`/yataklar/${id}`);
};

const yatakService = {
  getYataklarByOdaId,
  getAllYataklar,
  getYatakById,
  createYatak,
  updateYatak,
  updateYatakDolulukDurumu,
  deleteYatak,
};

export default yatakService;