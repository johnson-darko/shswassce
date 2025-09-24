import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import type { EligibilityResult } from '@shared/schema';

export default function SavedProgramsPage() {
  const { theme } = useTheme();
  const [savedPrograms, setSavedPrograms] = useState<EligibilityResult[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedPrograms') || '[]');
    setSavedPrograms(saved);
  }, []);

  function removeProgram(programId: string, universityName: string) {
    const updated = savedPrograms.filter(p => p.programId !== programId || p.universityName !== universityName);
    setSavedPrograms(updated);
    localStorage.setItem('savedPrograms', JSON.stringify(updated));
  }

  return (
    <div className={`flex-1 w-full flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors`}>
      <h2 className="text-2xl font-bold mb-6">Saved Programs</h2>
      {savedPrograms.length === 0 ? (
        <Card className={`max-w-sm w-full rounded-xl shadow-lg border-0 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-gray-800 text-blue-100' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-white text-scorecard-blue'} flex flex-col items-center py-8`}>
          <CardContent className="flex flex-col items-center">
            <Calculator className={`h-12 w-12 mb-4 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`} />
            <h3 className="text-lg font-semibold mb-2">No saved programs yet.</h3>
            <p className="text-sm mb-4 text-center opacity-80">Input your WASSCE grades to find eligible programs.</p>
            <Link to="/calculator">
              <button
                className={`px-6 py-2 rounded-full font-semibold shadow transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-700 text-white hover:bg-purple-700'
                    : 'bg-blue-600 text-white hover:bg-purple-600'
                }`}
              >
                Input & Check Eligibility
              </button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedPrograms.map((program, idx) => (
            <Card key={program.programId + program.universityName} className="border-green-200 bg-green-50">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-green-800">{program.programName}</div>
                  <div className="text-sm text-green-600">{program.universityName}</div>
                  <div className="text-xs text-green-700 mt-1">{program.status === 'eligible' ? <CheckCircle className="inline h-4 w-4 text-green-600 mr-1" /> : <XCircle className="inline h-4 w-4 text-red-600 mr-1" />} {program.status === 'eligible' ? 'Eligible' : 'Not Eligible'}</div>
                </div>
                <Button size="sm" variant="destructive" onClick={() => removeProgram(program.programId, program.universityName)}>
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
