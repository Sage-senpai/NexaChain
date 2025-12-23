// FILE: src/components/LiveCryptoFeed.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import Image from 'next/image'; // ✅ Use Next.js Image

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

export default function LiveCryptoFeed() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ✅ useCallback to fix ESLint warning
  const fetchCryptoPrices = useCallback(async () => {
    try {
      setError(false);
      
      // Fetch top 30 cryptocurrencies from CoinGecko
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false&price_change_percentage=24h',
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: CryptoPrice[] = await response.json();
      setPrices(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError(true);
      setLoading(false);
      
      // Retry after 5 seconds on error
      setTimeout(fetchCryptoPrices, 5000);
    }
  }, []); // ✅ Empty deps since it doesn't depend on anything

  useEffect(() => {
    fetchCryptoPrices();
    
    // Auto-refresh every 60 seconds (CoinGecko rate limit friendly)
    const interval = setInterval(fetchCryptoPrices, 60000);
    
    return () => clearInterval(interval);
  }, [fetchCryptoPrices]); // ✅ Include fetchCryptoPrices

  if (loading) {
    return (
      <div className="crypto-ticker py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin" />
          <span className="text-[#D4AF37] text-sm font-medium">
            Loading live market data from CoinGecko...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A] border-y border-[#EF4444]/20">
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 text-[#EF4444] animate-spin" />
          <span className="text-[#EF4444] text-sm font-medium">
            Failed to load market data. Retrying...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Last Update Timestamp */}
      {lastUpdate && (
        <div className="absolute top-2 right-4 z-10 text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Scrolling Ticker */}
      <div className="crypto-ticker py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A]">
        <div className="crypto-ticker-items hover:pause-animation">
          {/* Duplicate array for seamless infinite loop */}
          {[...prices, ...prices].map((crypto, index) => (
            <div
              key={`${crypto.id}-${index}`}
              className="inline-flex items-center space-x-2 px-6 py-2 hover:bg-[#D4AF37]/10 transition-all rounded-lg cursor-pointer"
              title={`${crypto.name} (${crypto.symbol.toUpperCase()})`}
            >
              {/* Coin Icon - Use Next.js Image */}
              <div className="relative w-5 h-5">
                <Image 
                  src={crypto.image} 
                  alt={crypto.name}
                  fill
                  className="rounded-full object-cover"
                  sizes="20px"
                  unoptimized // ✅ External URLs need this
                />
              </div>
              
              {/* Symbol */}
              <span className="text-[#D4AF37] font-bold text-sm">
                {crypto.symbol.toUpperCase()}
              </span>
              
              {/* Price */}
              <span className="text-white font-mono text-sm">
                $
                {crypto.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: crypto.current_price < 1 ? 6 : 2,
                })}
              </span>
              
              {/* 24h Change */}
              <span
                className={`text-xs font-semibold flex items-center gap-1 ${
                  crypto.price_change_percentage_24h >= 0 
                    ? "text-[#10B981]" 
                    : "text-[#EF4444]"
                }`}
              >
                {crypto.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Fade Edges */}
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#1A1A1A] dark:from-[#0A0A0A] to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#1A1A1A] dark:from-[#0A0A0A] to-transparent pointer-events-none" />

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 90s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}