import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Phone, 
  Lock, 
  Briefcase, 
  Layers, 
  Globe, 
  Code, 
  UploadCloud, 
  Check, 
  Sparkles, 
  Building, 
  FileText,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Tv,
  Users
} from "lucide-react";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Signup Wizard
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  // Signup Wizard Sub-steps (1: Personal, 2: API & Display, 3: Application Context)
  const [signupSubStep, setSignupSubStep] = useState(1);

  // Signup form states
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("Developer");
  const [role, setRole] = useState("Developer");
  const [organization, setOrganization] = useState("");
  const [apiPurpose, setApiPurpose] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Agricultural specific & Display platform fields
  const [selectedApis, setSelectedApis] = useState(["mandiPrices"]);
  const [displayPlatform, setDisplayPlatform] = useState("Website / Digital Portal");
  const [audienceSize, setAudienceSize] = useState("Medium Community (100 - 1,000 Farmers)");
  const [projectLink, setProjectLink] = useState("");
  const [selfDescription, setSelfDescription] = useState("");

  const navigate = useNavigate();
  const { currentUser, userData, loading: authLoading, localLogin } = useAuth();

  // Automatic routing & session detection
  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        if (userData) {
          // Logged in and registered -> go to dashboard
          navigate("/");
        } else {
          // Logged in but no Firestore document -> force signup step 3
          setStep(3);
        }
      } else {
        // Not logged in -> step 1
        setStep(1);
      }
    }
  }, [currentUser, userData, authLoading, navigate]);

  // Clean up reCAPTCHA verifier on unmount to prevent duplicate instances
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        console.log("[reCAPTCHA] Cleaning up global recaptchaVerifier on Login component unmount...");
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn("[reCAPTCHA] Error clearing recaptchaVerifier on unmount:", e);
        }
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const toggleApiSelection = (apiId) => {
    if (selectedApis.includes(apiId)) {
      if (selectedApis.length > 1) {
        setSelectedApis(selectedApis.filter(id => id !== apiId));
      }
    } else {
      setSelectedApis([...selectedApis, apiId]);
    }
  };

  // Developer Bypass Flow (Offline Sandbox mode helper)
  const handleDeveloperBypass = () => {
    console.log("[Bypass] Developer sandbox bypass triggered.");
    const mockUser = {
      uid: "dev_bypass_sandbox_user_" + Math.random().toString(36).substring(2, 9),
      phoneNumber: "+919876543210",
      isMock: true
    };
    localLogin(mockUser);
    setStep(3);
    setSignupSubStep(1);
  };

  // Send OTP Flow (Requirements 5, 6, 9, 10, 11)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("[OTP send] Initializing isolated OTP send procedure for global-auth...");

    const parent = document.getElementById("recaptcha-parent");
    if (parent) {
      parent.innerHTML = '<div id="recaptcha-container"></div>';
    }

    // EXACT reCAPTCHA setup as specified in Requirement 9
    console.log("[reCAPTCHA] Setting up fresh invisible RecaptchaVerifier...");
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );
    console.log("[reCAPTCHA] Recaptcha setup completed successfully.");
    
    // Ensure signInWithPhoneNumber uses appVerifier
    const appVerifier = window.recaptchaVerifier;
    if (!appVerifier) {
      console.error("[OTP send] appVerifier failed to initialize.");
      alert("Failed to initialize security verification (reCAPTCHA). Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      const formattedPhone = phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber}`;
      console.log(`[OTP send] Attempting to send OTP to ${formattedPhone} using global-auth app...`);

      // Call signInWithPhoneNumber using modular Firebase Auth SDK
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      console.log("[OTP send] OTP sent successfully! Confirmation result received.");
      setConfirmationResult(confirmation);
      setStep(2);
    } catch (error) {
      console.error("[OTP send] Error sending OTP code:", error);
      
      // Cleanup recaptcha on failure
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (cErr) {}
      }
      if (parent) {
        parent.innerHTML = '<div id="recaptcha-container"></div>';
      }

      alert(`Failed to send OTP.\n\nError: ${error.message || error}\n\nSolutions:\n1. Make sure you access the site via http://localhost:5173/ directly.\n2. Ensure 'localhost' is listed under Authorized Domains in the global-auth Firebase console.\n3. Make sure 'reCAPTCHA Enterprise' is DISABLED in the Firebase project settings if not properly configured.`);
    }
    setLoading(false);
  };

  // Verify OTP Flow (Requirement 5, 6, 11)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("[OTP verification] Commencing OTP verification code verification...");

    try {
      // Verify OTP and retrieve authenticated global-auth Firebase user
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      console.log("[OTP verification] OTP verification successful! Global-auth User UID:", user.uid);
      
      alert("OTP Verification Successful! Isolated OTP test complete.");
      
      // Complete login locally or transition to signup step
      // (Since Firestore check is removed temporarily, we can jump directly to step 3 or let context trigger it)
      setStep(3);
      setSignupSubStep(1);
    } catch (error) {
      console.error("[OTP verification] Invalid OTP verification attempt failed:", error);
      alert("Invalid OTP code. Please verify the code and try again.");
    }
    setLoading(false);
  };

  // Signup Profile Completion flow (TEMPORARILY local bypass for PURE OTP TEST)
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = currentUser;
      if (user) {
        console.log("[Signup] Profile completion submitted. [Firestore & Storage SAVES TEMPORARILY DISABLED]");
        
        const generatedKey = `agro_live_${user.uid.substring(0, 5)}${Math.random().toString(36).substring(2, 10)}`;

        const profileData = {
          name,
          phoneNumber: user.phoneNumber || `+91${phoneNumber}`,
          userType,
          organization: organization || "Personal Project",
          apiPurpose,
          selectedApis,
          displayPlatform,
          audienceSize,
          projectLink,
          selfDescription,
          apiKey: generatedKey,
          role: userType, 
          photoURL: "",
          status: "approved"
        };

        // Cache local backup
        localStorage.setItem(`agrobridge_fallback_profile_${user.uid}`, JSON.stringify(profileData));
        console.log("[Signup] Profile details successfully cached to local storage.");

        alert("Profile completed! Local sandbox access is now active.");
        navigate("/api");
      }
    } catch (error) {
      console.error("Signup wizard submission execution failed:", error);
      alert(`Submission Blocked:\n\n${error.message || error}`);
    }
    setLoading(false);
  };

  // Form step-level validators
  const isStep1Valid = name.trim().length > 0;
  const isStep2Valid = selectedApis.length > 0;
  const isStep3Valid = apiPurpose.trim().length >= 10;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 bg-gradient-to-br from-gray-50 via-green-50/15 to-gray-50">
      <div 
        className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 w-full transition-all duration-300 max-w-xl"
      >
        <div id="recaptcha-parent">
          <div id="recaptcha-container"></div>
        </div>

        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full mb-3">
                <Sparkles size={12} className="animate-pulse" />
                AgroBridge Sandbox (OTP Isolation Test)
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Developer Portal</h2>
              <p className="text-sm text-gray-500 mt-1">
                Verify your identity with OTP to gain secure API access.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
                <div className="relative flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 overflow-hidden shadow-sm transition-all">
                  <span className="inline-flex items-center px-4 bg-gray-50 text-gray-500 border-r border-gray-200 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 block w-full px-4 py-3 text-sm focus:outline-none placeholder-gray-400 bg-white"
                    placeholder="Enter 10 digit number"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Smartphone size={18} />
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition disabled:opacity-50 font-semibold shadow-md hover:shadow-green-600/20 cursor-pointer animate-fadeIn"
              >
                {loading ? "Sending..." : "Send Verification Code"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative px-3 bg-white text-xs text-gray-400 font-bold uppercase tracking-wider">
                OR
              </span>
            </div>

            <button
              type="button"
              onClick={handleDeveloperBypass}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3.5 px-4 rounded-xl transition font-bold text-sm shadow-md hover:shadow-green-600/25 active:scale-[0.98] cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Bypass OTP (Developer Demo Mode)</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full mb-3">
                <Smartphone size={12} className="animate-bounce" />
                SMS OTP Sent
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Enter OTP Code</h2>
              <p className="text-sm text-gray-500 mt-1">
                We've sent a 6-digit verification code to <span className="font-semibold text-gray-700">+91 {phoneNumber}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 text-center">Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-center tracking-[0.4em] text-xl font-bold bg-white shadow-sm"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition disabled:opacity-50 font-semibold shadow-md hover:shadow-green-600/20 cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-green-600 hover:text-green-700 hover:underline font-semibold cursor-pointer"
                >
                  Change phone number
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
                <Sparkles size={12} className="animate-pulse" />
                Developer Account Onboarding (Test Mode)
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Complete API Profile</h2>
              <p className="text-xs text-gray-500 mt-1">
                Provide your details to request secure access keys to AgroBridge APIs.
              </p>
            </div>

            {/* Visual Stepper */}
            <div className="flex items-center justify-center max-w-md mx-auto mb-10">
              {[
                { label: "Profile", step: 1 },
                { label: "Display Setup", step: 2 },
                { label: "Usage Purpose", step: 3 }
              ].map((s, idx) => (
                <div key={s.step} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center relative">
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        signupSubStep === s.step
                          ? "bg-green-600 text-white ring-4 ring-green-100"
                          : signupSubStep > s.step
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {signupSubStep > s.step ? <Check size={16} strokeWidth={3} /> : s.step}
                    </div>
                    <span 
                      className={`absolute -bottom-6 text-[10px] whitespace-nowrap font-semibold transition-all duration-300 ${
                        signupSubStep === s.step ? "text-gray-900 font-bold" : "text-gray-400 font-medium"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  
                  {idx < 2 && (
                    <div 
                      className={`h-0.5 w-full mx-3 transition-all duration-500 ${
                        signupSubStep > s.step ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Divider for label spacing */}
            <div className="h-6"></div>

            <form onSubmit={handleSignup} className="space-y-6">
              
              {/* STEP 1: Basic Identity & Role */}
              {signupSubStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 pb-1 border-b border-gray-100 uppercase tracking-wider">
                    <User size={14} className="text-green-600" />
                    Developer Identity Details
                  </h3>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm transition-all placeholder-gray-400"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Verified Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="text"
                        disabled
                        value={currentUser ? currentUser.phoneNumber : ""}
                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed font-medium shadow-inner"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-green-600">
                        <CheckCircle2 size={16} />
                      </div>
                    </div>
                    <span className="text-[10px] text-green-600 flex items-center gap-1 font-semibold">
                      <Lock size={10} /> Authenticated securely via SMS
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Who are you? (User Type)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Briefcase size={16} />
                      </div>
                      <select
                        value={userType}
                        onChange={(e) => {
                          setUserType(e.target.value);
                          setRole(e.target.value);
                        }}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm cursor-pointer"
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
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Company / Organization Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Building size={16} />
                      </div>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm transition-all placeholder-gray-400"
                        placeholder="Company, College, or Village Name (Optional)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: API Selection & Prices Display Setup */}
              {signupSubStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 pb-1 border-b border-gray-100 uppercase tracking-wider">
                    <Tv size={14} className="text-green-600" />
                    Market Prices Display Configuration
                  </h3>

                  {/* Requested API Options Selector */}
                  <div className="space-y-2.5">
                    <label className="block text-sm font-semibold text-gray-700">Which APIs do you want to access?</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { id: "mandiPrices", name: "Mandi Prices API", desc: "Live agricultural crop prices & market rates", color: "border-green-500 bg-green-50/60 text-green-700 text-green-800" },
                        { id: "marketInsights", name: "Market Insights API", desc: "Trend projections & predictive analytics", color: "border-blue-500 bg-blue-50/60 text-blue-700 text-blue-800" },
                        { id: "weatherCommodity", name: "Weather Advisory API", desc: "Real-time crop advisory & weather alerts", color: "border-amber-500 bg-amber-50/60 text-amber-700 text-amber-800" }
                      ].map((api) => {
                        const isSelected = selectedApis.includes(api.id);
                        return (
                          <button
                            key={api.id}
                            type="button"
                            onClick={() => toggleApiSelection(api.id)}
                            className={`flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                              isSelected 
                                ? `${api.color} shadow-sm font-medium border-2` 
                                : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                            }`}
                          >
                            <div className={`mt-0.5 p-1 rounded-md ${isSelected ? "bg-current text-white" : "bg-gray-100 text-gray-400"}`}>
                              <Check size={12} className={isSelected ? "text-white" : "text-transparent"} />
                            </div>
                            <div>
                              <span className="text-xs font-bold block leading-tight">{api.name}</span>
                              <span className="text-[11px] opacity-80 mt-0.5 block leading-relaxed">{api.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prices Display Platform */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Where will you display these market prices?</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Tv size={16} />
                      </div>
                      <select
                        value={displayPlatform}
                        onChange={(e) => setDisplayPlatform(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm cursor-pointer"
                      >
                        <option value="Website / Digital Portal">Website / Digital Portal</option>
                        <option value="Mobile App (Android / iOS)">Mobile App (Android / iOS)</option>
                        <option value="WhatsApp / SMS Alert System">WhatsApp / SMS Alert System</option>
                        <option value="LED Marketplace Display Board">LED Marketplace Display Board</option>
                        <option value="Personal Dashboard / Study">Personal Dashboard / Study</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Farmer / Audience Size */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Expected Farmers / Audience Benefitted</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Users size={16} />
                      </div>
                      <select
                        value={audienceSize}
                        onChange={(e) => setAudienceSize(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm cursor-pointer"
                      >
                        <option value="Small Community (< 100 Farmers)">Small Community (&lt; 100 Farmers)</option>
                        <option value="Medium District (100 - 1,000 Farmers)">Medium District (100 - 1,000 Farmers)</option>
                        <option value="Large Region (1,000 - 10,000 Farmers)">Large Region (1,000 - 10,000 Farmers)</option>
                        <option value="State / National Scale (10,000+ Farmers)">State / National Scale (10,000+ Farmers)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Usage, Details & Project Links */}
              {signupSubStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 pb-1 border-b border-gray-100 uppercase tracking-wider">
                    <FileText size={14} className="text-green-600" />
                    Application Context & Purpose
                  </h3>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex justify-between">
                      <span>How will you display or use the market prices? *</span>
                      <span className="text-[10px] text-gray-400">Min 10 characters</span>
                    </label>
                    <textarea
                      required
                      rows="3"
                      value={apiPurpose}
                      onChange={(e) => setApiPurpose(e.target.value)}
                      className="block w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm transition-all placeholder-gray-400"
                      placeholder="Please explain how this data will help farmers or users (e.g. Displaying live mandi crop rates in an Android app for local organic farmers, updating rates daily on a web portal, displaying on a big LED board in the local village market, etc.)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Brief Developer Bio / Background</label>
                    <textarea
                      rows="2"
                      value={selfDescription}
                      onChange={(e) => setSelfDescription(e.target.value)}
                      className="block w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm transition-all placeholder-gray-400"
                      placeholder="Tell us a little bit about yourself or your software engineering experience (Optional)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Project Website / Repo Link</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Globe size={16} />
                      </div>
                      <input
                        type="url"
                        value={projectLink}
                        onChange={(e) => setProjectLink(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm bg-white shadow-sm placeholder-gray-400"
                        placeholder="https://yourproject.com (Optional)"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Profile Photo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-xs">
                        [Photo Upload Temporarily Disabled]
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-step Footer Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-8">
                {signupSubStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setSignupSubStep(signupSubStep - 1)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition font-semibold text-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div> // Spacer for layout alignment
                )}

                {signupSubStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setSignupSubStep(signupSubStep + 1)}
                    disabled={signupSubStep === 1 ? !isStep1Valid : !isStep2Valid}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-semibold text-sm flex items-center gap-1.5 shadow-md hover:shadow-green-600/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]"
                  >
                    <span>Next Step</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isStep3Valid}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-bold text-sm flex items-center gap-1.5 shadow-md hover:shadow-green-600/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Submitting Request...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Submit API Request</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
