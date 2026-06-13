import { Database, Clock } from "lucide-react";
export default function Footer() {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  return <footer className="bg-slate-950 border-t border-slate-800 mt-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-emerald-500" />
              <span>
                Data Source:{" "}
                <span className="font-medium text-slate-200">
                  Agmarknet (Govt of India)
                </span>
              </span>
            </div>
            <div className="hidden md:block w-px h-4 bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-emerald-500" />
              <span>
                Last Updated:{" "}
                <span className="font-medium text-slate-200">{currentDate}</span>
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            <span>Powered by </span>
            <span className="font-medium text-emerald-500">AgroBridge</span>
            <span> • Making farming smarter</span>
          </div>
        </div>
      </div>
    </footer>;
}