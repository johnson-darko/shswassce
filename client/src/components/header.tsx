import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from '@/context/ThemeContext';
import { Network } from '@capacitor/network';
import { useEffect, useState } from "react";

export default function Header() {
  const { theme } = useTheme();
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
    };

    checkNetwork();

    const handler = Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
    });

    return () => {
      handler.remove();
    };
  }, []);

  const navigation = [
    { name: "Search Colleges", to: "/search" },
    { name: "Compare", to: "/compare" },
    { name: "Check Eligibility", to: "/eligibility" },
    { name: "PDF Parser", to: "/admin/pdf" },
  ];

  const handleRefresh = () => {
    if (!isOnline) {
      setShowOfflineModal(true);
    } else {
      window.location.reload();
    }
  };

  return (
    <header className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700 shadow-none' : 'bg-white shadow-sm border-b border-gray-200'}`} data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" data-testid="link-home">
              <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>Studyxo Uni Guide</h1>
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
