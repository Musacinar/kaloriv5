import React from 'react';
import { useYemek } from '../baglam/YemekBaglami';
import { bugunTarih } from '../yardimcilar';

const SikKullanilanlarListesi: React.FC = () => {
  const { sikKullanilanYemekler, yemekEkle } = useYemek();
  
  const sikKullanilanlar = sikKullanilanYemekler();
  
  if (sikKullanilanlar.length === 0) {
    return null;
  }
  
  const handleHizliEkle = (yemekIndex: number) => {
    const yemek = sikKullanilanlar[yemekIndex];
    
    yemekEkle({
      ad: yemek.ad,
      kalori: yemek.kalori,
      protein: yemek.protein,
      karbonhidrat: yemek.karbonhidrat,
      yag: yemek.yag,
      porsiyon: yemek.porsiyon,
      birim: yemek.birim,
      tarih: bugunTarih(),
      ogun: yemek.ogun
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-5">
      <h2 className="font-semibold text-lg text-gray-800 mb-3">Sık Kullanılanlar</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {sikKullanilanlar.map((yemek, index) => (
          <div 
            key={index}
            className="bg-green-50 rounded-lg p-3 text-center cursor-pointer hover:bg-green-100 transition-colors duration-200 border border-green-100"
            onClick={() => handleHizliEkle(index)}
          >
            <div className="font-medium text-gray-800 truncate">{yemek.ad}</div>
            <div className="text-sm text-gray-500">{yemek.kalori} kcal</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SikKullanilanlarListesi;