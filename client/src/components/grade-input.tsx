import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WassceeGrades } from "@shared/schema";

interface GradeInputProps {
  grades: WassceeGrades;
  onGradesChange: (grades: WassceeGrades) => void;
}

const gradeOptions = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const subjects = {
  core: [
    { key: 'english' as keyof WassceeGrades, label: 'English Language' },
    { key: 'mathematics' as keyof WassceeGrades, label: 'Mathematics' },
    { key: 'science' as keyof WassceeGrades, label: 'Integrated Science' },
    { key: 'social' as keyof WassceeGrades, label: 'Social Studies' },
  ],
  electives: [
    { key: 'electiveMath' as keyof WassceeGrades, label: 'Elective Mathematics' },
    { key: 'physics' as keyof WassceeGrades, label: 'Physics' },
    { key: 'chemistry' as keyof WassceeGrades, label: 'Chemistry' },
    { key: 'biology' as keyof WassceeGrades, label: 'Biology' },
    { key: 'economics' as keyof WassceeGrades, label: 'Economics' },
    { key: 'government' as keyof WassceeGrades, label: 'Government' },
    { key: 'literature' as keyof WassceeGrades, label: 'Literature' },
    { key: 'geography' as keyof WassceeGrades, label: 'Geography' },
  ],
};

export default function GradeInput({ grades, onGradesChange }: GradeInputProps) {
  const handleGradeChange = (subject: keyof WassceeGrades, grade: string) => {
    onGradesChange({
      ...grades,
      [subject]: grade as any,
    });
  };

  return (
    <Card className="w-full bg-scorecard-bg" data-testid="grade-input">
      <CardHeader>
        <CardTitle className="text-center text-scorecard-blue">Enter Your WASSCE Grades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Core Subjects */}
          <div data-testid="core-subjects">
            <h3 className="font-semibold text-scorecard-blue mb-4">Core Subjects</h3>
            <div className="space-y-4">
              {subjects.core.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <Select 
                    value={grades[key] || ""} 
                    onValueChange={(value) => handleGradeChange(key, value)}
                    data-testid={`select-${key}`}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Elective Subjects - Split into two columns */}
          <div data-testid="elective-subjects-1">
            <h3 className="font-semibold text-scorecard-blue mb-4">Elective Subjects</h3>
            <div className="space-y-4">
              {subjects.electives.slice(0, 4).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <Select 
                    value={grades[key] || ""} 
                    onValueChange={(value) => handleGradeChange(key, value)}
                    data-testid={`select-${key}`}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div data-testid="elective-subjects-2">
            <h3 className="font-semibold text-scorecard-blue mb-4">Additional Electives</h3>
            <div className="space-y-4">
              {subjects.electives.slice(4).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <Select 
                    value={grades[key] || ""} 
                    onValueChange={(value) => handleGradeChange(key, value)}
                    data-testid={`select-${key}`}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
