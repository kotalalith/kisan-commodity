import { Routes, Route } from "react-router";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import AddPrice from "./pages/AddPrice";
// import Login from "./pages/Login"; // Commented out as logins are currently on hold
import ApiDashboard from "./pages/ApiDashboard";

import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" />; // Redirect to home since login is on hold
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased relative">
      {/* Background Decorative Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-emerald-950/15 rounded-full blur-[150px] pointer-events-none"></div>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          {/* <Route path="/login" element={<Login />} /> -- Commented out as logins are on hold */}
          <Route path="/api" element={<ApiDashboard />} />
          <Route path="/add-price" element={<AddPrice />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
