import React, { useEffect, useState } from 'react';
import { 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Clock, 
  Radio, 
  AlertCircle, 
  Compass, 
  TrendingUp, 
  Calendar,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { api } from '../services/api';
import { WeatherCurrent, HourlyChartPoint } from '../types';
import { MetricCard } from '../components/MetricCard';

export const WeatherPage: React.FC = () => {
  const [current, setCurrent] = useState<WeatherCurrent | null>(null);
  const [hourlyTrend, setHourlyTrend] = useState<HourlyChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setIsLoading(true);
      const [curr, trend] = await Promise.all([
        api.getWeatherCurrent(),
        api.getRainfallTrend()
      ]);
      setCurrent(curr);
      setHourlyTrend(trend);
    } catch (err: any) {
      console.error("Weather data fetch error:", err);
      setError("Failed to retrieve weather data from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="h-28 bg-white rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 bg-white rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !current) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#C75C54]/30 max-w-xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-[#C75C54] mx-auto mb-3" />
        <h3 className="font-heading font-bold text-lg text-[#172B36]">Weather Service Unavailable</h3>
        <p className="text-xs text-[#738087] mt-1">{error}</p>
        <button
          onClick={loadWeatherData}
          className="mt-4 px-4 py-2 bg-[#267C78] text-white rounded-lg text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Attribution */}
      <div className="bg-white border border-[#E2E4DF] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#267C78]/15 text-[#267C78]">
                WEATHER INTELLIGENCE & HYDROMETRY
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#438A69] font-medium">
                <Radio className="w-3 h-3 animate-pulse" />
                {current.is_live ? 'Open-Meteo Live API Active' : 'Calibrated Reference Profile'}
              </span>
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#172B36]">
              Chandigarh & Tri-City Precipitation Intelligence
            </h1>
            <p className="text-xs text-[#738087] mt-1">
              Coordinates: 30.7333° N, 76.7794° E • Timezone: Asia/Kolkata (IST) • Observation Window: Past 72h to Next 24h
            </p>
          </div>

          <div className="text-right text-xs space-y-1 bg-[#F3F1E9] p-3 rounded-xl border border-[#E2E4DF]">
            <div className="font-semibold text-[#172B36]">Provider Attribution</div>
            <div className="text-[11px] text-[#738087]">{current.source}</div>
            <div className="text-[10px] text-[#267C78] font-mono">Last Synchronized: {new Date(current.retrieved_at).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Six Key Hydrological Intervals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#E2E4DF] rounded-xl p-3.5 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#738087] tracking-wider">Past 1-Hour</div>
          <div className="text-2xl font-extrabold font-heading text-[#172B36] mt-1">
            {current.rainfall_1h_mm} <span className="text-xs font-normal text-[#738087]">mm</span>
          </div>
          <div className="text-[10px] text-[#438A69] mt-1 font-medium">Recent Downpour</div>
        </div>

        <div className="bg-white border border-[#E2E4DF] rounded-xl p-3.5 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#738087] tracking-wider">Past 3-Hours</div>
          <div className="text-2xl font-extrabold font-heading text-[#172B36] mt-1">
            {current.rainfall_3h_mm} <span className="text-xs font-normal text-[#738087]">mm</span>
          </div>
          <div className="text-[10px] text-[#738087] mt-1">Short-term Surge</div>
        </div>

        <div className="bg-white border border-[#E2E4DF] rounded-xl p-3.5 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#738087] tracking-wider">Past 24-Hours</div>
          <div className="text-2xl font-extrabold font-heading text-[#172B36] mt-1">
            {current.rainfall_24h_mm} <span className="text-xs font-normal text-[#738087]">mm</span>
          </div>
          <div className="text-[10px] text-[#738087] mt-1">Daily Accumulation</div>
        </div>

        <div className="bg-white border border-[#E2E4DF] rounded-xl p-3.5 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#738087] tracking-wider">Past 72-Hours</div>
          <div className="text-2xl font-extrabold font-heading text-[#172B36] mt-1">
            {current.rainfall_72h_mm} <span className="text-xs font-normal text-[#738087]">mm</span>
          </div>
          <div className="text-[10px] text-[#738087] mt-1">Soil Saturation Baseline</div>
        </div>

        <div className="bg-white border-2 border-[#267C78]/40 rounded-xl p-3.5 shadow-xs bg-[#267C78]/5">
          <div className="text-[10px] uppercase font-bold text-[#267C78] tracking-wider">Forecast 6-Hours</div>
          <div className="text-2xl font-extrabold font-heading text-[#267C78] mt-1">
            {current.forecast_6h_mm} <span className="text-xs font-normal text-[#738087]">mm</span>
          </div>
          <div className="text-[10px] text-[#D69A42] font-semibold mt-1">
            Prob: {current.precipitation_probability}%
          </div>
        </div>

        <div className="bg-white border border-[#E2E4DF] rounded-xl p-3.5 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#738087] tracking-wider">Forecast 24-Hours</div>
          <div className="text-2xl font-extrabold font-heading text-[#172B36] mt-1">
            {current.forecast_24h_mm} <span className="text-xs font-normal text-[#738087]">mm</span>
          </div>
          <div className="text-[10px] text-[#738087] mt-1">Next Day Estimate</div>
        </div>
      </div>

      {/* Atmospheric State Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E4DF] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#F3F1E9] text-[#C75C54]">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#738087]">Current Ambient Temperature</div>
            <div className="text-xl font-bold font-heading text-[#172B36]">{current.temperature_c} °C</div>
          </div>
        </div>

        <div className="bg-white border border-[#E2E4DF] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#F3F1E9] text-[#267C78]">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#738087]">Relative Humidity</div>
            <div className="text-xl font-bold font-heading text-[#172B36]">{current.relative_humidity} %</div>
          </div>
        </div>

        <div className="bg-white border border-[#E2E4DF] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#F3F1E9] text-[#D69A42]">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#738087]">Precipitation Probability (Next 6h)</div>
            <div className="text-xl font-bold font-heading text-[#172B36]">{current.precipitation_probability} %</div>
          </div>
        </div>
      </div>

      {/* Hourly Rainfall Trend Chart (Observed Historical vs Forecast) */}
      <div className="bg-white border border-[#E2E4DF] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E4DF] gap-2">
          <div>
            <h2 className="font-heading font-bold text-base text-[#172B36]">
              Hourly Precipitation Profile (Observed vs Predictive Forecast)
            </h2>
            <p className="text-xs text-[#738087]">
              Notice the dashed division line separating recorded rain from future numerical forecasts
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#267C78]"></span>
              <span>Past Observations (mm)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#D69A42]"></span>
              <span>Predicted Forecast (mm)</span>
            </div>
          </div>
        </div>

        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E4DF" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(t) => t.includes('T') ? t.split('T')[1].slice(0, 5) : t}
                tick={{ fontSize: 10, fill: '#738087' }} 
              />
              <YAxis tick={{ fontSize: 10, fill: '#738087' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#172B36', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any, name: any, item: any) => [
                  `${val} mm (${item.payload.is_forecast ? 'Forecast' : 'Observed'})`,
                  'Rainfall'
                ]}
              />
              <Bar 
                dataKey="precipitation_mm" 
                name="Rainfall (mm)" 
                fill="#267C78"
                shape={(props: any) => {
                  const { fill, x, y, width, height, payload } = props;
                  const barColor = payload.is_forecast ? '#D69A42' : '#267C78';
                  return <rect x={x} y={y} width={width} height={height} fill={barColor} rx={2} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 p-3 bg-[#F3F1E9] rounded-lg text-xs text-[#738087] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#267C78]" />
            <span><strong>Scientific Distinction:</strong> Weather model predictions are not physical rain-gauge telemetry.</span>
          </div>
          <span className="font-mono text-[10px]">Open-Meteo High-Resolution Blend</span>
        </div>
      </div>
    </div>
  );
};

