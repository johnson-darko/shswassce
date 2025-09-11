import React, { useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen() {
  // Optionally, you can add logic to auto-hide after a delay
  // or hide when your app is ready
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <img
        src="logo.png"
        alt="App Logo"
        className="w-32 h-32 animate-splash-bounce mb-4"
      />
      <h2 className="text-2xl font-bold text-scorecard-blue">GH Uni Guide Powered by Studyxo</h2>
    </div>
  );
}
