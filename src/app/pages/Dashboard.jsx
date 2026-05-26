import { useState, useEffect } from "react";
import { Link } from "react-router";
import { PlusCircle } from "lucide-react";
import SummaryCards from "../components/SummaryCards";
import FiltersSection from "../components/FiltersSection";
import MandiTable from "../components/MandiTable";
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
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {t('smartMandiSystem')}
        </h2>
        <p className="text-gray-600">
          {t('realTimeInsights')}
        </p>
      </div>

      <div className="mb-8">
        <SummaryCards mandiData={mandiData} />
      </div>

      <div className="mb-8">
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

      <div className="mb-8">
        <MandiTable filters={filters} onDataFetched={setMandiData} />
      </div>

      <div className="fixed bottom-8 right-8 z-50 group">
        <Link 
          to="/add-price" 
          className="flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all hover:scale-110 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/30"
          title={t('addPrice')}
        >
          <PlusCircle size={26} strokeWidth={2.5} />
        </Link>
      </div>
    </>
  );
}
