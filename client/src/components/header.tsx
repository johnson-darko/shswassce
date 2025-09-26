import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from '@/context/ThemeContext';
import { Network } from '@capacitor/network';
import { useEffect, useState } from "react";
import { registerServiceWorker, clearAllCaches, hotReload } from "@/lib/swManager";
import { getServiceWorkerVersion } from "@/lib/versionCheck";


export default function Header() {
  const { theme } = useTheme();
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
    };
    checkNetwork();
    let removeListener: (() => void) | undefined;
    Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
    }).then(handle => {
      removeListener = handle.remove;
    });
    // Register SW and listen for updates
    registerServiceWorker({
      onUpdate: () => setShowUpdateModal(true)
    });

    // Version check on mount and after reload
    let lastVersion: string | null = null;
    getServiceWorkerVersion().then(version => {
      if (version) {
        const stored = localStorage.getItem('sw_app_version');
        if (stored && stored !== version) {
          setShowUpdateModal(true);
        }
        localStorage.setItem('sw_app_version', version);
        lastVersion = version;
      }
    });

    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  const navigation = [
    { name: "Search Universities", to: "/search" },
  ];

  // On refresh, clear all caches and reload
  const handleRefresh = async () => {
    if (!isOnline) {
      setShowOfflineModal(true);
    } else {
      await clearAllCaches();
      // Remove version from localStorage so modal doesn't show again after reload
      localStorage.removeItem('sw_app_version');
      hotReload();
    }
  };

  return (
    <header className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700 shadow-none' : 'bg-white shadow-sm border-b border-gray-200'}`} data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" data-testid="link-home">
              <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>GH-UniCheck</h1>
            </Link>
          </div>

          {/* Middle: Refresh Icon */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={handleRefresh}
              className={`p-1 rounded hover:bg-gray-100 ${theme === 'dark' ? 'hover:bg-gray-800' : ''}`}
              aria-label="Refresh"
              data-testid="refresh-icon"
            >
              <RefreshCw className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`} />
            </button>
          </div>

          {/* Right: Navigation and Mobile Menu */}
          <div className="flex items-center">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Button
                    variant="ghost"
                    className={`font-medium ${theme === 'dark' ? 'text-gray-200 hover:text-blue-200' : 'text-scorecard-gray hover:text-scorecard-blue'}`}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                    <Menu className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-200' : 'text-scorecard-gray'}`} />
                  </Button>
                </SheetTrigger>
                <SheetContent className={theme === 'dark' ? 'bg-gray-900 text-gray-200' : ''}>
                  <div className="mt-6 space-y-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        data-testid={`mobile-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start font-medium ${theme === 'dark' ? 'text-gray-200 hover:text-blue-200' : 'text-scorecard-gray hover:text-scorecard-blue'}`}
                        >
                          {item.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`rounded-lg shadow-lg p-6 max-w-sm w-full ${theme === 'dark' ? 'bg-gray-900 text-blue-200' : 'bg-white text-scorecard-blue'}`}>
            <h3 className="text-lg font-bold mb-2">Update Available</h3>
            <p className="mb-4">
              A new version of the app is available. Please refresh to get the latest updates.
            </p>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
              onClick={handleRefresh}
            >
              Refresh Now
            </button>
          </div>
        </div>
      )}

      {/* Offline Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`rounded-lg shadow-lg p-6 max-w-sm w-full ${theme === 'dark' ? 'bg-gray-900 text-blue-200' : 'bg-white text-scorecard-blue'}`}>
            <h3 className="text-lg font-bold mb-2">No Internet Connection</h3>
            <p className="mb-4">
              You are currently offline. Please connect to the internet to refresh and get the latest updates.
            </p>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
              onClick={() => setShowOfflineModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
