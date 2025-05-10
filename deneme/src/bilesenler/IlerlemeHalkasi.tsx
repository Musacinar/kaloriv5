import React from 'react';

interface IlerlemeHalkasiProps {
  yuzde: number;
  boyut: number;
  renk: string;
  kalinlik: number;
  children?: React.ReactNode;
}

const IlerlemeHalkasi: React.FC<IlerlemeHalkasiProps> = ({
  yuzde,
  boyut,
  renk,
  kalinlik,
  children
}) => {
  const yaricap = boyut / 2;
  const cevre = 2 * Math.PI * (yaricap - kalinlik / 2);
  const doluluk = cevre * (yuzde / 100);
  const bosluk = cevre - doluluk;
  
  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: boyut, height: boyut }}
    >
      <svg 
        width={boyut} 
        height={boyut} 
        viewBox={`0 0 ${boyut} ${boyut}`}
        className="transform -rotate-90"
      >
        {/* Arka plan halkası */}
        <circle
          cx={yaricap}
          cy={yaricap}
          r={yaricap - kalinlik / 2}
          fill="none"
          stroke="#e9ecef"
          strokeWidth={kalinlik}
        />
        
        {/* İlerleme halkası */}
        <circle
          cx={yaricap}
          cy={yaricap}
          r={yaricap - kalinlik / 2}
          fill="none"
          stroke={renk}
          strokeWidth={kalinlik}
          strokeDasharray={`${doluluk} ${bosluk}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default IlerlemeHalkasi;