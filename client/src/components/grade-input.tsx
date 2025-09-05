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
};

// All elective subjects from the provided list
const electiveSubjectOptions = [
  "Accounting",
  "Akan", 
  "Animal Husbandry",
  "Applied Electricity",
  "Applied Electronics",
  "Arabic",
  "Auto Mechanics",
  "Basic Electronics", 
  "Basic/Applied Electricity",
  "Basketry",
  "Biology",
  "Building Construction",
  "Business Management",
  "Business Mathematics",
  "Ceramics",
  "Chemistry",
  "Clerical Office Duties",
  "Clothing and Textiles",
  "Costing",
  "Crop Husbandry",
  "Economics",
  "Electricity/Applied Electricity",
  "Electronics",
  "Engineering Science",
  "Financial Accounting",
  "Foods and Nutrition",
  "Forestry",
  "French",
  "General Agriculture",
  "General Knowledge In Art",
  "Geography",
  "Ghanaian Language",
  "Government",
  "Graphic Design",
  "History",
  "Horticulture",
  "ICT (Elective)",
  "Information Communication Technology",
  "Introduction to Business Management",
  "Jewellery",
  "Leatherwork",
  "Literature in English",
  "Making",
  "Management-In-Living",
  "Mathematics (Elective)",
  "Metalwork",
  "Music",
  "Painting",
  "Physics",
  "Picture Making",
  "Principles of Cost Accounting",
  "Principles of Costing",
  "Religious Studies",
  "Sculpture",
  "Technical Drawing",
  "Textiles",
  "Typewriting (40wpm)",
  "Welding and Fabrication",
  "Woodwork"
].sort();

export default function GradeInput({ grades, onGradesChange }: GradeInputProps) {
  const handleCoreGradeChange = (subject: keyof WassceeGrades, grade: string) => {
    onGradesChange({
      ...grades,
      [subject]: grade as any,
    });
  };

  const handleElectiveChange = (electiveNumber: number, field: 'Subject' | 'Grade', value: string) => {
    const subjectKey = `elective${electiveNumber}Subject` as keyof WassceeGrades;
    const gradeKey = `elective${electiveNumber}Grade` as keyof WassceeGrades;
    
    onGradesChange({
      ...grades,
      [field === 'Subject' ? subjectKey : gradeKey]: value,
    });
  };

  const getElectiveCount = () => {
    let count = 0;
    for (let i = 1; i <= 4; i++) {
      const subjectKey = `elective${i}Subject` as keyof WassceeGrades;
      if (grades[subjectKey]) count++;
    }
    return count;
  };

  return (
    <Card className="w-full bg-scorecard-bg" data-testid="grade-input">
      <CardHeader>
        <CardTitle className="text-center text-scorecard-blue">Enter Your WASSCE Grades</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Core Subjects */}
        <div className="mb-8" data-testid="core-subjects">
          <h3 className="font-semibold text-scorecard-blue mb-4">Core Subjects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.core.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                </label>
                <Select 
                  value={grades[key] || ""} 
                  onValueChange={(value) => handleCoreGradeChange(key, value)}
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

        {/* Elective Subjects */}
        <div data-testid="elective-subjects">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-scorecard-blue">Elective Subjects</h3>
            <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">
              Selected: {getElectiveCount()} of 4 subjects
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((num) => {
              const subjectKey = `elective${num}Subject` as keyof WassceeGrades;
              const gradeKey = `elective${num}Grade` as keyof WassceeGrades;
              
              return (
                <div key={num} className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700 italic">Elective Subject {num}</h4>
                    <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded uppercase font-medium">
                      ELECTIVE
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Subject Selection */}
                    <div>
                      <Select 
                        value={grades[subjectKey] || ""} 
                        onValueChange={(value) => handleElectiveChange(num, 'Subject', value)}
                        data-testid={`select-elective-${num}-subject`}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {electiveSubjectOptions.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Grade Selection */}
                    <div>
                      <Select 
                        value={grades[gradeKey] || ""} 
                        onValueChange={(value) => handleElectiveChange(num, 'Grade', value)}
                        data-testid={`select-elective-${num}-grade`}
                        disabled={!grades[subjectKey]}
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
