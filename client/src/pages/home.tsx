import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, GraduationCap, University, Calculator, FileText, BookOpen, Target, Sun, Moon, Settings, Home } from "lucide-react";
import { useTheme } from '@/context/ThemeContext';

type ExamCategory = 'upcoming' | 'core' | 'elective';
type ExamItem = {
  subject: string;
  date: string;
  day: string;
  weekday: string;
  time: string;
  color: string;
};

export default function HomePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [examTab, setExamTab] = useState<ExamCategory>('upcoming');

  // Example exam data
  const exams: Record<ExamCategory, ExamItem[]> = {
    upcoming: [
      { subject: 'Mathematics', date: 'Mon, 10th June', day: '10', weekday: 'Mon', time: '8:00am - 11:00am', color: 'blue' },
      { subject: 'English Language', date: 'Wed, 12th June', day: '12', weekday: 'Wed', time: '8:00am - 11:00am', color: 'green' },
      { subject: 'Integrated Science', date: 'Fri, 14th June', day: '14', weekday: 'Fri', time: '8:00am - 11:00am', color: 'purple' },
    ],
    core: [
      { subject: 'Mathematics', date: 'Mon, 10th June', day: '10', weekday: 'Mon', time: '8:00am - 11:00am', color: 'blue' },
      { subject: 'English Language', date: 'Wed, 12th June', day: '12', weekday: 'Wed', time: '8:00am - 11:00am', color: 'green' },
      { subject: 'Integrated Science', date: 'Fri, 14th June', day: '14', weekday: 'Fri', time: '8:00am - 11:00am', color: 'purple' },
    ],
    elective: [
      { subject: 'Biology', date: 'Mon, 17th June', day: '17', weekday: 'Mon', time: '8:00am - 11:00am', color: 'teal' },
      { subject: 'Economics', date: 'Wed, 19th June', day: '19', weekday: 'Wed', time: '8:00am - 11:00am', color: 'orange' },
      { subject: 'Geography', date: 'Fri, 21st June', day: '21', weekday: 'Fri', time: '8:00am - 11:00am', color: 'indigo' },
    ],
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors flex-1 w-full flex flex-col`}>
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
          </div>
          {/* Text on the right, smaller on mobile */}
          <div className="flex-1 text-left">
            <h2 className={`text-lg md:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-white'}`}>Your University Journey Starts Here</h2>
            <p className={`text-xs md:text-lg mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-100'}`}>Instantly check UNI programs you're eligible for and calculate your WASSCE aggregate score.Find & Compare Uni</p>
          </div>
        </div>
      </section>

      {/* Quick Tools Section */}
      <section className={`py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`} data-testid="quick-tools-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3
              className={`font-bold mb-2 ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}
              style={{ fontSize: '1rem', lineHeight: '1.1' }}
            >
              Ghana University Eligibility Tool
            </h3>
          </div>
          <section className="py-6">
  <div className="max-w-md mx-auto px-2 flex flex-row items-center justify-center gap-4 relative">
    {/* Saved Program Eligibility Card */}
    <Link to="/saved-programs" className="w-full max-w-[160px]">
      <Card
        className={`rounded-xl border ${theme === 'dark' ? 'bg-gray-900 text-yellow-200 border-gray-700' : 'bg-white text-scorecard-blue border-gray-200'} transition-transform active:scale-95`}
      >
        <CardContent className="p-4 flex flex-col items-center">
          <FileText className={`h-8 w-8 mb-2 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`} />
          <h2 className="text-base font-semibold mb-1 text-center">Saved Program Eligibility</h2>
          <p className="text-xs text-center opacity-80">View all your saved eligible programs</p>
        </CardContent>
      </Card>
    </Link>
    {/* Connector Arrow */}
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      className="mx-2"
    >
      <path
        d="M8 40 Q24 16 40 40"
        stroke={theme === 'dark' ? "#fbbf24" : "#3b82f6"}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <polygon
        points="40,40 36,36 44,36"
        fill={theme === 'dark' ? "#fbbf24" : "#3b82f6"}
      />
    </svg>
    {/* WASSCE Aggregate Calculator Card */}
    <Link to="/calculator" className="w-full max-w-[160px]">
      <Card
        className={`rounded-xl border ${theme === 'dark' ? 'bg-gray-900 text-purple-200 border-gray-700' : 'bg-white text-scorecard-blue border-gray-200'} transition-transform active:scale-95`}
      >
        <CardContent className="p-4 flex flex-col items-center">
          <Calculator className={`h-8 w-8 mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`} />
          <h2 className="text-base font-semibold mb-1 text-center">University Programs Eligibility</h2>
          <p className="text-xs text-center opacity-80">Input your WASSCE grades</p>
        </CardContent>
      </Card>
    </Link>
  </div>
</section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">


            {/* Check Eligibility */}


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
      {/* WASSCE Timetable Calendar Section - Mobile Calendar Style with Tabs & Dynamic Today/Next Exam */}
      <section className={`py-10 ${theme === 'dark' ? 'bg-gray-900' : 'bg-scorecard-bg'}`} data-testid="timetable-section">
        <div className="max-w-md mx-auto px-4">
          <h3 className={`text-2xl font-bold mb-6 text-center ${theme === 'dark' ? 'text-blue-200' : 'text-scorecard-blue'}`}>WASSCE Timetable</h3>
          {/* Tabs for exam categories */}
          <div className="flex justify-center mb-6">
            <button
              className={`px-4 py-2 rounded-l-full font-semibold border ${examTab === 'upcoming' ? (theme === 'dark' ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-900') : (theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}
              onClick={() => setExamTab('upcoming')}
            >Upcoming</button>
            <button
              className={`px-4 py-2 font-semibold border-t border-b ${examTab === 'core' ? (theme === 'dark' ? 'bg-green-800 text-white' : 'bg-green-200 text-green-900') : (theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}
              onClick={() => setExamTab('core')}
            >Core</button>
            <button
              className={`px-4 py-2 rounded-r-full font-semibold border ${examTab === 'elective' ? (theme === 'dark' ? 'bg-purple-800 text-white' : 'bg-purple-200 text-purple-900') : (theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}
              onClick={() => setExamTab('elective')}
            >Elective</button>
          </div>
          {/* Dynamic Today/Next Exam Logic */}
          {(() => {
            const parseExamDate = (dateStr: string) => {
              const parts = dateStr.split(',');
              if (parts.length < 2) return null;
              const dayMonth = parts[1].trim();
              const match = dayMonth.match(/(\d+)(?:[a-zA-Z]{2})?\s+([a-zA-Z]+)/);
              if (!match) return null;
              const day = parseInt(match[1]);
              const monthName = match[2].toLowerCase();
              const monthIndex = [
                "january", "february", "march", "april", "may", "june",
                "july", "august", "september", "october", "november", "december"
              ].indexOf(monthName);
              if (day && monthIndex >= 0) {
                const year = 2025;
                return new Date(year, monthIndex, day);
              }
              return null;
            };

            const today = new Date();
            today.setHours(0,0,0,0);

            // Find today's exam
            const todayExam = exams[examTab].find(exam => {
              const examDate = parseExamDate(exam.date);
              return (
                examDate &&
                examDate.getFullYear() === today.getFullYear() &&
                examDate.getMonth() === today.getMonth() &&
                examDate.getDate() === today.getDate()
              );
            });

            // Find next exam (after today)
            const futureExams = exams[examTab]
              .map(exam => ({ ...exam, examDate: parseExamDate(exam.date) }))
              .filter(exam => exam.examDate && exam.examDate.getTime() > today.getTime())
              .sort((a, b) => a.examDate!.getTime() - b.examDate!.getTime());

            let nextExam = futureExams[0];

            // If no future exam, wrap around and show the earliest exam in the list as "Next Exam"
            if (!nextExam && exams[examTab].length > 0) {
              nextExam = exams[examTab]
                .map(exam => ({ ...exam, examDate: parseExamDate(exam.date) }))
                .sort((a, b) => a.examDate!.getTime() - b.examDate!.getTime())[0];
            }

            return (
              <div className="mb-6">
                {todayExam ? (
                  <div className="rounded-xl shadow p-4 flex items-center bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-600 mb-4">
                    <div className="flex flex-col items-center justify-center mr-4">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-200">{todayExam.day}</span>
                      <span className="text-xs text-gray-400">{todayExam.weekday}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-blue-700 dark:text-blue-200">{todayExam.subject}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-300">{todayExam.date.split(',')[1].trim()} &bull; {todayExam.time}</div>
                      <div className="mt-1 font-bold text-blue-600 dark:text-blue-200">Exam TODAY</div>
                    </div>
                  </div>
                ) : nextExam ? (
                  <div className="rounded-xl shadow p-4 flex items-center bg-green-50 dark:bg-green-900 border-l-4 border-green-600 mb-4">
                    <div className="flex flex-col items-center justify-center mr-4">
                      <span className="text-xl font-bold text-green-600 dark:text-green-200">{nextExam.day}</span>
                      <span className="text-xs text-gray-400">{nextExam.weekday}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-green-700 dark:text-green-200">{nextExam.subject}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-300">{nextExam.date.split(',')[1].trim()} &bull; {nextExam.time}</div>
                      <div className="mt-1 font-bold text-green-600 dark:text-green-200">Next Exam</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-300 mb-4">No exams scheduled.</div>
                )}
              </div>
            );
          })()}
          {/* Exam List for selected tab */}
          <div className="flex flex-col gap-5">
            {exams[examTab].map((exam: ExamItem, idx: number) => (
              <div key={idx} className={`rounded-xl shadow p-4 flex items-center bg-white dark:bg-gray-800`}>
                <div className="flex flex-col items-center justify-center mr-4">
                  <span className={`text-xl font-bold text-${exam.color}-600 dark:text-${exam.color}-200`}>{exam.day}</span>
                  <span className="text-xs text-gray-400">{exam.weekday}</span>
                </div>
                <div className="flex-1">
                  <span className={`font-semibold text-${exam.color}-700 dark:text-${exam.color}-200`}>{exam.subject}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-300">{exam.date.split(',')[1].trim()} &bull; {exam.time}</div>
                </div>
              </div>
            ))}
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
            <p>&copy; 2025 Studyxo Uni Guide. Empowering students across Ghana.</p>
          </div>
        </div>
      </footer>



    </div>
  );
}
