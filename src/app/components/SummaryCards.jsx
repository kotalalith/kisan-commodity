import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function SummaryCards({ mandiData = [] }) {
  const { t } = useLanguage();
  // Logic to calculate dynamic stats
  const getStats = () => {
    const cleanData = mandiData.filter(item => item && item.commodity && item.price !== undefined);
    if (cleanData.length === 0) {
      return {
        topCommodity: t('loading'),
        topPrice: "₹0",
        topChange: "0%",
        topChangeColor: "text-gray-500",
        topChangeIcon: "-",
        highestMarket: t('loading'),
        highestPrice: "₹0",
        highestChange: "0%",
        highestChangeColor: "text-gray-500",
        highestChangeIcon: "-",
        trend: t('stable'),
        trendPercent: `0% ${t('marketsUp')}`
      };
    }

    // 1. Top Commodity by frequency or highest modal price
    const topItem = [...cleanData].sort((a, b) => b.price - a.price)[0];
    
    // 2. Highest Market Price
    const highestPriceItem = [...cleanData].sort((a, b) => b.price - a.price)[0];

    // 3. Simple Market Trend logic
    const upCount = cleanData.filter(item => item && Number(item.priceChange) > 0).length;
    const trendPercent = ((upCount / cleanData.length) * 100).toFixed(0);

    return {
      topCommodity: topItem.commodity || "Unknown",
      topPrice: `₹${(topItem.price || 0).toLocaleString()}`,
      topChange: Number(topItem.priceChange || 0) > 0 ? `+${topItem.priceChange || 0}%` : `${topItem.priceChange || 0}%`,
      topChangeColor: Number(topItem.priceChange || 0) >= 0 ? "text-green-600" : "text-red-600",
      topChangeIcon: Number(topItem.priceChange || 0) >= 0 ? "↑" : "↓",
      
      highestMarket: highestPriceItem.market || "Unknown",
      highestPrice: `₹${(highestPriceItem.price || 0).toLocaleString()}`,
      highestChange: Number(highestPriceItem.priceChange || 0) > 0 ? `+${highestPriceItem.priceChange || 0}%` : `${highestPriceItem.priceChange || 0}%`,
      highestChangeColor: Number(highestPriceItem.priceChange || 0) >= 0 ? "text-green-600" : "text-red-600",
      highestChangeIcon: Number(highestPriceItem.priceChange || 0) >= 0 ? "↑" : "↓",

      trend: trendPercent > 50 ? t('bullish') : t('stable'),
      trendPercent: `${trendPercent}% ${t('marketsUp')}`
    };
  };

  const stats = getStats();

  const cards = [
    {
      icon: <TrendingUp className="text-green-600" size={24} />,
      title: t('topCommodity'),
      value: stats.topCommodity,
      price: stats.topPrice,
      change: stats.topChange,
      changeColor: stats.topChangeColor,
      changeIcon: stats.topChangeIcon
    },
    {
      icon: <DollarSign className="text-green-600" size={24} />,
      title: t('highestMarketPrice'),
      value: stats.highestMarket,
      price: stats.highestPrice,
      change: stats.highestChange,
      changeColor: stats.highestChangeColor,
      changeIcon: stats.highestChangeIcon
    },
    {
      icon: <BarChart3 className="text-green-600" size={24} />,
      title: t('marketTrend'),
      value: stats.trend,
      price: stats.trendPercent,
      change: stats.trend === t('bullish') ? t('strong') : t('neutral'),
      changeColor: stats.trend === t('bullish') ? "text-green-600" : "text-blue-600",
      changeIcon: stats.trend === t('bullish') ? "↑" : "→"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">{card.icon}</div>
            <span className={`text-sm font-medium ${card.changeColor} flex items-center gap-1`}>
              {card.changeIcon} {card.change}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
          <p className="text-gray-500 text-sm">{card.price}</p>
        </div>
      ))}
    </div>
  );
}