import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './bilesenler/Navbar';
import AnaSayfa from './sayfalar/AnaSayfa';
import YemekGirisiSayfasi from './sayfalar/YemekGirisiSayfasi';
import ProfilSayfasi from './sayfalar/ProfilSayfasi';
import IstatistiklerSayfasi from './sayfalar/IstatistiklerSayfasi';
import GirisSayfasi from './sayfalar/GirisSayfasi';
import { YemekSaglayici } from './baglam/YemekBaglami';
import { KullaniciSaglayici } from './baglam/KullaniciBaglami';
import { getCurrentUser } from './lib/supabase';
import YemekOneriSayfasi from './sayfalar/YemekOneriSayfasi'; // Yeni sayfa import ettik
import SporProgramiSayfasi from './sayfalar/SporProgramiSayfasi';



function App() {
  const [kullaniciYukleniyor, setKullaniciYukleniyor] = useState(true);
  const [girisYapildi, setGirisYapildi] = useState(false);

  useEffect(() => {
    const kullaniciKontrol = async () => {
      try {
        const mevcutKullanici = await getCurrentUser();
        setGirisYapildi(!!mevcutKullanici);
      } catch (error) {
        console.error('Kullanıcı kontrolü sırasında hata:', error);
      } finally {
        setKullaniciYukleniyor(false);
      }
    };

    kullaniciKontrol();
  }, []);

  if (kullaniciYukleniyor) {
    return (
      <div className="flex justify-center items-center h-screen bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <KullaniciSaglayici>
      <YemekSaglayici>
        <div className="min-h-screen bg-green-50 text-gray-800 flex flex-col">
          {girisYapildi && <Navbar />}
          <main className={`flex-grow container mx-auto px-4 pb-10 ${girisYapildi ? 'pt-20' : 'pt-0'}`}>
            <Routes>
              <Route path="/giris" element={!girisYapildi ? <GirisSayfasi /> : <Navigate to="/" />} />
              <Route path="/" element={girisYapildi ? <AnaSayfa /> : <Navigate to="/giris" />} />
              <Route path="/yemek-girisi" element={girisYapildi ? <YemekGirisiSayfasi /> : <Navigate to="/giris" />} />
              <Route path="/profil" element={girisYapildi ? <ProfilSayfasi /> : <Navigate to="/giris" />} />
              <Route path="/yemek-oneri" element={girisYapildi ? <YemekOneriSayfasi /> : <Navigate to="/giris" />} /> {/* Yeni rota */}
              <Route path="/spor-programi" element={girisYapildi ? <SporProgramiSayfasi /> : <Navigate to="/giris" />} />
              <Route path="/istatistikler" element={girisYapildi ? <IstatistiklerSayfasi /> : <Navigate to="/giris" />} />
            </Routes>
          </main>
        </div>
      </YemekSaglayici>
    </KullaniciSaglayici>
  );
}

export default App;


