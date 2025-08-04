function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VC</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              VideoClip Pro
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            Dashboard
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;