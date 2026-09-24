import React from 'react';
import { Cloud, Droplets, Thermometer, Wind } from 'lucide-react';
import './WeatherCard.css';

const iconMap = {
  temp: Thermometer,
  rain: Droplets,
  humidity: Cloud,
  wind: Wind
};

const WeatherCard = ({ type = 'temp', title, value, unit }) => {
  const Icon = iconMap[type] || Cloud;
  
  return (
    <div className="weather-card glass-panel">
      <div className="weather-icon-wrapper">
        <Icon className="weather-icon" size={24} />
      </div>
      <div className="weather-info">
        <span className="weather-title">{title}</span>
        <div className="weather-value-wrapper">
          <span className="weather-value">{value}</span>
          <span className="weather-unit">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
