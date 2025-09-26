import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, MapPin, BookOpen } from "lucide-react";
import { localDataService } from "@/lib/local-data-service";

interface UniversityDetailModalProps {
  university: any; // Use correct type if available
  onClose: () => void;
}

export default function UniversityDetailModal({ university, onClose }: UniversityDetailModalProps) {
  const [programCount, setProgramCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    localDataService.getProgramsByUniversity(university.id, university.name).then(programs => {
      if (isMounted) setProgramCount(programs.length);
    });
    return () => { isMounted = false; };
  }, [university.id, university.name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-scorecard-blue">{university.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-scorecard-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {university.name.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 text-scorecard-gray">
                  <MapPin className="h-5 w-5" />
                  <span>{university.location}, {university.region}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-blue-100 text-scorecard-blue">{university.type}</Badge>
                  <Badge className="bg-gray-100 text-gray-700"><Users className="mr-1 h-3 w-3" />{university.size}</Badge>
                  <Badge className="bg-gray-100 text-gray-700">{university.setting}</Badge>
                </div>
              </div>
            </div>
            {university.description && (
              <p className="text-scorecard-gray mb-4">{university.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-scorecard-blue">{university.graduationRate ? `${university.graduationRate}%` : 'N/A'}</div>
                <div className="text-xs text-scorecard-gray">Graduation Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">{university.acceptanceRate ? `${university.acceptanceRate}%` : 'N/A'}</div>
                <div className="text-xs text-scorecard-gray">Acceptance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{university.annualCost ? `₵${university.annualCost.toLocaleString()}` : 'N/A'}</div>
                <div className="text-xs text-scorecard-gray">Annual Cost</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{university.medianEarnings ? `₵${university.medianEarnings.toLocaleString()}` : 'N/A'}</div>
                <div className="text-xs text-scorecard-gray">Median Earnings</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-scorecard-blue" />
              <span className="font-semibold text-scorecard-blue">Programs:</span>
              <span className="font-bold text-scorecard-blue">{programCount !== null ? programCount : '...'}</span>
            </div>
            {university.website && (
              <Button
                variant="outline"
                onClick={() => window.open(university.website, '_blank')}
                className="w-full border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Website
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
