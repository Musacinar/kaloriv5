export interface Yemek {
  id: string;
  ad: string;
  kalori: number;
  protein: number;
  karbonhidrat: number;
  yag: number;
  porsiyon: number;
  birim: string;
  tarih: string;
  ogun: 'Kahvaltı' | 'Öğle Yemeği' | 'Akşam Yemeği' | 'Ara Öğün';
}

export interface YemekVeritabani {
  id: string;
  ad: string;
  kalori: number;
  protein: number;
  karbonhidrat: number;
  yag: number;
  birim: string;
  kategori: string;
}

export interface Kullanici {
  ad: string;
  yas: number;
  cinsiyet: 'Erkek' | 'Kadın' | 'Diğer';
  kilo: number;
  boy: number;
  hedefKalori: number;
  aktivite_duzeyi: 'Hareketsiz' | 'Az Hareketli' | 'Orta Düzeyde Aktif' | 'Çok Aktif' | 'Aşırı Aktif';
  hedef: 'Kilo Vermek' | 'Kilo Almak' | 'Kiloyu Korumak';
}

export interface GunlukOzet {
  tarih: string;
  toplamKalori: number;
  toplamProtein: number;
  toplamKarbonhidrat: number;
  toplamYag: number;
}

export interface YemekBaglamiDegerleri {
  yemekler: Yemek[];
  yemekEkle: (yemek: Omit<Yemek, 'id'>) => void;
  yemekGuncelle: (id: string, yemek: Partial<Yemek>) => void;
  yemekSil: (id: string) => void;
  bugunYemekler: () => Yemek[];
  bugunToplamKalori: () => number;
  bugunToplamBesinDegerleri: () => { protein: number; karbonhidrat: number; yag: number };
  ogunlereGoreYemekler: () => Record<Yemek['ogun'], Yemek[]>;
  gunlukOzet: (gun?: string) => GunlukOzet;
  sikKullanilanYemekler: () => Yemek[];
  hazirYemekler: YemekVeritabani[];
  yemekAra: (aramaMetni: string) => YemekVeritabani[];
}

export interface KullaniciBaglamiDegerleri {
  kullanici: Kullanici;
  kullaniciGuncelle: (yeniKullanici: Partial<Kullanici>) => void;
  vucutKitleIndeksi: () => number;
  gunlukKaloriIhtiyaci: () => number;
  kalanKalori: () => number;
}