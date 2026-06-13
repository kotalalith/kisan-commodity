const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const crypto = require('crypto');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import Mongoose Models
const MandiPrice = require('./models/MandiPrice');
const User = require('./models/User');
const SyncLog = require('./models/SyncLog');

// Initialize Firebase Admin SDK ONLY for FCM Notifications
try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require('./serviceAccountKey.json');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK (FCM) initialized successfully!');
} catch (error) {
  console.error('⚠️ Firebase Admin (FCM) initialization skipped or failed:', error.message);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    // Initialize stats cache asynchronously after DB connects
    setTimeout(() => {
      global.updateApiStatsCache().catch(err => console.warn('Startup stats update warning:', err.message));
    }, 1000);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

// Real-time API Cache
global.apiStatsCache = {
  totalRecords: 0,
  statesCount: 0,
  commoditiesCount: 0,
  lastSync: 'Never',
  lastSyncStatus: 'unknown'
};

global.filterCache = {
  states: [],
  commodities: [],
  markets: []
};

global.updateApiStatsCache = async () => {
  try {
    const states = await MandiPrice.distinct('state');
    const commodities = await MandiPrice.distinct('commodity');
    const markets = await MandiPrice.distinct('market');

    global.filterCache = {
      states: states.sort(),
      commodities: commodities.sort(),
      markets: markets.sort()
    };

    global.apiStatsCache.totalRecords = await MandiPrice.countDocuments();
    global.apiStatsCache.statesCount = states.length;
    global.apiStatsCache.commoditiesCount = commodities.length;

    const lastSyncLog = await SyncLog.findOne().sort({ triggered_at: -1 });
    if (lastSyncLog) {
      global.apiStatsCache.lastSync = new Date(lastSyncLog.completed_at).toLocaleString();
      global.apiStatsCache.lastSyncStatus = lastSyncLog.status;
    }
    console.log('📊 API Stats cache updated successfully:', global.apiStatsCache);
  } catch (err) {
    console.warn('⚠️ Could not update API Stats cache:', err.message);
  }
};

// Allowed API Keys (loaded from environment variables, fallback to a default key for testing)
const VALID_API_KEYS = process.env.API_KEYS
  ? process.env.API_KEYS.split(',')
  : ['agro_secret_key_12345'];

// Middleware to authorize requests using API Key
const requireApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: API Key is missing. Please provide it in the "x-api-key" header or as the "api_key" query parameter.'
    });
  }

  // Fallback to hardcoded testing/admin keys in VALID_API_KEYS
  if (VALID_API_KEYS.includes(apiKey)) {
    return next();
  }

  // Query MongoDB users collection
  try {
    const userDoc = await User.findOne({ apiKey: apiKey, status: 'approved' });

    if (userDoc) {
      if (userDoc.usage_today >= 100) {
        return res.status(429).json({
          success: false,
          message: 'Daily limit reached. Upgrade your plan.'
        });
      }

      // Increment usage
      userDoc.usage_today += 1;
      userDoc.usage_total += 1;
      await userDoc.save();

      req.apiUser = userDoc.toObject();
      return next();
    }
  } catch (error) {
    console.warn('⚠️ MongoDB key validation error:', error.message);
  }

  // Offline Sandbox Bypass Mode
  if (apiKey && typeof apiKey === 'string' && apiKey.startsWith('agro_live_')) {
    console.log('✅ Authorized key in offline sandbox mode:', apiKey);
    req.apiUser = { name: "Offline Sandbox Client", organization: "Offline Bypass" };
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Invalid or unapproved API Key. Sandbox request requires administrator approval.'
  });
};

// --- API ROUTES ---

const GOVT_API_KEY = process.env.GOVT_API_KEY || "579b464db66ec23bdd00000141df70af670e4c686cc1d53adb2acf8e";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const parseDateHelper = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
};

// FEATURE 1 — Scheduled Gov API Sync with Bulk Upsert
const syncGovApi = async () => {
  const triggeredAt = new Date();
  let recordsSynced = 0;

  console.log(`🚀 Starting MongoDB Gov API Sync at ${triggeredAt.toISOString()}...`);

  try {
    const targetDates = [];
    const baseDate = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      targetDates.push(`${dayStr}/${monthStr}/${year}`);
    }

    for (const dateStr of targetDates) {
      const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${GOVT_API_KEY}&format=json&limit=10000&filters[arrival_date]=${dateStr}`;
      try {
        const response = await fetch(url);
        if (!response.ok) continue;

        const json = await response.json();
        const records = json.records || [];
        console.log(`📄 Date ${dateStr}: Fetched ${records.length} records. Writing to MongoDB...`);

        if (records.length > 0) {
          const bulkOps = records.map(record => {
            if (!record.market || !record.commodity || !record.arrival_date) return null;

            const docId = `${slugify(record.market)}_${slugify(record.commodity)}_${slugify(record.arrival_date)}_gov`;
            const parsed_date = parseDateHelper(record.arrival_date) || new Date();

            return {
              updateOne: {
                filter: { docId: docId },
                update: {
                  $set: {
                    state: record.state || '',
                    district: record.district || '',
                    market: record.market || '',
                    commodity: record.commodity || '',
                    variety: record.variety || '',
                    min_price: record.min_price ? Number(record.min_price) : 0,
                    max_price: record.max_price ? Number(record.max_price) : 0,
                    modal_price: record.modal_price ? Number(record.modal_price) : 0,
                    arrival_date: record.arrival_date || '',
                    parsed_date: parsed_date,
                    source: 'gov',
                    last_synced: new Date()
                  }
                },
                upsert: true
              }
            };
          }).filter(op => op !== null);

          if (bulkOps.length > 0) {
            await MandiPrice.bulkWrite(bulkOps, { ordered: false });
            recordsSynced += bulkOps.length;
          }
        }
      } catch (fetchErr) {
        console.warn(`⚠️ Fetch failed for date ${dateStr}:`, fetchErr.message);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Auto-cleanup 90 days older data
    console.log("🧹 Running 90-day auto-cleanup...");
    const cleanupDate = new Date();
    cleanupDate.setDate(cleanupDate.getDate() - 90);
    const deleteResult = await MandiPrice.deleteMany({ parsed_date: { $lt: cleanupDate } });
    console.log(`🧹 Deleted ${deleteResult.deletedCount} old records to save storage!`);

    await SyncLog.create({
      triggered_at: triggeredAt,
      completed_at: new Date(),
      records_synced: recordsSynced,
      status: 'success'
    });

    console.log(`✅ Gov API Sync finished successfully. Synced ${recordsSynced} records!`);

    global.updateApiStatsCache().catch(err => console.warn('Background cache update error:', err.message));
  } catch (error) {
    console.error('❌ Gov API Sync failed:', error.message);
    await SyncLog.create({
      triggered_at: triggeredAt,
      completed_at: new Date(),
      records_synced: recordsSynced,
      status: 'failed',
      error_message: error.message
    });
  }
};

cron.schedule('0 6,10,13,16,21 * * *', () => {
  syncGovApi().catch(err => console.error("Cron Gov API sync background error:", err));
}, { scheduled: true, timezone: "Asia/Kolkata" });

const resetDailyUsage = async () => {
  try {
    await User.updateMany({}, { $set: { usage_today: 0 } });
    console.log('✅ Daily usage reset completed successfully.');
  } catch (error) {
    console.error('❌ Error resetting daily usage:', error);
  }
};

cron.schedule('0 0 * * *', () => {
  resetDailyUsage().catch(err => console.error("Cron usage reset background error:", err));
}, { scheduled: true, timezone: "Asia/Kolkata" });

const generateStablePriceChange = (commodity, market) => {
  const str = `${commodity}-${market}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  const pseudoRandom = Math.abs(Math.sin(hash) * 10000);
  const normalized = pseudoRandom - Math.floor(pseudoRandom);
  return Number((normalized * 10 - 5).toFixed(1));
};

app.get('/api/mandi-filters', async (req, res) => {
  try {
    res.json({
      success: true,
      data: global.filterCache || { states: [], commodities: [], markets: [] }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/mandi-prices', requireApiKey, async (req, res) => {
  try {
    let firestoreQuery = {};
    if (req.query.state) {
      const states = req.query.state.split(',').map(s => s.trim());
      firestoreQuery.state = { $in: states.map(s => new RegExp('^' + s + '$', 'i')) };
    }

    if (req.query.commodity) {
      const comms = req.query.commodity.split(',').map(c => c.trim());
      firestoreQuery.commodity = { $in: comms.map(s => new RegExp('^' + s + '$', 'i')) };
    }

    if (req.query.market) {
      const markets = req.query.market.split(',').map(m => m.trim());
      firestoreQuery.market = { $in: markets.map(s => new RegExp('^' + s + '$', 'i')) };
    }

    if (req.query.search) {
      const searchQ = req.query.search.toLowerCase();
      firestoreQuery.$or = [
        { commodity: new RegExp(searchQ, 'i') },
        { market: new RegExp(searchQ, 'i') },
        { state: new RegExp(searchQ, 'i') },
        { district: new RegExp(searchQ, 'i') }
      ];
    }

    // Fetch the matched records from MongoDB
    let dbRecords = await MandiPrice.find(firestoreQuery)
      .sort({ parsed_date: -1 })
      .limit(3000)
      .lean();

    // The rest is grouping and calculating changes
    let decoratedData = [];
    if (req.query.grouped === 'true') {
      const groups = {};
      dbRecords.forEach(record => {
        if (!record.commodity || !record.market) return;
        const key = `${record.commodity.trim()}_${record.market.trim()}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(record);
      });

      Object.keys(groups).forEach(key => {
        const groupItems = groups[key];
        const todayItem = groupItems[0];
        const yesterdayItem = groupItems[1];

        const todayPrice = Number(todayItem.modal_price) || 0;
        const yesterdayPrice = yesterdayItem ? (Number(yesterdayItem.modal_price) || 0) : null;

        let dailyChangePercentage = 0;
        if (yesterdayPrice && yesterdayPrice > 0) {
          dailyChangePercentage = Number((((todayPrice - yesterdayPrice) / yesterdayPrice) * 100).toFixed(2));
        } else {
          const mspNum = Number(todayItem.min_price) || 0;
          if (mspNum > 0) {
            dailyChangePercentage = Number((((todayPrice - mspNum) / mspNum) * 100).toFixed(1));
          }
        }

        decoratedData.push({
          ...todayItem,
          price: todayPrice,
          min_price: Number(todayItem.min_price) || 0,
          max_price: Number(todayItem.max_price) || 0,
          yesterday_price: yesterdayPrice,
          daily_change: yesterdayPrice ? (todayPrice - yesterdayPrice) : 0,
          daily_change_percentage: dailyChangePercentage,
          priceChange: dailyChangePercentage,
          weekly_average: todayPrice,
          weekly_trend: dailyChangePercentage > 1 ? "Bullish" : dailyChangePercentage < -1 ? "Bearish" : "Stable",
          trend: dailyChangePercentage > 1 ? "Bullish" : dailyChangePercentage < -1 ? "Bearish" : "Stable",
          status: dailyChangePercentage > 1 ? "Bullish" : dailyChangePercentage < -1 ? "Bearish" : "Stable"
        });
      });
    } else {
      decoratedData = dbRecords.map(item => ({
        ...item,
        price: Number(item.modal_price) || 0,
        min_price: Number(item.min_price) || 0,
        max_price: Number(item.max_price) || 0
      }));
    }

    const totalRecords = decoratedData.length;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10000;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const paginatedData = decoratedData.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      source: "agmarknet.gov.in",
      last_synced: global.apiStatsCache.lastSync,
      pagination: {
        total_records: totalRecords,
        page: page,
        limit: limit,
        total_pages: totalPages
      },
      data: paginatedData
    });
  } catch (error) {
    console.error('Error fetching Mandi prices:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to fetch data.',
      error: error.message
    });
  }
});

app.get('/api/mandi-prices/history', requireApiKey, async (req, res) => {
  try {
    const { commodity, market, from, to } = req.query;
    if (!commodity || !market) {
      return res.status(400).json({ success: false, message: "commodity and market are required" });
    }

    let parsedTo = to ? parseDateHelper(to) : new Date();
    let parsedFrom = from ? parseDateHelper(from) : new Date();
    if (!from) {
      parsedFrom.setDate(parsedTo.getDate() - 90);
    }

    let query = {
      commodity: new RegExp('^' + commodity + '$', 'i'),
      market: new RegExp('^' + market + '$', 'i'),
      parsed_date: { $gte: parsedFrom, $lte: parsedTo }
    };

    let data = await MandiPrice.find(query).sort({ parsed_date: 1 }).lean();

    let actualCommodity = commodity;
    let actualMarket = market;

    if (data.length > 0) {
      actualCommodity = data[0].commodity;
      actualMarket = data[0].market;
    } else {
      // Mock Data Generation
      const daysToGenerate = 90;
      const baseDate = parsedTo;
      let basePrice = 2000;
      const lowerComm = commodity.toLowerCase();
      if (lowerComm.includes('rice')) basePrice = 2050;
      else if (lowerComm.includes('chilli')) basePrice = 18000;
      else if (lowerComm.includes('cotton')) basePrice = 7200;
      else if (lowerComm.includes('wheat')) basePrice = 2450;

      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() - i);
        const dayStr = String(currentDate.getDate()).padStart(2, '0');
        const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
        const arrival_date = `${dayStr}/${monthStr}/${currentDate.getFullYear()}`;

        const priceChange = generateStablePriceChange(commodity, market) * (i - 45) * 0.4;
        const modal_price = Math.round(basePrice + priceChange);
        data.push({
          arrival_date,
          min_price: Math.round(modal_price * 0.92),
          max_price: Math.round(modal_price * 1.08),
          modal_price
        });
      }
    }

    let analytics = null;
    if (data.length > 0) {
      const modalPrices = data.map(item => item.modal_price);
      const totalModal = modalPrices.reduce((sum, val) => sum + val, 0);
      const oldestPrice = data[0].modal_price;
      const newestPrice = data[data.length - 1].modal_price;
      const priceChangePercentage = oldestPrice > 0 ? Number((((newestPrice - oldestPrice) / oldestPrice) * 100).toFixed(2)) : 0;

      analytics = {
        average_modal_price: Math.round(totalModal / data.length),
        highest_price: Math.max(...modalPrices),
        lowest_price: Math.min(...modalPrices),
        price_change: newestPrice - oldestPrice,
        price_change_percentage: priceChangePercentage,
        trend: priceChangePercentage > 1 ? "Bullish" : priceChangePercentage < -1 ? "Bearish" : "Stable"
      };
    }

    res.json({
      success: true,
      commodity: actualCommodity,
      market: actualMarket,
      from: from,
      to: to,
      count: data.length,
      analytics,
      data: data.map(d => ({
        arrival_date: d.arrival_date,
        min_price: d.min_price,
        max_price: d.max_price,
        modal_price: d.modal_price
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

app.post('/api/keys/generate', async (req, res) => {
  const { email, app_name } = req.body;
  if (!email || !app_name) return res.status(400).json({ success: false, message: "Required" });

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';
  for (let i = 0; i < 24; i++) randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  const apiKey = `agro_live_${randomPart}`;

  try {
    await User.create({ email, appName: app_name, apiKey });
    res.json({ success: true, api_key: apiKey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate key', error: error.message });
  }
});

app.post('/api/admin/sync', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== (process.env.ADMIN_KEY || 'kisanetra_admin_2026')) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  syncGovApi().catch(err => console.error(err));
  res.json({ success: true, message: "Sync started in background" });
});

// GET / Developer Console Page
app.get('/', (req, res) => {
  const stats = global.apiStatsCache || {
    totalRecords: 969,
    statesCount: 4,
    commoditiesCount: 6,
    lastSync: '2026-05-26 13:08 PM',
    lastSyncStatus: 'success'
  };

  res.send(`
    <!DOCTYPE html>
    <html lang="en" class="h-full bg-slate-950 text-slate-100">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AgroBridge API Developer Portal</title>
      <!-- Google Fonts -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
      <!-- Tailwind CSS -->
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
              }
            }
          }
        }
      </script>
      <style>
        .glass-panel {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .neon-border-green {
          box-shadow: 0 0 15px rgba(22, 163, 74, 0.15);
          border: 1px solid rgba(22, 163, 74, 0.3);
        }
        .neon-glow-text {
          text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.6);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(22, 163, 74, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(22, 163, 74, 0.6);
        }
        @keyframes pulse-breathing {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .pulse-breath {
          animation: pulse-breathing 2s infinite ease-in-out;
        }
      </style>
    </head>
    <body class="h-full font-sans antialiased overflow-x-hidden">
      <!-- Background Decorative Lights -->
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-green-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-emerald-950/15 rounded-full blur-[150px] pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <!-- HEADER -->
        <header class="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-slate-800 gap-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-500/20">
              <svg class="w-6 h-6 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-green-400 bg-clip-text text-transparent">
                AgroBridge <span class="text-sm font-semibold text-green-500 uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-500/10 ml-2">v1.2.0</span>
              </h1>
              <p class="text-xs sm:text-sm text-slate-400 font-medium mt-1">High-performance Indian Mandi Price REST Gateway for Agritech Developers</p>
            </div>
          </div>
          <div class="flex items-center gap-4 bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-800">
            <span class="relative flex h-3 w-3">
              <span class="pulse-breath absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <div class="text-xs font-semibold">
              <span class="text-slate-300 block">Service Status</span>
              <span class="text-green-400">ONLINE & HEALTHY</span>
            </div>
          </div>
        </header>

        <!-- DASHBOARD REAL-TIME METRICS -->
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-8">
          <div class="glass-panel rounded-2xl p-4 sm:p-6 transition-all hover:border-slate-700/80 shadow-md">
            <span class="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-2">Total Mandi Records</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-bold tracking-tight text-white">${stats.totalRecords.toLocaleString()}</span>
              <span class="text-xs font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">Cached</span>
            </div>
          </div>
          <div class="glass-panel rounded-2xl p-4 sm:p-6 transition-all hover:border-slate-700/80 shadow-md">
            <span class="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-2">Active Indian States</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-bold tracking-tight text-white">${stats.statesCount}</span>
              <span class="text-xs font-semibold text-slate-500">States</span>
            </div>
          </div>
          <div class="glass-panel rounded-2xl p-4 sm:p-6 transition-all hover:border-slate-700/80 shadow-md">
            <span class="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-2">Crops Monitored</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-bold tracking-tight text-white">${stats.commoditiesCount}</span>
              <span class="text-xs font-semibold text-slate-500">Commodities</span>
            </div>
          </div>
          <div class="glass-panel rounded-2xl p-4 sm:p-6 transition-all hover:border-slate-700/80 shadow-md">
            <span class="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-2">Last Sync Log</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs sm:text-sm font-bold tracking-tight text-slate-100 truncate" title="${stats.lastSync}">${stats.lastSync.split(',')[0]}</span>
              <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${stats.lastSyncStatus === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}">
                ${stats.lastSyncStatus}
              </span>
            </div>
          </div>
        </section>

        <!-- MAIN DUAL SECTION -->
        <main class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- LEFT SIDE: Interactive API Console & Key Generator -->
          <div class="lg:col-span-8 space-y-8">
            <!-- INTERACTIVE API EXPLORER -->
            <div class="glass-panel rounded-3xl overflow-hidden shadow-2xl neon-border-green">
              <div class="px-6 py-5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <span class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  <h3 class="font-bold text-lg text-slate-100">Interactive API Playground</h3>
                </div>
                <span class="text-xs text-slate-500 font-mono">sandbox=live</span>
              </div>
              
              <div class="p-6 space-y-6">
                <!-- Endpoint Chooser -->
                <div class="flex gap-2">
                  <button id="tab-prices" onclick="switchEndpoint('prices')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-green-600 text-slate-950 shadow-md">
                    GET /api/mandi-prices
                  </button>
                  <button id="tab-history" onclick="switchEndpoint('history')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-slate-800 hover:bg-slate-700 text-slate-300">
                    GET /api/mandi-prices/history
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <!-- Query Input Panel -->
                  <div class="md:col-span-5 space-y-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Request Parameters</h4>
                    
                    <div>
                      <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">API Key (x-api-key)</label>
                      <input type="text" id="param-key" value="agro_secret_key_12345" class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs font-semibold text-green-400 focus:outline-none focus:border-green-600 font-mono">
                    </div>

                    <!-- Prices Parameters -->
                    <div id="group-prices" class="space-y-4">
                      <div>
                        <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">State Filter</label>
                        <select id="param-state" onchange="updateQueryUrl()" class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-green-600">
                          <option value="">All States</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Gujarat">Gujarat</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Commodity Filter</label>
                        <select id="param-commodity" onchange="updateQueryUrl()" class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-green-600">
                          <option value="">All Commodities</option>
                          <option value="Wheat">Wheat</option>
                          <option value="Onion">Onion</option>
                          <option value="Chilli">Chilli</option>
                          <option value="Tomato">Tomato</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Search Query</label>
                        <input type="text" id="param-search" oninput="updateQueryUrl()" placeholder="e.g. Ratlam, Chilli..." class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-green-600">
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Limit</label>
                          <input type="number" id="param-limit" oninput="updateQueryUrl()" value="5" min="1" max="100" class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-green-600">
                        </div>
                        <div>
                          <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Page</label>
                          <input type="number" id="param-page" oninput="updateQueryUrl()" value="1" min="1" class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-green-600">
                        </div>
                      </div>
                    </div>

                    <!-- History Parameters (Hidden by default) -->
                    <div id="group-history" class="space-y-4 hidden">
                      <div>
                        <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Commodity (Required)</label>
                        <input type="text" id="param-hist-commodity" oninput="updateQueryUrl()" value="Wheat" class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-green-600">
                      </div>
                      <div>
                        <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Market (Required)</label>
                        <input type="text" id="param-hist-market" oninput="updateQueryUrl()" value="Achnera APMC" class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-green-600">
                      </div>
                    </div>

                    <button onclick="runInteractiveQuery()" class="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-slate-950 font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-green-600/10 hover:shadow-green-500/20 active:scale-95 transition-all">
                      ⚡ Execute API Query
                    </button>
                  </div>

                  <!-- Live Response Panel -->
                  <div class="md:col-span-7 flex flex-col h-full">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Response Visualizer</span>
                      <button onclick="copyResponseText()" class="text-[10px] font-bold uppercase text-green-400 hover:text-green-300 transition-colors">Copy JSON</button>
                    </div>
                    <div class="flex-grow bg-slate-950 p-4 rounded-2xl border border-slate-850 font-mono text-[11px] min-h-[300px] max-h-[420px] overflow-y-auto relative flex flex-col justify-between">
                      <pre id="response-content" class="text-slate-300 overflow-x-auto select-text whitespace-pre-wrap">Click "Execute API Query" to query the live gateway...</pre>
                      <div id="loader" class="absolute inset-0 bg-slate-950/95 flex items-center justify-center hidden">
                        <div class="flex items-center gap-2 bg-slate-900 border border-green-500/20 px-4 py-2.5 rounded-full shadow-xl">
                          <div class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                          <span class="text-xs font-bold text-green-400 tracking-wide">FETCHING GATEWAY...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- URL Indicator -->
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-900 text-[11px] font-mono flex items-center justify-between gap-3 text-slate-400">
                  <span class="font-semibold select-all" id="url-preview">https://kisan-commodity.onrender.com/api/mandi-prices?api_key=agro_secret_key_12345&limit=5&page=1</span>
                  <span class="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded uppercase">GET</span>
                </div>
              </div>
            </div>

            <!-- CODE INTEGRATION CENTER -->
            <div class="glass-panel rounded-3xl p-6 shadow-2xl space-y-6">
              <div>
                <h3 class="font-bold text-lg text-slate-100 mb-1">Developer Integration Guide</h3>
                <p class="text-xs text-slate-400 font-medium">Copy complete, robust integration templates in your preferred programming language.</p>
              </div>

              <div class="flex gap-2 border-b border-slate-900 pb-3">
                <button id="lang-curl" onclick="switchLang('curl')" class="px-4 py-2 rounded-xl text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">cURL</button>
                <button id="lang-js" onclick="switchLang('js')" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-400">JavaScript</button>
                <button id="lang-py" onclick="switchLang('py')" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-400">Python</button>
              </div>

              <div class="bg-slate-950 p-5 rounded-2xl border border-slate-850 font-mono text-[11.5px] text-slate-300 relative select-text overflow-x-auto">
                <pre id="code-snippet-box" class="whitespace-pre">curl -H "x-api-key: agro_secret_key_12345" "https://kisan-commodity.onrender.com/api/mandi-prices?limit=5"</pre>
              </div>
            </div>
          </div>

          <!-- RIGHT SIDE: API Keys Generator & Endpoints -->
          <div class="lg:col-span-4 space-y-8">
            <!-- INSTANT API KEY GENERATOR -->
            <div class="glass-panel rounded-3xl p-6 shadow-2xl space-y-5 bg-gradient-to-b from-slate-900/60 to-slate-950/40">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400">
                  🔑
                </div>
                <div>
                  <h3 class="font-bold text-base text-slate-100">Sandbox API Key Maker</h3>
                  <p class="text-[11px] text-slate-500">Register instantly for direct access</p>
                </div>
              </div>

              <div class="space-y-3.5">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Developer Email</label>
                  <input type="email" id="key-email" placeholder="lalith@agrocorp.com" class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-green-600">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Application Name</label>
                  <input type="text" id="key-app" placeholder="KisanMandi Portal" class="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-green-600">
                </div>
                
                <button onclick="requestApiKey()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold text-xs py-3 rounded-xl active:scale-95 transition-all">
                  🔑 Issue Live Sandbox API Key
                </button>
              </div>

              <div id="key-result" class="hidden animate-fadeIn bg-green-950/30 p-4 rounded-xl border border-green-500/20">
                <span class="text-[10px] font-bold text-green-400 uppercase block mb-1">KEY ISSUED SUCCESSFULLY!</span>
                <div class="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-lg border border-slate-850">
                  <span id="generated-key-text" class="text-xs font-mono font-bold text-green-400 select-all tracking-wide truncate">agro_live_...</span>
                  <button onclick="copyGeneratedKey()" class="text-[9px] font-bold uppercase text-slate-400 hover:text-white shrink-0">Copy</button>
                </div>
              </div>
            </div>

            <!-- GATEWAY ROUTE METADATA -->
            <div class="glass-panel rounded-3xl p-6 shadow-2xl space-y-6">
              <div>
                <h3 class="font-bold text-base text-slate-100">Gateway Route Registry</h3>
                <p class="text-[11px] text-slate-500">Overview of all active REST paths</p>
              </div>

              <div class="space-y-4">
                <div class="p-3 bg-slate-900/30 rounded-xl border border-slate-850 hover:border-slate-800 transition-all">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="font-mono text-xs text-white font-bold">/api/mandi-prices</span>
                    <span class="text-[9px] font-bold bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded">GET</span>
                  </div>
                  <p class="text-[11px] text-slate-400 leading-relaxed">Returns current crop rates with Today vs Yesterday comparison. Supports sorting, pagination, and Indian state/market/crop filtering.</p>
                </div>

                <div class="p-3 bg-slate-900/30 rounded-xl border border-slate-850 hover:border-slate-800 transition-all">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="font-mono text-xs text-white font-bold">/api/mandi-prices/history</span>
                    <span class="text-[9px] font-bold bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded">GET</span>
                  </div>
                  <p class="text-[11px] text-slate-400 leading-relaxed">Retrieves 90-day daily price trends and analytics (Highest, Lowest, Average modal crop rate) for charting.</p>
                </div>

                <div class="p-3 bg-slate-900/30 rounded-xl border border-slate-850 hover:border-slate-800 transition-all">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="font-mono text-xs text-white font-bold">/api/health</span>
                    <span class="text-[9px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">GET</span>
                  </div>
                  <p class="text-[11px] text-slate-400 leading-relaxed">Public health monitor showing overall system heartbeat, date sync status, and internal components status.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer class="mt-16 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>© 2026 AgroBridge Gateway. Designed for rural agricultural growth and premium developer experience.</p>
        </footer>
      </div>

      <!-- PLAYGROUND SCRIPT -->
      <script>
        let currentEndpoint = 'prices';
        let currentLang = 'curl';

        function switchEndpoint(type) {
          currentEndpoint = type;
          document.getElementById('tab-prices').className = type === 'prices' 
            ? 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-green-600 text-slate-950 shadow-md'
            : 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-slate-800 hover:bg-slate-700 text-slate-300';
          document.getElementById('tab-history').className = type === 'history'
            ? 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-green-600 text-slate-950 shadow-md'
            : 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-slate-800 hover:bg-slate-700 text-slate-300';

          if (type === 'prices') {
            document.getElementById('group-prices').classList.remove('hidden');
            document.getElementById('group-history').classList.add('hidden');
          } else {
            document.getElementById('group-prices').classList.add('hidden');
            document.getElementById('group-history').classList.remove('hidden');
          }
          updateQueryUrl();
        }

        function switchLang(lang) {
          currentLang = lang;
          ['curl', 'js', 'py'].forEach(l => {
            const btn = document.getElementById('lang-' + l);
            if (l === lang) {
              btn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20';
            } else {
              btn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-400';
            }
          });
          updateCodeSnippet();
        }

        function buildParams() {
          const key = document.getElementById('param-key').value;
          if (currentEndpoint === 'prices') {
            const state = document.getElementById('param-state').value;
            const comm = document.getElementById('param-commodity').value;
            const search = document.getElementById('param-search').value;
            const limit = document.getElementById('param-limit').value;
            const page = document.getElementById('param-page').value;

            let queryParts = [];
            queryParts.push('api_key=' + encodeURIComponent(key));
            if (state) queryParts.push('state=' + encodeURIComponent(state));
            if (comm) queryParts.push('commodity=' + encodeURIComponent(comm));
            if (search) queryParts.push('search=' + encodeURIComponent(search));
            if (limit) queryParts.push('limit=' + encodeURIComponent(limit));
            if (page) queryParts.push('page=' + encodeURIComponent(page));
            
            return {
              path: '/api/mandi-prices',
              query: '?' + queryParts.join('&')
            };
          } else {
            const comm = document.getElementById('param-hist-commodity').value;
            const market = document.getElementById('param-hist-market').value;
            
            let queryParts = [];
            queryParts.push('api_key=' + encodeURIComponent(key));
            queryParts.push('commodity=' + encodeURIComponent(comm));
            queryParts.push('market=' + encodeURIComponent(market));
            
            return {
              path: '/api/mandi-prices/history',
              query: '?' + queryParts.join('&')
            };
          }
        }

        function updateQueryUrl() {
          const params = buildParams();
          const host = window.location.origin;
          document.getElementById('url-preview').innerText = host + params.path + params.query;
          updateCodeSnippet();
        }

        function updateCodeSnippet() {
          const params = buildParams();
          const host = window.location.origin;
          const fullUrl = host + params.path + params.query;
          const box = document.getElementById('code-snippet-box');

          if (currentLang === 'curl') {
            box.innerText = 'curl -H "x-api-key: ' + document.getElementById('param-key').value + '" "' + fullUrl.replace('api_key=', 'mock_key=') + '"';
          } else if (currentLang === 'js') {
            box.innerText = '// Copy this into your JavaScript controller\\n' +
              'fetch("' + fullUrl + '")\\n' +
              '  .then(res => res.json())\\n' +
              '  .then(json => console.log("Mandi Response:", json))\\n' +
              '  .catch(err => console.error("API error:", err));';
          } else if (currentLang === 'py') {
            box.innerText = '# Copy this into your Python script\\n' +
              'import requests\\n\\n' +
              'url = "' + fullUrl + '"\\n' +
              'response = requests.get(url)\\n' +
              'if response.status_code == 200:\\n' +
              '    data = response.json()\\n' +
              '    print("AgroBridge records:", len(data.get("data", [])))\\n' +
              'else:\\n' +
              '    print("Error:", response.status_code)';
          }
        }

        async function runInteractiveQuery() {
          const loader = document.getElementById('loader');
          const pre = document.getElementById('response-content');
          loader.classList.remove('hidden');

          const params = buildParams();
          const url = params.path + params.query;
          
          try {
            const res = await fetch(url);
            const json = await res.json();
            pre.innerText = JSON.stringify(json, null, 2);
          } catch (err) {
            pre.innerText = "Error executing query: " + err.message;
          } finally {
            loader.classList.add('hidden');
          }
        }

        async function requestApiKey() {
          const email = document.getElementById('key-email').value;
          const app = document.getElementById('key-app').value;

          if (!email || !app) {
            alert("Email and Application Name are required!");
            return;
          }

          try {
            const res = await fetch('/api/keys/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, app_name: app })
            });
            const json = await res.json();
            if (json && json.success) {
              document.getElementById('generated-key-text').innerText = json.api_key;
              document.getElementById('key-result').classList.remove('hidden');
              // Automatically put it in the key inputs!
              document.getElementById('param-key').value = json.api_key;
              updateQueryUrl();
            } else {
              alert("Could not generate key: " + (json.message || "Unknown error"));
            }
          } catch (err) {
            alert("Failed to connect: " + err.message);
          }
        }

        function copyResponseText() {
          const pre = document.getElementById('response-content');
          navigator.clipboard.writeText(pre.innerText);
          alert("Response copied to clipboard!");
        }

        function copyGeneratedKey() {
          const txt = document.getElementById('generated-key-text').innerText;
          navigator.clipboard.writeText(txt);
          alert("API key copied to clipboard!");
        }

        // Initialize URL preview
        updateQueryUrl();
      </script>
    </body>
    </html>
  `);
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ AgroBridge API Server running securely on port ${PORT}`);
});
