import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GirisFormu from '../bilesenler/GirisFormu';
import { getCurrentUser } from '../lib/supabase';
import { useKullanici } from '../baglam/KullaniciBaglami';

const GirisSayfasi: React.FC = () => {
  const navigate = useNavigate();
  const { kullanici } = useKullanici();
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const kullaniciKontrol = async () => {
      try {
        const mevcutKullanici = await getCurrentUser();
        if (mevcutKullanici) {
          navigate('/');
        }
      } catch (error) {
        console.error('Kullanıcı kontrolü sırasında hata:', error);
      } finally {
        setYukleniyor(false);
      }
    };

    kullaniciKontrol();
  }, [navigate]);

  if (yukleniyor) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kalori Takip Uygulaması
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sağlıklı bir yaşam için kalori takibinizi yapın
          </p>
        </div>
        <GirisFormu />
      </div>
    </div>
  );
};

export default GirisSayfasi;