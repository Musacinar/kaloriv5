import React, { createContext, useContext, useState, useEffect } from 'react';
import { Kullanici, KullaniciBaglamiDegerleri } from '../tipler';
import { 
  kaydetKullanici, 
  getirKullanici, 
  varsayilanKullanici 
} from '../depolama';
import { 
  hesaplaVKI, 
  hesaplaGunlukKalori, 
  hesaplaKalanKalori 
} from '../yardimcilar';
import { useYemek } from './YemekBaglami';
import { supabase } from '../lib/supabase';

const KullaniciBaglami = createContext<KullaniciBaglamiDegerleri | undefined>(undefined);

export const KullaniciSaglayici: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kullanici, setKullanici] = useState<Kullanici>(varsayilanKullanici);
  const [yukleniyor, setYukleniyor] = useState<boolean>(true);
  
  useEffect(() => {
    const veritabanindanKullaniciGetir = async () => {
      setYukleniyor(true);
      try {
        // Önce oturum açmış kullanıcıyı al
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Oturum açmış kullanıcı bulunamadı:', userError?.message);
          // Yerel depolamadan kullanıcıyı al
          const kayitliKullanici = getirKullanici();
          if (kayitliKullanici) {
            setKullanici(kayitliKullanici);
          }
          return;
        }
        
        // Kullanıcının profil bilgilerini veritabanından al
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Profil verisi alınamadı:', error.message);
          // Hata durumunda yerel depolamadan kullanıcıyı al
          const kayitliKullanici = getirKullanici();
          if (kayitliKullanici) {
            setKullanici(kayitliKullanici);
          }
        } else if (data) {
          // Veritabanından gelen verileri kullanıcı state'ine aktar
          setKullanici({
            ad: data.ad || '',
            yas: data.yas || '',
            cinsiyet: data.cinsiyet || '',
            kilo: data.kilo || '',
            boy: data.boy || 0,
            hedefKalori: data.hedef_kalori || 0,
            aktivite_duzeyi: data.aktivite_duzeyi || '',
            hedef: data.hedef || ''
          });
        }
      } catch (err) {
        console.error('Kullanıcı verisi alınırken hata oluştu:', err);
        // Hata durumunda yerel depolamadan kullanıcıyı al
        const kayitliKullanici = getirKullanici();
        if (kayitliKullanici) {
          setKullanici(kayitliKullanici);
        }
      } finally {
        setYukleniyor(false);
      }
    };
    
    veritabanindanKullaniciGetir();
  }, []);

  useEffect(() => {
    kaydetKullanici(kullanici);
  }, [kullanici]);

  const kullaniciGuncelle = async (yeniKullanici: Partial<Kullanici>) => {
    // Önce state'i güncelle
    setKullanici(oncekiKullanici => ({
      ...oncekiKullanici,
      ...yeniKullanici
    }));
    
    try {
      // Oturum açmış kullanıcıyı al
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Oturum açmış kullanıcı bulunamadı:', userError?.message);
        // Sadece yerel depolamaya kaydet
        kaydetKullanici({...kullanici, ...yeniKullanici});
        return;
      }
      
      // Veritabanında profil bilgilerini güncelle
      const { error } = await supabase
        .from('profiles')
        .update({
          ad: yeniKullanici.ad !== undefined ? yeniKullanici.ad : kullanici.ad,
          yas: yeniKullanici.yas !== undefined ? yeniKullanici.yas : kullanici.yas,
          cinsiyet: yeniKullanici.cinsiyet !== undefined ? yeniKullanici.cinsiyet : kullanici.cinsiyet,
          boy: yeniKullanici.boy !== undefined ? yeniKullanici.boy : kullanici.boy,
          kilo: yeniKullanici.kilo !== undefined ? yeniKullanici.kilo : kullanici.kilo,
          aktivite_duzeyi: yeniKullanici.aktivite_duzeyi !== undefined ? yeniKullanici.aktivite_duzeyi : kullanici.aktivite_duzeyi,
          hedef: yeniKullanici.hedef !== undefined ? yeniKullanici.hedef : kullanici.hedef,
          hedef_kalori: yeniKullanici.hedefKalori !== undefined ? yeniKullanici.hedefKalori : kullanici.hedefKalori
        })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Profil güncellenemedi:', error.message);
      }
    } catch (err) {
      console.error('Kullanıcı güncellenirken hata oluştu:', err);
    }
    
    // Her durumda yerel depolamaya da kaydet
    kaydetKullanici({...kullanici, ...yeniKullanici});
  };

  const vucutKitleIndeksi = () => {
    return hesaplaVKI(kullanici.kilo, kullanici.boy);
  };

  const gunlukKaloriIhtiyaci = () => {
    return hesaplaGunlukKalori(kullanici);
  };

  // Bu fonksiyon için YemekBaglami hook'unu kullanamayız çünkü bir döngüsel bağımlılık oluşturur
  // Bu nedenle, bu fonksiyon kullanıldığında aşağıda yemek bağlamını kullanacağız
  const kalanKalori = () => {
    // Bu gerçek değeri bir komponent içinde hesaplayacağız
    return kullanici.hedefKalori;
  };

  const deger: KullaniciBaglamiDegerleri = {
    kullanici,
    kullaniciGuncelle,
    vucutKitleIndeksi,
    gunlukKaloriIhtiyaci,
    kalanKalori,
    yukleniyor
  };

  return (
    <KullaniciBaglami.Provider value={deger}>
      {children}
    </KullaniciBaglami.Provider>
  );
};

export const useKullanici = () => {
  const baglam = useContext(KullaniciBaglami);
  if (baglam === undefined) {
    throw new Error('useKullanici kancası KullaniciSaglayici içinde kullanılmalıdır');
  }
  return baglam;
};
