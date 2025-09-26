import React from 'react';
import { useTheme } from "@/context/ThemeContext"; // Adjust path if needed
import './SplashScreen.css';

export default function SplashScreen() {
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center z-50 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <img
        src="logo.png"
        alt="App Logo"
        className="w-32 h-32 animate-splash-bounce mb-4"
      />
      <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-blue-200' : 'text-scorecard-blue'}`}>GH-UniCheck</h2>
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Powered by Studyxo</p>
    </div>
  );
}
