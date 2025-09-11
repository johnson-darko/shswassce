import { useTheme } from '@/context/ThemeContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-${theme === 'dark' ? 'gray-900' : 'white'} transition-colors`}>
      <Card className="rounded-2xl shadow-lg w-full max-w-sm">
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
          <p className="text-gray-600 text-center">Toggle between light and dark theme for a better experience.</p>
        </CardContent>
      </Card>
    </div>
  );
}
