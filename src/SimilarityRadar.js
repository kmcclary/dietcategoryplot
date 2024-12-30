import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Balanced Omnivore', value: 0.92 },
  { name: 'Pescatarian', value: 0.81 },
  { name: 'Vegetarian', value: 0.30 },
  { name: 'Vegan', value: 0.15 },
  { name: 'Paleo', value: 0.55 },
  { name: 'Keto', value: 0.25 },
  { name: 'Carnivore', value: 0.10 }
];

const SimilarityRadar = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: '400px', 
      backgroundColor: '#f0f0f0', 
      padding: '20px',
      border: '1px solid #ccc'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Diet Similarity</h2>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <Radar
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimilarityRadar;