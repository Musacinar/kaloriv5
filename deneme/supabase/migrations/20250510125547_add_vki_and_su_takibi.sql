-- VKİ ve su takibi için gerekli alanları ve tabloları ekleme

-- Profiles tablosuna VKİ alanları ekleme
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vki FLOAT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vki_kategori TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hedef_su INTEGER DEFAULT 2500;

-- Su takibi tablosu oluşturma
CREATE TABLE IF NOT EXISTS su_takibi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tarih DATE NOT NULL DEFAULT CURRENT_DATE,
  miktar INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, tarih)
);

-- RLS (Row Level Security) politikalarını ayarlama
ALTER TABLE su_takibi ENABLE ROW LEVEL SECURITY;

-- Kullanıcıların kendi su takiplerini görmesine izin veren politika
CREATE POLICY "Kullanıcılar kendi su takiplerini görebilir" 
  ON su_takibi 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Kullanıcıların kendi su takiplerini eklemesine izin veren politika
CREATE POLICY "Kullanıcılar kendi su takiplerini ekleyebilir" 
  ON su_takibi 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcıların kendi su takiplerini güncellemesine izin veren politika
CREATE POLICY "Kullanıcılar kendi su takiplerini güncelleyebilir" 
  ON su_takibi 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Egzersizler tablosu oluşturma
CREATE TABLE IF NOT EXISTS egzersizler (
  id SERIAL PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT NOT NULL,
  set INTEGER NOT NULL DEFAULT 3,
  tekrar INTEGER NOT NULL DEFAULT 10,
  kategori TEXT NOT NULL,
  vki_kategori TEXT NOT NULL DEFAULT 'tum',
  resim_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS (Row Level Security) politikalarını ayarlama
ALTER TABLE egzersizler ENABLE ROW LEVEL SECURITY;

-- Herkesin egzersizleri görmesine izin veren politika
CREATE POLICY "Herkes egzersizleri görebilir" 
  ON egzersizler 
  FOR SELECT 
  TO public
  USING (true);

-- Örnek egzersizler ekleme
INSERT INTO egzersizler (ad, aciklama, set, tekrar, kategori, vki_kategori) VALUES
('Şınav', 'Göğüs, omuz ve triceps kaslarını çalıştıran temel bir egzersiz.', 3, 10, 'Üst Vücut', 'tum'),
('Squat', 'Bacak kaslarını güçlendiren temel bir egzersiz.', 3, 15, 'Alt Vücut', 'tum'),
('Plank', 'Karın ve sırt kaslarını güçlendiren statik bir egzersiz.', 3, 30, 'Karın', 'tum'),
('Jumping Jack', 'Tüm vücudu çalıştıran kardiyovasküler bir egzersiz.', 3, 20, 'Kardiyo', 'tum'),
('Dumbbell Curl', 'Biceps kaslarını çalıştıran bir egzersiz.', 3, 12, 'Üst Vücut', 'zayif'),
('Leg Press', 'Bacak kaslarını güçlendiren bir makine egzersizi.', 3, 15, 'Alt Vücut', 'zayif'),
('Yürüyüş', 'Düşük tempolu kardiyovasküler egzersiz.', 1, 30, 'Kardiyo', 'obez'),
('Su Yürüyüşü', 'Eklemlere minimum yük bindiren bir egzersiz.', 1, 20, 'Kardiyo', 'obez'),
('Hafif Squat', 'Diz seviyesine kadar inen hafif squat hareketi.', 3, 10, 'Alt Vücut', 'obez'),
('HIIT', 'Yüksek yoğunluklu interval antrenmanı.', 4, 15, 'Kardiyo', 'kilolu'),
('Mountain Climber', 'Karın kaslarını ve kardiyovasküler sistemi çalıştıran dinamik bir egzersiz.', 3, 20, 'Karın', 'kilolu'),
('Burpee', 'Tüm vücudu çalıştıran yüksek yoğunluklu bir egzersiz.', 3, 10, 'Tam Vücut', 'normal');