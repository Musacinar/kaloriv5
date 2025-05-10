import React, { useState } from 'react';
import { PlusCircle, Filter } from 'lucide-react';
import { useYemek } from '../baglam/YemekBaglami';
import YemekListesi from '../bilesenler/YemekListesi';
import Modal from '../bilesenler/Modal';
import YemekEklemeFormu from '../bilesenler/YemekEklemeFormu';
import { tarihFormati } from '../yardimcilar';

const YemekGirisiSayfasi: React.FC = () => {
  const { bugunYemekler } = useYemek();
  const [yemekEkleModalAcik, setYemekEkleModalAcik] = useState(false);
  const [filtreModalAcik, setFiltreModalAcik] = useState(false);
  const [ogunFiltresi, setOgunFiltresi] = useState<string | null>(null);
  
  const tumYemekler = bugunYemekler();
  
  const filtrelenmisYemekler = ogunFiltresi 
    ? tumYemekler.filter(yemek => yemek.ogun === ogunFiltresi)
    : tumYemekler;
  
  const tarih = new Date().toISOString().split('T')[0];
  const formatlananTarih = tarihFormati(tarih);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Yemek Kayıtları
          </h1>
          <p className="text-gray-600">{formatlananTarih}</p>
        </div>
        
        <div className="flex mt-4 sm:mt-0 space-x-3">
          <button
            onClick={() => setFiltreModalAcik(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <Filter className="h-5 w-5 mr-2" />
            {ogunFiltresi ? `Filtre: ${ogunFiltresi}` : 'Filtrele'}
          </button>
          
          <button
            onClick={() => setYemekEkleModalAcik(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Yemek Ekle
          </button>
        </div>
      </div>
      
      <YemekListesi
        baslik={ogunFiltresi ? `${ogunFiltresi} Yemekleri` : "Bugünkü Tüm Yemekler"}
        yemekler={filtrelenmisYemekler}
      />
      
      <Modal 
        acik={yemekEkleModalAcik} 
        kapat={() => setYemekEkleModalAcik(false)} 
        baslik="Yemek Ekle"
      >
        <YemekEklemeFormu kapatModal={() => setYemekEkleModalAcik(false)} />
      </Modal>
      
      <Modal 
        acik={filtreModalAcik} 
        kapat={() => setFiltreModalAcik(false)} 
        baslik="Öğüne Göre Filtrele"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği', 'Ara Öğün'].map((ogun) => (
              <button
                key={ogun}
                onClick={() => {
                  setOgunFiltresi(ogun);
                  setFiltreModalAcik(false);
                }}
                className={`p-3 rounded-lg border text-center transition-colors duration-200 ${
                  ogunFiltresi === ogun
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'border-gray-200 hover:bg-green-50'
                }`}
              >
                {ogun}
              </button>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => {
                setOgunFiltresi(null);
                setFiltreModalAcik(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              Filtreyi Temizle
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default YemekGirisiSayfasi;