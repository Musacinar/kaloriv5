import React, { createContext, useContext, useState, useEffect } from 'react';
import { Yemek, YemekBaglamiDegerleri, YemekVeritabani } from '../tipler';
import { kaydetYemekler, getirYemekler } from '../depolama';
import { bugunTarih, rastgeleId, hesaplaGunlukOzet } from '../yardimcilar';
import { supabase } from '../lib/supabase';



const YemekBaglami = createContext<YemekBaglamiDegerleri | undefined>(undefined);

export const YemekSaglayici: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [yemekler, setYemekler] = useState<Yemek[]>([]);
  const [hazirYemekler, setHazirYemekler] = useState<YemekVeritabani[]>([]);

  useEffect(() => {
    const kayitliYemekler = getirYemekler();
    setYemekler(kayitliYemekler);
    
    // Fetch ready-made foods from Supabase
    const getirHazirYemekler = async () => {
      const { data, error } = await supabase
        .from('yemekler')
        .select('*');
      
      if (error) {
        console.error('Hazır yemekler yüklenirken hata:', error);
        return;
      }
      
      setHazirYemekler(data || []);
    };
    
    getirHazirYemekler();
  }, []);

  useEffect(() => {
    kaydetYemekler(yemekler);
  }, [yemekler]);

  const yemekAra = (aramaMetni: string): YemekVeritabani[] => {
    const kucukHarfArama = aramaMetni.toLowerCase().trim();
    return hazirYemekler.filter(yemek => 
      yemek.ad.toLowerCase().includes(kucukHarfArama)
    );
  };

  const yemekEkle = (yeniYemek: Omit<Yemek, 'id'>) => {
    const yemek: Yemek = {
      ...yeniYemek,
      id: rastgeleId()
    };
    setYemekler(oncekiYemekler => [...oncekiYemekler, yemek]);
  };

  const yemekGuncelle = (id: string, guncelYemek: Partial<Yemek>) => {
    setYemekler(oncekiYemekler =>
      oncekiYemekler.map(yemek =>
        yemek.id === id ? { ...yemek, ...guncelYemek } : yemek
      )
    );
  };

  const yemekSil = (id: string) => {
    setYemekler(oncekiYemekler =>
      oncekiYemekler.filter(yemek => yemek.id !== id)
    );
  };

  const bugunYemekler = () => {
    return yemekler.filter(yemek => yemek.tarih === bugunTarih());
  };

  const bugunToplamKalori = () => {
    return bugunYemekler().reduce((toplam, yemek) => toplam + yemek.kalori, 0);
  };

  const bugunToplamBesinDegerleri = () => {
    const bugunYenenYemekler = bugunYemekler();
    return {
      protein: bugunYenenYemekler.reduce((toplam, yemek) => toplam + yemek.protein, 0),
      karbonhidrat: bugunYenenYemekler.reduce((toplam, yemek) => toplam + yemek.karbonhidrat, 0),
      yag: bugunYenenYemekler.reduce((toplam, yemek) => toplam + yemek.yag, 0)
    };
  };

  const ogunlereGoreYemekler = () => {
    const bugunYenenYemekler = bugunYemekler();
    return {
      'Kahvaltı': bugunYenenYemekler.filter(yemek => yemek.ogun === 'Kahvaltı'),
      'Öğle Yemeği': bugunYenenYemekler.filter(yemek => yemek.ogun === 'Öğle Yemeği'),
      'Akşam Yemeği': bugunYenenYemekler.filter(yemek => yemek.ogun === 'Akşam Yemeği'),
      'Ara Öğün': bugunYenenYemekler.filter(yemek => yemek.ogun === 'Ara Öğün')
    };
  };

  const gunlukOzet = (gun = bugunTarih()) => {
    return hesaplaGunlukOzet(gun, yemekler);
  };

  const sikKullanilanYemekler = () => {
    const yemekFrekansi: Record<string, number> = {};
    
    yemekler.forEach(yemek => {
      const anahtar = yemek.ad.toLowerCase();
      yemekFrekansi[anahtar] = (yemekFrekansi[anahtar] || 0) + 1;
    });
    
    const benzersizYemekler = yemekler.reduce<Record<string, Yemek>>((acc, yemek) => {
      const anahtar = yemek.ad.toLowerCase();
      if (!acc[anahtar]) {
        acc[anahtar] = yemek;
      }
      return acc;
    }, {});
    
    return Object.entries(yemekFrekansi)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([ad]) => benzersizYemekler[ad]);
  };

  const deger: YemekBaglamiDegerleri = {
    yemekler,
    hazirYemekler,
    yemekAra,
    yemekEkle,
    yemekGuncelle,
    yemekSil,
    bugunYemekler,
    bugunToplamKalori,
    bugunToplamBesinDegerleri,
    ogunlereGoreYemekler,
    gunlukOzet,
    sikKullanilanYemekler
  };

  return (
    <YemekBaglami.Provider value={deger}>
      {children}
    </YemekBaglami.Provider>
  );
};

export const useYemek = () => {
  const baglam = useContext(YemekBaglami);
  if (baglam === undefined) {
    throw new Error('useYemek kancası YemekSaglayici içinde kullanılmalıdır');
  }
  return baglam;
};