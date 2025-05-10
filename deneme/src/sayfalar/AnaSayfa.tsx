import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, Coffee, Utensils, Droplets, Plus, Minus } from 'lucide-react';
import { useYemek } from '../baglam/YemekBaglami';
import { useKullanici } from '../baglam/KullaniciBaglami';
import KaloriOzeti from '../bilesenler/KaloriOzeti';
import YemekListesi from '../bilesenler/YemekListesi';
import Modal from '../bilesenler/Modal';
import YemekEklemeFormu from '../bilesenler/YemekEklemeFormu';
import SikKullanilanlarListesi from '../bilesenler/SikKullanilanlarListesi';
import { ogunSiralama } from '../yardimcilar';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const AnaSayfa: React.FC = () => {
  const [yemekEkleModalAcik, setYemekEkleModalAcik] = useState(false);
  const { ogunlereGoreYemekler, bugunYemekler, yemekler } = useYemek();
  const { kullanici } = useKullanici();
  const [suMiktari, setSuMiktari] = useState(0);
  const [hedefSuMiktari, setHedefSuMiktari] = useState(2500); // ml cinsinden
  const [yukleniyor, setYukleniyor] = useState(true);
  
  const ogunYemekleri = ogunlereGoreYemekler();
  const bugunTumYemekler = bugunYemekler();
  
  const ogunlerSirali = Object.entries(ogunYemekleri)
    .sort(([a], [b]) => (ogunSiralama[a] || 0) - (ogunSiralama[b] || 0))
    .filter(([_, yemekler]) => yemekler.length > 0);
    
  // Su miktarını veritabanından getir
  useEffect(() => {
    const getSuMiktari = async () => {
      setYukleniyor(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const bugun = new Date().toISOString().split('T')[0];
        
        // Bugünkü su kaydını getir
        const { data, error } = await supabase
          .from('su_takibi')
          .select('*')
          .eq('user_id', user.id)
          .eq('tarih', bugun)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116: Kayıt bulunamadı hatası
          console.error('Su verisi alınırken hata:', error);
        }
        
        if (data) {
          setSuMiktari(data.miktar);
        } else {
          // Bugün için kayıt yoksa oluştur
          await supabase
            .from('su_takibi')
            .insert({
              user_id: user.id,
              tarih: bugun,
              miktar: 0
            });
        }
        
        // Kullanıcının hedef su miktarını getir
        const { data: profilData } = await supabase
          .from('profiles')
          .select('hedef_su')
          .eq('user_id', user.id)
          .single();
          
        if (profilData && profilData.hedef_su) {
          setHedefSuMiktari(profilData.hedef_su);
        } else {
          // Varsayılan hedef su miktarını hesapla (kilo * 30ml)
          const hesaplananHedef = Math.round(kullanici.kilo * 30);
          setHedefSuMiktari(hesaplananHedef > 0 ? hesaplananHedef : 2500);
          
          // Hesaplanan hedefi veritabanına kaydet
          await supabase
            .from('profiles')
            .update({ hedef_su: hesaplananHedef })
            .eq('user_id', user.id);
        }
      } catch (err) {
        console.error('Su verisi alınırken hata:', err);
      } finally {
        setYukleniyor(false);
      }
    };
    
    getSuMiktari();
  }, [kullanici.kilo]);
  
  // Su miktarını güncelle
  const suMiktariGuncelle = async (miktar: number) => {
    const yeniMiktar = Math.max(0, suMiktari + miktar);
    setSuMiktari(yeniMiktar);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const bugun = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('su_takibi')
        .update({ miktar: yeniMiktar })
        .eq('user_id', user.id)
        .eq('tarih', bugun);
    } catch (err) {
      console.error('Su miktarı güncellenirken hata:', err);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Merhaba, {kullanici.ad || 'Misafir'}!
        </h1>
        
        <div className="flex space-x-2">
          <Link
            to="/spor-programi"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Spor Programım
          </Link>
          
          <button
            onClick={() => setYemekEkleModalAcik(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Yemek Ekle
          </button>
        </div>
      </div>
      
      <KaloriOzeti />
      
      {/* Su Takibi */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Droplets className="h-5 w-5 text-blue-500 mr-2" />
            Günlük Su Takibi
          </h2>
          <div className="text-sm text-gray-500">
            {suMiktari} / {hedefSuMiktari} ml
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((suMiktari / hedefSuMiktari) * 100, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button 
              onClick={() => suMiktariGuncelle(-250)}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              disabled={suMiktari <= 0}
            >
              <Minus className="h-4 w-4" />
            </button>
            
            <button 
              onClick={() => suMiktariGuncelle(250)}
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            {[250, 500].map(miktar => (
              <button 
                key={miktar}
                onClick={() => suMiktariGuncelle(miktar)}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                +{miktar} ml
              </button>
            ))}
          </div>
        </div>
      </motion.div>
      
      <SikKullanilanlarListesi />
      
      {ogunlerSirali.length > 0 ? (
        ogunlerSirali.map(([ogun, yemekler]) => (
          <YemekListesi
            key={ogun}
            baslik={ogun}
            yemekler={yemekler}
            ogun={ogun}
          />
        ))
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <Coffee className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Bugün Henüz Yemek Eklenmemiş
            </h2>
            <p className="text-gray-600 mb-6">
              Bugün tükettiğiniz yemekleri ekleyerek kalori takibinizi yapabilirsiniz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setYemekEkleModalAcik(true)}
              className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Yemek Ekle
            </button>
            
            <Link
              to="/istatistikler"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <Clock className="h-5 w-5 mr-2" />
              Geçmiş Kayıtlarım
            </Link>
          </div>
        </div>
      )}
      
      {bugunTumYemekler.length > 0 && (
        <div className="text-center mt-4">
          <Link
            to="/yemek-girisi"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 focus:outline-none focus:underline transition-colors duration-200"
          >
            <Utensils className="h-4 w-4 mr-1" />
            Tüm yemekleri görüntüle
          </Link>
        </div>
      )}
      
      <Modal 
        acik={yemekEkleModalAcik} 
        kapat={() => setYemekEkleModalAcik(false)} 
        baslik="Yemek Ekle"
      >
        <YemekEklemeFormu kapatModal={() => setYemekEkleModalAcik(false)} />
      </Modal>
    </div>
  );
};

export default AnaSayfa;