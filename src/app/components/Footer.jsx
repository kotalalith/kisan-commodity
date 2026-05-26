import { Database, Clock } from "lucide-react";
export default function Footer() {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  return <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-green-600" />
              <span>
                Data Source:{" "}
                <span className="font-medium text-gray-900">
                  Agmarknet (Govt of India)
                </span>
              </span>
            </div>
            <div className="hidden md:block w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-green-600" />
              <span>
                Last Updated:{" "}
                <span className="font-medium text-gray-900">{currentDate}</span>
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <span>Powered by </span>
            <span className="font-medium text-green-600">AgroBridge</span>
            <span> • Making farming smarter</span>
          </div>
        </div>
      </div>
    </footer>;
}