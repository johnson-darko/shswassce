// --- Testimonials Carousel Component ---
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




// --- Testimonials Carousel Component ---
const testimonials = [
  {
    name: "Ama B.",
    text: "This app made it so easy to check my eligibility and find the right program. Highly recommended!",
    school: "Prempeh College Student"
  },
  {
    name: "Kwesi O.",
    text: "I love the clean design and how fast I could compare universities. The stats are super helpful!",
    school: "Adisadel College Student"
  },
  {
    name: "Linda A.",
    text: "The WASSCE calculator and eligibility checker saved me so much time. Every SHS student should use this!",
    school: "Presbyterian Girls' Student"
  }
];

function TestimonialCarousel() {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);
  const t = testimonials[idx];
  return (
    <div className="flex flex-col items-center text-center min-h-[90px]">
      <p className="text-sm text-gray-800 dark:text-gray-100 italic mb-1">“{t.text}”</p>
      <span className="text-xs font-semibold text-blue-700 dark:text-blue-200">{t.name}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{t.school}</span>
      <div className="flex gap-1 mt-2">
        {testimonials.map((_, i) => (
          <span key={i} className={`inline-block w-2 h-2 rounded-full ${i === idx ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}></span>
        ))}
      </div>
    </div>
  );
}


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

  // Get onboarding info from localStorage
  let onboarding = { stage: '', school: '' };
  try {
    onboarding = JSON.parse(localStorage.getItem('onboarding') || '{}');
  } catch {}

  // Banner message logic
  let bannerMessage = '';
  if (onboarding.stage === 'current') {
    bannerMessage = 'Hard Work Pays!';
  } else if (onboarding.stage === 'graduate') {
    bannerMessage = 'Work Smarter, Not Harder!';
  }

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-between bg-gray-100 dark:bg-gray-900 transition-colors duration-500 w-full`} style={{background: theme === 'dark' ? '#111827' : undefined}}>
      {/* Header (shared) */}

      {/* Main Content */}
      <main className="w-full max-w-md mt-8 mb-24 px-4 flex flex-col items-center">
        {/* School name and motivational banner above the banner, horizontal */}
        {(onboarding.school || bannerMessage) && (
          <div className="w-full flex justify-center items-center gap-3 mb-2 mt-2">
            {onboarding.school && (
              <span className="bg-white/80 dark:bg-gray-900/80 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full font-semibold shadow text-sm">
                {onboarding.school}
              </span>
            )}
            {bannerMessage && (
              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-4 py-1 rounded-full font-bold shadow text-base animate-pulse">
                {bannerMessage}
              </span>
            )}
          </div>
        )}
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

        {/* Stats & Testimonials Section (moved below cards) */}
        <section className="w-full flex flex-col gap-4 mb-8">
          {/* Stats */}
          <div className="glass-card rounded-2xl px-6 py-4 flex flex-row items-center justify-between shadow-md">
            <div className="flex flex-col items-center flex-1">
              <University className="w-8 h-8 text-blue-700 dark:text-blue-200 mb-1" />
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">32</span>
              <span className="text-xs text-gray-700 dark:text-gray-300">Universities</span>
            </div>
            <div className="w-px h-10 bg-gray-300 dark:bg-gray-700 mx-2" />
            <div className="flex flex-col items-center flex-1">
              <BookOpen className="w-8 h-8 text-green-700 dark:text-green-200 mb-1" />
              <span className="text-lg font-bold text-green-900 dark:text-green-100">700+</span>
              <span className="text-xs text-gray-700 dark:text-gray-300">Programs</span>
            </div>
          </div>
          {/* Testimonials Carousel */}
          <div className="glass-card rounded-2xl px-4 py-4 shadow-md">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">What students say</h3>
            <TestimonialCarousel />
          </div>
        </section>




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
