import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DAY_TRANSLATIONS = {
  English: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  'සිංහල': ['ඉරිදා', 'සඳුදා', 'අඟහ', 'බදාදා', 'බ්‍රහස්', 'සිකු', 'සෙන'],
  'தமிழ்': ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
};

const WeatherForecastWidget = () => {
  const { language, t } = useLanguage();
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch 7-day forecast
    fetch('https://api.open-meteo.com/v1/forecast?latitude=7.8731&longitude=80.7718&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FColombo')
      .then(res => res.json())
      .then(data => {
        if (data.daily) {
          const days = [];
          for (let i = 0; i < 7; i++) {
            const dateStr = data.daily.time[i];
            const dateObj = new Date(dateStr);
            const dayOfWeek = dateObj.getDay(); // 0 (Sun) to 6 (Sat)
            
            days.push({
              dayIndex: dayOfWeek,
              max: Math.round(data.daily.temperature_2m_max[i]),
              min: Math.round(data.daily.temperature_2m_min[i]),
              code: data.daily.weathercode[i]
            });
          }
          setForecast(days);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getWeatherIcon = (code) => {
    if (code >= 95) return <CloudLightning size={20} color="#eab308" />;
    if (code >= 51 && code <= 67) return <CloudRain size={20} color="#3b82f6" />;
    if (code >= 80 && code <= 82) return <CloudRain size={20} color="#3b82f6" />;
    if (code >= 1 && code <= 3) return <Cloud size={20} color="#94a3b8" />;
    return <Sun size={20} color="#f59e0b" />;
  };

  const dayList = DAY_TRANSLATIONS[language] || DAY_TRANSLATIONS['English'];

  if (loading) {
    return <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>{t('loadingWeather', 'Loading weather...')}</div>;
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0f172a' }}>{t('weatherForecast', 'Weather Forecast')}</h3>
        <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#475569' }}>{t('sriLanka', 'Sri Lanka')}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {forecast.map((f, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '45px', background: i === 0 ? '#f1f5f9' : 'transparent', padding: '0.5rem 0.25rem', borderRadius: '8px', border: i === 0 ? '1px solid #cbd5e1' : 'none' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: i === 0 ? '700' : '500', color: i === 0 ? '#0f172a' : '#64748b', marginBottom: '0.25rem' }}>
              {i === 0 ? t('today', 'Today') : (dayList[f.dayIndex] || 'Day')}
            </span>
            {getWeatherIcon(f.code)}
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginTop: '0.25rem' }}>{f.max}°</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{f.min}°</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherForecastWidget;
