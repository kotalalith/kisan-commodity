import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { 
  Key, 
  Copy, 
  Download, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Code2, 
  Terminal, 
  FileJson, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Play,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Building,
  Tv,
  Users,
  Code
} from "lucide-react";

// Beautiful syntax highlighter helper for integration code blocks
const renderHighlightedCode = (tab, apiKey) => {
  if (tab === "curl") {
    return (
      <code>
        <span className="tok-keyword font-bold">curl</span>{" "}
        <span className="tok-operator">-X</span>{" "}
        <span className="tok-boolean font-bold">GET</span> \{`\n  `}
        <span className="tok-string">"http://localhost:5000/api/mandi-prices?api_key={apiKey}"</span> \{`\n  `}
        <span className="tok-operator">-H</span>{" "}
        <span className="tok-string">"x-api-key: {apiKey}"</span>
      </code>
    );
  }
  if (tab === "javascript") {
    return (
      <code>
        <span className="tok-comment">// Fetch Mandi Prices in React/Node.js</span>{`\n`}
        <span className="tok-keyword font-bold">const</span>{" "}
        <span className="tok-function font-bold text-blue-400">fetchMandiPrices</span> ={" "}
        <span className="tok-keyword font-bold text-pink-500">async</span> () =&gt; {"{"}{`\n`}
        {"  "}<span className="tok-keyword font-bold text-pink-500">try</span> {"{"}{`\n`}
        {"    "}<span className="tok-keyword font-bold text-pink-500">const</span> <span className="tok-variable">res</span> ={" "}
        <span className="tok-keyword font-bold text-pink-500">await</span>{" "}
        <span className="tok-function font-bold text-blue-400">fetch</span>(
        <span className="tok-string">"http://localhost:5000/api/mandi-prices"</span>, {"{"}{`\n`}
        {"      "}headers: {"{"}{`\n`}
        {"        "}<span className="tok-string">"x-api-key"</span>:{" "}
        <span className="tok-string">"{apiKey}"</span>{`\n`}
        {"      "}{"}"}{`\n`}
        {"    "}{"}"});{`\n`}
        {"    "}<span className="tok-keyword font-bold text-pink-500">const</span> <span className="tok-variable">result</span> ={" "}
        <span className="tok-keyword font-bold text-pink-500">await</span> <span className="tok-variable">res</span>.
        <span className="tok-function text-blue-400">json</span>();{`\n`}
        {"    "}<span className="tok-variable">console</span>.<span className="tok-function text-blue-400">log</span>(
        <span className="tok-string">"Mandi Prices:"</span>, <span className="tok-variable">result</span>.
        <span className="tok-property">data</span>);{`\n`}
        {"  "}{"}"} <span className="tok-keyword font-bold text-pink-500">catch</span> (<span className="tok-variable">error</span>) {"{"}{`\n`}
        {"    "}<span className="tok-variable">console</span>.<span className="tok-function text-blue-400">error</span>(
        <span className="tok-string">"Fetch failed:"</span>, <span className="tok-variable">error</span>);{`\n`}
        {"  "}{"}"}{`\n`}
        {"}"};
      </code>
    );
  }
  if (tab === "python") {
    return (
      <code>
        <span className="tok-comment"># Python Requests Implementation</span>{`\n`}
        <span className="tok-keyword font-bold text-pink-500">import</span> <span className="tok-variable">requests</span>{`\n\n`}
        <span className="tok-variable">url</span> ={" "}
        <span className="tok-string">"http://localhost:5000/api/mandi-prices"</span>{`\n`}
        <span className="tok-variable">headers</span> = {"{"}{`\n`}
        {"    "}<span className="tok-string">"x-api-key"</span>:{" "}
        <span className="tok-string">"{apiKey}"</span>{`\n`}
        {"}"}{`\n\n`}
        <span className="tok-keyword font-bold text-pink-500">try</span>:{`\n`}
        {"    "}<span className="tok-variable">response</span> = <span className="tok-variable">requests</span>.
        <span className="tok-function text-blue-400">get</span>(<span className="tok-variable">url</span>, headers=<span className="tok-variable">headers</span>){`\n`}
        {"    "}<span className="tok-variable">mandi_data</span> = <span className="tok-variable">response</span>.
        <span className="tok-function text-blue-400">json</span>(){`\n`}
        {"    "}<span className="tok-variable">print</span>(f<span className="tok-string">"Total Prices: {"{"}mandi_data.get('count'){"}"}"</span>){`\n`}
        <span className="tok-keyword font-bold text-pink-500">except</span> <span className="tok-property">Exception</span> <span className="tok-keyword font-bold text-pink-500">as</span> <span className="tok-variable">e</span>:{`\n`}
        {"    "}<span className="tok-function text-blue-400 font-bold">print</span>(<span className="tok-string">"API Error:"</span>, <span className="tok-variable">e</span>)
      </code>
    );
  }
  return <code>{apiKey}</code>;
};

// Beautiful syntax highlighter helper for JSON schema blocks
const renderSchemaCode = () => {
  return (
    <code>
      {"{"}{`\n`}
      {"  "}<span className="tok-property">"success"</span>: <span className="tok-boolean font-bold">true</span>,{`\n`}
      {"  "}<span className="tok-property">"count"</span>: <span className="tok-number">1</span>,{`\n`}
      {"  "}<span className="tok-property">"data"</span>: [{"{"}{`\n`}
      {"      "}<span className="tok-property">"id"</span>: <span className="tok-string">"1H2Y3x9"</span>,{`\n`}
      {"      "}<span className="tok-property">"commodity"</span>: <span className="tok-string">"Chilli"</span>,{`\n`}
      {"      "}<span className="tok-property">"market"</span>: <span className="tok-string">"Hyderabad APMC"</span>,{`\n`}
      {"      "}<span className="tok-property">"state"</span>: <span className="tok-string">"Telangana"</span>,{`\n`}
      {"      "}<span className="tok-property">"price"</span>: <span className="tok-number">14000</span>,{`\n`}
      {"      "}<span className="tok-property">"createdAt"</span>: <span className="tok-string">"2026-05-20T18:45:00.000Z"</span>{`\n`}
      {"    "}{"}"}]{`\n`}
      {"}"}
    </code>
  );
};

// Beautiful syntax highlighter helper for JSON API Responses
const renderHighlightedJSON = (data) => {
  if (!data) return null;
  const jsonStr = JSON.stringify(data, null, 2);
  
  return (
    <code>
      {jsonStr.split("\n").map((line, idx) => {
        if (/^\s*[{}[\],]*\s*$/.test(line)) {
          return <div key={idx} className="min-h-[1.2em]">{line}</div>;
        }
        
        const match = line.match(/^(\s*)(".*?")(\s*:\s*)(.*)$/);
        if (match) {
          const [_, indent, key, colon, value] = match;
          
          let valElem = <span>{value}</span>;
          const trimmedVal = value.trim().replace(/,$/, "");
          
          if (trimmedVal.startsWith('"')) {
            valElem = <span className="tok-string">{trimmedVal}</span>;
          } else if (trimmedVal === "true" || trimmedVal === "false") {
            valElem = <span className="tok-boolean">{trimmedVal}</span>;
          } else if (!isNaN(Number(trimmedVal))) {
            valElem = <span className="tok-number">{trimmedVal}</span>;
          } else if (trimmedVal === "null") {
            valElem = <span className="tok-keyword font-bold">{trimmedVal}</span>;
          }
          
          const hasComma = value.endsWith(",");
          
          return (
            <div key={idx} className="min-h-[1.2em]">
              {indent}
              <span className="tok-property">{key}</span>
              {colon}
              {valElem}
              {hasComma && ","}
            </div>
          );
        }
        return <div key={idx} className="min-h-[1.2em]">{line}</div>;
      })}
    </code>
  );
};

export default function ApiDashboard() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("curl");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [bypassLoading, setBypassLoading] = useState(false);

  const isApproved = userData?.status === "approved";
  const userApiKey = userData?.apiKey || "agro_live_72fa5d691e84b7a10f92b7c6";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(userApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEnv = () => {
    const envContent = `# AgroBridge REST API Credentials
AGROBRIDGE_API_URL=http://localhost:5000/api/mandi-prices
AGROBRIDGE_API_KEY=${userApiKey}
AGROBRIDGE_RESPONSE_FORMAT=${userData?.dataFormat || "JSON"}
AGROBRIDGE_PLATFORM=${userData?.displayPlatform || "Portal"}
`;
    const element = document.createElement("a");
    const file = new Blob([envContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = ".env";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Developer Admin Hack: Instantly approve status in Firestore for convenient testing
  const handleAutoApproveBypass = async () => {
    setBypassLoading(true);
    try {
      // 1. Try to update Firestore
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          status: "approved"
        });
      } catch (firestoreErr) {
        console.warn("Firestore update failed, proceeding in offline bypass mode:", firestoreErr.message);
      }

      // 2. Always update local storage profile status to approved for offline fallback support!
      const localDataKey = `agrobridge_fallback_profile_${currentUser.uid}`;
      const cached = localStorage.getItem(localDataKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.status = "approved";
        localStorage.setItem(localDataKey, JSON.stringify(parsed));
      } else {
        // Create a basic fallback profile structure
        const profileData = {
          name: "Developer Account",
          phoneNumber: currentUser.phoneNumber || "+919999999999",
          userType: "Developer",
          apiKey: `agro_live_${currentUser.uid.substring(0, 5)}${Math.random().toString(36).substring(2, 10)}`,
          status: "approved",
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(localDataKey, JSON.stringify(profileData));
      }

      alert("🎉 Success! Your API Key is now active and approved in Sandbox test mode!");
      window.location.reload();
    } catch (err) {
      console.error("Error auto-approving key:", err);
      alert("Failed to auto-approve: " + err.message);
    }
    setBypassLoading(false);
  };

  const handleRunTestQuery = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const response = await fetch(`http://localhost:5000/api/mandi-prices?api_key=${userApiKey}`);
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({
        success: false,
        message: "Failed to connect to API Server. Please ensure your Express Node.js server is running on port 5000.",
        error: err.message
      });
    }
    setTestLoading(false);
  };

  // Code snippet templates
  const snippets = {
    curl: `curl -X GET \\
  "http://localhost:5000/api/mandi-prices?api_key=${userApiKey}" \\
  -H "x-api-key: ${userApiKey}"`,
    
    javascript: `// Fetch Mandi Prices in React/Node.js
const fetchMandiPrices = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/mandi-prices", {
      headers: {
        "x-api-key": "${userApiKey}"
      }
    });
    const result = await res.json();
    console.log("Mandi Prices:", result.data);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
};`,
    
    python: `# Python Requests Implementation
import requests

url = "http://localhost:5000/api/mandi-prices"
headers = {
    "x-api-key": "${userApiKey}"
}

try:
    response = requests.get(url, headers=headers)
    mandi_data = response.json()
    print(f"Total Prices: {mandi_data.get('count')}")
except Exception as e:
    print("API Error:", e)`
  };

  // If user is not logged in, render the premium public Developer Landing Page
  if (!currentUser) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 animate-fadeIn">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden text-center mb-10 border border-green-500/20">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 -translate-x-1/4 translate-y-1/4 w-60 h-60 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-xs font-semibold uppercase tracking-wider text-green-400">
              <Sparkles size={12} className="text-yellow-300 animate-pulse" />
              AgroBridge REST API Services
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Real-time Agricultural Market Data
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Power your farmer apps, market dashboards, SMS alert systems, and LED display screens with verified real-time Mandi market crop rates.
            </p>
            
            <div className="pt-4">
              <button 
                onClick={() => alert("Registration and Logins are temporarily on hold during launch. Please check back later!")}
                className="inline-flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-8 py-3.5 rounded-2xl transition font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Key size={16} />
                <span>API Registrations on Hold</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { 
              title: "Sub-Second Latency", 
              desc: "Engineered on premium Express.js endpoints for lightning fast query times.",
              icon: Terminal,
              color: "text-green-600 bg-green-50"
            },
            { 
              title: "Unified Formats", 
              desc: "Get standardized JSON structures for crop types, market states, and MSP records.",
              icon: FileJson,
              color: "text-blue-600 bg-blue-50"
            },
            { 
              title: "Fail-Safe Redundancy", 
              desc: "Automatic fail-safe architecture to ensure market data displays successfully under all conditions.",
              icon: CheckCircle2,
              color: "text-amber-600 bg-amber-50"
            }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${f.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-gray-800 text-base">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Integration Preview Code block */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Code2 size={20} className="text-green-600" />
              Easy Integration Snippets
            </h3>
            
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {[
                { id: "curl", label: "cURL", icon: Terminal },
                { id: "javascript", label: "JavaScript", icon: Code2 },
                { id: "python", label: "Python", icon: FileJson }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <pre className="bg-gray-950 p-5 rounded-2xl text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed shadow-lg border border-gray-800">
              {snippets[activeTab]}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const isFarmer = userData?.userType === "Farmer";
  
  if (isFarmer) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="text-4xl">🌾</span>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome, {userData?.name || "Farmer"}!</h2>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full">
              <span>Farmer Member Account</span>
            </div>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed pt-2">
              As a registered Farmer on AgroBridge, you have immediate, direct access to real-time crops Mandi prices and market insights on our main dashboard without needing technical API integrations.
            </p>
            <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
              API keys and token downloads are reserved for software developers, agents, businesses, and display portal builders.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-2xl transition shadow-md hover:shadow-green-600/20 text-sm cursor-pointer"
            >
              Go to Mandi Dashboard
            </button>
            <button
              onClick={() => navigate("/insights")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl transition text-sm cursor-pointer"
            >
              View Market Insights
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Welcome Banner with animated mesh gradient */}
      <div className="animated-mesh-banner rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden mb-8 border border-white/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-72 h-72 bg-emerald-950/50 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border border-white/10 hover:bg-white/25 transition-all">
              <Sparkles size={12} className="text-yellow-300 animate-pulse" />
              <span>Developer Central</span>
            </div>
            <h1 className="text-3xl sm:text-5.5xl font-extrabold tracking-tight leading-none drop-shadow-md">
              AgroBridge API Portal
            </h1>
            <p className="text-emerald-50/90 text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
              Integrate real-time Mandi market rates into your apps, dashboards, SMS alert networks, and local LED screens with verified high-performance endpoints.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <button 
              onClick={handleDownloadEnv}
              disabled={!isApproved}
              className="flex items-center justify-center gap-2 bg-white text-green-700 hover:bg-green-50 px-7 py-4 rounded-2xl transition-all font-bold text-sm shadow-xl shadow-black/10 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Download size={16} className="stroke-[2.5]" />
              <span>Download .env</span>
            </button>
            <a 
              href="http://localhost:5000/api/health" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-7 py-4 rounded-2xl transition-all font-bold text-sm hover:scale-[1.03] active:scale-[0.97] cursor-pointer backdrop-blur-sm shadow-lg shadow-black/5"
            >
              <span>API Health</span>
              <ExternalLink size={14} className="stroke-[2.5]" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: API Key Management & Status */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Key Status Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5 premium-hover-card">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Key size={18} className="text-green-600 dark:text-green-500" />
              Your Sandbox Key
            </h3>

            {/* Approval Status Badge */}
            {isApproved ? (
              <div className="flex items-center gap-3.5 px-4.5 py-4 bg-green-500/[0.04] border border-green-500/30 text-green-800 dark:text-green-400 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full glow-green-pulse shrink-0"></div>
                <div>
                  <span className="text-sm font-bold block leading-none">Access Status: Approved</span>
                  <span className="text-[11px] opacity-80 mt-1 block">Your production key is active & queryable.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 px-4.5 py-4 bg-amber-500/[0.04] border border-amber-500/30 text-amber-900 dark:text-amber-400 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full glow-amber-pulse shrink-0"></div>
                  <div>
                    <span className="text-sm font-bold block leading-none">Access Status: Pending</span>
                    <span className="text-[11px] opacity-80 mt-1 block">Admin (Lalith) is reviewing your application details.</span>
                  </div>
                </div>

                {/* Developer Auto-Approve Admin Bypass Button */}
                <div className="pt-3.5 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2 leading-relaxed">
                    💡 **Developer Mode Hack:** Click below to bypass review and instantly self-approve this key in Firestore!
                  </p>
                  <button
                    type="button"
                    onClick={handleAutoApproveBypass}
                    disabled={bypassLoading}
                    className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {bypassLoading ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    <span>Demo Bypass: Auto-Approve Key</span>
                  </button>
                </div>
              </div>
            )}

            {/* API Key Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">API Client Token</label>
              
              <div className="premium-input-wrapper">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-950 p-1.5 rounded-[15px]">
                  <input
                    type={showKey ? "text" : "password"}
                    readOnly
                    value={userApiKey}
                    className="flex-1 bg-transparent px-3 text-sm font-mono focus:outline-none text-gray-700 dark:text-gray-300 truncate"
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition cursor-pointer"
                    title={showKey ? "Hide key" : "Show key"}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition cursor-pointer relative"
                    title="Copy key"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Context */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Registered Profile</h4>
              
              <div className="grid grid-cols-1 gap-2.5 text-xs">
                
                <div className="flex items-center gap-3.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all premium-hover-card">
                  <div className="p-2 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-xl shrink-0">
                    <Building size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold block">Organization</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-300 truncate block">
                      {userData?.organization || "Personal Project"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all premium-hover-card">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                    <Tv size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold block">Display Platform</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-300 truncate block">
                      {userData?.displayPlatform || "Website"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all premium-hover-card">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                    <Users size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold block">Audience Benefitted</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-300 truncate block">
                      {userData?.audienceSize || "Medium Community"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all premium-hover-card">
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
                    <Code size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold block">Subscribed APIs</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-300 block capitalize truncate">
                      {userData?.selectedApis ? userData.selectedApis.join(", ") : "mandiPrices"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Quick Sandbox Tester */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 premium-hover-card">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Play size={18} className="text-green-600 dark:text-green-500" />
              Sandbox Request Tester
            </h3>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Test your API key in real-time by querying your local Express REST server endpoints directly.
            </p>

            <button
              onClick={handleRunTestQuery}
              disabled={testLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg hover:shadow-green-600/35 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {testLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Play size={16} className="stroke-[2.5]" />
              )}
              <span>Send Test Request</span>
            </button>

            {testResult && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">API Response</label>
                
                <div className="relative rounded-2xl overflow-hidden border border-gray-850 shadow-2xl syntax-container">
                  <div className="bg-gray-900 px-3 py-2 flex items-center justify-between border-b border-gray-850">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#ff5f56] rounded-full"></span>
                      <span className="w-2.5 h-2.5 bg-[#ffbd2e] rounded-full"></span>
                      <span className="w-2.5 h-2.5 bg-[#27c93f] rounded-full"></span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500">output.json</span>
                  </div>
                  
                  <pre className="bg-gray-950 p-4.5 pt-3.5 text-[10px] font-mono text-gray-200 overflow-x-auto max-h-56 leading-relaxed custom-scrollbar">
                    {renderHighlightedJSON(testResult)}
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Code Samples & Docs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Integration Guide */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5 premium-hover-card">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Code2 size={20} className="text-green-600 dark:text-green-500" />
                Integration Snippets
              </h3>
              
              {/* Tab Toggles */}
              <div className="flex bg-gray-100 dark:bg-gray-950 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                {[
                  { id: "curl", label: "cURL", icon: Terminal },
                  { id: "javascript", label: "JavaScript", icon: Code2 },
                  { id: "python", label: "Python", icon: FileJson }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white"
                      }`}
                    >
                      <Icon size={12} className="stroke-[2.5]" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Include your custom `apiKey` token in either the **`x-api-key`** header OR as the **`api_key`** query parameter.
            </p>

            {/* Fenced Code Snippet block */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-850 syntax-container">
              {/* Mac-style Window header */}
              <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-850">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#ff5f56] rounded-full"></span>
                  <span className="w-3 h-3 bg-[#ffbd2e] rounded-full"></span>
                  <span className="w-3 h-3 bg-[#27c93f] rounded-full"></span>
                </div>
                <span className="text-[10px] text-gray-400 font-semibold font-mono tracking-wider">
                  {activeTab === "curl" ? "bash" : activeTab === "javascript" ? "javascript.js" : "python.py"}
                </span>
              </div>
              
              <pre className="bg-gray-950 p-5 pt-4 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed custom-scrollbar">
                {renderHighlightedCode(activeTab, userApiKey)}
              </pre>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(snippets[activeTab]);
                  alert("Code snippet copied to clipboard!");
                }}
                className="absolute top-14 right-3.5 p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition border border-gray-700 cursor-pointer shadow-md"
                title="Copy snippet"
              >
                <Copy size={14} className="stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Endpoint Documentation */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 premium-hover-card">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FileJson size={18} className="text-green-600 dark:text-green-500" />
              API Reference: Mandi Prices
            </h3>
            
            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden text-sm shadow-sm">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-950 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-extrabold rounded-md border border-green-500/20">GET</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300 font-bold">/api/mandi-prices</span>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-wide">Returns Live Crops Data</span>
              </div>
              
              <div className="p-5 space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Request Parameters</h4>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 pb-2">
                        <th className="pb-2.5 font-bold">Parameter</th>
                        <th className="pb-2.5 font-bold">Type</th>
                        <th className="pb-2.5 font-bold">Required</th>
                        <th className="pb-2.5 font-bold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-400">
                      <tr>
                        <td className="py-3 font-mono text-gray-900 dark:text-gray-100 font-bold">api_key</td>
                        <td className="py-3 text-gray-500 dark:text-gray-400 font-medium">string</td>
                        <td className="py-3 text-amber-600 dark:text-amber-500 font-extrabold">Conditional</td>
                        <td className="py-3 font-medium">Your sandbox authorization key. (Or pass in `x-api-key` header).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">JSON Success Schema</h4>
                  
                  <div className="relative rounded-2xl overflow-hidden border border-gray-850 shadow-2xl syntax-container">
                    <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between border-b border-gray-850">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#ff5f56] rounded-full"></span>
                        <span className="w-2.5 h-2.5 bg-[#ffbd2e] rounded-full"></span>
                        <span className="w-2.5 h-2.5 bg-[#27c93f] rounded-full"></span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">response_schema.json</span>
                    </div>
                    
                    <pre className="bg-gray-950 p-5 pt-4 text-xs font-mono text-gray-200 leading-relaxed overflow-x-auto max-h-64 custom-scrollbar">
                      {renderSchemaCode()}
                    </pre>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
