import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { University } from "@shared/schema";
import { Check, ExternalLink } from "lucide-react";
import { useComparison } from "@/hooks/use-comparison";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface UniversityCardProps {
  university: University;
  onViewDetails?: () => void;
}

export default function UniversityCard({ university, onViewDetails }: UniversityCardProps) {
  const { addToComparison, removeFromComparison, isSelected, selectedUniversities } = useComparison();
  const selected = isSelected(university.id);

  const handleToggleComparison = () => {
    if (selected) {
      removeFromComparison(university.id);
    } else {
      if (selectedUniversities.size < 10) {
        addToComparison(university);
        toast({
          title: `${university.name} added to compare list!`,
          description: `You have ${selectedUniversities.size + 1} universities in your compare list. Go to the Home page to view and compare.`,
        });
      }
    }
  };

  const getUniversityInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  const getTypeColor = (type: string) => {
    return type === 'Public' ? 'bg-blue-100 text-scorecard-blue' : 'bg-red-100 text-red-700';
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Small': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Large': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative" data-testid={`card-university-${university.id}`}>
      <div className="absolute top-4 right-4">
        <button
          onClick={handleToggleComparison}
          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            selected 
              ? 'border-scorecard-blue bg-scorecard-blue text-white' 
              : 'border-gray-300 hover:border-scorecard-blue hover:bg-scorecard-blue hover:text-white'
          }`}
          disabled={!selected && selectedUniversities.size >= 10}
          data-testid={`button-toggle-compare-${university.id}`}
        >
          <Check className={`h-4 w-4 ${selected ? 'block' : 'hidden'}`} />
        </button>
      </div>
      
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              {/* University Logo */}
              <div className="w-16 h-16 bg-scorecard-blue rounded-lg flex items-center justify-center text-white font-bold text-xl" data-testid={`logo-${university.id}`}>
                {getUniversityInitials(university.name)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-scorecard-blue mb-2" data-testid={`text-university-name-${university.id}`}>
                  {university.name}
                </h3>
                <p className="text-scorecard-gray mb-2" data-testid={`text-location-${university.id}`}>
                  {university.location}, {university.region}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getTypeColor(university.type)} data-testid={`badge-type-${university.id}`}>
                    {university.type}
                  </Badge>
                  <Badge className={getSizeColor(university.size)} data-testid={`badge-size-${university.id}`}>
                    {university.size}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700" data-testid={`badge-setting-${university.id}`}>
                    {university.setting}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-80">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div data-testid={`stat-graduation-rate-${university.id}`}>
                <div className="text-2xl font-bold text-scorecard-blue">
                  {university.graduationRate ? `${university.graduationRate}%` : 'N/A'}
                </div>
                <div className="text-xs text-scorecard-gray">Graduation Rate</div>
              </div>
              <div data-testid={`stat-annual-cost-${university.id}`}>
                <div className="text-2xl font-bold text-green-600">
                  {university.annualCost ? `₵${university.annualCost.toLocaleString()}` : 'N/A'}
                </div>
                <div className="text-xs text-scorecard-gray">Annual Cost</div>
              </div>
              <div data-testid={`stat-median-earnings-${university.id}`}>
                <div className="text-2xl font-bold text-purple-600">
                  {university.medianEarnings ? `₵${university.medianEarnings.toLocaleString()}` : 'N/A'}
                </div>
                <div className="text-xs text-scorecard-gray">Median Earnings</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="w-full bg-scorecard-blue text-white hover:bg-blue-900 transition text-sm"
                data-testid={`button-view-details-${university.id}`}
                onClick={onViewDetails}
              >
                View Details
              </Button>
              {university.website && (
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(university.website, '_blank')}
                  className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white transition"
                  data-testid={`button-external-link-${university.id}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
