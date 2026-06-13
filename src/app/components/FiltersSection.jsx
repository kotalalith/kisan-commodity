import { Search, RefreshCw, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function FiltersSection({ filters, setFilters, distinctStates = [], distinctCommodities = [], distinctMarkets = [] }) {
  const { t } = useLanguage();
  const handleReset = () => {
    if (setFilters) {
      setFilters({ searchQuery: "", state: "All States", commodity: "All Commodities", market: "All Markets" });
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for commodities or markets (e.g., chillies, hyderabad)..." 
          value={filters?.searchQuery || ""}
          onChange={(e) => setFilters?.({ ...filters, searchQuery: e.target.value })}
          className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white placeholder-slate-500 transition-all"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
        <div className="relative">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t('state')}
          </label>
          <div className="relative">
            <select
              value={filters?.state || "All States"}
              onChange={(e) => setFilters?.({ 
                state: e.target.value, 
                commodity: "All Commodities", 
                market: "All Markets" 
              })}
              className="w-full px-4 py-3 pr-10 bg-slate-900/50 border border-slate-700/50 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200 [&>option]:bg-slate-900 transition-all cursor-pointer"
            >
              <option value="All States">{t('allStates')}</option>
              {distinctStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={18}
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t('commodity')}
          </label>
          <div className="relative">
            <select
              value={filters?.commodity || "All Commodities"}
              onChange={(e) => setFilters?.({ 
                ...filters, 
                commodity: e.target.value, 
                market: "All Markets" 
              })}
              className="w-full px-4 py-3 pr-10 bg-slate-900/50 border border-slate-700/50 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200 [&>option]:bg-slate-900 transition-all cursor-pointer"
            >
              <option value="All Commodities">{t('allCommodities')}</option>
              {distinctCommodities.map(commodity => (
                <option key={commodity} value={commodity}>{commodity}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={18}
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t('market')}
          </label>
          <div className="relative">
            <select
              value={filters?.market || "All Markets"}
              onChange={(e) => setFilters?.({ ...filters, market: e.target.value })}
              className="w-full px-4 py-3 pr-10 bg-slate-900/50 border border-slate-700/50 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200 [&>option]:bg-slate-900 transition-all cursor-pointer"
            >
              <option value="All Markets">{t('allMarkets')}</option>
              {distinctMarkets.map(market => (
                <option key={market} value={market}>{market}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={18}
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-gradient-to-tr from-emerald-600 to-green-500 text-slate-950 font-bold rounded-xl hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            <RefreshCw size={18} />
            <span>{t('resetFilters')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
