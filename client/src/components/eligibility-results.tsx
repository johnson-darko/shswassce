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
      case 'multiple_tracks':
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
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
      case 'multiple_tracks':
        return 'bg-blue-50 border-blue-200';
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
      case 'multiple_tracks':
        return <Badge className="bg-blue-100 text-blue-800">🎯 Multiple Tracks Available</Badge>;
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

                {/* Enhanced Multi-Track Display */}
                {result.status === 'multiple_tracks' && result.admissionTracks && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg" data-testid={`admission-tracks-${index}`}>
                    <h5 className="font-medium text-blue-900 mb-3">
                      Ways You Can Apply:
                      {result.bestTrackMatch && (
                        <span className="text-sm font-normal text-blue-700 ml-2">
                          (Best option for you: {result.bestTrackMatch})
                        </span>
                      )}
                    </h5>
                    <div className="space-y-3">
                      {result.admissionTracks.map((track, trackIndex) => (
                        <div key={trackIndex} className="border border-blue-200 rounded p-3 bg-white">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-shrink-0">
                              {track.status === 'eligible' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : track.status === 'borderline' ? (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <h6 className="font-medium text-gray-900" data-testid={`track-name-${index}-${trackIndex}`}>
                              {track.name}
                            </h6>
                            <Badge 
                              className={`text-xs ${
                                track.status === 'eligible' ? 'bg-green-100 text-green-800' :
                                track.status === 'borderline' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {track.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{track.description}</p>
                          {track.matchDetails && track.matchDetails.length > 0 && (
                            <div className="text-xs space-y-1">
                              {track.matchDetails.map((detail, detailIndex) => (
                                <p key={detailIndex} className="text-gray-700">
                                  {detail}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {result.requirementComplexity === 'advanced' && (
                      <p className="text-xs text-blue-600 mt-2 italic">
                        💡 This program has complex requirements with multiple pathways. Contact the admissions office for detailed guidance.
                      </p>
                    )}
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
