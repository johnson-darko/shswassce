import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import type { EligibilityResult } from '@shared/schema';

export default function SavedProgramsPage() {
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-scorecard-blue">Saved Programs</h1>
      {savedPrograms.length === 0 ? (
        <div className="text-gray-600">No saved programs yet.</div>
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
