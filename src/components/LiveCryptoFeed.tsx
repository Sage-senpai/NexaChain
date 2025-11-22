// src/components/LiveCryptoFeed.tsx
"use client";
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  lastUpdate: number;
}

export default function LiveCryptoFeed() {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Crypto symbols to track
  const cryptoSymbols = [
    "BTC", "ETH", "USDT", "BNB", "SOL", "XRP", "ADA", "DOGE", 
    "AVAX", "MATIC", "DOT", "LINK", "UNI", "LTC", "ATOM", "ETC",
    "XLM", "ALGO", "VET", "FIL", "HBAR", "APT", "ARB", "OP",
    "INJ", "SUI", "TIA", "SEI", "RUNE", "FTM"
  ];

  // Fetch real crypto prices from CoinGecko API (free, no API key needed)
  const fetchCryptoPrices = async () => {
    try {
      const ids = cryptoSymbols.map(symbol => {
        const idMap: { [key: string]: string } = {
          'BTC': 'bitcoin',
          'ETH': 'ethereum',
          'USDT': 'tether',
          'BNB': 'binancecoin',
          'SOL': 'solana',
          'XRP': 'ripple',
          'ADA': 'cardano',
          'DOGE': 'dogecoin',
          'AVAX': 'avalanche-2',
          'MATIC': 'matic-network',
          'DOT': 'polkadot',
          'LINK': 'chainlink',
          'UNI': 'uniswap',
          'LTC': 'litecoin',
          'ATOM': 'cosmos',
          'ETC': 'ethereum-classic',
          'XLM': 'stellar',
          'ALGO': 'algorand',
          'VET': 'vechain',
          'FIL': 'filecoin',
          'HBAR': 'hedera-hashgraph',
          'APT': 'aptos',
          'ARB': 'arbitrum',
          'OP': 'optimism',
          'INJ': 'injective-protocol',
          'SUI': 'sui',
          'TIA': 'celestia',
          'SEI': 'sei-network',
          'RUNE': 'thorchain',
          'FTM': 'fantom'
        };
        return idMap[symbol] || symbol.toLowerCase();
      }).join(',');

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }

      const data = await response.json();

      const prices: CryptoPrice[] = cryptoSymbols.map((symbol) => {
        const idMap: { [key: string]: string } = {
          'BTC': 'bitcoin',
          'ETH': 'ethereum',
          'USDT': 'tether',
          'BNB': 'binancecoin',
          'SOL': 'solana',
          'XRP': 'ripple',
          'ADA': 'cardano',
          'DOGE': 'dogecoin',
          'AVAX': 'avalanche-2',
          'MATIC': 'matic-network',
          'DOT': 'polkadot',
          'LINK': 'chainlink',
          'UNI': 'uniswap',
          'LTC': 'litecoin',
          'ATOM': 'cosmos',
          'ETC': 'ethereum-classic',
          'XLM': 'stellar',
          'ALGO': 'algorand',
          'VET': 'vechain',
          'FIL': 'filecoin',
          'HBAR': 'hedera-hashgraph',
          'APT': 'aptos',
          'ARB': 'arbitrum',
          'OP': 'optimism',
          'INJ': 'injective-protocol',
          'SUI': 'sui',
          'TIA': 'celestia',
          'SEI': 'sei-network',
          'RUNE': 'thorchain',
          'FTM': 'fantom'
        };
        
        const id = idMap[symbol] || symbol.toLowerCase();
        const coinData = data[id];

        return {
          symbol,
          name: symbol,
          price: coinData?.usd || 0,
          change24h: coinData?.usd_24h_change || 0,
          lastUpdate: Date.now(),
        };
      });

      setCryptoPrices(prices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCryptoPrices();

    // Update every 30 seconds (CoinGecko free tier rate limit)
    const interval = setInterval(fetchCryptoPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A] border-y border-[#D4AF37]/20">
        <div className="flex items-center justify-center">
          <div className="text-[#D4AF37] animate-pulse">Loading live prices...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A] border-y border-[#D4AF37]/20 overflow-hidden">
      <div className="relative">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...cryptoPrices, ...cryptoPrices].map((crypto, index) => (
            <motion.div
              key={`${crypto.symbol}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center space-x-2 px-6 py-2"
            >
              <span className="text-[#D4AF37] font-bold text-sm">
                {crypto.symbol}
              </span>
              <span className="text-white font-mono text-sm">
                ${crypto.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: crypto.price < 1 ? 6 : 2,
                })}
              </span>
              <span
                className={`text-xs font-semibold ${
                  crypto.change24h >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                }`}
              >
                {crypto.change24h >= 0 ? "+" : ""}
                {crypto.change24h.toFixed(2)}%
              </span>
            </motion.div>
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