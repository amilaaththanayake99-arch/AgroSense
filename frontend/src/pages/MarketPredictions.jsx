import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart2, AlertTriangle, Info } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getMarketPrediction } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './MarketPredictions.css';

const crops = ['Rice (Paddy)', 'Tomato', 'Chili', 'Onion (Big)', 'Banana', 'Potato', 'Tea', 'Coconut', 'Rubber', 'Cinnamon', 'Pepper', 'Ginger', 'Turmeric'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const MarketPredictions = () => {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await getMarketPrediction({ crop_name: selectedCrop });

      // result can be { prediction: {...}, historical_data: [...] }
      // or { prediction: "text", historical_data: [...] } if raw
      const pred = result.prediction;
      const historical = result.historical_data ?? [];

      setData({
        raw: typeof pred === 'string',
        prediction: pred,
        historical
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch prediction. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Build chart from historical data (up to 12 months)
  const buildChart = (historical) => {
    if (!historical.length) return [];
    const prices = historical.map(h => h.price);
    const max = Math.max(...prices);
    return historical.slice(-8).map(h => ({
      label: new Date(h.date).toLocaleDateString('en', { month: 'short' }),
      height: Math.round((h.price / max) * 100),
      price: h.price,
      market: h.market
    }));
  };

  const chartBars = data?.historical ? buildChart(data.historical) : [];

  // Extract structured data if AI returned JSON object
  const pred = data?.prediction;
  const isStructured = pred && typeof pred === 'object';

  return (
    <div className="page-wrapper">
      <div className="page-header text-center">
        <h1>{t('marketPredTitle', 'Market Price Predictions')}</h1>
        <p>{t('marketPredSub', 'AI-driven price forecasts based on Sri Lankan market data to help you sell at the right time.')}</p>
      </div>

      <div className="market-layout">
        {/* Selector */}
        <div className="market-controls glass-panel">
          <form onSubmit={handlePredict} className="prediction-form">
            <div className="form-group mb-0">
              <label>{t('selectCropMarket', 'Select Crop for Market Analysis')}</label>
              <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                {crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('analyzingMarket', 'Analyzing...') : <><BarChart2 size={18}/> {t('getForecastBtn', 'Get Forecast')}</>}
            </button>
          </form>

          {/* Reference sources */}
          <div className="source-links">
            <span><Info size={12}/> {t('dataReferences', 'Data references:')}</span>
            <a href="https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report" target="_blank" rel="noreferrer">CBSL Price Report</a>
            <a href="https://www.statistics.gov.lk/DashBoard/Prices/" target="_blank" rel="noreferrer">DCS Price Dashboard</a>
            <a href="https://www.harti.gov.lk/" target="_blank" rel="noreferrer">HARTI</a>
          </div>
        </div>

        {error && <div className="error-msg mt-4"><AlertTriangle size={16}/> {error}</div>}

        {loading ? (
          <div className="glass-panel centered-panel mt-4">
            <LoadingSpinner message="Analyzing Sri Lankan market trends..." />
          </div>
        ) : data ? (
          <div className="predictions-results fade-in mt-4">
            {/* Structured prediction cards */}
            {isStructured && (
              <div className="price-cards-grid">
                <div className="price-card glass-panel">
                  <div className="price-icon-wrapper"><DollarSign /></div>
                  <div>
                    <p className="price-label">Current Price (LKR/kg)</p>
                    <h3 className="price-value">{pred.current_estimated_price ?? '—'}</h3>
                  </div>
                </div>
                <div className="price-card glass-panel">
                  <div className="price-icon-wrapper highlight"><Calendar /></div>
                  <div>
                    <p className="price-label">Predicted Harvest Price</p>
                    <h3 className="price-value">{pred.predicted_harvest_price ?? '—'}</h3>
                  </div>
                </div>
                <div className={`price-card glass-panel trend-${pred.price_trend === 'Rising' ? 'up' : 'down'}`}>
                  <div className="price-icon-wrapper">
                    {pred.price_trend === 'Rising' ? <TrendingUp /> : <TrendingDown />}
                  </div>
                  <div>
                    <p className="price-label">Trend — Confidence: {pred.confidence}</p>
                    <h3 className="price-value">{pred.price_trend ?? '—'}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Historical price bar chart */}
            {chartBars.length > 0 && (
              <div className="chart-section glass-panel">
                <h3>Historical Price Trend ({selectedCrop})</h3>
                <div className="css-chart">
                  {chartBars.map((bar, i) => (
                    <div key={i} className="chart-bar-container" title={`${bar.market}: LKR ${bar.price}/kg`}>
                      <div
                        className={`chart-bar ${i === chartBars.length - 1 ? 'latest-bar' : ''}`}
                        style={{ height: `${bar.height}%` }}
                      >
                        <span className="bar-tooltip">Rs.{bar.price}</span>
                      </div>
                      <span className="chart-label">{bar.label}</span>
                    </div>
                  ))}
                </div>
                <p className="chart-note">Source: Dambulla Economic Center & Manning Market, Colombo</p>
              </div>
            )}

            {/* AI Analysis text */}
            {isStructured && pred.analysis && (
              <div className="recommendation-card glass-panel">
                <h3>AI Market Analysis</h3>
                <p>{pred.analysis}</p>
              </div>
            )}

            {/* Recommendations list */}
            {isStructured && pred.recommendations?.length > 0 && (
              <div className="recommendation-card glass-panel">
                <h3>Recommendations for Farmers</h3>
                <ul className="rec-list">
                  {pred.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
                {pred.best_selling_period && (
                  <div className="best-time">Best Selling Period: <strong>{pred.best_selling_period}</strong></div>
                )}
              </div>
            )}

            {/* Factors */}
            {isStructured && pred.factors_affecting_price?.length > 0 && (
              <div className="factors-card glass-panel">
                <h3>Key Factors Affecting Price</h3>
                <div className="factor-tags">
                  {pred.factors_affecting_price.map((f, i) => <span key={i} className="factor-tag">{f}</span>)}
                </div>
              </div>
            )}

            {/* Raw text fallback */}
            {!isStructured && typeof pred === 'string' && (
              <div className="recommendation-card glass-panel">
                <h3>AI Market Analysis</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{pred}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel centered-panel placeholder-panel mt-4">
            <BarChart2 size={48} className="placeholder-icon" />
            <p>Select a crop and click <strong>Get Forecast</strong> to see AI market predictions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPredictions;
