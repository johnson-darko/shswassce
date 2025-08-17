import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { SearchFilters } from "@shared/schema";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export default function SearchFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onApplyFilters, 
  onResetFilters 
}: SearchFiltersProps) {
  const regions = [
    "Greater Accra",
    "Ashanti", 
    "Central",
    "Eastern",
    "Northern",
    "Western",
    "Upper East",
    "Upper West",
    "Volta",
    "Brong Ahafo"
  ];

  const handleRegionChange = (region: string, checked: boolean) => {
    if (checked) {
      onFiltersChange({ ...filters, region });
    } else if (filters.region === region) {
      onFiltersChange({ ...filters, region: undefined });
    }
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      onFiltersChange({ ...filters, type });
    } else if (filters.type === type) {
      onFiltersChange({ ...filters, type: undefined });
    }
  };

  const handleCostChange = (values: number[]) => {
    onFiltersChange({ 
      ...filters, 
      minCost: values[0], 
      maxCost: values[1] 
    });
  };

  return (
    <Card className="h-fit" data-testid="search-filters">
      <CardHeader>
        <CardTitle className="text-scorecard-blue">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Filter */}
        <div data-testid="filter-location">
          <h4 className="font-medium text-gray-900 mb-3">Region</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {regions.map((region) => (
              <div key={region} className="flex items-center space-x-2">
                <Checkbox
                  id={`region-${region}`}
                  checked={filters.region === region}
                  onCheckedChange={(checked) => 
                    handleRegionChange(region, checked as boolean)
                  }
                  data-testid={`checkbox-region-${region.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <label
                  htmlFor={`region-${region}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {region}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Institution Type */}
        <div data-testid="filter-type">
          <h4 className="font-medium text-gray-900 mb-3">Institution Type</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-public"
                checked={filters.type === "Public"}
                onCheckedChange={(checked) => 
                  handleTypeChange("Public", checked as boolean)
                }
                data-testid="checkbox-type-public"
              />
              <label
                htmlFor="type-public"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Public
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-private"
                checked={filters.type === "Private"}
                onCheckedChange={(checked) => 
                  handleTypeChange("Private", checked as boolean)
                }
                data-testid="checkbox-type-private"
              />
              <label
                htmlFor="type-private"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Private
              </label>
            </div>
          </div>
        </div>

        {/* Tuition Range */}
        <div data-testid="filter-cost">
          <h4 className="font-medium text-gray-900 mb-3">Annual Tuition (GHS)</h4>
          <div className="space-y-3">
            <Slider
              min={0}
              max={50000}
              step={1000}
              value={[filters.minCost || 0, filters.maxCost || 50000]}
              onValueChange={handleCostChange}
              className="w-full"
              data-testid="slider-cost"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span data-testid="text-min-cost">₵{(filters.minCost || 0).toLocaleString()}</span>
              <span data-testid="text-max-cost">₵{(filters.maxCost || 50000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={onApplyFilters}
            className="w-full bg-scorecard-blue text-white hover:bg-blue-900"
            data-testid="button-apply-filters"
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline"
            onClick={onResetFilters}
            className="w-full text-scorecard-gray hover:text-scorecard-blue"
            data-testid="button-reset-filters"
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
