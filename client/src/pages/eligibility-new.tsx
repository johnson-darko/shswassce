import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, Heart, Download, Share2, Briefcase, DollarSign, TrendingUp } from 'lucide-react';
import { checkEligibilityOffline } from '@/lib/offline-eligibility-engine';
import { userPrefsService } from '@/lib/local-data-service';
import { useToast } from '@/hooks/use-toast';

const gradeOptions = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const gradeFormSchema = z.object({
  english: z.string().min(1, 'English grade is required'),
  mathematics: z.string().min(1, 'Mathematics grade is required'),
  science: z.string().min(1, 'Science grade is required'),
  social: z.string().min(1, 'Social Studies grade is required'),
  electiveMath: z.string().optional(),
  physics: z.string().optional(),
  chemistry: z.string().optional(),
  biology: z.string().optional(),
  economics: z.string().optional(),
  government: z.string().optional(),
  literature: z.string().optional(),
  geography: z.string().optional(),
});

type GradeFormData = z.infer<typeof gradeFormSchema>;

interface EligibilityResult {
  programId: string;
  programName: string;
  universityName: string;
  status: 'eligible' | 'borderline' | 'not_eligible' | 'multiple_tracks';
  message: string;
  details: string[];
  recommendations?: string[];
  careerOutcomes?: string[];
  averageSalary?: number;
  employmentRate?: number;
  isFavorite?: boolean;
  matchScore?: number;
  admissionTracks?: any[];
  bestTrackMatch?: string;
  requirementComplexity?: string;
}

const coreSubjects = [
  { key: 'english', label: 'English Language' },
  { key: 'mathematics', label: 'Mathematics (Core)' },
  { key: 'science', label: 'Integrated Science' },
  { key: 'social', label: 'Social Studies' }
];

const electiveSubjects = [
  { key: 'electiveMath', label: 'Elective Mathematics' },
  { key: 'physics', label: 'Physics' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'biology', label: 'Biology' },
  { key: 'economics', label: 'Economics' },
  { key: 'government', label: 'Government' },
  { key: 'literature', label: 'Literature in English' },
  { key: 'geography', label: 'Geography' }
];

function EligibilityPage() {
  const [savedGrades, setSavedGrades] = useState<GradeFormData | null>(null);
  const [eligibilityResults, setEligibilityResults] = useState<EligibilityResult[]>([]);

  const gradeForm = useForm<GradeFormData>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      english: '',
      mathematics: '',
      science: '',
      social: '',
      electiveMath: '',
      physics: '',
      chemistry: '',
      biology: '',
      economics: '',
      government: '',
      literature: '',
      geography: '',
    },
  });

  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleGradeSubmit = async (data: GradeFormData) => {
    setIsChecking(true);
    try {
      // Save grades locally
      userPrefsService.saveGrades(data);
      setSavedGrades(data);
      
      // Check eligibility offline
      const results = await checkEligibilityOffline(data);
      setEligibilityResults(results);
      
      toast({
        title: "Eligibility Check Complete",
        description: `Found ${results.filter(r => r.status === 'eligible').length} eligible programs for you!`,
      });
    } catch (error) {
      console.error('Failed to check eligibility:', error);
      toast({
        title: "Error",
        description: "Failed to check eligibility. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const renderSubjectSelect = (subject: { key: string; label: string }) => (
    <FormField
      key={subject.key}
      control={gradeForm.control}
      name={subject.key as keyof GradeFormData}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-scorecard-gray">{subject.label}</FormLabel>
          <FormControl>
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger data-testid={`select-${subject.key}`}>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const getEligibilityIcon = (status: 'eligible' | 'borderline' | 'not_eligible' | 'multiple_tracks') => {
    switch (status) {
      case 'eligible':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'borderline':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'multiple_tracks':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'not_eligible':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getEligibilityBadge = (status: 'eligible' | 'borderline' | 'not_eligible' | 'multiple_tracks') => {
    switch (status) {
      case 'eligible':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Eligible</Badge>;
      case 'borderline':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Borderline</Badge>;
      case 'multiple_tracks':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Multiple Options</Badge>;
      case 'not_eligible':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Not Eligible</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-scorecard-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-scorecard-blue mb-4" data-testid="page-title">
            Check Your Eligibility
          </h1>
          <p className="text-lg text-scorecard-gray">
            Enter your WASSCE grades once to check eligibility for multiple programs
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-scorecard-blue text-center">
              Enter Your WASSCE Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...gradeForm}>
              <form onSubmit={gradeForm.handleSubmit(handleGradeSubmit)} className="space-y-6">
                {/* Core Subjects */}
                <div>
                  <h3 className="text-lg font-semibold text-scorecard-blue mb-4">Core Subjects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coreSubjects.map(renderSubjectSelect)}
                  </div>
                </div>

                {/* Elective Subjects */}
                <div>
                  <h3 className="text-lg font-semibold text-scorecard-blue mb-4">Elective Subjects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {electiveSubjects.map(renderSubjectSelect)}
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    disabled={isChecking}
                    className="bg-scorecard-orange hover:bg-scorecard-orange/90 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-check-eligibility"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Checking Eligibility...
                      </>
                    ) : (
                      'Check Program Eligibility'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Eligibility Results */}
        {eligibilityResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl text-scorecard-blue text-center flex items-center justify-center gap-2">
                <AlertCircle className="h-6 w-6" />
                Eligibility Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eligibilityResults.map((result) => (
                  <div
                    key={result.programId}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                    data-testid={`result-${result.programId}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-scorecard-blue" data-testid={`program-name-${result.programId}`}>
                          {result.programName}
                        </h3>
                        <p className="text-scorecard-gray" data-testid={`university-name-${result.programId}`}>
                          {result.universityName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEligibilityIcon(result.status)}
                        {getEligibilityBadge(result.status)}
                      </div>
                    </div>

                    <p className="text-sm text-scorecard-gray mb-3" data-testid={`message-${result.programId}`}>
                      {result.message}
                    </p>

                    {result.details && result.details.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-scorecard-blue mb-2">Details:</p>
                        <div className="space-y-1">
                          {result.details.map((detail, index) => (
                            <p key={index} className="text-xs text-scorecard-gray">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.recommendations && result.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-2">Recommendations:</p>
                        <div className="space-y-1">
                          {result.recommendations.map((rec, index) => (
                            <p key={index} className="text-xs text-blue-600">
                              • {rec}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default EligibilityPage;