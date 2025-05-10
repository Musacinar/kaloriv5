import React, { useState } from 'react';
import { Edit2, Trash2, Info } from 'lucide-react';
import { useYemek } from '../baglam/YemekBaglami';
import { Yemek } from '../tipler';
import Modal from './Modal';
import YemekEklemeFormu from './YemekEklemeFormu';
import { ogunSiralama } from '../yardimcilar';

interface YemekListesiProps {
  baslik: string;
  yemekler: Yemek[];
  ogun?: string;
}

const YemekListesi: React.FC<YemekListesiProps> = ({ baslik, yemekler, ogun }) => {
  const { yemekSil } = useYemek();
  const [seciliYemek, setSeciliYemek] = useState<Yemek | null>(null);
  const [duzenleModalAcik, setDuzenleModalAcik] = useState(false);
  const [detayModalAcik, setDetayModalAcik] = useState(false);

  // Öğüne göre sıralama yapılıyor
  const siraliYemekler = [...yemekler].sort((a, b) => {
    if (ogun) return 0; // Zaten öğüne göre filtrelenmiş
    return (ogunSiralama[a.ogun] || 0) - (ogunSiralama[b.ogun] || 0);
  });

  const handleDuzenle = (yemek: Yemek) => {
    setSeciliYemek(yemek);
    setDuzenleModalAcik(true);
  };

  const handleDetay = (yemek: Yemek) => {
    setSeciliYemek(yemek);
    setDetayModalAcik(true);
  };

  const handleSil = (id: string) => {
    if (confirm('Bu yemeği silmek istediğinizden emin misiniz?')) {
      yemekSil(id);
    }
  };

  if (siraliYemekler.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-5 mb-5">
        <h2 className="font-semibold text-lg text-gray-800 mb-3">{baslik}</h2>
        <p className="text-gray-500 text-center py-4">Henüz yemek eklenmemiş.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5">
      <div className="p-5">
        <h2 className="font-semibold text-lg text-gray-800 mb-3">{baslik}</h2>
        <div className="space-y-3">
          {siraliYemekler.map(yemek => (
            <div 
              key={yemek.id} 
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-800">{yemek.ad}</h3>
                  {!ogun && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {yemek.ogun}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span>{yemek.kalori} kcal</span>
                  <span className="mx-2">•</span>
                  <span>{yemek.porsiyon} {yemek.birim}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleDetay(yemek)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  aria-label="Detayları Göster"
                >
                  <Info className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleDuzenle(yemek)}
                  className="p-1 text-gray-500 hover:text-yellow-600 transition-colors"
                  aria-label="Düzenle"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleSil(yemek.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  aria-label="Sil"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Düzenleme Modalı */}
      <Modal 
        acik={duzenleModalAcik} 
        kapat={() => setDuzenleModalAcik(false)} 
        baslik="Yemek Düzenle"
      >
        {seciliYemek && (
          <YemekEklemeFormu 
            varsayilanDegerler={seciliYemek}
            kapatModal={() => setDuzenleModalAcik(false)}
            duzenlemeModu={true}
            yemekId={seciliYemek.id}
          />
        )}
      </Modal>
      
      {/* Detay Modalı */}
      <Modal 
        acik={detayModalAcik} 
        kapat={() => setDetayModalAcik(false)} 
        baslik="Yemek Detayları"
      >
        {seciliYemek && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">{seciliYemek.ad}</h3>
              <p className="text-gray-500">{seciliYemek.porsiyon} {seciliYemek.birim}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{seciliYemek.kalori}</p>
              <p className="text-sm text-green-800">kalori</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xl font-bold text-blue-600">{seciliYemek.protein}g</p>
                <p className="text-xs text-blue-800">protein</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-xl font-bold text-yellow-600">{seciliYemek.karbonhidrat}g</p>
                <p className="text-xs text-yellow-800">karbonhidrat</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xl font-bold text-red-600">{seciliYemek.yag}g</p>
                <p className="text-xs text-red-800">yağ</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Öğün:</strong> {seciliYemek.ogun}</p>
              <p><strong>Tarih:</strong> {new Date(seciliYemek.tarih).toLocaleDateString('tr-TR')}</p>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleDuzenle(seciliYemek)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Düzenle
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default YemekListesi;