import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
// CardLink: animates card on click, then navigates
function CardLink({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAnimating(true);
    setTimeout(() => {
      navigate(to);
    }, 650); // 650ms for slower, smoother effect
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={`group bg-gradient-to-br from-blue-200 to-blue-400 dark:from-gray-800 dark:to-gray-700 hover:from-blue-300 hover:to-blue-500 dark:hover:from-gray-700 dark:hover:to-gray-800 text-blue-900 dark:text-blue-100 font-semibold py-4 px-2 rounded-2xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center cursor-pointer select-none
        ${animating ? 'animate-card-open' : ''}`}
      style={{
        transition: 'transform 0.65s cubic-bezier(.4,2,.6,1)',
        transform: animating ? 'scale(0.96) translateY(-10px)' : 'none',
        opacity: 1,
      }}
    >
      {icon}
      <span className="text-base font-bold group-hover:scale-105 transition-transform text-center">{title}</span>
      <span className="text-xs opacity-90 text-center">{desc}</span>
    </a>
  );
}
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, Search, GraduationCap, University, Calculator, Bot, FileText, Settings, Save, ShieldCheck, BarChart2, BookOpen, Users, CheckCircle } from "lucide-react";
import banner from '/banner.png';


export default function HomePage() {
  const { theme, toggleTheme } = useTheme();

  // All main links for cards (from App.tsx)
  const mainLinks = [
    {
      to: "/calculator",
      icon: <CheckCircle className="w-7 h-7 mb-1 text-green-600" />, title: "Admission Eligibility Checker",
      desc: "Check if you qualify for university admission with your WASSCE results."
    },
    {
      to: "/calculator",
      icon: <Calculator className="w-7 h-7 mb-1" />, title: "WASSCE Aggregate Calculator",
      desc: "Calculate your WASSCE aggregate score easily."
    },
    {
      to: "/search",
      icon: <Search className="w-7 h-7 mb-1" />, title: "Search Ghana Universities",
      desc: "Find universities by location, program, and more."
    },
    {
      to: "/compare",
      icon: <GraduationCap className="w-7 h-7 mb-1" />, title: "Compare Ghana Universities",
      desc: "Compare universities side by side to make the best choice based on your preferences."
    },
    // Removed Saved Programs card
  ];

  return (
  <div className={`relative min-h-screen flex flex-col items-center justify-between bg-gray-100 dark:bg-gray-900 transition-colors duration-500 w-full`} style={{background: theme === 'dark' ? '#111827' : undefined}}>
      {/* Header (shared) */}
    

      {/* Main Content */}
  <main className="w-full max-w-md mt-8 mb-24 px-4 flex flex-col items-center">
        {/* Banner */}
        <div className="w-full flex justify-center mb-6">
          <div className="relative w-full">
            <img
              src={banner}
              alt="Ghana University Guide Banner"
              className="w-full max-h-40 object-cover rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 transition-transform duration-500 hover:scale-105 hover:-rotate-2 hover:shadow-[0_10px_40px_rgba(62,83,127,0.25)]"
              style={{ background: '#e0e7ff', transform: 'perspective(800px) rotateX(6deg) scale(1.01)' }}
            />
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
              boxShadow: '0 8px 32px 0 rgba(31, 41, 55, 0.18), 0 1.5px 8px 0 rgba(62,83,127,0.10)',
              zIndex: 1
            }} />
          </div>
        </div>
        {/* Hero */}
        <section className="w-full text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2" style={{ color: theme === 'dark' ? 'rgb(62,83,127)' : undefined }}>University Eligibility Tool</h2>
          <p className="text-base text-gray-600 dark:text-gray-300">Check UNI eligibility and WASSCE score instantly.</p>
        </section>


        {/* All Main Links as Cards */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          {mainLinks.map(link => (
            <CardLink key={link.to} {...link} />
          ))}
        </div>




      </main>



      {/* Glassmorphism utility */}
      <style>{`
        .glass-card {
          background-color: rgba(255,255,255,0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }
        .dark .glass-card {
          background-color: rgba(31,41,55,0.4);
          border: 1px solid rgba(31,41,55,0.2);
        }
      `}</style>

      {/* Footer intentionally left blank (removed duplicate app name) */}
    </div>
  );
}
