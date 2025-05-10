

import React, { useState, useEffect } from 'react';

function BeslenmePlani() {
  const [mealPlan, setMealPlan] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/mealplan?userId=1')
      .then(res => res.json())
      .then(data => {
        console.log('Gelen veri:', data);
        setMealPlan(data);
      })
      .catch(err => {
        console.error('Hata:', err);
      });
  }, []);

  if (!mealPlan) return <p>Yükleniyor...</p>;

  return (
    <div>
      <h2>Beslenme Planı ({mealPlan.date})</h2>
      <p><strong>Toplam Kalori:</strong> {mealPlan.totalKalori}</p>
      <ul>
        {mealPlan.mealPlan.map((item, index) => (
          <li key={index}>{item.meal} - {item.kalori} kalori</li>
        ))}
      </ul>
    </div>
  );
}

export default BeslenmePlani;
