import { useState, useEffect } from "react";
import { localDataService, userPrefsService } from '@/lib/local-data-service';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import UniversityCard from "@/components/university-card";
import { Dialog } from "@/components/ui/dialog";
import UniversityDetailModal from "@/components/university-detail-modal";
import SearchFilters from "@/components/search-filters";
import { SearchFilters as ISearchFilters, University } from "@shared/schema";
import { useLocation } from "wouter";

export default function SearchPage() {
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ISearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<ISearchFilters>({});

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    const region = params.get('region');
    const type = params.get('type');
    
    if (query) setSearchQuery(query);
    
    const initialFilters: ISearchFilters = {};
    if (query) initialFilters.query = query;
    if (region) initialFilters.region = region;
    if (type) initialFilters.type = type;
    
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [location]);

  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load universities when filters change
  useEffect(() => {
    const loadUniversities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await localDataService.getUniversities(appliedFilters);
        setUniversities(results);
        
        // Save search to history
        if (appliedFilters.query) {
          userPrefsService.addToSearchHistory(appliedFilters.query);
        }
      } catch (err) {
        setError('Failed to load universities');
        console.error('Error loading universities:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUniversities();
  }, [appliedFilters]);

  const handleSearch = () => {
    const newFilters = { ...filters, query: searchQuery };
    setAppliedFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    const resetFilters: ISearchFilters = {};
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSearchQuery("");
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { 
      ...appliedFilters, 
      sortBy: sortBy as ISearchFilters['sortBy']
    };
    setAppliedFilters(newFilters);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-scorecard-bg py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Universities</h2>
            <p className="text-scorecard-gray">{error}. Please try again later.</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-scorecard-blue hover:bg-blue-900"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-scorecard-bg py-8 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8" data-testid="search-header">
          <h1 className="text-3xl font-bold text-scorecard-blue mb-4">Search Universities</h1>
          <p className="text-scorecard-gray mb-6">
            Find universities that match your goals and preferences
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Enter university name or program..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-12"
                  data-testid="input-search"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-scorecard-gray" />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-scorecard-blue hover:bg-blue-900 text-white"
                data-testid="button-search"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80">
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          </aside>

          {/* Results Section */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6" data-testid="results-header">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
                <p className="text-scorecard-gray" data-testid="results-count">
                  {isLoading ? 'Loading...' : `${universities.length} universities found`}
                </p>
              </div>
              <Select onValueChange={handleSortChange} data-testid="select-sort">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="cost_asc">Tuition: Low to High</SelectItem>
                  <SelectItem value="cost_desc">Tuition: High to Low</SelectItem>
                  <SelectItem value="graduation_rate">Graduation Rate</SelectItem>
                  <SelectItem value="acceptance_rate">Acceptance Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="space-y-4" data-testid="loading-skeleton">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : universities.length === 0 ? (
              <div className="text-center py-12" data-testid="no-results">
                <Search className="mx-auto h-12 w-12 text-scorecard-gray mb-4" />
                <h3 className="text-xl font-semibold text-scorecard-blue mb-2">No universities found</h3>
                <p className="text-scorecard-gray mb-4">
                  Try adjusting your search criteria or filters to find more results.
                </p>
                <Button 
                  onClick={handleResetFilters}
                  variant="outline"
                  className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                  data-testid="button-reset-search"
                >
                  Reset Search
                </Button>
              </div>
            ) : (
              <div className="space-y-4" data-testid="results-list">
                {universities.map((university) => (
                  <UniversityCard 
                    key={university.id} 
                    university={university} 
                    onViewDetails={() => setSelectedUniversity(university)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      {/* University Details Modal */}
      <Dialog open={!!selectedUniversity} onOpenChange={() => setSelectedUniversity(null)}>
        {selectedUniversity && (
          <UniversityDetailModal university={selectedUniversity} onClose={() => setSelectedUniversity(null)} />
        )}
      </Dialog>
    </div>
  );
}
