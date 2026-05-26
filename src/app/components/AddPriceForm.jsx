import { Plus, MapPin, DollarSign, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { fetchMandiFilters } from "../api/mandiApi";

const ALL_INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 
  'Lakshadweep', 'Puducherry'
];

export default function AddPriceForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commodity, setCommodity] = useState("");
  const [price, setPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [market, setMarket] = useState("");
  const [state, setState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  const handleSubmit = async e => {
    e.preventDefault();
    if (!commodity || !price || !market || !state) {
      alert("Please fill all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const q = query(
        collection(db, "mandiPrices"), 
        where("commodity", "==", commodity),
        where("market", "==", market)
      );
      const querySnapshot = await getDocs(q);

      const dataToSave = {
        commodity,
        price: Number(price),
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        market,
        state,
        msp: null,
        priceChange: 0,
        lastUpdated: "Just now",
        createdAt: new Date()
      };

      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "mandiPrices", existingDoc.id), dataToSave);
        alert("Price updated successfully!");
      } else {
        await addDoc(collection(db, "mandiPrices"), dataToSave);
        alert("Price added successfully!");
      }
      setCommodity("");
      setPrice("");
      setMinPrice("");
      setMaxPrice("");
      setMarket("");
      setState("");
      setIsExpanded(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to add price");
    }
    setIsSubmitting(false);
  };
  return <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Plus className="text-green-600" size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">Add Community Price</h3>
            <p className="text-sm text-gray-500">
              Help others with your local market data
            </p>
          </div>
        </div>
        <span className="text-gray-400">{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && <form onSubmit={handleSubmit} className="px-6 pb-6 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  Commodity
                </div>
              </label>
              <input 
                type="text" 
                list="commodities-list" 
                value={commodity} 
                onChange={e => setCommodity(e.target.value)} 
                placeholder="Type commodity name" 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              />
              <datalist id="commodities-list">
                {(filterOptions.commodities.length > 0 ? filterOptions.commodities : ["Tomato", "Onion", "Maize", "Paddy", "Cotton", "Chilli", "Wheat"]).map(comm => (
                  <option key={comm} value={comm} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  Prices (₹/quintal)
                </div>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Lowest" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm" />
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Average" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm" />
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Highest" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  Market/Location
                </div>
              </label>
              <input 
                type="text" 
                list="markets-list" 
                value={market} 
                onChange={e => setMarket(e.target.value)} 
                placeholder="Enter or select market" 
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              />
              <datalist id="markets-list">
                {(filterOptions.markets.length > 0 ? filterOptions.markets : ["Hyderabad APMC", "Warangal Enumamula", "Khammam APMC", "Guntur APMC", "Vijayawada APMC", "Kurnool APMC"]).map(mkt => (
                  <option key={mkt} value={mkt} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Select state</option>
                {(filterOptions.states.length > 0 ? filterOptions.states : ALL_INDIAN_STATES).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Community verified data</span>
            </div>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50">
              <Plus size={18} />
              {isSubmitting ? "Submitting..." : "Submit Price"}
            </button>
          </div>
        </form>}
    </div>;
}