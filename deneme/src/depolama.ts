import { Yemek, Kullanici } from './tipler';

const YEMEKLER_ANAHTAR = 'kaloriTakip_yemekler';
const KULLANICI_ANAHTAR = 'kaloriTakip_kullanici';

export const kaydetYemekler = (yemekler: Yemek[]): void => {
  localStorage.setItem(YEMEKLER_ANAHTAR, JSON.stringify(yemekler));
};

export const getirYemekler = (): Yemek[] => {
  const kaydedilenYemekler = localStorage.getItem(YEMEKLER_ANAHTAR);
  return kaydedilenYemekler ? JSON.parse(kaydedilenYemekler) : [];
};

export const kaydetKullanici = (kullanici: Kullanici): void => {
  localStorage.setItem(KULLANICI_ANAHTAR, JSON.stringify(kullanici));
};

export const getirKullanici = (): Kullanici | null => {
  const kaydedilenKullanici = localStorage.getItem(KULLANICI_ANAHTAR);
  
  if (kaydedilenKullanici) {
    return JSON.parse(kaydedilenKullanici);
  }
  
  return null;
};

export const varsayilanKullanici: Kullanici = {
  ad: '',
  yas: 0,
  cinsiyet: 'Erkek',
  kilo: 0,
  boy: 0,
  hedefKalori: '',
  aktiviteDuzeyi: 'Az Hareketli',
  hedef: 'Kiloyu Korumak'
};

