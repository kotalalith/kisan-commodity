import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, Search, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { fetchLiveMandiPrices } from "../api/mandiApi";

export default function MandiGrid({ filters = {}, onDataFetched }) {
  const { t } = useLanguage();
  const [mandiData, setMandiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchApi = async () => {
      setLoading(true);
      try {
        const transformedData = await fetchLiveMandiPrices(filters, t);
        if (active) {
          setMandiData(transformedData || []);
          if (onDataFetched) onDataFetched(transformedData || []);
        }
      } catch (err) {
        if (active) setError("Failed to fetch live data");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchApi();
    return () => { active = false; };
  }, [filters]);

  // Apply frontend filters just in case
  const filteredData = mandiData.filter((item) => {
    if (!item) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchesCommodity = item.commodity && item.commodity.toLowerCase().includes(q);
      const matchesMarket = item.market && item.market.toLowerCase().includes(q);
      if (!matchesCommodity && !matchesMarket) return false;
    }
    if (filters.state && filters.state !== "All States" && item.state !== filters.state) return false;
    if (filters.market && filters.market !== "All Markets" && item.market !== filters.market) return false;
    if (filters.commodity && filters.commodity !== "All Commodities" && item.commodity !== filters.commodity) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        <p className="mt-4 text-emerald-400 font-semibold animate-pulse-breath">Loading Live Market Prices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center border-red-500/30">
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center border-slate-700">
        <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-400 font-medium text-lg">No commodities found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredData.map((item, index) => {
        const isUp = item.priceChange > 0;
        const isDown = item.priceChange < 0;
        const trendColor = isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-blue-400';
        const trendBg = isUp ? 'bg-emerald-500/10 border-emerald-500/20' : isDown ? 'bg-red-500/10 border-red-500/20' : 'bg-blue-500/10 border-blue-500/20';
        
        return (
          <div 
            key={item.id || index} 
            className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:neon-border-green transition-all duration-300 hover:-translate-y-1"
          >
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] -mr-10 -mt-10 opacity-20 group-hover:opacity-40 transition-opacity ${isUp ? 'bg-emerald-500' : isDown ? 'bg-red-500' : 'bg-blue-500'}`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">{item.commodity}</h3>
                {item.variety && <p className="text-xs text-slate-400 mt-0.5">{item.variety} {item.grade && item.grade !== 'FAQ' ? `(${item.grade})` : ''}</p>}
              </div>
              <div className={`px-2.5 py-1 rounded-lg border ${trendBg} flex items-center gap-1 backdrop-blur-sm`}>
                {isUp ? <TrendingUp size={14} className={trendColor} /> : isDown ? <TrendingDown size={14} className={trendColor} /> : null}
                <span className={`text-xs font-bold ${trendColor}`}>
                  {isUp ? "+" : ""}{item.priceChange}%
                </span>
              </div>
            </div>

            <div className="mb-5 relative z-10">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Modal Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-500 neon-glow-text">
                  ₹{item.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ Quintal</span>
              </div>
              {item.yesterday_price && (
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Yesterday: <span className="text-slate-300">₹{item.yesterday_price.toLocaleString()}</span>
                </p>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-700/50 relative z-10">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin size={14} className="text-emerald-500" />
                <span className="truncate" title={`${item.market}, ${item.state}`}>
                  <span className="font-semibold text-white">{item.market}</span>, <span className="text-slate-400 text-xs">{item.state}</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock size={12} />
                  <span>{item.lastUpdated}</span>
                </div>
                {item.msp && (
                   <div className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-slate-300">
                     MSP: ₹{item.msp.toLocaleString()}
                   </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
