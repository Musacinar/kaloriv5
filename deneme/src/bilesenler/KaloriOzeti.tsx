import React from 'react';
import { CalendarDays } from 'lucide-react';
import { useYemek } from '../baglam/YemekBaglami';
import { useKullanici } from '../baglam/KullaniciBaglami';
import IlerlemeHalkasi from './IlerlemeHalkasi';
import { tarihFormati, besinRenkleri } from '../yardimcilar';

const KaloriOzeti: React.FC = () => {
  const { bugunToplamKalori, bugunToplamBesinDegerleri } = useYemek();
  const { kullanici } = useKullanici();
  
  const bugun = tarihFormati(new Date().toISOString());
  const toplamKalori = bugunToplamKalori();
  const kalanKalori = kullanici.hedefKalori - toplamKalori;
  const kaloriYuzdesi = Math.min(Math.round((toplamKalori / kullanici.hedefKalori) * 100), 100);
  
  const { protein, karbonhidrat, yag } = bugunToplamBesinDegerleri();
  
  const toplamGram = protein + karbonhidrat + yag;
  const proteinYuzdesi = toplamGram > 0 ? Math.round((protein / toplamGram) * 100) : 0;
  const karbonhidratYuzdesi = toplamGram > 0 ? Math.round((karbonhidrat / toplamGram) * 100) : 0;
  const yagYuzdesi = toplamGram > 0 ? Math.round((yag / toplamGram) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Günlük Özet
          </h2>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 mr-1" />
            <span>{bugun}</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/3 flex justify-center mb-5 md:mb-0">
            <IlerlemeHalkasi 
              yuzde={kaloriYuzdesi} 
              boyut={140}
              renk="#22c55e"
              kalinlik={10}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {toplamKalori}
                </div>
                <div className="text-xs text-gray-500">
                  / {kullanici.hedefKalori} kcal
                </div>
              </div>
            </IlerlemeHalkasi>
          </div>
          
          <div className="w-full md:w-2/3 pl-0 md:pl-6">
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Kalan Kalori
                </span>
                <span className={`text-sm font-medium ${
                  kalanKalori < 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {kalanKalori} kcal
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    kalanKalori < 0 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${kaloriYuzdesi}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <div className="text-sm font-semibold text-gray-700">Protein</div>
                <div className="text-lg font-bold text-blue-600">{protein}g</div>
                <div className="text-xs text-gray-500">{proteinYuzdesi}%</div>
              </div>
              
              <div className="p-2 rounded-lg bg-yellow-50">
                <div className="text-sm font-semibold text-gray-700">Karb</div>
                <div className="text-lg font-bold text-yellow-600">{karbonhidrat}g</div>
                <div className="text-xs text-gray-500">{karbonhidratYuzdesi}%</div>
              </div>
              
              <div className="p-2 rounded-lg bg-red-50">
                <div className="text-sm font-semibold text-gray-700">Yağ</div>
                <div className="text-lg font-bold text-red-600">{yag}g</div>
                <div className="text-xs text-gray-500">{yagYuzdesi}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Besin dağılımı çubuğu */}
      <div className="h-3 w-full flex">
        <div 
          className={besinRenkleri.protein}
          style={{ width: `${proteinYuzdesi}%` }}
        ></div>
        <div 
          className={besinRenkleri.karbonhidrat}
          style={{ width: `${karbonhidratYuzdesi}%` }}
        ></div>
        <div 
          className={besinRenkleri.yag}
          style={{ width: `${yagYuzdesi}%` }}
        ></div>
      </div>
    </div>
  );
};

export default KaloriOzeti;