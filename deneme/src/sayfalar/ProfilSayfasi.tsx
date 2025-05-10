import React from 'react';
import { User, Activity, Scale, LineChart, Loader2, Target, Droplets, Heart, Footprints } from 'lucide-react';
import { useKullanici } from '../baglam/KullaniciBaglami';
import ProfilFormu from '../bilesenler/ProfilFormu';
import { hesaplaIdealKilo, hesaplaIdealKiloAraligi } from '../yardimcilar';


const ProfilSayfasi: React.FC = () => {
  const { kullanici, vucutKitleIndeksi, gunlukKaloriIhtiyaci, yukleniyor } = useKullanici();
  const vki = vucutKitleIndeksi();
  
  // İdeal kilo hesaplama
  const idealKilo = hesaplaIdealKilo(kullanici.boy, kullanici.cinsiyet);
  const idealKiloAraligi = hesaplaIdealKiloAraligi(kullanici.boy, kullanici.cinsiyet);
  
  const vkiDurum = () => {
    if (vki < 18.5) return { durum: 'Zayıf', renk: 'text-blue-600' };
    if (vki < 25) return { durum: 'Normal', renk: 'text-green-600' };
    if (vki < 30) return { durum: 'Fazla Kilolu', renk: 'text-yellow-600' };
    return { durum: 'Obez', renk: 'text-red-600' };
  };
  
  const { durum, renk } = vkiDurum();
  
  const vkiYuzdesi = Math.min(Math.max((vki - 15) / 20 * 100, 0), 100); // 15-35 VKİ aralığı için
  
  if (yukleniyor) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
        <p className="text-gray-600">Kullanıcı bilgileri yükleniyor...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center justify-center">
          <div className="rounded-full bg-green-100 p-3 mb-3">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Kişisel Bilgiler</h2>
          <div className="text-center">
            <p className="text-gray-600">{kullanici.ad|| 'İsim belirtilmemiş'}</p>
            <p className="text-gray-600">{kullanici.yas} yaş, {kullanici.cinsiyet}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center justify-center">
          <div className="rounded-full bg-blue-100 p-3 mb-3">
            <Scale className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Vücut Kitle İndeksi</h2>
          <div className="text-center">
            <p className="text-lg font-bold">{vki.toFixed(1)}</p>
            <p className={`${renk} font-medium`}>{durum}</p>
            
            {/* VKİ göstergesi */}
            <div className="w-full mt-2">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{
                    width: `${vkiYuzdesi}%`,
                    background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #ef4444)',
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Zayıf</span>
                <span>Normal</span>
                <span>Kilolu</span>
                <span>Obez</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center justify-center">
          <div className="rounded-full bg-green-100 p-3 mb-3">
            <Activity className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Kalori İhtiyacı</h2>
          <div className="text-center">
            <p className="text-lg font-bold">{gunlukKaloriIhtiyaci()} kcal</p>
            <p className="text-gray-600">Günlük tahmini ihtiyaç</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center justify-center">
          <div className="rounded-full bg-purple-100 p-3 mb-3">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">İdeal Kilo</h2>
          <div className="text-center">
            <p className="text-lg font-bold">{idealKilo} kg</p>
            <p className="text-gray-600">Sağlıklı aralık: {idealKiloAraligi.min}-{idealKiloAraligi.max} kg</p>
            {kullanici.kilo > 0 && (
              <div className="mt-2">
                {kullanici.kilo < idealKiloAraligi.min ? (
                  <p className="text-blue-600 text-sm">Hedef: {Math.round(idealKiloAraligi.min - kullanici.kilo)} kg almanız önerilir</p>
                ) : kullanici.kilo > idealKiloAraligi.max ? (
                  <p className="text-orange-600 text-sm">Hedef: {Math.round(kullanici.kilo - idealKiloAraligi.max)} kg vermeniz önerilir</p>
                ) : (
                  <p className="text-green-600 text-sm">İdeal kilo aralığındasınız!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sağlık Önerileri Bölümü */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Kişiselleştirilmiş Sağlık Önerileri</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Adım Önerisi */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-start">
            <div className="rounded-full bg-blue-100 p-2 mr-3">
              <Footprints className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Günlük Adım Hedefi</h3>
              {kullanici.kilo < idealKiloAraligi.min ? (
                <p className="text-sm text-gray-600">Kilo almanız için günde en az <span className="font-bold">6.000 adım</span> atmanız önerilir. Düzenli yürüyüş metabolizmanızı hızlandırır ve iştahınızı artırır.</p>
              ) : kullanici.kilo > idealKiloAraligi.max ? (
                <p className="text-sm text-gray-600">Kilo vermeniz için günde en az <span className="font-bold">10.000 adım</span> atmanız önerilir. Bu, yaklaşık 400-500 kalori yakmanıza yardımcı olur.</p>
              ) : (
                <p className="text-sm text-gray-600">Sağlığınızı korumak için günde <span className="font-bold">8.000 adım</span> atmanız önerilir. Bu, kardiyovasküler sağlığınızı destekler.</p>
              )}
            </div>
          </div>
          
          {/* Su Tüketimi Önerisi */}
          <div className="bg-cyan-50 rounded-lg p-4 flex items-start">
            <div className="rounded-full bg-cyan-100 p-2 mr-3">
              <Droplets className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Su Tüketimi</h3>
              <p className="text-sm text-gray-600">Günde en az <span className="font-bold">{Math.round(kullanici.kilo * 0.033)} litre</span> su içmeniz önerilir. Bu, metabolizmanızı hızlandırır ve toksinlerin atılmasına yardımcı olur.</p>
              <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Günlük hedefin %30'u tamamlandı</p>
            </div>
          </div>
          
          {/* Egzersiz Önerisi */}
          <div className="bg-green-50 rounded-lg p-4 flex items-start">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <Heart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Egzersiz Önerisi</h3>
              {kullanici.kilo < idealKiloAraligi.min ? (
                <p className="text-sm text-gray-600">Haftada 3 gün <span className="font-bold">kuvvet antrenmanı</span> yapmanız önerilir. Kas kütlenizi artırmak için protein alımınıza dikkat edin.</p>
              ) : kullanici.kilo > idealKiloAraligi.max ? (
                <p className="text-sm text-gray-600">Haftada 4-5 gün <span className="font-bold">kardiyovasküler egzersiz</span> yapmanız önerilir. Yüksek yoğunluklu interval antrenmanları (HIIT) daha etkili yağ yakımı sağlar.</p>
              ) : (
                <p className="text-sm text-gray-600">Haftada 3-4 gün <span className="font-bold">karışık egzersizler</span> yapmanız önerilir. Kardiyovasküler egzersizler ve kuvvet antrenmanlarını dengeli şekilde birleştirin.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Beslenme Önerisi */}
        <div className="mt-4 bg-amber-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            <span className="inline-block rounded-full bg-amber-100 p-1 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
            Beslenme Önerisi
          </h3>
          {kullanici.kilo < idealKiloAraligi.min ? (
            <div className="text-sm text-gray-600">
              <p className="mb-2">Kilo almanız için günlük kalori ihtiyacınızdan <span className="font-bold">300-500 kalori</span> fazla tüketmeniz önerilir.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Protein açısından zengin besinler tüketin (et, süt ürünleri, baklagiller)</li>
                <li>Sağlıklı yağlar ekleyin (zeytinyağı, avokado, kuruyemişler)</li>
                <li>Kompleks karbonhidratlar tüketin (tam tahıllar, patates, pirinç)</li>
                <li>Gün içinde 5-6 öğün yemeye çalışın</li>
              </ul>
            </div>
          ) : kullanici.kilo > idealKiloAraligi.max ? (
            <div className="text-sm text-gray-600">
              <p className="mb-2">Kilo vermeniz için günlük kalori ihtiyacınızdan <span className="font-bold">500-700 kalori</span> az tüketmeniz önerilir.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Protein açısından zengin besinlere öncelik verin</li>
                <li>Sebze ve meyve tüketimini artırın</li>
                <li>İşlenmiş şeker ve basit karbonhidratları sınırlayın</li>
                <li>Porsiyonlarınızı küçültün ve yavaş yiyin</li>
                <li>Su tüketimini artırın, açlık hissi bazen susuzluk olabilir</li>
              </ul>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p className="mb-2">Sağlıklı kilonuzu korumak için dengeli beslenmeye devam edin.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Günlük kalori ihtiyacınızı karşılayacak şekilde beslenin</li>
                <li>Besin gruplarını dengeli tüketin (protein, karbonhidrat, yağ)</li>
                <li>İşlenmiş gıdalardan kaçının, tam gıdalara öncelik verin</li>
                <li>Düzenli öğün saatleri belirleyin</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Günlük Hatırlatma */}
        <div className="mt-4 bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-indigo-800">
            {kullanici.kilo < idealKiloAraligi.min ? (
              "Bugünkü hatırlatma: Ara öğünlerinizi ihmal etmeyin ve protein açısından zengin atıştırmalıklar tercih edin."
            ) : kullanici.kilo > idealKiloAraligi.max ? (
              "Bugünkü hatırlatma: 10.000 adım hedefine ulaşın ve akşam yemeğinden sonra atıştırmalıklardan kaçının."
            ) : (
              "Bugünkü hatırlatma: Günde en az 30 dakika orta yoğunlukta fiziksel aktivite yapmayı unutmayın."
            )}
          </p>
        </div>
      </div>
      
      <ProfilFormu />
    </div>
  );
  }


export default ProfilSayfasi;






