import React from 'react';
import './GaugeChart.css';

const GaugeChart = ({ value = 0, label = 'Suitability' }) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  let colorClass = 'gauge-red';
  if (normalizedValue >= 75) colorClass = 'gauge-green';
  else if (normalizedValue >= 40) colorClass = 'gauge-yellow';

  const rotation = (normalizedValue / 100) * 180;

  return (
    <div className="gauge-container">
      <div className="gauge-body">
        <div className={`gauge-fill ${colorClass}`} style={{ transform: `rotate(${rotation}deg)` }}></div>
        <div className="gauge-cover">{normalizedValue}%</div>
      </div>
      <div className="gauge-label">{label}</div>
    </div>
  );
};

export default GaugeChart;
