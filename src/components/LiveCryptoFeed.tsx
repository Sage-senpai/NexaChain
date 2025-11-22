// src/components/LiveCryptoFeed.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AssetPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  type: "crypto" | "commodity" | "forex" | "index";
}

export default function LiveCryptoFeed() {
  const [prices, setPrices] = useState<AssetPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Comprehensive asset list
  const assets = {
    // Stablecoins
    stablecoins: ["USDT", "USDC", "DAI", "BUSD"],
    
    // Major Cryptocurrencies
    majors: ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE"],
    
    // Layer 2 & Top Ecosystem Tokens
    layer2: ["MATIC", "ARB", "OP", "IMX", "LRC"],
    
    // Additional Top Tokens
    topTokens: ["AVAX", "DOT", "LINK", "UNI", "ATOM", "APT", "SUI"],
  };

  const fetchCryptoPrices = async () => {
    try {
      // Combine all crypto symbols
      const allCryptos = [
        ...assets.stablecoins,
        ...assets.majors,
        ...assets.layer2,
        ...assets.topTokens,
      ];

      // Map to CoinGecko IDs
      const cryptoIdMap: { [key: string]: string } = {
        BTC: "bitcoin",
        ETH: "ethereum",
        USDT: "tether",
        USDC: "usd-coin",
        DAI: "dai",
        BUSD: "binance-usd",
        BNB: "binancecoin",
        SOL: "solana",
        XRP: "ripple",
        ADA: "cardano",
        DOGE: "dogecoin",
        MATIC: "matic-network",
        ARB: "arbitrum",
        OP: "optimism",
        IMX: "immutable-x",
        LRC: "loopring",
        AVAX: "avalanche-2",
        DOT: "polkadot",
        LINK: "chainlink",
        UNI: "uniswap",
        ATOM: "cosmos",
        APT: "aptos",
        SUI: "sui",
      };

      const ids = allCryptos
        .map((symbol) => cryptoIdMap[symbol] || symbol.toLowerCase())
        .join(",");

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) throw new Error("Failed to fetch prices");

      const data = await response.json();

      const cryptoPrices: AssetPrice[] = allCryptos.map((symbol) => {
        const id = cryptoIdMap[symbol] || symbol.toLowerCase();
        const coinData = data[id];

        return {
          symbol,
          name: symbol,
          price: coinData?.usd || 0,
          change24h: coinData?.usd_24h_change || 0,
          type: "crypto" as const,
        };
      });

      // Add simulated commodities (in production, use real API)
      const commodities: AssetPrice[] = [
        {
          symbol: "XAU/USD",
          name: "Gold",
          price: 2045.5,
          change24h: 0.8,
          type: "commodity",
        },
        {
          symbol: "XAG/USD",
          name: "Silver",
          price: 24.15,
          change24h: 1.2,
          type: "commodity",
        },
        {
          symbol: "WTI",
          name: "Crude Oil",
          price: 78.5,
          change24h: -0.5,
          type: "commodity",
        },
        {
          symbol: "BRENT",
          name: "Brent Oil",
          price: 82.3,
          change24h: -0.3,
          type: "commodity",
        },
        {
          symbol: "NG",
          name: "Natural Gas",
          price: 2.85,
          change24h: 2.1,
          type: "commodity",
        },
      ];

      // Add simulated forex pairs
      const forexPairs: AssetPrice[] = [
        {
          symbol: "EUR/USD",
          name: "Euro",
          price: 1.0875,
          change24h: 0.15,
          type: "forex",
        },
        {
          symbol: "GBP/USD",
          name: "Pound",
          price: 1.2654,
          change24h: -0.12,
          type: "forex",
        },
        {
          symbol: "USD/JPY",
          name: "Yen",
          price: 149.85,
          change24h: 0.3,
          type: "forex",
        },
        {
          symbol: "USD/CHF",
          name: "Franc",
          price: 0.8756,
          change24h: -0.08,
          type: "forex",
        },
        {
          symbol: "USD/CAD",
          name: "CAD",
          price: 1.3542,
          change24h: 0.18,
          type: "forex",
        },
        {
          symbol: "AUD/USD",
          name: "AUD",
          price: 0.6523,
          change24h: -0.22,
          type: "forex",
        },
        {
          symbol: "USD/CNY",
          name: "Yuan",
          price: 7.2345,
          change24h: 0.05,
          type: "forex",
        },
      ];

      // Add simulated indices
      const indices: AssetPrice[] = [
        {
          symbol: "SPX",
          name: "S&P 500",
          price: 4567.89,
          change24h: 0.75,
          type: "index",
        },
        {
          symbol: "NDX",
          name: "NASDAQ",
          price: 15234.5,
          change24h: 1.2,
          type: "index",
        },
        {
          symbol: "DJI",
          name: "Dow Jones",
          price: 35678.9,
          change24h: 0.45,
          type: "index",
        },
        {
          symbol: "FTSE",
          name: "FTSE 100",
          price: 7456.3,
          change24h: -0.3,
          type: "index",
        },
        {
          symbol: "DAX",
          name: "DAX",
          price: 16234.7,
          change24h: 0.6,
          type: "index",
        },
      ];

      // Combine all prices
      const allPrices = [
        ...cryptoPrices,
        ...commodities,
        ...forexPairs,
        ...indices,
      ];

      setPrices(allPrices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prices:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoPrices();
    const interval = setInterval(fetchCryptoPrices, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Simulate price changes for non-crypto assets
  useEffect(() => {
    if (prices.length === 0) return;

    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((asset) => {
          if (asset.type !== "crypto") {
            // Simulate small price movements
            const priceChange = (Math.random() - 0.5) * 0.002;
            return {
              ...asset,
              price: asset.price * (1 + priceChange),
              change24h: (Math.random() - 0.5) * 3,
            };
          }
          return asset;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [prices]);

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

  const getTypeColor = (type: AssetPrice["type"]) => {
    switch (type) {
      case "crypto":
        return "text-[#D4AF37]";
      case "commodity":
        return "text-[#FFD700]";
      case "forex":
        return "text-[#10B981]";
      case "index":
        return "text-[#3B82F6]";
      default:
        return "text-[#D4AF37]";
    }
  };

  return (
    <section className="py-4 bg-[#1A1A1A] dark:bg-[#0A0A0A] border-y border-[#D4AF37]/20 overflow-hidden">
      <div className="relative">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...prices, ...prices].map((asset, index) => (
            <motion.div
              key={`${asset.symbol}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center space-x-2 px-6 py-2"
            >
              <span
                className={`${getTypeColor(asset.type)} font-bold text-sm`}
              >
                {asset.symbol}
              </span>
              <span className="text-white font-mono text-sm">
                $
                {asset.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: asset.price < 1 ? 6 : 2,
                })}
              </span>
              <span
                className={`text-xs font-semibold ${
                  asset.change24h >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                }`}
              >
                {asset.change24h >= 0 ? "+" : ""}
                {asset.change24h.toFixed(2)}%
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
          animation: scroll 120s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}