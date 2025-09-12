import { useTheme } from '@/context/ThemeContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Share2, Info, RefreshCw, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Network } from '@capacitor/network';
import { useEffect, useState } from 'react';

const APP_VERSION = "v1.0.0"; // Replace with your actual version

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
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

  const handleCheckUpdate = () => {
    if (!isOnline) {
      setShowOfflineModal(true);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors`}>
      <Card className="rounded-2xl shadow-lg w-full max-w-sm mb-6">
        <CardContent className="p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="rounded-full"
            >
              <Sun className="h-6 w-6 mr-2" /> Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="rounded-full"
            >
              <Moon className="h-6 w-6 mr-2" /> Dark
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-center">Toggle between light and dark theme for a better experience.</p>
        </CardContent>
      </Card>

      {/* Share Feature */}
      <Card className="rounded-2xl shadow w-full max-w-sm mb-4">
        <CardContent className="flex items-center gap-4 p-4">
          <Share2 className={`h-7 w-7 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h3 className="font-semibold">Share App</h3>
            <p className="text-xs opacity-80">Share the app via social media.</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Studyxo GH Uni Guide",
                  url: window.location.href,
                });
              } else {
                window.open(`https://twitter.com/intent/tweet?text=Check%20out%20Studyxo%20GH%20Uni%20Guide!%20${window.location.href}`);
              }
            }}
          >
            Share
          </Button>
        </CardContent>
      </Card>

      {/* App Version & Update */}
      <Card className="rounded-2xl shadow w-full max-w-sm mb-4">
        <CardContent className="flex items-center gap-4 p-4">
          <Info className={`h-7 w-7 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`} />
          <div className="flex-1">
            <h3 className="font-semibold">App Version</h3>
            <p className="text-xs opacity-80">{APP_VERSION}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleCheckUpdate}
          >
            <RefreshCw className="h-5 w-5 mr-1" /> Check Update
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card className="rounded-2xl shadow w-full max-w-sm mb-4">
        <CardContent className="flex items-center gap-4 p-4">
          <Info className={`h-7 w-7 ${theme === 'dark' ? 'text-pink-300' : 'text-pink-600'}`} />
          <div className="flex-1">
            <h3 className="font-semibold">Privacy</h3>
            <p className="text-xs opacity-80">Read about your privacy and data protection.</p>
          </div>
          <Link to="/privacy">
            <Button variant="outline" className="rounded-full">Privacy</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <Card className="rounded-2xl shadow w-full max-w-sm mb-4">
        <CardContent className="flex items-center gap-4 p-4">
          <MessageCircle className={`h-7 w-7 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`} />
          <div className="flex-1">
            <h3 className="font-semibold">Feedback</h3>
            <p className="text-xs opacity-80">Send feedback or report issues.</p>
          </div>
          <Link to="/feedback">
            <Button variant="outline" className="rounded-full">Feedback</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Help/FAQ */}
      <Card className="rounded-2xl shadow w-full max-w-sm mb-4">
        <CardContent className="flex items-center gap-4 p-4">
          <Info className={`h-7 w-7 ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`} />
          <div className="flex-1">
            <h3 className="font-semibold">Help / FAQ</h3>
            <p className="text-xs opacity-80">View help and frequently asked questions.</p>
          </div>
          <Link to="/help">
            <Button variant="outline" className="rounded-full">Help</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Offline Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`rounded-lg shadow-lg p-6 max-w-sm w-full ${theme === 'dark' ? 'bg-gray-900 text-blue-200' : 'bg-white text-scorecard-blue'}`}>
            <h3 className="text-lg font-bold mb-2">No Internet Connection</h3>
            <p className="mb-4">
              You are currently offline. Please connect to the internet to check for updates.
            </p>
            <Button
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
              onClick={() => setShowOfflineModal(false)}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
