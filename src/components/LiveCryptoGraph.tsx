// src/components/LiveCryptoGraph.tsx
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Search, X, RefreshCw } from 'lucide-react';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

interface ChartData {
  time: string;
  price: number;
  timestamp: number;
}

export default function LiveCryptoGraph() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<'1' | '7' | '30' | '365'>('7');
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch top 50 cryptocurrencies
  const fetchCryptoList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h'
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: CryptoData[] = await response.json();
      setCryptos(data);
      
      if (data.length > 0 && !selectedCrypto) {
        setSelectedCrypto(data[0]); // Default to Bitcoin
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching crypto list:', err);
      setError('Failed to fetch cryptocurrency data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical chart data for selected crypto
  const fetchChartData = async (cryptoId: string, days: string) => {
    try {
      setChartLoading(true);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}`
      );

      if (!response.ok) {
        throw new Error(`Chart API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data for chart
      const formattedData: ChartData[] = data.prices.map((price: [number, number]) => {
        const timestamp = price[0];
        const value = price[1];
        
        return {
          time: formatChartTime(timestamp, days),
          price: value,
          timestamp: timestamp
        };
      });

      setChartData(formattedData);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to fetch chart data.');
    } finally {
      setChartLoading(false);
    }
  };

  // Format time based on range
  const formatChartTime = (timestamp: number, days: string) => {
    const date = new Date(timestamp);
    
    if (days === '1') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === '7') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Initial load
  useEffect(() => {
    fetchCryptoList();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchCryptoList();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch chart data when crypto or timeRange changes
  useEffect(() => {
    if (selectedCrypto) {
      fetchChartData(selectedCrypto.id, timeRange);
    }
  }, [selectedCrypto, timeRange]);

  const filteredCryptos = useMemo(() => {
    return cryptos.filter(crypto =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cryptos, searchTerm]);

  const priceChange = useMemo(() => {
    if (selectedCrypto) {
      return selectedCrypto.price_change_percentage_24h || 0;
    }
    return 0;
  }, [selectedCrypto]);

  const handleRefresh = () => {
    fetchCryptoList();
    if (selectedCrypto) {
      fetchChartData(selectedCrypto.id, timeRange);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
            <p className="text-[#4A4A4A] dark:text-[#B8B8B8]">Loading live crypto data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#EF4444]/20 p-6">
        <div className="text-center py-8">
          <p className="text-[#EF4444] mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!selectedCrypto) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border-2 border-[#D4AF37]/20 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">
            Live Crypto Markets
          </h2>
          <p className="text-[#4A4A4A] dark:text-[#B8B8B8] text-sm">
            Real-time data from CoinGecko API • Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] rounded-lg hover:bg-[#D4AF37]/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A4A4A] dark:text-[#B8B8B8]" />
            <input
              type="text"
              placeholder="Search cryptocurrency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-[#D4AF37]/20 bg-[#F8F9FA] dark:bg-[#0A0A0A] text-[#000000] dark:text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-[#4A4A4A] dark:text-[#B8B8B8]" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
            {filteredCryptos.map((crypto) => (
              <button
                key={crypto.id}
                onClick={() => {
                  setSelectedCrypto(crypto);
                  setShowSearch(false);
                  setSearchTerm('');
                }}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedCrypto.id === crypto.id
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                  <span className="font-bold text-[#000000] dark:text-[#FFFFFF] text-sm">
                    {crypto.symbol.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8] truncate">
                  {crypto.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Crypto Info */}
      <div className="bg-[#F8F9FA] dark:bg-[#0A0A0A] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={selectedCrypto.image} 
              alt={selectedCrypto.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF]">
                {selectedCrypto.name}
              </h3>
              <p className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8]">
                {selectedCrypto.symbol.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-[#000000] dark:text-[#FFFFFF]">
              ${selectedCrypto.current_price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: selectedCrypto.current_price < 1 ? 6 : 2
              })}
            </div>
            <div className={`flex items-center gap-1 justify-end text-sm font-semibold ${
              priceChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {priceChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[
            { label: '24H', value: '1' },
            { label: '7D', value: '7' },
            { label: '30D', value: '30' },
            { label: '1Y', value: '365' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                timeRange === range.value
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white'
                  : 'border-2 border-[#D4AF37]/20 text-[#000000] dark:text-[#FFFFFF] hover:bg-[#D4AF37]/10'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 relative">
        {chartLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-sm z-10 rounded-lg">
            <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} />
            <XAxis 
              dataKey="time" 
              stroke="#4A4A4A"
              tick={{ fill: '#4A4A4A' }}
              tickLine={{ stroke: '#D4AF37' }}
            />
            <YAxis 
              stroke="#4A4A4A"
              tick={{ fill: '#4A4A4A' }}
              tickLine={{ stroke: '#D4AF37' }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(selectedCrypto.current_price < 1 ? 4 : 0)}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '2px solid #D4AF37',
                borderRadius: '12px',
                color: '#FFFFFF'
              }}
              formatter={(value: any) => [`$${parseFloat(value).toFixed(selectedCrypto.current_price < 1 ? 6 : 2)}`, 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#D4AF37"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#D4AF37' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Market Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A]">
          <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-1">24h High</div>
          <div className="text-lg font-bold text-[#10B981]">
            ${selectedCrypto.high_24h.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: selectedCrypto.current_price < 1 ? 6 : 2
            })}
          </div>
        </div>
        <div className="text-center p-4 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A]">
          <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-1">24h Low</div>
          <div className="text-lg font-bold text-[#EF4444]">
            ${selectedCrypto.low_24h.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: selectedCrypto.current_price < 1 ? 6 : 2
            })}
          </div>
        </div>
        <div className="text-center p-4 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A]">
          <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-1">Market Cap</div>
          <div className="text-lg font-bold text-[#D4AF37]">
            ${(selectedCrypto.market_cap / 1000000000).toFixed(2)}B
          </div>
        </div>
        <div className="text-center p-4 rounded-lg bg-[#F8F9FA] dark:bg-[#0A0A0A]">
          <div className="text-sm text-[#4A4A4A] dark:text-[#B8B8B8] mb-1">24h Volume</div>
          <div className="text-lg font-bold text-[#3B82F6]">
            ${(selectedCrypto.total_volume / 1000000000).toFixed(2)}B
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 rounded-lg bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FCD34D] dark:border-[#78350F]">
        <p className="text-xs text-[#92400E] dark:text-[#FCD34D]">
          ℹ️ Live data powered by CoinGecko API. Prices update every 60 seconds automatically.
        </p>
      </div>
    </div>
  );
}