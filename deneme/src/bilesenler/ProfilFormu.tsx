// import React, { useState, useEffect } from 'react';
// import { useKullanici } from '../baglam/KullaniciBaglami';
// import { Kullanici } from '../tipler';
// import { aktiviteDuzeyiAciklamalari } from '../yardimcilar';
// import { supabase } from '../lib/supabase';

// const ProfilFormu: React.FC = () => {
//   const { kullanici, kullaniciGuncelle } = useKullanici();
  
//   const [profilVerisi, setProfilVerisi] = useState<Kullanici>({
//     ...kullanici
//   });
  
//   const [hata, setHata] = useState('');
//   const [basarili, setBasarili] = useState(false);
//   const [yukleniyor, setYukleniyor] = useState(false);
  
//   // useEffect hook moved inside the component
//   useEffect(() => {
//     const fetchProfil = async () => {
//       setYukleniyor(true);
//       try {
//         const { data: { user }, error: userError } = await supabase.auth.getUser(); 
//         if (userError || !user) {
//           console.error('Kullanıcı alınamadı:', userError?.message);
//           return;
//         }

//         const { data, error } = await supabase
//           .from('profiles')
//           .select('*')
//           .eq('user_id', user.id)
//           .single();
          
//         if (error) {
//           console.error('Profil verisi alınamadı:', error.message);
//         } else if (data) {
//           // Veritabanından gelen verileri profilVerisi state'ine aktar
//           setProfilVerisi(prevData => ({
//             ...prevData,
//             ...data
//           }));
//         }
//       } catch (err) {
//         console.error('Profil verisi alınırken hata oluştu:', err);
//       } finally {
//         setYukleniyor(false);
//       }
//     };

//     fetchProfil();
//   }, []);
  
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
    
//     if (['yas', 'kilo', 'boy'].includes(name)) {
//       setProfilVerisi({
//         ...profilVerisi,
//         [name]: parseFloat(value) || 0
//       });
//     } else {
//       setProfilVerisi({
//         ...profilVerisi,
//         [name]: value
//       });
//     }
//   };
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
  
//     // Doğrulamalar (zaten mevcut)
//     if (!profilVerisi.ad) {
//       setHata('Lütfen adınızı girin.');
//       setBasarili(false);
//       return;
//     }
//     if (profilVerisi.yas <= 0 || profilVerisi.kilo <= 0 || profilVerisi.boy <= 0) {
//       setHata('Lütfen geçerli bilgiler girin.');
//       setBasarili(false);
//       return;
//     }
  
//     // Kullanıcı güncellemesi bağlamda varsa çalıştır
//     kullaniciGuncelle(profilVerisi);
  
//     try {
//       const { data: { user }, error: userError } = await supabase.auth.getUser();
//       if (userError || !user) throw new Error('Kullanıcı alınamadı');
  
//       const { error } = await supabase
//         .from('profiles') // tablo adın buysa
//         .update({
//           ad: profilVerisi.ad,
//           yas: profilVerisi.yas,
//           cinsiyet: profilVerisi.cinsiyet,
//           boy: profilVerisi.boy,
//           kilo: profilVerisi.kilo,
//           aktivite_duzeyi: profilVerisi.aktivite_duzeyi,
//           hedef: profilVerisi.hedef
//         })
//         .eq('user_id', user.id); // kullanıcıya özel satırı güncelle
  
//       if (error) throw error;
  
//       setHata('');
//       setBasarili(true);
//       setTimeout(() => setBasarili(false), 3000);
//     } catch (err: any) {
//       setHata(err.message || 'Bir hata oluştu.');
//       setBasarili(false);
//     }
//   };
  
//   // Update handleSubmit to save to Supabase
//  /* const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setYukleniyor(true);
    
//     // Validation checks
//     if (!profilVerisi.ad) {
//       setHata('Lütfen adınızı girin.');
//       setBasarili(false);
//       setYukleniyor(false);
//       return;
//     }
    
//     if (profilVerisi.yas <= 0) {
//       setHata('Lütfen geçerli bir yaş girin.');
//       setBasarili(false);
//       return;
//     }
    
//     if (profilVerisi.kilo <= 0) {
//       setHata('Lütfen geçerli bir kilo girin.');
//       setBasarili(false);
//       return;
//     }
    
//     if (profilVerisi.boy <= 0) {
//       setHata('Lütfen geçerli bir boy girin.');
//       setBasarili(false);
//       return;
//     }

//     try {
//       // Get current user
//       const { data: { user }, error: userError } = await supabase.auth.getUser();
//       if (userError || !user) {
//         throw new Error('Kullanıcı bilgisi alınamadı');
//       }
      
//       // Update profile in Supabase
//       const { error } = await supabase
//         .from('profiles')
//         .upsert({ 
//           user_id: user.id,
//           ...profilVerisi
//         }, { 
//           onConflict: 'user_id' 
//         });
        
//       if (error) {
//         throw new Error(`Profil güncellenemedi: ${error.message}`);
//       }
      
//       // Update local state
//       kullaniciGuncelle(profilVerisi);
//       setHata('');
//       setBasarili(true);
      
//       setTimeout(() => {
//         setBasarili(false);
//       }, 3000);
//     } catch (err) {
//       console.error('Profil güncellenirken hata:', err);
//       setHata(err instanceof Error ? err.message : 'Profil güncellenirken bir hata oluştu');
//       setBasarili(false);
//     } finally {
//       setYukleniyor(false);
//     }
//   };
//   */
//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4">Kişisel Bilgiler</h2>
      
//       {yukleniyor && (
//         <div className="text-blue-500 text-sm p-2 bg-blue-50 border border-blue-100 rounded">
//           Yükleniyor...
//         </div>
//       )}
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label htmlFor="ad" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
//           <input
//             type="text"
//             id="ad"
//             name="ad"
//             value={profilVerisi.ad}
//             onChange={handleInputChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white border p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
//             placeholder="Ad Soyad"
//           />
//         </div>
        
//         <div>
//           <label htmlFor="yas" className="block text-sm font-medium text-gray-700">Yaş</label>
//           <input
//             type="number"
//             id="yas"
//             name="yas"
//             value={profilVerisi.yas}
//             onChange={handleInputChange}
//             min="1"
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white border p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
//           />
//         </div>
        
//         <div>
//           <label htmlFor="cinsiyet" className="block text-sm font-medium text-gray-700">Cinsiyet</label>
//           <select
//             id="cinsiyet"
//             name="cinsiyet"
//             value={profilVerisi.cinsiyet}
//             onChange={handleInputChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white border p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
//           >
//             <option value="Erkek">Erkek</option>
//             <option value="Kadın">Kadın</option>
//             <option value="Diğer">Diğer</option>
//           </select>
//         </div>
        
//         <div>
//           <label htmlFor="kilo" className="block text-sm font-medium text-gray-700">Kilo (kg)</label>
//           <input
//             type="number"
//             id="kilo"
//             name="kilo"
//             value={profilVerisi.kilo}
//             onChange={handleInputChange}
//             min="1"
//             step="0.1"
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white border p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
//           />
//         </div>
        
//         <div>
//           <label htmlFor="boy" className="block text-sm font-medium text-gray-700">Boy (cm)</label>
//           <input
//             type="number"
//             id="boy"
//             name="boy"
//             value={profilVerisi.boy}
//             onChange={handleInputChange}
//             min="1"
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white border p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
//           />
//         </div>
//       </div>
      
//       <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Aktivite ve Hedef</h2>
      
//       <div className="space-y-4">
//         <div>
//           <label htmlFor="aktiviteDuzeyi" className="block text-sm font-medium text-gray-700">Aktivite Düzeyi</label>
//           <select
//             id="aktiviteDuzeyi"
//             name="aktiviteDuzeyi"
//             value={profilVerisi.aktivite_duzeyi}
//             onChange={handleInputChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white border p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
//           >
//             {Object.entries(aktiviteDuzeyiAciklamalari).map(([duzey, aciklama]) => (
//               <option key={duzey} value={duzey}>{duzey} - {aciklama}</option>
//             ))}
//           </select>
//         </div>
        
//         <div>
//           <label htmlFor="hedef" className="block text-sm font-medium text-gray-700">Hedefiniz</label>
//           <select
//             id="hedef"
//             name="hedef"
//             value={profilVerisi.hedef}
//             onChange={handleInputChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-white border p-2 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
//           >
//             <option value="Kilo Vermek">Kilo Vermek</option>
//             <option value="Kilo Almak">Kilo Almak</option>
//             <option value="Kiloyu Korumak">Kiloyu Korumak</option>
//           </select>
//         </div>
//       </div>
      
//       {hata && (
//         <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-100 rounded">
//           {hata}
//         </div>
//       )}
      
//       {basarili && (
//         <div className="text-green-500 text-sm p-2 bg-green-50 border border-green-100 rounded animate-fadeIn">
//           Profiliniz başarıyla güncellendi!
//         </div>
//       )}
      
//       <div className="flex justify-end">
//         <button
//           type="submit"
//           disabled={yukleniyor}
//           className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${yukleniyor ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
//         >
//           {yukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default ProfilFormu;
import React, { useState, useEffect } from 'react';
import { useKullanici } from '../baglam/KullaniciBaglami';
import { Kullanici } from '../tipler';
import { aktiviteDuzeyiAciklamalari, hesaplaGunlukKalori, hesaplaVKI } from '../yardimcilar';
import { supabase } from '../lib/supabase';

const ProfilFormu: React.FC = () => {
  const { kullanici, kullaniciGuncelle } = useKullanici();

  const [profilVerisi, setProfilVerisi] = useState<Kullanici>({
    ad: '',
    yas: 0,
    cinsiyet: '',
    boy: 0,
    kilo: 0,
    aktivite_duzeyi: '',
    hedef: '',
  });

  const [hata, setHata] = useState('');
  const [basarili, setBasarili] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    const fetchProfil = async () => {
      setYukleniyor(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('Kullanıcı alınamadı');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setProfilVerisi(prev => ({
          ...prev,
          ...data,
        }));
      } catch (err) {
        console.error('Profil verisi alınırken hata:', err);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchProfil();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfilVerisi(prev => ({
      ...prev,
      [name]: ['yas', 'kilo', 'boy'].includes(name) ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setBasarili(false);
    setYukleniyor(true);

    if (!profilVerisi.ad) {
      setHata('Lütfen adınızı girin.');
      setYukleniyor(false);
      return;
    }
    if (profilVerisi.yas <= 0 || profilVerisi.kilo <= 0 || profilVerisi.boy <= 0) {
      setHata('Lütfen geçerli bilgiler girin.');
      setYukleniyor(false);
      return;
    }

    try {
      // Günlük kalori ihtiyacını hesapla
      const hesaplananKalori = hesaplaGunlukKalori(profilVerisi);
      
      // VKİ hesapla
      const vki = hesaplaVKI(profilVerisi.kilo, profilVerisi.boy);
      
      // VKİ kategorisini belirle
      let vkiKategori = '';
      if (vki < 18.5) vkiKategori = 'zayif';
      else if (vki < 25) vkiKategori = 'normal';
      else if (vki < 30) vkiKategori = 'kilolu';
      else vkiKategori = 'obez';
      
      // Hesaplanan kalori değerini profilVerisi'ne ekle
      const guncelProfilVerisi = {
        ...profilVerisi,
        hedefKalori: hesaplananKalori,
        vki: vki,
        vki_kategori: vkiKategori
      };

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Kullanıcı alınamadı');

      const { error } = await supabase
        .from('profiles')
        .update({
          ad: profilVerisi.ad,
          yas: profilVerisi.yas,
          cinsiyet: profilVerisi.cinsiyet,
          boy: profilVerisi.boy,
          kilo: profilVerisi.kilo,
          aktivite_duzeyi: profilVerisi.aktivite_duzeyi,
          hedef: profilVerisi.hedef,
          hedef_kalori: hesaplananKalori, // Hesaplanan kalori değerini veritabanına kaydet
          vki: vki, // VKİ değerini veritabanına kaydet
          vki_kategori: vkiKategori // VKİ kategorisini veritabanına kaydet
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Hesaplanan kalori değerini içeren güncel profil verisini kullanıcı bağlamına aktar
      kullaniciGuncelle(guncelProfilVerisi);
      setBasarili(true);
      setTimeout(() => setBasarili(false), 3000);
    } catch (err: any) {
      setHata(err.message || 'Bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Kişisel Bilgiler</h2>

      {yukleniyor && <div className="text-blue-500 text-sm p-2 bg-blue-50 border border-blue-100 rounded">Yükleniyor...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ad" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
          <input type="text" id="ad" name="ad" value={profilVerisi.ad || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:border-green-500" placeholder="Ad Soyad" />
        </div>
        <div>
          <label htmlFor="yas" className="block text-sm font-medium text-gray-700">Yaş</label>
          <input type="number" id="yas" name="yas" value={profilVerisi.yas || ''} onChange={handleInputChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:border-green-500" />
        </div>
        <div>
          <label htmlFor="cinsiyet" className="block text-sm font-medium text-gray-700">Cinsiyet</label>
          <select id="cinsiyet" name="cinsiyet" value={profilVerisi.cinsiyet || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:border-green-500">
            <option value="">-- Seçiniz --</option>
            <option value="Erkek">Erkek</option>
            <option value="Kadın">Kadın</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>
        <div>
          <label htmlFor="kilo" className="block text-sm font-medium text-gray-700">Kilo (kg)</label>
          <input type="number" id="kilo" name="kilo" value={profilVerisi.kilo || ''} onChange={handleInputChange} min="1" step="0.1" className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:border-green-500" />
        </div>
        <div>
          <label htmlFor="boy" className="block text-sm font-medium text-gray-700">Boy (cm)</label>
          <input type="number" id="boy" name="boy" value={profilVerisi.boy || ''} onChange={handleInputChange} min="1" className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:border-green-500" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Aktivite ve Hedef</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="aktivite_duzeyi" className="block text-sm font-medium text-gray-700">Aktivite Düzeyi</label>
          <select id="aktivite_duzeyi" name="aktivite_duzeyi" value={profilVerisi.aktivite_duzeyi || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:border-green-500">
            <option value="">-- Seçiniz --</option>
            {Object.entries(aktiviteDuzeyiAciklamalari).map(([duzey, aciklama]) => (
              <option key={duzey} value={duzey}>{duzey} - {aciklama}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hedef" className="block text-sm font-medium text-gray-700">Hedefiniz</label>
          <select id="hedef" name="hedef" value={profilVerisi.hedef || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 p-2 focus:border-green-500">
            <option value="">-- Seçiniz --</option>
            <option value="Kilo Vermek">Kilo Vermek</option>
            <option value="Kilo Almak">Kilo Almak</option>
            <option value="Kiloyu Korumak">Kiloyu Korumak</option>
          </select>
        </div>
      </div>

      {hata && <div className="text-red-500 text-sm p-2 bg-red-50 border border-red-100 rounded">{hata}</div>}
      {basarili && <div className="text-green-500 text-sm p-2 bg-green-50 border border-green-100 rounded">Profiliniz başarıyla güncellendi!</div>}

      <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition">Kaydet</button>
    </form>
  );
};

export default ProfilFormu;
