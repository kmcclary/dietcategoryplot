// App.js
import React, { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { dietData } from './dietData.js'; // Adjust path if needed
import SimilarityRadar from './SimilarityRadar.js'; // Adjust path if needed

/**
 * 1) The highest values for each metric across all diets.
 */
const maxValues = {
  red_meat: 1733,
  poultry: 347,
  seafood: 347,
  eggs: 246,
  milk: 347,
  cheese: 347,
  yogurt: 347,
  cream: 347,
  butter: 347,
  whole_fruits: 805,
  juices: 146,
  leaves: 302,
  flowers: 302,
  red_and_orange_vegetables: 302,
  starchy_vegetables: 302,
  stems: 201,
  other_vegetables: 201,
  mushrooms: 101,
  beans_and_lentils: 224,
  soy_products: 79,
  nuts_and_seeds: 83,
  oils: 116,
  refined_sugar: 36,
  whole_grains: 402,
  refined_grains: 146,
  fiber: 60,
  fat_pct: 80,
  carbs_pct: 65,
  protein_pct: 45
};

/**
 * 2) Normalization helper: Convert an actual value to 0–100 based on its maxValue.
 */
const normalize = (value, maxValue) => (value / maxValue) * 100 || 0;

/**
 * 3) We have 29 metrics from your original list.
 */
const metrics = [
  'red_meat',
  'poultry',
  'seafood',
  'eggs',
  'milk',
  'cheese',
  'yogurt',
  'cream',
  'butter',
  'whole_fruits',
  'juices',
  'leaves',
  'flowers',
  'red_and_orange_vegetables',
  'starchy_vegetables',
  'stems',
  'other_vegetables',
  'mushrooms',
  'beans_and_lentils',
  'soy_products',
  'nuts_and_seeds',
  'oils',
  'refined_sugar',
  'whole_grains',
  'refined_grains',
  'fiber',
  'fat_pct',
  'carbs_pct',
  'protein_pct'
];

/**
 * 4) All 8 diets we want to show (including user_diet).
 */
const diets = [
  'user_diet',
  'balanced_omnivore',
  'pescatarian',
  'vegetarian',
  'vegan',
  'paleo',
  'keto',
  'carnivore'
];

/**
 * 5) Colors for each of the 8 diets (used for radar fill/stroke).
 */
const colors = {
  user_diet: '#2196F3',         // bright blue
  balanced_omnivore: 'gold', // light orange
  pescatarian: 'violet',       // light green
  vegetarian: '#66BB6A',        // medium green
  vegan: 'teal',             // deep green
  paleo: '#F57C00',             // medium orange
  keto: 'red',              // dark orange/red
  carnivore: 'maroon'          // deep red
};

/**
 * 6) Build the Recharts "data" array from `dietData`, normalizing each value.
 *    Then SHIFT each diet value so it starts at 20 (not 0).
 */
const getMetricDisplayName = (metric) => {
  return metric
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const CENTER_FILL_RADIUS = 1;   // First ring covers 0–20
const SHIFT_DIET_MIN = 5;       // Shift all diets so 0→20
const SHIFT_FACTOR = 0.9;        // (100–20)/100 => 0.8

const data = metrics.map((metric) => {
  const row = { metric: getMetricDisplayName(metric) };
  const maxValue = maxValues[metric];

  diets.forEach((dietKey) => {
    const rawValue = dietData[dietKey][`${metric}_g_day`] || dietData[dietKey][metric];
    // 1) normalize rawValue → [0..100]
    let normValue = normalize(rawValue, maxValue);
    // 2) SHIFT so normValue=0 becomes SHIFT_DIET_MIN=20
    //    and normValue=100 remains 100
    //    i.e. final = 20 + 0.8 * normValue
    normValue = SHIFT_DIET_MIN + SHIFT_FACTOR * normValue;
    row[dietKey] = normValue;
  });

  // This "centerFill" ring always stays at 20 (the boundary between ring #1 and ring #2).
  // So it visually fills that inner 0–20 circle.
  row.centerFill = CENTER_FILL_RADIUS;

  return row;
});

/**
 * 7) The main App component
 */
const App = () => {
  const [visibleDiets, setVisibleDiets] = useState(
    Object.fromEntries(diets.map((dietKey) => [dietKey, true]))
  );
  const [hoveredDiet, setHoveredDiet] = useState(null);

  const handleLegendClick = (dietKey) => {
    setVisibleDiets((prev) => ({
      ...prev,
      [dietKey]: !prev[dietKey]
    }));
  };

  const getDietDisplayName = (dietKey) => {
    if (dietKey === 'user_diet') return 'Your Diet';
    return dietKey
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRadarOpacity = (dietKey) => {
    if (!visibleDiets[dietKey]) return 0;
    if (!hoveredDiet) return 0.1;
    return dietKey === hoveredDiet ? 0.3 : 0.05;
  };

  const getStrokeOpacity = (dietKey) => {
    if (!visibleDiets[dietKey]) return 0;
    if (!hoveredDiet) return 1;
    return dietKey === hoveredDiet ? 1 : 0.2;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {payload
            // Hide the dummy "centerFill" from the legend, since it’s just a background ring
            .filter((entry) => entry.dataKey !== 'centerFill')
            .map((entry) => {
              const dietKey = entry.dataKey;
              const isVisible = visibleDiets[dietKey];

              return (
                <div
                  key={dietKey}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isVisible ? '#eee' : '#ccc',
                    padding: '0.5rem',
                    borderRadius: '0.25rem'
                  }}
                  onClick={() => handleLegendClick(dietKey)}
                  onMouseEnter={() => setHoveredDiet(dietKey)}
                  onMouseLeave={() => setHoveredDiet(null)}
                >
                  <div
                    style={{
                      backgroundColor: colors[dietKey],
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      marginRight: '8px'
                    }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>
                    {getDietDisplayName(dietKey)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', background: '#fafafa', padding: '1rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Diet Category Radar Chart
      </h1>
      {/* Main radar chart */}
      <div style={{ width: '100%', height: '800px', margin: '0 auto', marginBottom: '2rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            {/**
             * Use circle grid, 5 rings total (0–20–40–60–80–100).
             * You can set radialLines={false} if you don’t want spokes.
             */}
            <PolarGrid gridType="circle" radialLines={false} />

            {/**
             * Domain 0→100 with 6 ticks => 5 segments.
             */}
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={5}
              axisLine={false}
              stroke="#ccc"
              tick={false} 
            />

            <PolarAngleAxis dataKey="metric" tick={{ fill: '#333', fontSize: 12 }} />

            {/**
             * Render a radar to fill the center ring (0–20).
             * This is purely a background shape, so no stroke & full opacity.
             */}
            <Radar
              key="centerFill"
              dataKey="centerFill"
              stroke="none"
              fill="#eeeeee"
              fillOpacity={1}
              isAnimationActive={false}
            />

            {/**
             * A Radar for each of the 8 diets, now shifted to [20..100] range.
             */}
            {diets.map((dietKey) => (
              <Radar
                key={dietKey}
                name={getDietDisplayName(dietKey)}
                dataKey={dietKey}
                stroke={colors[dietKey]}
                fill={colors[dietKey]}
                fillOpacity={getRadarOpacity(dietKey)}
                strokeOpacity={getStrokeOpacity(dietKey)}
              />
            ))}

            <Legend
              content={<CustomLegend />}
              verticalAlign="top"
              align="center"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Similarity radar with explicit dimensions */}
      <div style={{ width: '100%', minHeight: '400px', margin: '2rem auto' }}>
        <SimilarityRadar />
      </div>
    </div>
  );
};

export default App;
