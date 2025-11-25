// src/components/LiveCryptoFeed.tsx
"use client";
import React, { useState, useEffect } from 'react';

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

  const fetchCryptoPrices = async () => {
    try {
      setError(false);
      
      // Fetch top 30 cryptocurrencies
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false&price_change_percentage=24h'
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data: CryptoPrice[] = await response.json();
      setPrices(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoPrices();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCryptoPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A] border-y border-[#D4AF37]/20">
        <div className="flex items-center justify-center">
          <div className="text-[#D4AF37] animate-pulse">
            Loading live market data...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A] border-y border-[#EF4444]/20">
        <div className="flex items-center justify-center">
          <div className="text-[#EF4444] text-sm">
            Failed to load market data. Retrying...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A] border-y border-[#D4AF37]/20 overflow-hidden">
      <div className="relative">
        <div className="flex animate-scroll whitespace-nowrap">
          {/* Duplicate array for seamless loop */}
          {[...prices, ...prices].map((crypto, index) => (
            <div
              key={`${crypto.id}-${index}`}
              className="inline-flex items-center space-x-2 px-6 py-2"
            >
              <img 
                src={crypto.image} 
                alt={crypto.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-[#D4AF37] font-bold text-sm">
                {crypto.symbol.toUpperCase()}
              </span>
              <span className="text-white font-mono text-sm">
                $
                {crypto.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: crypto.current_price < 1 ? 6 : 2,
                })}
              </span>
              <span
                className={`text-xs font-semibold ${
                  crypto.price_change_percentage_24h >= 0 
                    ? "text-[#10B981]" 
                    : "text-[#EF4444]"
                }`}
              >
                {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

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
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}