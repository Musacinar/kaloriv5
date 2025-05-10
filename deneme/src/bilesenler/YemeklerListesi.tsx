import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaUtensils, FaAppleAlt, FaCoffee, FaCarrot, FaPizzaSlice, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaUserMd, FaSave, FaList, FaHeart, FaChartPie } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSparkles } from 'react-icons/hi';

const supabaseUrl = 'https://iuazqskxpxzyuyqztafk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YXpxc2t4cHh6eXV5cXp0YWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NzczODYsImV4cCI6MjA2MTE1MzM4Nn0.t9uQcYJSZtUx-Fm8fzH-epjs4BzGw8HqciMWHgsv7Ac';
const supabase = createClient(supabaseUrl, supabaseKey);

// Kategori simgeleri
const iconMap = {
  Kahvaltı: <FaCoffee className="text-orange-500" />,
  Öğle: <FaUtensils className="text-green-600" />,
  Akşam: <FaPizzaSlice className="text-red-500" />,
  Atıştırmalık: <FaCarrot className="text-yellow-500" />,
  Meyve: <FaAppleAlt className="text-pink-500" />,
};

// Kalori oranları - normal diyet için
const normalOranlar = {
  Kahvaltı: 0.25,
  Öğle: 0.30,
  Akşam: 0.30,
  Atıştırmalık: 0.10,
  Meyve: 0.05,
};

// Kalori oranları - mide ameliyatı sonrası diyet için
const mideAmeliyatiOranlar = {
  Kahvaltı: 0.20,
  Öğle: 0.25,
  Akşam: 0.25,
  Atıştırmalık: 0.20,
  Meyve: 0.10,
};

// Haftanın günleri
const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// Ayın günleri (30 gün varsayıyoruz)
const ayGunleri = Array.from({ length: 30 }, (_, i) => i + 1);

const YemeklerListesi = () => {
  const [userCalories, setUserCalories] = useState(null);
  const [yemekler, setYemekler] = useState([]);
  const [error, setError] = useState(null);
  const [gorunumTipi, setGorunumTipi] = useState('gunluk'); // gunluk, haftalik, aylik
  const [diyetTipi, setDiyetTipi] = useState('normal'); // normal, mideAmeliyati
  const [userProfile, setUserProfile] = useState(null);
  const [kaydedilmisPlanlar, setKaydedilmisPlanlar] = useState([]);
  const [planKaydediliyor, setPlanKaydediliyor] = useState(false);
  const [planlarYukleniyor, setPlanlarYukleniyor] = useState(false);
  const [planlarModalAcik, setPlanlarModalAcik] = useState(false);
  const [basariliMesaj, setBasariliMesaj] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError('Kullanıcı bulunamadı.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) return setError('Profil verisi alınamadı.');

      setUserProfile(profile);
      setUserCalories(profile.hedef_kalori);

      const { data: yemekData, error: yemekError } = await supabase
        .from('yemekler')
        .select('*');

      if (yemekError) return setError('Yemek verisi alınamadı.');

      setYemekler(yemekData);
      
      // Kaydedilmiş beslenme planlarını getir
      getirKaydedilmisPlanlar();
    };

    fetchData();
  }, []);
  
  // Kaydedilmiş beslenme planlarını getirme fonksiyonu
  const getirKaydedilmisPlanlar = async () => {
    setPlanlarYukleniyor(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('beslenme_planlari')
        .select('*')
        .eq('user_id', user.id)
        .order('olusturma_tarihi', { ascending: false });
        
      if (error) throw error;
      
      setKaydedilmisPlanlar(data || []);
      
      // Eğer kaydedilmiş plan varsa, otomatik olarak ilk planı yükle
      if (data && data.length > 0) {
        // İlk planı otomatik olarak yükle
        yukleBeslenmePlani(data[0]);
        setBasariliMesaj('Kaydedilmiş beslenme planınız otomatik olarak yüklendi!');
      }
    } catch (err) {
      console.error('Beslenme planları yüklenirken hata:', err.message);
      setError('Beslenme planları yüklenirken bir hata oluştu.');
    } finally {
      setPlanlarYukleniyor(false);
    }
  };

  // Diyet tipine göre oran seçimi
  const oranlar = diyetTipi === 'mideAmeliyati' ? mideAmeliyatiOranlar : normalOranlar;

  // Mide ameliyatı sonrası yemek filtresi
  const filterMealsForGastricSurgery = (meals) => {
    return meals.filter(meal => {
      // Mide ameliyatı sonrası uygun yiyecekler (düşük yağlı, kolay sindirilebilir)
      return meal.yag < 10 && meal.porsiyon_buyuklugu !== 'Büyük';
    });
  };

  const getMealsForCategory = (kategori, alreadyUsedMeals, gun = 0) => {
    const hedefKalori = userCalories * oranlar[kategori];
    let kategoriYemekleri = yemekler.filter(
      y => y.kategori === kategori && !alreadyUsedMeals.has(y.id + '-' + gun)
    );

    // Mide ameliyatı sonrası diyet için yemekleri filtrele
    if (diyetTipi === 'mideAmeliyati') {
      kategoriYemekleri = filterMealsForGastricSurgery(kategoriYemekleri);
    }

    let secilenYemekler = [];
    let toplamKalori = 0;

    // Kalori hedefi tamamlanana kadar yemek seç
    while (toplamKalori < hedefKalori && kategoriYemekleri.length > 0) {
      const index = Math.floor(Math.random() * kategoriYemekleri.length);
      const rastgele = kategoriYemekleri[index];

      // Eğer yemeği seçersek hedef kaloriyi aşmıyorsa, ekle
      if (toplamKalori + rastgele.kalori <= hedefKalori) {
        toplamKalori += rastgele.kalori;
        secilenYemekler.push(rastgele);
        alreadyUsedMeals.add(rastgele.id + '-' + gun); // Aynı yemeği bir daha eklememek için
      }

      // Seçilen yemeği listeden çıkar
      kategoriYemekleri.splice(index, 1);
    }

    return secilenYemekler;
  };

  const kategoriler = Object.keys(oranlar);
  const alreadyUsedMeals = new Set(); // Tekrar kontrolü

  // Günlük görünüm
  const renderGunlukGorunum = () => {
    return (
      <div className="grid gap-6">
        {kategoriler.map((kategori, idx) => {
          const secilenYemekler = getMealsForCategory(kategori, alreadyUsedMeals);
          return (
            <motion.div 
              key={kategori} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
                  {iconMap[kategori]} {kategori}
                </h2>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <FaChartPie className="mr-1 text-blue-500" size={14} />
                  {Math.round(userCalories * oranlar[kategori])} kcal
                </div>
              </div>
              
              {secilenYemekler.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {secilenYemekler.map((yemek, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{yemek.ad}</h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {yemek.kalori} kcal
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <p className="text-xs text-gray-500">Protein</p>
                          <p className="font-medium text-blue-700">{yemek.protein}g</p>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded text-center">
                          <p className="text-xs text-gray-500">Karb</p>
                          <p className="font-medium text-yellow-700">{yemek.karbonhidrat}g</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded text-center">
                          <p className="text-xs text-gray-500">Yağ</p>
                          <p className="font-medium text-red-700">{yemek.yag}g</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <p>Bu kategori için uygun yemek bulunamadı.</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Haftalık görünüm
  const renderHaftalikGorunum = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="overflow-x-auto bg-white rounded-xl shadow-md p-1"
      >
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
              <th className="py-4 px-4 text-left font-semibold text-blue-800 rounded-tl-xl">Gün / Öğün</th>
              {kategoriler.map((kategori, idx) => (
                <th key={kategori} className={`py-4 px-4 text-left font-semibold text-blue-800 ${idx === kategoriler.length - 1 ? 'rounded-tr-xl' : ''}`}>
                  <div className="flex items-center gap-2">
                    {iconMap[kategori]} {kategori}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gunler.map((gun, gunIndex) => {
              return (
                <tr key={gun} className={`${gunIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}>
                  <td className="py-3 px-4 border-b font-medium text-gray-700">{gun}</td>
                  {kategoriler.map((kategori) => {
                    const secilenYemekler = getMealsForCategory(kategori, alreadyUsedMeals, gunIndex);
                    return (
                      <td key={kategori} className="py-3 px-4 border-b">
                        <div className="flex flex-wrap gap-1">
                          {secilenYemekler.map((yemek, index) => (
                            <span key={index} className="inline-flex items-center bg-gradient-to-r from-green-100 to-green-50 text-green-800 text-xs px-3 py-1 rounded-full shadow-sm">
                              {yemek.ad} 
                              <span className="ml-1 font-semibold">{yemek.kalori} kcal</span>
                            </span>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    );
  };

  // Aylık görünüm
  const renderAylikGorunum = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {ayGunleri.map((gun, idx) => (
          <motion.div 
            key={gun} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.01 }}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 -mx-4 -mt-4 px-4 py-3 mb-4">
              <h3 className="text-lg font-bold text-center text-white">Gün {gun}</h3>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {kategoriler.map((kategori) => {
                const secilenYemekler = getMealsForCategory(kategori, alreadyUsedMeals, gun);
                return (
                  <div key={kategori} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                    <div className="font-medium flex items-center gap-1 mb-1 text-gray-700">
                      {iconMap[kategori]} {kategori}
                    </div>
                    <div className="ml-5">
                      {secilenYemekler.length > 0 ? secilenYemekler.map((yemek, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                          <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                          <span className="flex-1">{yemek.ad}</span>
                          <span className="font-medium text-blue-600">{yemek.kalori} kcal</span>
                        </div>
                      )) : (
                        <div className="text-xs text-gray-400 italic">Yemek bulunamadı</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Görünüm tipine göre içerik render etme
  const renderContent = () => {
    switch (gorunumTipi) {
      case 'haftalik':
        return renderHaftalikGorunum();
      case 'aylik':
        return renderAylikGorunum();
      default:
        return renderGunlukGorunum();
    }
  };

  // Diyet tipi değiştirme fonksiyonu
  const handleDiyetTipiChange = (e) => {
    setDiyetTipi(e.target.value);
    // Yeni diyet tipine göre yemekleri yeniden seçmek için kullanılan yemekleri sıfırla
    alreadyUsedMeals.clear();
  };
  
  // Beslenme planını kaydetme fonksiyonu
  const kaydetBeslenmePlani = async () => {
    setPlanKaydediliyor(true);
    setBasariliMesaj('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı.');
      
      // Mevcut planı JSON olarak hazırla
      let planIcerik;
      
      if (gorunumTipi === 'gunluk') {
        // Günlük plan için kategorilere göre seçilen yemekleri topla
        const gunlukPlan = {};
        kategoriler.forEach(kategori => {
          gunlukPlan[kategori] = getMealsForCategory(kategori, new Set());
        });
        planIcerik = gunlukPlan;
      } else if (gorunumTipi === 'haftalik') {
        // Haftalık plan için günlere ve kategorilere göre seçilen yemekleri topla
        const haftalikPlan = {};
        gunler.forEach((gun, gunIndex) => {
          haftalikPlan[gun] = {};
          kategoriler.forEach(kategori => {
            haftalikPlan[gun][kategori] = getMealsForCategory(kategori, new Set(), gunIndex);
          });
        });
        planIcerik = haftalikPlan;
      } else { // aylik
        // Aylık plan için günlere ve kategorilere göre seçilen yemekleri topla
        const aylikPlan = {};
        ayGunleri.forEach(gun => {
          aylikPlan[`Gün ${gun}`] = {};
          kategoriler.forEach(kategori => {
            aylikPlan[`Gün ${gun}`][kategori] = getMealsForCategory(kategori, new Set(), gun);
          });
        });
        planIcerik = aylikPlan;
      }
      
      // Planı veritabanına kaydet
      const { error } = await supabase
        .from('beslenme_planlari')
        .insert({
          user_id: user.id,
          plan_tipi: gorunumTipi,
          diyet_tipi: diyetTipi,
          plan_icerik: planIcerik
        });
        
      if (error) throw error;
      
      // Başarılı mesajı göster
      setBasariliMesaj('Beslenme planınız başarıyla kaydedildi!');
      
      // Kaydedilmiş planları yeniden yükle
      getirKaydedilmisPlanlar();
    } catch (err) {
      console.error('Plan kaydedilirken hata:', err.message);
      setError('Beslenme planı kaydedilirken bir hata oluştu.');
    } finally {
      setPlanKaydediliyor(false);
    }
  };
  
  // Kaydedilmiş planı yükleme fonksiyonu
  const yukleBeslenmePlani = (plan) => {
    setGorunumTipi(plan.plan_tipi);
    setDiyetTipi(plan.diyet_tipi);
    
    // Planı yükledikten sonra modalı kapat
    setPlanlarModalAcik(false);
    
    // Başarılı mesajı göster
    setBasariliMesaj('Kaydedilmiş beslenme planı yüklendi!');
    
    // Plan içeriğini de yükle (eğer varsa)
    if (plan.plan_icerik) {
      // Plan içeriğini kullanarak UI'ı güncelle
      // Bu kısım plan içeriğinin yapısına göre değişebilir
      console.log('Plan içeriği yüklendi:', plan.plan_icerik);
    }
  };
  
  // Kaydedilmiş planları listeleyen modal
  const renderKaydedilmisPlanlarModal = () => {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${planlarModalAcik ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Kaydedilmiş Beslenme Planları</h2>
            <button 
              onClick={() => setPlanlarModalAcik(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {planlarYukleniyor ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2">Planlar yükleniyor...</p>
            </div>
          ) : kaydedilmisPlanlar.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Henüz kaydedilmiş beslenme planınız bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {kaydedilmisPlanlar.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">
                        {plan.plan_tipi === 'gunluk' ? 'Günlük Plan' : 
                         plan.plan_tipi === 'haftalik' ? 'Haftalık Plan' : 'Aylık Plan'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {plan.diyet_tipi === 'normal' ? 'Normal Diyet' : 'Mide Ameliyatı Sonrası Diyet'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(plan.olusturma_tarihi).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <button
                      onClick={() => yukleBeslenmePlani(plan)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Yükle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-800 flex items-center justify-center gap-2">
            <HiOutlineSparkles className="text-yellow-500" />
            <span>Beslenme Planı</span>
            <HiOutlineSparkles className="text-yellow-500" />
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
            {userCalories && (
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-lg font-medium">
                <FaChartPie className="mr-2 text-blue-600" />
                Hedef: <span className="font-bold ml-1">{userCalories} kcal</span>
              </div>
            )}
            {kaydedilmisPlanlar.length > 0 && (
              <button
                onClick={() => setPlanlarModalAcik(true)}
                className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-lg font-medium hover:bg-green-200 transition-colors duration-200"
              >
                <FaList className="mr-2 text-green-600" />
                Kayıtlı Planlarım ({kaydedilmisPlanlar.length})
              </button>
            )}
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md shadow-sm"
          >
            <p className="text-red-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </motion.div>
        )}

        {/* Görünüm ve Diyet Tipi Seçenekleri */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-auto">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Görünüm Tipi</h3>
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                <button
                  onClick={() => setGorunumTipi('gunluk')}
                  className={`flex items-center gap-1 px-4 py-2 rounded-md transition-all duration-200 ${gorunumTipi === 'gunluk' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'bg-white hover:bg-gray-100'}`}
                >
                  <FaCalendarDay /> Günlük
                </button>
                <button
                  onClick={() => setGorunumTipi('haftalik')}
                  className={`flex items-center gap-1 px-4 py-2 rounded-md transition-all duration-200 ${gorunumTipi === 'haftalik' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'bg-white hover:bg-gray-100'}`}
                >
                  <FaCalendarWeek /> Haftalık
                </button>
                <button
                  onClick={() => setGorunumTipi('aylik')}
                  className={`flex items-center gap-1 px-4 py-2 rounded-md transition-all duration-200 ${gorunumTipi === 'aylik' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'bg-white hover:bg-gray-100'}`}
                >
                  <FaCalendarAlt /> Aylık
                </button>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Diyet Tipi</h3>
              <select
                value={diyetTipi}
                onChange={handleDiyetTipiChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="normal">Normal Diyet</option>
                <option value="mideAmeliyati">Mide Ameliyatı Sonrası</option>
              </select>
            </div>
          </div>
        </div>

      {/* Diyet Tipi Açıklaması */}
      <AnimatePresence>
        {diyetTipi === 'mideAmeliyati' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500 p-4 mb-6 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <FaUserMd className="text-blue-600" />
              </div>
              <h3 className="font-bold text-blue-700">Mide Ameliyatı Sonrası Diyet Planı</h3>
            </div>
            <p className="text-sm text-blue-800 mt-3 ml-10">
              Bu plan, mide ameliyatı sonrası beslenme ihtiyaçlarınıza göre özelleştirilmiştir. Daha küçük porsiyonlar, düşük yağlı ve kolay sindirilebilir yiyecekler içerir.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* İçerik Render */}
      {renderContent()}

      {/* Başarılı Mesajı */}
      <AnimatePresence>
        {basariliMesaj && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-green-50 to-white border-l-4 border-green-500 p-4 mb-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-green-700 font-medium">{basariliMesaj}</p>
                {basariliMesaj.includes('otomatik olarak yüklendi') && (
                  <p className="text-green-600 text-xs mt-1">
                    Farklı bir plan görmek için "Kayıtlı Planlarım" butonuna tıklayabilirsiniz.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Kaydetme ve Planları Görüntüleme Butonları */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2"
          onClick={kaydetBeslenmePlani}
          disabled={planKaydediliyor}
        >
          {planKaydediliyor ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <FaSave size={18} />
              <span>Planı Kaydet</span>
            </>
          )}
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2"
          onClick={() => setPlanlarModalAcik(true)}
        >
          <FaList size={18} />
          <span>Kaydedilmiş Planlar</span>
        </motion.button>
      </div>
      
      {/* Kaydedilmiş Planlar Modalı */}
      <AnimatePresence>
        {planlarModalAcik && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaList className="text-blue-500" />
                  Kaydedilmiş Beslenme Planları
                </h2>
                <button 
                  onClick={() => setPlanlarModalAcik(false)}
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {planlarYukleniyor ? (
                <div className="text-center py-12">
                  <svg className="animate-spin h-12 w-12 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-lg text-gray-600">Planlar yükleniyor...</p>
                </div>
              ) : kaydedilmisPlanlar.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FaList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-gray-500">Henüz kaydedilmiş beslenme planınız bulunmamaktadır.</p>
                  <p className="text-sm text-gray-400 mt-2">Planlarınızı kaydetmek için "Planı Kaydet" butonunu kullanabilirsiniz.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {kaydedilmisPlanlar.map((plan) => (
                    <motion.div 
                      key={plan.id} 
                      whileHover={{ scale: 1.01 }}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors duration-200 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            {plan.plan_tipi === 'gunluk' ? <FaCalendarDay className="text-blue-500" /> : 
                             plan.plan_tipi === 'haftalik' ? <FaCalendarWeek className="text-green-500" /> : 
                             <FaCalendarAlt className="text-purple-500" />}
                            <h3 className="font-medium text-lg">
                              {plan.plan_tipi === 'gunluk' ? 'Günlük Plan' : 
                               plan.plan_tipi === 'haftalik' ? 'Haftalık Plan' : 'Aylık Plan'}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {plan.diyet_tipi === 'normal' ? 
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaUtensils className="mr-1" size={10} /> Normal Diyet
                              </span> : 
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <FaUserMd className="mr-1" size={10} /> Mide Ameliyatı Sonrası
                              </span>
                            }
                            <span className="text-xs text-gray-400">
                              {new Date(plan.olusturma_tarihi).toLocaleString('tr-TR')}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => yukleBeslenmePlani(plan)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-all duration-200 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                          </svg>
                          Yükle
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default YemeklerListesi;
