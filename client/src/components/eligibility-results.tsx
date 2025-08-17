import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { EligibilityResult } from "@shared/schema";

interface EligibilityResultsProps {
  results: EligibilityResult[];
}

export default function EligibilityResults({ results }: EligibilityResultsProps) {
  const getStatusIcon = (status: EligibilityResult['status']) => {
    switch (status) {
      case 'eligible':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'borderline':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'not_eligible':
        return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getStatusColor = (status: EligibilityResult['status']) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-50 border-green-200';
      case 'borderline':
        return 'bg-yellow-50 border-yellow-200';
      case 'not_eligible':
        return 'bg-red-50 border-red-200';
    }
  };

  const getStatusBadge = (status: EligibilityResult['status']) => {
    switch (status) {
      case 'eligible':
        return <Badge className="bg-green-100 text-green-800">✅ Eligible</Badge>;
      case 'borderline':
        return <Badge className="bg-yellow-100 text-yellow-800">⚠️ Borderline</Badge>;
      case 'not_eligible':
        return <Badge className="bg-red-100 text-red-800">❌ Not Eligible</Badge>;
    }
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-results">
        <AlertTriangle className="mx-auto h-12 w-12 text-scorecard-gray mb-4" />
        <h3 className="text-xl font-semibold text-scorecard-blue mb-2">No Results</h3>
        <p className="text-scorecard-gray">
          Please enter your grades to check eligibility for university programs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="eligibility-results">
      <h3 className="text-xl font-semibold text-scorecard-blue mb-4">Your Eligibility Results</h3>
      
      {results.map((result, index) => (
        <Card 
          key={`${result.programId}-${index}`} 
          className={`border ${getStatusColor(result.status)}`}
          data-testid={`result-card-${result.status}-${index}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900" data-testid={`program-name-${index}`}>
                      {result.programName} - {result.universityName}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1" data-testid={`status-message-${index}`}>
                      {result.message}
                    </p>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                
                {result.details.length > 0 && (
                  <div className="mt-3" data-testid={`details-${index}`}>
                    <div className="text-sm space-y-1">
                      {result.details.map((detail, detailIndex) => (
                        <div 
                          key={detailIndex} 
                          className={`${
                            detail.startsWith('✓') ? 'text-green-700' :
                            detail.startsWith('⚠️') ? 'text-yellow-700' :
                            detail.startsWith('❌') ? 'text-red-700' :
                            'text-gray-700'
                          }`}
                          data-testid={`detail-${index}-${detailIndex}`}
                        >
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg" data-testid={`recommendations-${index}`}>
                    <h5 className="font-medium text-blue-900 mb-2">Recommendations:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {result.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span data-testid={`recommendation-${index}-${recIndex}`}>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
