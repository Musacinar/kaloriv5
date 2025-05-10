-- Beslenme planları tablosunu oluşturma
CREATE TABLE IF NOT EXISTS beslenme_planlari (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_tipi TEXT NOT NULL CHECK (plan_tipi IN ('gunluk', 'haftalik', 'aylik')),
  diyet_tipi TEXT NOT NULL CHECK (diyet_tipi IN ('normal', 'mideAmeliyati')),
  olusturma_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  plan_icerik JSONB NOT NULL,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS (Row Level Security) politikalarını ayarlama
ALTER TABLE beslenme_planlari ENABLE ROW LEVEL SECURITY;

-- Kullanıcıların kendi planlarını görmesine izin veren politika
CREATE POLICY "Kullanıcılar kendi beslenme planlarını görebilir" 
  ON beslenme_planlari 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Kullanıcıların kendi planlarını eklemesine izin veren politika
CREATE POLICY "Kullanıcılar kendi beslenme planlarını ekleyebilir" 
  ON beslenme_planlari 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcıların kendi planlarını güncellemesine izin veren politika
CREATE POLICY "Kullanıcılar kendi beslenme planlarını güncelleyebilir" 
  ON beslenme_planlari 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Kullanıcıların kendi planlarını silmesine izin veren politika
CREATE POLICY "Kullanıcılar kendi beslenme planlarını silebilir" 
  ON beslenme_planlari 
  FOR DELETE 
  USING (auth.uid() = user_id);