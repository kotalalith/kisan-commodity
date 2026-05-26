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
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for commodities or markets (e.g., chillies, hyderabad)..." 
          value={filters?.searchQuery || ""}
          onChange={(e) => setFilters?.({ ...filters, searchQuery: e.target.value })}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="All States">{t('allStates')}</option>
              {distinctStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="All Commodities">{t('allCommodities')}</option>
              {distinctCommodities.map(commodity => (
                <option key={commodity} value={commodity}>{commodity}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('market')}
          </label>
          <div className="relative">
            <select
              value={filters?.market || "All Markets"}
              onChange={(e) => setFilters?.({ ...filters, market: e.target.value })}
              className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="All Markets">{t('allMarkets')}</option>
              {distinctMarkets.map(market => (
                <option key={market} value={market}>{market}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <RefreshCw size={20} />
            <span>{t('resetFilters')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
