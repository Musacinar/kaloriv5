/*
  # Yemek veritabanı tablosu oluşturma

  1. Yeni Tablo
    - `yemekler`
      - `id` (uuid, primary key)
      - `ad` (text)
      - `kalori` (integer)
      - `protein` (float)
      - `karbonhidrat` (float)
      - `yag` (float)
      - `birim` (text)
      - `kategori` (text)
      - `created_at` (timestamp)

  2. Güvenlik
    - RLS politikaları eklendi
*/

CREATE TABLE IF NOT EXISTS yemekler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad text NOT NULL,
  kalori integer NOT NULL,
  protein float NOT NULL,
  karbonhidrat float NOT NULL,
  yag float NOT NULL,
  birim text NOT NULL DEFAULT 'gram',
  kategori text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS'yi etkinleştir
ALTER TABLE yemekler ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Herkes yemekleri görebilir"
  ON yemekler
  FOR SELECT
  TO public
  USING (true);

-- Örnek veriler
INSERT INTO yemekler (ad, kalori, protein, karbonhidrat, yag, birim, kategori) VALUES
  ('Haşlanmış Yumurta', 155, 13, 1.1, 11, 'adet', 'Kahvaltılık'),
  ('Tam Buğday Ekmeği', 69, 3.6, 12, 1.2, 'dilim', 'Kahvaltılık'),
  ('Beyaz Peynir', 93, 6.2, 0.5, 7.3, 'porsiyon', 'Kahvaltılık'),
  ('Izgara Tavuk Göğsü', 165, 31, 0, 3.6, 'porsiyon', 'Ana Yemek'),
  ('Pirinç Pilavı', 130, 2.7, 28, 0.3, 'porsiyon', 'Ana Yemek'),
  ('Mercimek Çorbası', 230, 11, 40, 2, 'kase', 'Çorba'),
  ('Elma', 95, 0.5, 25, 0.3, 'adet', 'Meyve'),
  ('Muz', 105, 1.3, 27, 0.3, 'adet', 'Meyve'),
  ('Ceviz', 185, 4.3, 3.9, 18.5, 'porsiyon', 'Kuruyemiş'),
  ('Yoğurt', 150, 8.5, 11.4, 8, 'kase', 'Süt Ürünü');