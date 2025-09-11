import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, GraduationCap, University, Calculator, FileText, BookOpen, Target, Sun, Moon, Settings, Home } from "lucide-react";
import { useTheme } from '@/context/ThemeContext';

export default function HomePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors`}>
      {/* Hero Section */}
      <section className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-scorecard-blue to-scorecard-light-blue'} py-10`} data-testid="hero-section">
        <div className="max-w-4xl mx-auto px-4 flex flex-row items-center justify-center relative">
          {/* Logo on the left */}
          <div className="flex-shrink-0 flex items-center justify-center mr-4 relative" style={{ height: 110 }}>
            <img
              src="logo.png"
              alt="App Logo"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-2xl border-4 border-white"
              style={{ boxShadow: '0 8px 32px 0 rgba(59,130,246,0.25), 0 1.5px 8px 0 rgba(0,0,0,0.10)' }}
            />
            {/* Lower curved arrow from bottom of logo to text */}
            <svg className="absolute left-1/2 bottom-[-24px] md:left-full md:bottom-0" width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="arrowGradient" x1="0" y1="30" x2="120" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <path d="M10 40 Q60 80 110 50" stroke="url(#arrowGradient)" strokeWidth="3" fill="none" filter="url(#f1)" />
              <polygon points="110,50 100,45 100,55" fill="#60a5fa" filter="url(#f1)" />
              <filter id="f1">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#3b82f6" />
              </filter>
            </svg>
          </div>
          {/* Text on the right, smaller on mobile */}
          <div className="flex-1 text-left">
            <h2 className={`text-lg md:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-white'}`}>Your University Journey Starts Here</h2>
            <p className={`text-xs md:text-lg mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-100'}`}>Find, compare, and apply to universities across Ghana. Instantly check your eligibility and calculate your WASSCE aggregate score.</p>
          </div>
        </div>
      </section>

      {/* Quick Tools Section */}
      <section className={`py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`} data-testid="quick-tools-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
              Your Eligibility Tool
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Saved Programs Eligibility */}
            <Link to="/saved-programs" className="block">
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-saved-programs">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                    <FileText className={`h-6 w-6 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`} />
                  </div>
                  <h4 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                    Saved Program Eligibility
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                    View all your saved eligible programs
                  </p>
                </CardContent>
              </Card>
            </Link>
            {/* WASSCE Aggregate Calculator */}
            <Link to="/calculator" className="block">
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-calculator">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'}`}>
                    <Calculator className={`h-6 w-6 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`} />
                  </div>
                  <h4 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                    WASSCE Aggregate Calculator
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                    Calculate your aggregate score
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Check Eligibility */}
            <Link to="/eligibility" className="block">
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-eligibility-small">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'}`}>
                    <Target className={`h-6 w-6 ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`} />
                  </div>
                  <h4 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                    Check Eligibility
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                    See which programs you qualify for
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Search Universities */}
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-search-small">
              <Link to="/search">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
                    <Search className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`} />
                  </div>
                  <h4 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                    Search Universities
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                    Find universities by location & programs
                  </p>
                </CardContent>
              </Link>
            </Card>

            {/* Compare Universities */}
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-compare-small">
              <Link to="/compare">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-orange-900' : 'bg-orange-100'}`}>
                    <GraduationCap className={`h-6 w-6 ${theme === 'dark' ? 'text-orange-300' : 'text-orange-600'}`} />
                  </div>
                  <h4 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                    Compare Universities
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                    Side-by-side comparison
                  </p>
                </CardContent>
              </Link>
            </Card>

            {/* Program Guide */}
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-programs-small">
              <Link to="/programs">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-teal-900' : 'bg-teal-100'}`}>
                    <BookOpen className={`h-6 w-6 ${theme === 'dark' ? 'text-teal-300' : 'text-teal-600'}`} />
                  </div>
                  <h4 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                    Program Guide
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                    Explore available programs
                  </p>
                </CardContent>
              </Link>
            </Card>

            {/* Application Guide */}
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-guide-small">
              <Link to="/guide">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${theme === 'dark' ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
                    <FileText className={`h-6 w-6 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`} />
                  </div>
                  <h4 className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                    Application Guide
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                    Step-by-step application tips
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`} data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
              Your Complete University Guide
            </h3>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
              Everything you need to make informed decisions about your education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className={`text-center ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-search">
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-scorecard-blue text-white'}`}>
                  <Search className="h-8 w-8" />
                </div>
                <h4 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                  Search & Filter
                </h4>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                  Find universities by location, program type, cost, and more with our advanced search filters.
                </p>
                <Link to="/search">
                  <Button className="mt-4 bg-scorecard-blue hover:bg-blue-900">
                    Start Your Search
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className={`text-center ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-compare">
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-orange-900 text-orange-200' : 'bg-scorecard-light-blue text-white'}`}>
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h4 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                  Compare Universities
                </h4>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                  Compare up to 10 universities side by side. See costs, graduation rates, and program offerings.
                </p>
                <Link to="/compare">
                  <Button variant="outline" className="mt-4 border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white">
                    Compare Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className={`text-center ${theme === 'dark' ? 'bg-gray-800 text-white' : ''}`} data-testid="card-eligibility">
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-600 text-white'}`}>
                  <University className="h-8 w-8" />
                </div>
                <h4 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                  Check Eligibility
                </h4>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                  Enter your WASSCE grades to see which programs you qualify for and get personalized recommendations.
                </p>
                <Link to="/eligibility">
                  <Button variant="outline" className="mt-4 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                    Check Eligibility
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-scorecard-bg'}`} data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div data-testid="stat-universities">
              <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                119+
              </div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                Universities
              </div>
            </div>
            <div data-testid="stat-programs">
              <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                1,000+
              </div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                Programs
              </div>
            </div>
            <div data-testid="stat-students">
              <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                500K+
              </div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                Students Helped
              </div>
            </div>
            <div data-testid="stat-regions">
              <div className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>
                16
              </div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-scorecard-gray'}`}>
                Regions Covered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${theme === 'dark' ? 'bg-gray-900 text-blue-200' : 'bg-scorecard-blue text-white'} py-12`} data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">Studyxo Uni Guide</h3>
              <p className="text-blue-100">
                Your comprehensive guide to universities in Ghana. Find, compare, and apply to the right programs for your future.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Search & Compare</h4>
              <ul className="space-y-2 text-blue-100">
                <li><Link to="/search" className="hover:text-white">Search Universities</Link></li>
                <li><Link to="/compare" className="hover:text-white">Compare Programs</Link></li>
                <li><Link to="/eligibility" className="hover:text-white">Check Eligibility</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white">Application Guide</a></li>
                <li><a href="#" className="hover:text-white">Scholarship Information</a></li>
                <li><a href="#" className="hover:text-white">Career Guidance</a></li>
                <li><a href="#" className="hover:text-white">Financial Aid</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-blue-100">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className={`border-t mt-8 pt-8 text-center ${theme === 'dark' ? 'border-gray-700 text-blue-300' : 'border-blue-800 text-blue-100'}`}>
            <p>&copy; 2024 Studyxo Uni Guide. Empowering students across Ghana.</p>
          </div>
        </div>
      </footer>

      <div className="flex-1 p-4">
        <h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-blue-300' : 'text-scorecard-blue'}`}>
          Ghana Uni Guide
        </h1>
        <div className="space-y-4">
          <Card className={`rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
            <CardContent className="p-6 flex flex-col items-center">
              <GraduationCap className={`h-10 w-10 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} mb-2`} />
              <h2 className="text-xl font-semibold mb-2">Check Your Eligibility</h2>
              <Button size="lg" className="w-full rounded-full bg-blue-600 text-white" onClick={() => navigate('/calculator')}>
                Start Calculator
              </Button>
            </CardContent>
          </Card>
          <Card className={`rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
            <CardContent className="p-6 flex flex-col items-center">
              <Home className={`h-10 w-10 ${theme === 'dark' ? 'text-green-300' : 'text-green-600'} mb-2`} />
              <h2 className="text-xl font-semibold mb-2">Explore Universities</h2>
              <Button size="lg" className="w-full rounded-full bg-green-600 text-white" onClick={() => navigate('/universities')}>
                Browse Universities
              </Button>
            </CardContent>
          </Card>
          <Card className={`rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
            <CardContent className="p-6 flex flex-col items-center">
              <Settings className={`h-10 w-10 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`} />
              <h2 className="text-xl font-semibold mb-2">Settings</h2>
              <Button size="lg" className="w-full rounded-full bg-gray-700 text-white" onClick={() => navigate('/settings')}>
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Bottom navigation bar */}
      <div className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-t'} flex justify-around py-2 shadow-lg`}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          <Home className="h-6 w-6" />
        </Button>
        <Button variant="ghost" onClick={() => navigate('/calculator')}>
          <GraduationCap className="h-6 w-6" />
        </Button>
        <Button variant="ghost" onClick={() => navigate('/settings')}>
          <Settings className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
