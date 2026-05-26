import { MapPin, CheckCircle, TrendingUp, Lightbulb } from "lucide-react";
export default function InsightsPanel() {
  return <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-green-600" size={20} />
          <h3 className="font-bold text-gray-900">Best Nearby Market</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div>
              <p className="font-medium text-gray-900">Kurnool</p>
              <p className="text-xs text-gray-500">12 km away</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">₹1,850</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle size={14} />
                <span>Best</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Guntur</p>
              <p className="text-xs text-gray-500">28 km away</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-700">₹1,600</p>
              <p className="text-xs text-gray-500">-13% lower</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Anantapur</p>
              <p className="text-xs text-gray-500">35 km away</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-700">₹1,550</p>
              <p className="text-xs text-gray-500">-16% lower</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-sm text-white">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} />
          <h3 className="font-bold">Smart Advice</h3>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
              ✓
            </div>
            <div>
              <p className="font-medium mb-1">Best Time to Sell</p>
              <p className="text-sm text-green-50">
                Current tomato prices are 23% above MSP. Excellent selling
                opportunity.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
              👉
            </div>
            <div>
              <p className="font-medium mb-1">Market Forecast</p>
              <p className="text-sm text-green-50">
                Prices expected to stay strong for next 3-5 days based on demand
                trends.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
              💰
            </div>
            <div>
              <p className="font-medium mb-1">Profit Estimate</p>
              <p className="text-sm text-green-50">
                Selling in Kurnool today: ~₹350/quintal more profit than local
                market.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="text-blue-600" size={20} />
          <h3 className="font-bold text-blue-900">Market Alert</h3>
        </div>
        <p className="text-sm text-blue-800 mb-3">
          <span className="font-medium">Maize prices surging:</span> Up 15% this
          week due to increased export demand.
        </p>
        <button className="text-sm text-blue-600 font-medium hover:underline">
          View detailed analysis →
        </button>
      </div>
    </div>;
}