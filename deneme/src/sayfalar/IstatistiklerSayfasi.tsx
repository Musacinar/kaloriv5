import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useYemek } from '../baglam/YemekBaglami';
import { useKullanici } from '../baglam/KullaniciBaglami';
import BesinGrafigi from '../bilesenler/BesinGrafigi';
import { tarihFormati } from '../yardimcilar';
import { supabase } from '../lib/supabase';

const IstatistiklerSayfasi: React.FC = () => {
  const { yemekler, gunlukOzet } = useYemek();
  const { kullanici } = useKullanici();
  
  const [tarihAraligi, setTarihAraligi] = useState<'hafta' | 'ay'>('hafta');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullaniciYemekleri, setKullaniciYemekleri] = useState<any[]>([]);
  
  // Son 7 veya 30 günün tarihlerini oluştur
  const tarihlerOlustur = () => {
    const tarihler: string[] = [];
    const gun = 24 * 60 * 60 * 1000; // 1 gün (ms)
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    
    const gunSayisi = tarihAraligi === 'hafta' ? 7 : 30;
    
    for (let i = gunSayisi - 1; i >= 0; i--) {
      const tarih = new Date(bugun.getTime() - (i * gun));
      tarihler.push(tarih.toISOString().split('T')[0]);
    }
    
    return tarihler;
  };
  
  const [gunlukOzetler, setGunlukOzetler] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchKullaniciYemekleri = async () => {
      setYukleniyor(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Kullanıcının yemek kayıtlarını getir
        const { data, error } = await supabase
          .from('user_foods')
          .select('*, yemekler(*)')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        if (data) {
          setKullaniciYemekleri(data);
        }
      } catch (err) {
        console.error('Yemek verileri alınırken hata:', err);
      } finally {
        setYukleniyor(false);
      }
    };
    
    fetchKullaniciYemekleri();
  }, []);
  
  useEffect(() => {
    const tarihler = tarihlerOlustur();
    const ozetler = tarihler.map(tarih => {
      const ozet = gunlukOzet(tarih);
      
      // Veritabanından gelen yemekleri de dahil et
      const tarihYemekleri = kullaniciYemekleri.filter(y => y.date === tarih);
      const dbKalori = tarihYemekleri.reduce((toplam, y) => toplam + y.calories, 0);
      
      return {
        ...ozet,
        tarihFormati: tarihFormati(tarih).split(' ')[0], // Sadece gün ve ay
        toplamKalori: ozet.toplamKalori + dbKalori,
        hedefYuzdesi: Math.min(Math.round(((ozet.toplamKalori + dbKalori) / kullanici.hedefKalori) * 100), 100)
      };
    });
    
    setGunlukOzetler(ozetler);
  }, [tarihAraligi, yemekler, kullanici.hedefKalori, kullaniciYemekleri]);
  
  // Son 7 günün ortalaması
  const ortalamalar = {
    kalori: Math.round(gunlukOzetler.reduce((t, g) => t + g.toplamKalori, 0) / gunlukOzetler.length),
    protein: Math.round(gunlukOzetler.reduce((t, g) => t + g.toplamProtein, 0) / gunlukOzetler.length),
    karbonhidrat: Math.round(gunlukOzetler.reduce((t, g) => t + g.toplamKarbonhidrat, 0) / gunlukOzetler.length),
    yag: Math.round(gunlukOzetler.reduce((t, g) => t + g.toplamYag, 0) / gunlukOzetler.length)
  };
  
  const bugunOzet = gunlukOzet();
  
  if (yukleniyor) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
        <p className="text-gray-600">İstatistikler yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">İstatistikler</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Kalori Alımı
            </h2>
            <div className="flex">
              <button
                onClick={() => setTarihAraligi('hafta')}
                className={`px-3 py-1 rounded-l-md text-sm ${
                  tarihAraligi === 'hafta'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Haftalık
              </button>
              <button
                onClick={() => setTarihAraligi('ay')}
                className={`px-3 py-1 rounded-r-md text-sm ${
                  tarihAraligi === 'ay'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aylık
              </button>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gunlukOzetler}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tarihFormati" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} kcal`, 'Kalori']}
                  labelFormatter={(label) => `Tarih: ${label}`}
                />
                <Bar dataKey="toplamKalori" name="Kalori" fill="#22c55e" />
                {/* Hedef kalori çizgisi */}
                <Line 
                  type="monotone" 
                  dataKey={() => kullanici.hedefKalori} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  name="Hedef"
                  dot={false}
                  activeDot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Bugünkü Besin Dağılımı
              </h2>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarDays className="h-4 w-4 mr-1" />
                <span>{tarihFormati(new Date().toISOString())}</span>
              </div>
            </div>
            
            <BesinGrafigi
              protein={bugunOzet.toplamProtein}
              karbonhidrat={bugunOzet.toplamKarbonhidrat}
              yag={bugunOzet.toplamYag}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {tarihAraligi === 'hafta' ? 'Haftalık' : 'Aylık'} Ortalamalar
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Kalori</span>
                  <span className="text-sm font-medium text-gray-700">
                    {ortalamalar.kalori} / {kullanici.hedefKalori} kcal
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min((ortalamalar.kalori / kullanici.hedefKalori) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Protein</span>
                  <span className="text-sm font-medium text-gray-700">
                    {ortalamalar.protein} / {kullanici.hedefProtein} g
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min((ortalamalar.protein / kullanici.hedefProtein) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Karbonhidrat</span>
                  <span className="text-sm font-medium text-gray-700">
                    {ortalamalar.karbonhidrat} / {kullanici.hedefKarbonhidrat} g
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min((ortalamalar.karbonhidrat / kullanici.hedefKarbonhidrat) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Yağ</span>
                  <span className="text-sm font-medium text-gray-700">
                    {ortalamalar.yag} / {kullanici.hedefYag} g
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min((ortalamalar.yag / kullanici.hedefYag) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Besin Değerleri Trendi
        </h2>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={gunlukOzetler}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tarihFormati" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="toplamProtein" 
                name="Protein (g)" 
                stroke="#3b82f6" 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="toplamKarbonhidrat" 
                name="Karbonhidrat (g)" 
                stroke="#eab308" 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="toplamYag" 
                name="Yağ (g)" 
                stroke="#ef4444" 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default IstatistiklerSayfasi;