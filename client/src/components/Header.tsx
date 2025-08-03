import { Bell, Video } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-material-1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Video className="text-primary text-2xl" />
              <h1 className="text-xl font-semibold text-gray-900">VideoClip Pro</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button className="text-primary border-b-2 border-primary px-3 py-2 text-sm font-medium">
                Dashboard
              </button>
              <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Videos
              </button>
              <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Cuts
              </button>
              <button className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Social Media
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
