import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, Save, XCircle } from "lucide-react";
import GradeInput from "@/components/grade-input";
import EligibilityResults from "@/components/eligibility-results";
import { WassceeGrades, EligibilityResult } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const GRADES_STORAGE_KEY = 'wassce_grades';

export default function EligibilityPage() {
  const [grades, setGrades] = useState<WassceeGrades>({});
  const [results, setResults] = useState<EligibilityResult[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const eligibilityMutation = useMutation({
    mutationFn: async (grades: WassceeGrades) => {
      const response = await apiRequest('POST', '/api/check-eligibility', grades);
      return response.json() as Promise<EligibilityResult[]>;
    },
    onSuccess: (data) => {
      setResults(data);
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    },
    onError: (error) => {
      console.error('Eligibility check failed:', error);
    },
  });

  // Load saved grades on component mount
  useEffect(() => {
    try {
      const savedGrades = localStorage.getItem(GRADES_STORAGE_KEY);
      if (savedGrades) {
        const parsedGrades = JSON.parse(savedGrades) as WassceeGrades;
        setGrades(parsedGrades);
      }
    } catch (error) {
      console.error('Failed to load saved grades:', error);
    }
  }, []);

  const handleSaveGrades = () => {
    try {
      localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(grades));
      setIsSaved(true);
      // Show success message briefly
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save grades:', error);
      alert('Failed to save grades. Please try again.');
    }
  };

  const handleCheckEligibility = () => {
    // Check if at least some core subjects are provided
    const hasGrades = Object.values(grades).some(grade => grade && grade.trim() !== '');
    
    if (!hasGrades) {
      alert('Please enter at least some of your WASSCE grades before checking eligibility.');
      return;
    }

    eligibilityMutation.mutate(grades);
  };

  const hasResults = results.length > 0;
  const hasAnyGrades = Object.values(grades).some(grade => grade && grade.trim() !== '');

  return (
    <div className="min-h-screen bg-scorecard-bg py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12" data-testid="eligibility-header">
          <h1 className="text-4xl font-bold text-scorecard-blue mb-4">
            Check Your Eligibility
          </h1>
          <p className="text-xl text-scorecard-gray max-w-3xl mx-auto">
            Enter your WASSCE grades to see which programs you qualify for at universities across Ghana. 
            Get personalized recommendations based on your academic performance.
          </p>
        </div>

        {/* Grade Input Section */}
        <div className="mb-12" data-testid="grade-input-section">
          <GradeInput grades={grades} onGradesChange={setGrades} />
          
          <div className="flex justify-center items-center gap-4 mt-8">
            {/* Save Button */}
            <Button
              onClick={handleSaveGrades}
              disabled={!hasAnyGrades}
              variant="outline"
              className="font-semibold py-3 px-6 rounded-lg border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
              data-testid="button-save-grades"
            >
              <Save className="mr-2 h-5 w-5" />
              Save Grades
            </Button>

            {/* Check Eligibility Button */}
            <Button
              onClick={handleCheckEligibility}
              disabled={eligibilityMutation.isPending}
              className="bg-scorecard-blue hover:bg-blue-900 text-white font-semibold py-3 px-8 rounded-lg"
              data-testid="button-check-eligibility"
            >
              {eligibilityMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Checking Eligibility...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Check My Eligibility
                </>
              )}
            </Button>
          </div>

          {/* Save Success Message */}
          {isSaved && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Grades saved successfully!
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {eligibilityMutation.isError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg" data-testid="error-message">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">
                Failed to check eligibility. Please try again.
              </span>
            </div>
          </div>
        )}

        {/* Results Section */}
        {(hasResults || eligibilityMutation.isPending) && (
          <div id="results-section" className="mb-12" data-testid="results-section">
            {eligibilityMutation.isPending ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-scorecard-blue mb-4">Checking Eligibility...</h3>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-300 rounded w-full"></div>
                          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EligibilityResults results={results} />
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="bg-white rounded-lg p-8" data-testid="info-section">
          <h3 className="text-2xl font-semibold text-scorecard-blue mb-6">How Eligibility Checking Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Core Subjects</h4>
              <p className="text-scorecard-gray mb-4">
                All university programs require minimum grades in core subjects: English Language, 
                Mathematics, Integrated Science, and Social Studies.
              </p>
              <ul className="text-sm text-scorecard-gray space-y-1">
                <li>• Most programs require C6 or better in all core subjects</li>
                <li>• Some competitive programs may require higher grades</li>
                <li>• English and Mathematics are particularly important</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Elective Subjects</h4>
              <p className="text-scorecard-gray mb-4">
                Elective subjects are specific to your chosen field of study and vary by program.
              </p>
              <ul className="text-sm text-scorecard-gray space-y-1">
                <li>• Science programs require Physics, Chemistry, or Biology</li>
                <li>• Engineering programs typically need Elective Mathematics</li>
                <li>• Business programs may require Economics or Government</li>
                <li>• Some programs accept "any 2 electives" with minimum grades</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Results are based on general admission requirements and may vary by institution</li>
              <li>• Some programs have additional requirements like interviews or portfolio submissions</li>
              <li>• Aggregate scores and specific grade combinations may also be considered</li>
              <li>• Contact universities directly for the most current and detailed admission requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
