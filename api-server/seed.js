const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MandiPrice = require('./models/MandiPrice');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const mockData = [
  { state: "Andhra Pradesh", market: "Adoni", commodity: "Cotton", variety: "Medium Staple", min_price: 5200, max_price: 5800, modal_price: 5500 },
  { state: "Andhra Pradesh", market: "Kurnool", commodity: "Onion", variety: "Red", min_price: 1500, max_price: 2200, modal_price: 1850 },
  { state: "Andhra Pradesh", market: "Guntur", commodity: "Chilli Red", variety: "Guntur", min_price: 15000, max_price: 21000, modal_price: 18000 },
  { state: "Andhra Pradesh", market: "Tirupati", commodity: "Tomato", variety: "Local", min_price: 2000, max_price: 3500, modal_price: 2800 },
  { state: "Andhra Pradesh", market: "Vijayawada", commodity: "Paddy(Dhan)", variety: "Common", min_price: 2200, max_price: 2500, modal_price: 2350 },
  
  { state: "Telangana", market: "Hyderabad", commodity: "Tomato", variety: "Hybrid", min_price: 2200, max_price: 3800, modal_price: 3100 },
  { state: "Telangana", market: "Warangal", commodity: "Cotton", variety: "Long Staple", min_price: 5500, max_price: 6200, modal_price: 5900 },
  { state: "Telangana", market: "Nizamabad", commodity: "Turmeric", variety: "Finger", min_price: 8000, max_price: 11000, modal_price: 9500 },
  { state: "Telangana", market: "Khammam", commodity: "Maize", variety: "Yellow", min_price: 1800, max_price: 2100, modal_price: 1950 },
  { state: "Telangana", market: "Mahbubnagar", commodity: "Groundnut", variety: "Pods", min_price: 4500, max_price: 5200, modal_price: 4850 },

  { state: "Maharashtra", market: "Pune", commodity: "Onion", variety: "Big", min_price: 1800, max_price: 2600, modal_price: 2200 },
  { state: "Maharashtra", market: "Lasalgaon", commodity: "Onion", variety: "Red", min_price: 1600, max_price: 2400, modal_price: 2000 },
  { state: "Maharashtra", market: "Nagpur", commodity: "Orange", variety: "Nagpur", min_price: 3000, max_price: 4500, modal_price: 3800 },
  { state: "Maharashtra", market: "Nashik", commodity: "Grape", variety: "Green", min_price: 4000, max_price: 6000, modal_price: 5000 },
  { state: "Maharashtra", market: "Mumbai", commodity: "Potato", variety: "Jyoti", min_price: 1200, max_price: 1800, modal_price: 1500 },

  { state: "Karnataka", market: "Bengaluru", commodity: "Tomato", variety: "Local", min_price: 2500, max_price: 4000, modal_price: 3200 },
  { state: "Karnataka", market: "Mysuru", commodity: "Coconut", variety: "Dry", min_price: 12000, max_price: 16000, modal_price: 14000 },
  { state: "Karnataka", market: "Hubballi", commodity: "Cotton", variety: "Medium", min_price: 5300, max_price: 6000, modal_price: 5600 },
  { state: "Karnataka", market: "Mangaluru", commodity: "Arecanut", variety: "Red", min_price: 35000, max_price: 42000, modal_price: 38000 },

  { state: "Uttar Pradesh", market: "Agra", commodity: "Potato", variety: "Desi", min_price: 800, max_price: 1300, modal_price: 1050 },
  { state: "Uttar Pradesh", market: "Kanpur", commodity: "Wheat", variety: "Dara", min_price: 2100, max_price: 2400, modal_price: 2250 },
  { state: "Uttar Pradesh", market: "Lucknow", commodity: "Mango", variety: "Dasheri", min_price: 4000, max_price: 7000, modal_price: 5500 },
  { state: "Uttar Pradesh", market: "Varanasi", commodity: "Brinjal", variety: "Round", min_price: 1000, max_price: 1600, modal_price: 1300 },

  { state: "Punjab", market: "Amritsar", commodity: "Wheat", variety: "Super", min_price: 2200, max_price: 2500, modal_price: 2350 },
  { state: "Punjab", market: "Ludhiana", commodity: "Paddy(Dhan)", variety: "Basmati", min_price: 3000, max_price: 3800, modal_price: 3400 },
  
  { state: "Gujarat", market: "Ahmedabad", commodity: "Cotton", variety: "Shankar-6", min_price: 5800, max_price: 6500, modal_price: 6100 },
  { state: "Gujarat", market: "Rajkot", commodity: "Groundnut", variety: "Bold", min_price: 5000, max_price: 5800, modal_price: 5400 },
  { state: "Gujarat", market: "Surat", commodity: "Banana", variety: "Green", min_price: 1200, max_price: 1800, modal_price: 1500 },

  { state: "Madhya Pradesh", market: "Indore", commodity: "Soyabean", variety: "Yellow", min_price: 4200, max_price: 4800, modal_price: 4500 },
  { state: "Madhya Pradesh", market: "Bhopal", commodity: "Wheat", variety: "Sharbati", min_price: 2500, max_price: 3200, modal_price: 2850 },
  { state: "Madhya Pradesh", market: "Ujjain", commodity: "Garlic", variety: "Desi", min_price: 6000, max_price: 9000, modal_price: 7500 },

  { state: "Rajasthan", market: "Jaipur", commodity: "Mustard", variety: "Black", min_price: 4800, max_price: 5500, modal_price: 5150 },
  { state: "Rajasthan", market: "Jodhpur", commodity: "Cumin", variety: "Jeera", min_price: 25000, max_price: 32000, modal_price: 28500 },
  { state: "Rajasthan", market: "Kota", commodity: "Coriander", variety: "Dry", min_price: 6000, max_price: 8500, modal_price: 7250 }
];

async function seedDB() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    // Optional: Clear old gov data to avoid duplicates, but keep 'farmer' updates
    await MandiPrice.deleteMany({ source: 'gov' });
    console.log("Cleared old mock data.");

    const todayDateStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    const todayParsed = new Date();

    const docsToInsert = mockData.map(item => {
      // Create slug ID
      const docId = `${item.market}_${item.commodity}_${todayDateStr}_gov`.toLowerCase().replace(/\s+/g, '-');
      return {
        ...item,
        docId,
        arrival_date: todayDateStr,
        parsed_date: todayParsed,
        source: 'gov',
        last_synced: todayParsed
      };
    });

    await MandiPrice.insertMany(docsToInsert);
    console.log(`Successfully seeded ${docsToInsert.length} mock prices into MongoDB!`);
    process.exit(0);
  } catch (e) {
    console.error("Seeding failed:", e);
    process.exit(1);
  }
}

seedDB();
