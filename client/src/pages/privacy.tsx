import { useTheme } from '@/context/ThemeContext';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors`}>
      <Card className="rounded-2xl shadow-lg w-full max-w-md">
        <CardContent className={`text-center ${theme === 'dark' ? 'bg-gray-800 text-white' : ''} p-6`}>
          <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
          <p className="mb-4">
            Your privacy is important to us. This app does <strong>not</strong> collect, store, or sell any personal data from users.
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>We do not ask for or store any personal information.</li>
            <li>No data is sent to our servers or any third parties.</li>
            <li>All your activity and data remain local on your device.</li>
            <li>We do not sell, share, or use your data for any purpose.</li>
          </ul>
          <p>
            Enjoy using the app with peace of mind knowing your privacy is fully respected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
