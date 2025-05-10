import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { besinRenkleri } from '../yardimcilar';

interface BesinGrafigiProps {
  protein: number;
  karbonhidrat: number;
  yag: number;
}

const BesinGrafigi: React.FC<BesinGrafigiProps> = ({ 
  protein, 
  karbonhidrat, 
  yag 
}) => {
  const data = [
    { name: 'Protein', value: protein },
    { name: 'Karbonhidrat', value: karbonhidrat },
    { name: 'Yağ', value: yag }
  ].filter(item => item.value > 0);
  
  const COLORS = [
    besinRenkleri.protein.replace('bg-', 'rgb(59, 130, 246)'), // Mavi
    besinRenkleri.karbonhidrat.replace('bg-', 'rgb(234, 179, 8)'), // Sarı
    besinRenkleri.yag.replace('bg-', 'rgb(239, 68, 68)') // Kırmızı
  ];
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent, 
    index 
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  if (data.length === 0) {
    return <div className="text-center text-gray-500 py-10">Veri yok</div>;
  }
  
  const toplamGram = protein + karbonhidrat + yag;
  
  return (
    <div className="flex flex-col md:flex-row items-center">
      <div className="w-full md:w-1/2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}g (${((value / toplamGram) * 100).toFixed(1)}%)`, null]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="w-full md:w-1/2 pl-0 md:pl-6 flex flex-col justify-center">
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-gray-700">Protein</span>
                <span className="font-medium">{protein}g</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(protein / toplamGram) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-gray-700">Karbonhidrat</span>
                <span className="font-medium">{karbonhidrat}g</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(karbonhidrat / toplamGram) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-gray-700">Yağ</span>
                <span className="font-medium">{yag}g</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                <div 
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(yag / toplamGram) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          Toplam: {toplamGram}g
        </div>
      </div>
    </div>
  );
};

export default BesinGrafigi;