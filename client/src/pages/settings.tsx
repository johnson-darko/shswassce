import { useTheme } from '@/context/ThemeContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Share2, Info, RefreshCw, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const APP_VERSION = "v1.0.0"; // Replace with your actual version

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

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
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-5 w-5 mr-1" /> Check Update
          </Button>
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
    </div>
  );
}
