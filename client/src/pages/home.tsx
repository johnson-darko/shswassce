import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, GraduationCap, University } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = `/search`;
    }
  };

  return (
    <div className="min-h-screen bg-scorecard-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-scorecard-blue to-scorecard-light-blue py-16" data-testid="hero-section">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Find Your Perfect University
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Search and compare universities across Ghana. Check your eligibility and find programs that match your goals.
          </p>
          
          {/* Main Search Interface */}
          <Card className="max-w-2xl mx-auto" data-testid="search-card">
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter university name or program..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-12"
                  data-testid="input-search-query"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-scorecard-gray" />
              </div>
              
              <Button 
                onClick={handleSearch}
                className="w-full bg-scorecard-blue hover:bg-blue-900 text-white font-semibold"
                data-testid="button-search"
              >
                <Search className="mr-2 h-4 w-4" />
                Search Universities
              </Button>
            </CardContent>
          </Card>

          {/* Quick Search Options */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/search?near=me">
              <Button 
                variant="outline" 
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                data-testid="button-near-me"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Near Me
              </Button>
            </Link>
            <Link href="/search">
              <Button 
                variant="outline" 
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                data-testid="button-all-universities"
              >
                <University className="mr-2 h-4 w-4" />
                All Universities
              </Button>
            </Link>
            <Link href="/search?category=programs">
              <Button 
                variant="outline" 
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                data-testid="button-programs"
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-scorecard-blue mb-4">
              Your Complete University Guide
            </h3>
            <p className="text-xl text-scorecard-gray">
              Everything you need to make informed decisions about your education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center" data-testid="card-search">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-scorecard-blue rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold text-scorecard-blue mb-4">Search & Filter</h4>
                <p className="text-scorecard-gray">
                  Find universities by location, program type, cost, and more with our advanced search filters.
                </p>
                <Link href="/search">
                  <Button className="mt-4 bg-scorecard-blue hover:bg-blue-900" data-testid="button-start-search">
                    Start Your Search
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-compare">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-scorecard-light-blue rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold text-scorecard-blue mb-4">Compare Universities</h4>
                <p className="text-scorecard-gray">
                  Compare up to 10 universities side by side. See costs, graduation rates, and program offerings.
                </p>
                <Link href="/compare">
                  <Button variant="outline" className="mt-4 border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white" data-testid="button-compare">
                    Compare Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-eligibility">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <University className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold text-scorecard-blue mb-4">Check Eligibility</h4>
                <p className="text-scorecard-gray">
                  Enter your WASSCE grades to see which programs you qualify for and get personalized recommendations.
                </p>
                <Link href="/eligibility">
                  <Button variant="outline" className="mt-4 border-green-600 text-green-600 hover:bg-green-600 hover:text-white" data-testid="button-check-eligibility">
                    Check Eligibility
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-scorecard-bg" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div data-testid="stat-universities">
              <div className="text-4xl font-bold text-scorecard-blue mb-2">119+</div>
              <div className="text-scorecard-gray">Universities</div>
            </div>
            <div data-testid="stat-programs">
              <div className="text-4xl font-bold text-scorecard-blue mb-2">1,000+</div>
              <div className="text-scorecard-gray">Programs</div>
            </div>
            <div data-testid="stat-students">
              <div className="text-4xl font-bold text-scorecard-blue mb-2">500K+</div>
              <div className="text-scorecard-gray">Students Helped</div>
            </div>
            <div data-testid="stat-regions">
              <div className="text-4xl font-bold text-scorecard-blue mb-2">16</div>
              <div className="text-scorecard-gray">Regions Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-scorecard-blue text-white py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">MyCampusMingle</h3>
              <p className="text-blue-100">Your comprehensive guide to universities in Ghana. Find, compare, and apply to the right programs for your future.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Search & Compare</h4>
              <ul className="space-y-2 text-blue-100">
                <li><Link href="/search" className="hover:text-white">Search Universities</Link></li>
                <li><Link href="/compare" className="hover:text-white">Compare Programs</Link></li>
                <li><Link href="/eligibility" className="hover:text-white">Check Eligibility</Link></li>
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
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-100">
            <p>&copy; 2024 MyCampusMingle. Empowering students across Ghana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
