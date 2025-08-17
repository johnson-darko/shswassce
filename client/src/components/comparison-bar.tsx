import { Button } from "@/components/ui/button";
import { useComparison } from "@/hooks/use-comparison";
import { Link } from "wouter";
import { X } from "lucide-react";

export default function ComparisonBar() {
  const { selectedUniversities, clearComparison } = useComparison();
  const count = selectedUniversities.size;

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-50" data-testid="comparison-bar">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-semibold text-scorecard-blue mr-4">Ready to Compare:</span>
          <span className="text-scorecard-gray" data-testid="text-comparison-count">
            {count} {count === 1 ? 'University' : 'Universities'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={clearComparison}
            className="text-scorecard-gray hover:text-red-600"
            data-testid="button-clear-comparison"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
          <Link href="/compare">
            <Button 
              className="bg-scorecard-blue hover:bg-blue-900 text-white"
              data-testid="button-compare-universities"
            >
              Compare Universities
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
