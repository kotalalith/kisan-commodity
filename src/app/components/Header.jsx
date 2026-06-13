import { useState } from "react";
import { 
  User, 
  Menu, 
  Globe, 
  LogOut, 
  X, 
  ShieldCheck, 
  Clock, 
  Building, 
  Smartphone, 
  Tv, 
  Users, 
  Code,
  Edit2,
  Save,
  Check
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, userData, setUserData, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Profile Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUserType, setEditUserType] = useState("");
  const [editOrganization, setEditOrganization] = useState("");
  const [editDisplayPlatform, setEditDisplayPlatform] = useState("");
  const [editAudienceSize, setEditAudienceSize] = useState("");
  const [editSelectedApis, setEditSelectedApis] = useState([]);
  const [editApiPurpose, setEditApiPurpose] = useState("");

  const initials = userData?.name 
    ? userData.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() 
    : "U";

  const isApproved = userData?.status === "approved";

  const handleLogoutClick = () => {
    logout();
    setIsProfileOpen(false);
    setIsEditing(false);
    navigate("/");
  };

  const startEditing = () => {
    setEditName(userData?.name || "");
    setEditUserType(userData?.userType || "Developer");
    setEditOrganization(userData?.organization || "");
    setEditDisplayPlatform(userData?.displayPlatform || "Website / Digital Portal");
    setEditAudienceSize(userData?.audienceSize || "Small Community (< 100 Farmers)");
    setEditSelectedApis(userData?.selectedApis || ["mandiPrices"]);
    setEditApiPurpose(userData?.apiPurpose || "");
    setIsEditing(true);
  };

  const toggleEditApiSelection = (apiId) => {
    if (editSelectedApis.includes(apiId)) {
      setEditSelectedApis(editSelectedApis.filter(id => id !== apiId));
    } else {
      setEditSelectedApis([...editSelectedApis, apiId]);
    }
  };

  const handleSaveChanges = async () => {
    if (!editName.trim()) {
      alert("Name is required.");
      return;
    }

    const updatedData = {
      ...userData,
      name: editName,
      userType: editUserType,
      role: editUserType,
      organization: editOrganization || "Personal Project",
      displayPlatform: editDisplayPlatform,
      audienceSize: editAudienceSize,
      selectedApis: editSelectedApis,
      apiPurpose: editApiPurpose,
    };

    // 1. Instantly save to LocalStorage fallback
    try {
      localStorage.setItem(`agrobridge_fallback_profile_${currentUser.uid}`, JSON.stringify(updatedData));
    } catch (e) {
      console.error("Local storage update failed:", e);
    }

    // 2. Instantly update React context to redraw UI
    setUserData(updatedData);

    // 3. Gracefully sync to Firestore in background
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        name: editName,
        userType: editUserType,
        role: editUserType,
        organization: editOrganization || "Personal Project",
        displayPlatform: editDisplayPlatform,
        audienceSize: editAudienceSize,
        selectedApis: editSelectedApis,
        apiPurpose: editApiPurpose,
      });
      console.log("Firestore profile updated successfully.");
    } catch (error) {
      console.warn("Firestore update skipped or failed (using offline fallback):", error);
    }

    setIsEditing(false);
  };


  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-tr from-emerald-600 to-green-400 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <span className="text-slate-950 font-extrabold text-lg">A</span>
              </div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent tracking-tight">AgroBridge</h1>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 font-medium transition-colors"}
              >
                {t('dashboard')}
              </NavLink>
              <NavLink 
                to="/insights" 
                className={({ isActive }) => isActive ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 font-medium transition-colors"}
              >
                {t('insights')}
              </NavLink>
              <NavLink 
                to="/add-price" 
                className={({ isActive }) => isActive ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 font-medium transition-colors"}
              >
                {t('addPrice')}
              </NavLink>
              {(!userData || userData.userType !== "Farmer") && (
                <NavLink 
                  to="/api" 
                  className={({ isActive }) => isActive ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 font-medium transition-colors"}
                >
                  API
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1 text-slate-300 px-2 py-2 rounded-lg hover:bg-slate-800/50 transition-colors">
              <Globe size={18} className="text-emerald-500" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer font-semibold text-slate-300 [&>option]:bg-slate-900"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* Profile Navigation Capsule */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-3">
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-sm border border-green-200/30"
                  title="View Profile Details"
                >
                  {userData?.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt="Profile" 
                      className="w-5 h-5 rounded-full object-cover border border-green-500 shadow-sm"
                    />
                  ) : (
                    <User size={14} className="text-green-600" />
                  )}
                  <span className="text-sm font-semibold truncate max-w-[120px]">
                    {userData?.name || "Developer"}
                  </span>
                </button>
                <button 
                  onClick={handleLogoutClick} 
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              /* Login button is commented out as logins are currently on hold */
              /*
              <button 
                onClick={() => navigate('/login')} 
                className="hidden md:flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all font-semibold text-sm shadow-md cursor-pointer hover:scale-[1.02]"
              >
                <User size={16} />
                <span>Login</span>
              </button>
              */
              null
            )}
            
            {/* Mobile menu trigger */}
            <button className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* POPUP: Beautiful detailed profile modal when clicking on the profile capsule */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md border border-gray-100 shadow-2xl p-6 relative overflow-hidden animate-fadeIn">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setIsProfileOpen(false);
                setIsEditing(false);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {isEditing ? (
              // EDIT MODE
              <div className="animate-fadeIn">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 mt-2">
                  <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                    <Edit2 size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                    <p className="text-xs text-gray-400">Update your details to sync automatically</p>
                  </div>
                </div>

                {/* Scrollable Form Fields */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto px-1 pr-2 mb-6 custom-scrollbar">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="block w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm font-semibold text-gray-800"
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* User Type */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">User Type (Role)</label>
                    <select
                      value={editUserType}
                      onChange={(e) => setEditUserType(e.target.value)}
                      className="block w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm font-semibold text-gray-800 cursor-pointer"
                    >
                      <option value="Farmer">Farmer</option>
                      <option value="Developer">Developer</option>
                      <option value="Mandi Agent / Trader">Mandi Agent / Trader</option>
                      <option value="Business / Company">Business / Company</option>
                      <option value="Research Analyst">Research Analyst</option>
                      <option value="Student">Student</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Organization */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Organization</label>
                    <input
                      type="text"
                      value={editOrganization}
                      onChange={(e) => setEditOrganization(e.target.value)}
                      className="block w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm font-semibold text-gray-800"
                      placeholder="Company, College, or Village Name"
                    />
                  </div>

                  {/* Display Platform */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Display Platform</label>
                    <select
                      value={editDisplayPlatform}
                      onChange={(e) => setEditDisplayPlatform(e.target.value)}
                      className="block w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm font-semibold text-gray-800 cursor-pointer"
                    >
                      <option value="Website / Digital Portal">Website / Digital Portal</option>
                      <option value="Mobile App (Android / iOS)">Mobile App (Android / iOS)</option>
                      <option value="WhatsApp / SMS Alert System">WhatsApp / SMS Alert System</option>
                      <option value="LED Marketplace Display Board">LED Marketplace Display Board</option>
                      <option value="Personal Dashboard / Study">Personal Dashboard / Study</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Expected Farmers/Audience Size */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Expected Audience Size</label>
                    <select
                      value={editAudienceSize}
                      onChange={(e) => setEditAudienceSize(e.target.value)}
                      className="block w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm font-semibold text-gray-800 cursor-pointer"
                    >
                      <option value="Small Community (< 100 Farmers)">Small Community (&lt; 100 Farmers)</option>
                      <option value="Medium District (100 - 1,000 Farmers)">Medium District (100 - 1,000 Farmers)</option>
                      <option value="Large Region (1,000 - 10,000 Farmers)">Large Region (1,000 - 10,000 Farmers)</option>
                      <option value="State / National Scale (10,000+ Farmers)">State / National Scale (10,000+ Farmers)</option>
                    </select>
                  </div>

                  {/* APIs Subscribed */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">APIs Subscribed</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: "mandiPrices", name: "Mandi Prices API", desc: "Live agricultural crop prices" },
                        { id: "marketInsights", name: "Market Insights API", desc: "Predictive analytics" },
                        { id: "weatherCommodity", name: "Weather Advisory API", desc: "Real-time advisory & weather" }
                      ].map((api) => {
                        const isSelected = editSelectedApis.includes(api.id);
                        return (
                          <button
                            key={api.id}
                            type="button"
                            onClick={() => toggleEditApiSelection(api.id)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                              isSelected 
                                ? "border-green-500 bg-green-50/60 text-green-800 border-2 font-medium" 
                                : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className={`mt-0.5 p-0.5 rounded ${isSelected ? "bg-green-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                              <Check size={10} className={isSelected ? "text-white" : "text-transparent"} />
                            </div>
                            <div>
                              <span className="font-bold block leading-tight">{api.name}</span>
                              <span className="opacity-80 text-[10px] mt-0.5 block">{api.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Usage Purpose */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">API Intended Usage</label>
                    <textarea
                      rows="2"
                      value={editApiPurpose}
                      onChange={(e) => setEditApiPurpose(e.target.value)}
                      className="block w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm font-medium text-gray-700 placeholder-gray-400"
                      placeholder="Explain how this data is used..."
                    />
                  </div>
                </div>

                {/* Edit Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition text-sm cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition shadow-md hover:shadow-green-600/20 text-sm cursor-pointer text-center"
                  >
                    <Save size={14} />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              // VIEW MODE
              <div className="animate-fadeIn">
                {/* Initials / Image Banner */}
                <div className="flex flex-col items-center text-center mt-3 mb-6">
                  {userData?.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt="Profile" 
                      className="w-18 h-18 rounded-full object-cover border-2 border-green-500 shadow-md mb-3"
                    />
                  ) : (
                    <div className="w-18 h-18 bg-gradient-to-br from-green-500 to-green-600 text-white font-extrabold text-2xl rounded-full flex items-center justify-center shadow-lg mb-3">
                      {initials}
                    </div>
                  )}
                  
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">{userData?.name || "Developer Account"}</h2>
                  <span className="text-xs text-gray-400 font-semibold uppercase mt-0.5 tracking-wider">
                    {userData?.userType || "API Client"}
                  </span>

                  {/* Status Badge */}
                  <div className="mt-2.5">
                    {isApproved ? (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full shadow-sm">
                        <ShieldCheck size={12} />
                        <span>Approved / Active Keys</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full shadow-sm">
                        <Clock size={12} />
                        <span>Pending Admin Review</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile specifications list */}
                <div className="space-y-3.5 border-t border-gray-100 pt-5 text-sm text-gray-700 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-semibold flex items-center gap-1.5"><Smartphone size={14} /> Verified Phone</span>
                    <span className="font-bold text-gray-800 text-xs">{userData?.phoneNumber || "Unverified"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-semibold flex items-center gap-1.5"><Building size={14} /> Organization</span>
                    <span className="font-semibold text-gray-800 text-xs truncate max-w-[200px]">
                      {userData?.organization || "Personal Project"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-semibold flex items-center gap-1.5"><Tv size={14} /> Display Platform</span>
                    <span className="font-semibold text-gray-800 text-xs">{userData?.displayPlatform || "Website"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-semibold flex items-center gap-1.5"><Users size={14} /> Farmers Benefitted</span>
                    <span className="font-semibold text-gray-800 text-xs truncate max-w-[200px]">{userData?.audienceSize || "Medium Group"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-semibold flex items-center gap-1.5"><Code size={14} /> APIs Subscribed</span>
                    <span className="font-semibold text-green-700 text-xs truncate max-w-[200px] uppercase font-mono">
                      {userData?.selectedApis ? userData.selectedApis.join(", ") : "mandiPrices"}
                    </span>
                  </div>

                  {userData?.apiPurpose && (
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl mt-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">API Intended Usage</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed max-h-20 overflow-y-auto italic">
                        "{userData.apiPurpose}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="space-y-2.5">
                  <button
                    onClick={startEditing}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-2xl transition border border-gray-200/60 text-sm cursor-pointer shadow-sm"
                  >
                    <Edit2 size={14} className="text-gray-500" />
                    <span>Edit Profile Details</span>
                  </button>

                  {userData?.userType === "Farmer" ? (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/insights");
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition shadow-md hover:shadow-green-600/20 text-sm cursor-pointer"
                    >
                      <span>View Agricultural Insights</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/api");
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition shadow-md hover:shadow-green-600/20 text-sm cursor-pointer"
                    >
                      <span>Open Developer API Portal</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition text-sm cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              </div>
            )}


          </div>
        </div>
      )}

    </header>
  );
}
