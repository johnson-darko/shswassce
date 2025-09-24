import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { University } from "@shared/schema";
import { useComparison } from "@/hooks/use-comparison";
import { Link } from "wouter";
import { ExternalLink, GraduationCap, DollarSign, TrendingUp, Users, X } from "lucide-react";
import { localDataService } from "@/lib/local-data-service";

export default function ComparePage() {
  const { selectedUniversities, universityDetails, removeFromComparison, clearComparison } = useComparison();

  const { data: universities = [], isLoading, error } = useQuery({
    queryKey: ['offline-universities-compare', Array.from(selectedUniversities), 'v2'], // Force cache bust
    queryFn: async () => {
      if (selectedUniversities.size === 0) return [];
      console.log('Loading comparison data offline - no API calls');
      
      const universityIds = Array.from(selectedUniversities);
      return await localDataService.getUniversitiesByIds(universityIds);
    },
    enabled: selectedUniversities.size > 0,
    staleTime: 0, // Force fresh queries
    cacheTime: 0, // Don't cache
  });

  if (selectedUniversities.size === 0) {
    return (
      <div className="flex-1 w-full bg-scorecard-bg py-8 flex flex-col">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16" data-testid="no-selection">
            <GraduationCap className="mx-auto h-16 w-16 text-scorecard-gray mb-6" />
            <h1 className="text-3xl font-bold text-scorecard-blue mb-4">Compare Universities</h1>
            <p className="text-xl text-scorecard-gray mb-8 max-w-2xl mx-auto">
              Select universities from the search page to compare them side by side.
            </p>
            <Link href="/search">
              <Button className="bg-scorecard-blue hover:bg-blue-900 text-white" data-testid="button-go-search">
                Go to Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-scorecard-bg py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16" data-testid="error-state">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Comparison</h1>
            <p className="text-scorecard-gray mb-8">Failed to load university data for comparison.</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
              data-testid="button-retry"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getUniversityInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  const getTypeColor = (type: string) => {
    return type === 'Public' ? 'bg-blue-100 text-scorecard-blue' : 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen bg-scorecard-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8" data-testid="compare-header">
          <h1 className="text-3xl font-bold text-scorecard-blue mb-4">Compare Universities</h1>
          <div className="flex justify-between items-center">
            <p className="text-scorecard-gray">
              Comparing {universities.length} {universities.length === 1 ? 'university' : 'universities'}
            </p>
            <Button 
              variant="outline" 
              onClick={clearComparison}
              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              data-testid="button-clear-all"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="loading-skeleton">
            {[...Array(selectedUniversities.size)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-16 bg-gray-300 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* University Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-testid="comparison-grid">
              {universities.map((university) => (
                <Card key={university.id} className="relative" data-testid={`comparison-card-${university.id}`}>
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromComparison(university.id)}
                      className="h-8 w-8 text-red-600 hover:bg-red-100"
                      data-testid={`button-remove-${university.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-scorecard-blue rounded-lg flex items-center justify-center text-white font-bold">
                        {getUniversityInitials(university.name)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-scorecard-blue" data-testid={`title-${university.id}`}>
                          {university.name}
                        </CardTitle>
                        <p className="text-sm text-scorecard-gray" data-testid={`location-${university.id}`}>
                          {university.location}, {university.region}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getTypeColor(university.type)} data-testid={`type-badge-${university.id}`}>
                        {university.type}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700" data-testid={`size-badge-${university.id}`}>
                        {university.size}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-scorecard-gray">Graduation Rate</span>
                        <span className="font-semibold text-scorecard-blue" data-testid={`grad-rate-${university.id}`}>
                          {university.graduationRate ? `${university.graduationRate}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-scorecard-gray">Annual Cost</span>
                        <span className="font-semibold text-green-600" data-testid={`cost-${university.id}`}>
                          {university.annualCost ? `₵${university.annualCost.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-scorecard-gray">Median Earnings</span>
                        <span className="font-semibold text-purple-600" data-testid={`earnings-${university.id}`}>
                          {university.medianEarnings ? `₵${university.medianEarnings.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-scorecard-gray">Acceptance Rate</span>
                        <span className="font-semibold text-orange-600" data-testid={`acceptance-${university.id}`}>
                          {university.acceptanceRate ? `${university.acceptanceRate}%` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/university/${university.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                          data-testid={`button-details-${university.id}`}
                        >
                          View Details
                        </Button>
                      </Link>
                      {university.website && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(university.website, '_blank')}
                          className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                          data-testid={`button-website-${university.id}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <Card data-testid="comparison-table">
              <CardHeader>
                <CardTitle className="text-scorecard-blue">Side-by-Side Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-scorecard-blue">Metric</th>
                        {universities.map((university) => (
                          <th key={university.id} className="text-left py-3 px-4 font-semibold text-scorecard-blue min-w-48">
                            {university.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-scorecard-gray">Location</td>
                        {universities.map((university) => (
                          <td key={university.id} className="py-3 px-4 text-gray-900">
                            {university.location}, {university.region}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-scorecard-gray">Type</td>
                        {universities.map((university) => (
                          <td key={university.id} className="py-3 px-4">
                            <Badge className={getTypeColor(university.type)}>
                              {university.type}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-scorecard-gray">Size</td>
                        {universities.map((university) => (
                          <td key={university.id} className="py-3 px-4 text-gray-900">
                            {university.size}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-scorecard-gray">Graduation Rate</td>
                        {universities.map((university) => (
                          <td key={university.id} className="py-3 px-4 font-semibold text-scorecard-blue">
                            {university.graduationRate ? `${university.graduationRate}%` : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-scorecard-gray">Annual Cost</td>
                        {universities.map((university) => (
                          <td key={university.id} className="py-3 px-4 font-semibold text-green-600">
                            {university.annualCost ? `₵${university.annualCost.toLocaleString()}` : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-scorecard-gray">Median Earnings</td>
                        {universities.map((university) => (
                          <td key={university.id} className="py-3 px-4 font-semibold text-purple-600">
                            {university.medianEarnings ? `₵${university.medianEarnings.toLocaleString()}` : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-scorecard-gray">Acceptance Rate</td>
                        {universities.map((university) => (
                          <td key={university.id} className="py-3 px-4 font-semibold text-orange-600">
                            {university.acceptanceRate ? `${university.acceptanceRate}%` : 'N/A'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Actions */}
        <div className="mt-8 text-center" data-testid="comparison-actions">
          <div className="space-x-4">
            <Link href="/search">
              <Button 
                variant="outline" 
                className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                data-testid="button-add-more"
              >
                Add More Universities
              </Button>
            </Link>
            <Link href="/eligibility">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-check-eligibility"
              >
                Check Eligibility
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
