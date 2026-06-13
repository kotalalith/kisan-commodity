import { useState, useEffect } from "react";
import { Link } from "react-router";
import { PlusCircle } from "lucide-react";
import FiltersSection from "../components/FiltersSection";
import MandiGrid from "../components/MandiGrid";
import { useLanguage } from "../context/LanguageContext";
import { fetchMandiFilters } from "../api/mandiApi";

export default function Dashboard() {
  const { t } = useLanguage();
  const [mandiData, setMandiData] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: "",
    state: "All States",
    commodity: "All Commodities",
    market: "All Markets",
  });
  const [filterOptions, setFilterOptions] = useState({ states: [], commodities: [], markets: [] });

  useEffect(() => {
    let active = true;
    const loadFilters = async () => {
      const data = await fetchMandiFilters();
      if (active) {
        setFilterOptions(data);
      }
    };
    loadFilters();
    return () => { active = false; };
  }, []);

  return (
    <div className="relative z-10 animate-fadeIn">
      {/* Dashboard Header */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent mb-3 tracking-tight">
          Live Market Intelligence
        </h2>
        <p className="text-slate-400 font-medium text-lg max-w-2xl">
          Real-time agricultural commodity prices synced directly from the Government API and Community updates.
        </p>
      </div>

      <div className="mb-10 relative z-20">
        <FiltersSection 
          filters={filters} 
          setFilters={setFilters} 
          distinctStates={filterOptions.states.length > 0 ? filterOptions.states : [...new Set(mandiData.map(item => item.state))].sort()}
          distinctCommodities={filterOptions.commodities.length > 0 ? filterOptions.commodities : [...new Set(mandiData.map(item => item.commodity))].sort()}
          distinctMarkets={
            filters.state === "All States" && filters.commodity === "All Commodities" && filterOptions.markets.length > 0
              ? filterOptions.markets
              : [...new Set(mandiData
                  .filter(item => (filters.state === "All States" || item.state === filters.state) && (filters.commodity === "All Commodities" || item.commodity === filters.commodity))
                  .map(item => item.market)
                )].sort()
          }
        />
      </div>

      <div className="mb-12 relative z-10">
        <MandiGrid filters={filters} onDataFetched={setMandiData} />
      </div>

      <div className="fixed bottom-8 right-8 z-50 group">
        <Link 
          to="/add-price" 
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-600 to-green-400 text-slate-950 rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)] focus:outline-none"
          title={t('addPrice')}
        >
          <PlusCircle size={28} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
