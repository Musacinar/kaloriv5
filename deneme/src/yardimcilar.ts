import { Yemek, GunlukOzet, Kullanici } from './tipler';

export const bugunTarih = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const tarihFormati = (tarih: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(tarih).toLocaleDateString('tr-TR', options);
};

export const rastgeleId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const hesaplaVKI = (kilo: number, boy: number): number => {
  const boyMetre = boy / 100;
  return kilo / (boyMetre * boyMetre);
};

export const hesaplaGunlukKalori = (kullanici: Kullanici): number => {
  const { cinsiyet, yas, kilo, boy, aktivite_duzeyi, hedef } = kullanici;
  
  // Harris-Benedict denklemi
  let BMR = 0;
  
  if (cinsiyet === 'Erkek') {
    BMR = 88.362 + (13.397 * kilo) + (4.799 * boy) - (5.677 * yas);
  } else {
    BMR = 447.593 + (9.247 * kilo) + (3.098 * boy) - (4.330 * yas);
  }
  
  // Aktivite düzeyi çarpanları
  const aktiviteCarpanlari = {
    'Hareketsiz': 1.2,
    'Az Hareketli': 1.375,
    'Orta Düzeyde Aktif': 1.55,
    'Çok Aktif': 1.725,
    'Aşırı Aktif': 1.9
  };
  
  let gunlukKalori = BMR * aktiviteCarpanlari[aktivite_duzeyi];
  
  // Hedef bazlı kalori ayarlaması
  switch (hedef) {
    case 'Kilo Vermek':
      gunlukKalori *= 0.85; // %15 kalori açığı
      break;
    case 'Kilo Almak':
      gunlukKalori *= 1.15; // %15 kalori fazlası
      break;
    default:
      // Kiloyu korumak için mevcut kaloriyi koru
      break;
  }
  
  return Math.round(gunlukKalori);
};

export const hesaplaKalanKalori = (
  hedefKalori: number, 
  bugunYemekler: Yemek[]
): number => {
  const toplamKalori = bugunYemekler.reduce(
    (toplam, yemek) => toplam + yemek.kalori, 0
  );
  return hedefKalori - toplamKalori;
};

export const hesaplaGunlukOzet = (
  tarih: string, 
  yemekler: Yemek[]
): GunlukOzet => {
  const gunYemekleri = yemekler.filter(yemek => yemek.tarih === tarih);
  
  const toplamKalori = gunYemekleri.reduce(
    (toplam, yemek) => toplam + yemek.kalori, 0
  );
  
  const toplamProtein = gunYemekleri.reduce(
    (toplam, yemek) => toplam + yemek.protein, 0
  );
  
  const toplamKarbonhidrat = gunYemekleri.reduce(
    (toplam, yemek) => toplam + yemek.karbonhidrat, 0
  );
  
  const toplamYag = gunYemekleri.reduce(
    (toplam, yemek) => toplam + yemek.yag, 0
  );
  
  return {
    tarih,
    toplamKalori,
    toplamProtein,
    toplamKarbonhidrat,
    toplamYag
  };
};

export const kaloriYuzdesi = (
  kalori: number, 
  hedefKalori: number
): number => {
  return Math.min(Math.round((kalori / hedefKalori) * 100), 100);
};

export const besinRenkleri = {
  protein: 'bg-blue-500',
  karbonhidrat: 'bg-yellow-500',
  yag: 'bg-red-500'
};

export const ogunSiralama = {
  'Kahvaltı': 1,
  'Öğle Yemeği': 2,
  'Akşam Yemeği': 3,
  'Ara Öğün': 4
};

export const aktiviteDuzeyiAciklamalari = {
  'Hareketsiz': 'Masa başı iş, spor yok',
  'Az Hareketli': 'Hafif aktivite, haftada 1-2 gün spor',
  'Orta Düzeyde Aktif': 'Orta düzey aktivite, haftada 3-5 gün spor',
  'Çok Aktif': 'Yoğun aktivite, haftada 6-7 gün spor',
  'Aşırı Aktif': 'Profesyonel sporcu seviyesi'
};

// İdeal kilo hesaplama fonksiyonu
export const hesaplaIdealKilo = (boy: number, cinsiyet: string): number => {
  // Hamwi formülü kullanılarak ideal kilo hesaplanıyor
  // Erkekler için: 50 kg + (boy - 152.4) * 0.9
  // Kadınlar için: 45.5 kg + (boy - 152.4) * 0.9
  
  const temelKilo = cinsiyet === 'Erkek' ? 50 : 45.5;
  const boyFarki = Math.max(0, boy - 152.4); // Boy 152.4 cm'den küçükse negatif değer olmaması için
  
  const idealKilo = temelKilo + (boyFarki * 0.9);
  
  // Sonucu bir ondalık basamağa yuvarlayarak döndür
  return Math.round(idealKilo * 10) / 10;
};

// İdeal kilo aralığı hesaplama fonksiyonu
export const hesaplaIdealKiloAraligi = (boy: number, cinsiyet: string): { min: number, max: number } => {
  const idealKilo = hesaplaIdealKilo(boy, cinsiyet);
  
  // İdeal kilonun %10 altı ve üstü sağlıklı aralık olarak kabul edilir
  return {
    min: Math.round((idealKilo * 0.9) * 10) / 10,
    max: Math.round((idealKilo * 1.1) * 10) / 10
  };
};