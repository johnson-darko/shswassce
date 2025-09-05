import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { WassceeGrades } from "@shared/schema";
import { useState } from "react";

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
  const [openPopovers, setOpenPopovers] = useState<Record<number, boolean>>({});
  
  const handleCoreGradeChange = (subject: keyof WassceeGrades, grade: string) => {
    onGradesChange({
      ...grades,
      [subject]: grade as any,
    });
  };

  const handleElectiveChange = (electiveNumber: number, field: 'Subject' | 'Grade', value: string) => {
    const subjectKey = `elective${electiveNumber}Subject` as keyof WassceeGrades;
    const gradeKey = `elective${electiveNumber}Grade` as keyof WassceeGrades;
    
    if (field === 'Subject') {
      // Clear the grade when subject changes
      onGradesChange({
        ...grades,
        [subjectKey]: value,
        [gradeKey]: '',
      });
      // Close the popover
      setOpenPopovers(prev => ({ ...prev, [electiveNumber]: false }));
    } else {
      onGradesChange({
        ...grades,
        [gradeKey]: value,
      });
    }
  };
  
  const getSelectedSubjects = () => {
    const selected: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const subjectKey = `elective${i}Subject` as keyof WassceeGrades;
      const subject = grades[subjectKey];
      if (subject) selected.push(subject);
    }
    return selected;
  };
  
  const getAvailableSubjects = (currentElectiveNumber: number) => {
    const selectedSubjects = getSelectedSubjects();
    const currentSubjectKey = `elective${currentElectiveNumber}Subject` as keyof WassceeGrades;
    const currentSubject = grades[currentSubjectKey];
    
    return electiveSubjectOptions.filter(subject => 
      !selectedSubjects.includes(subject) || subject === currentSubject
    );
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">
                {getElectiveCount()} of 4 selected
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((num) => {
                  const subjectKey = `elective${num}Subject` as keyof WassceeGrades;
                  const hasSubject = !!grades[subjectKey];
                  return (
                    <div 
                      key={num} 
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        hasSubject 
                          ? "bg-green-500 border-green-500 text-white" 
                          : "bg-gray-100 border-gray-300"
                      )}
                    >
                      {hasSubject && <Check className="w-3 h-3" />}
                    </div>
                  );
                })}
              </div>
            </div>
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
                    {/* Subject Selection - Searchable Combobox */}
                    <div>
                      <Popover 
                        open={openPopovers[num] || false} 
                        onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, [num]: open }))}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPopovers[num] || false}
                            className="w-full justify-between font-normal"
                            data-testid={`select-elective-${num}-subject`}
                          >
                            {grades[subjectKey] || "Select a subject"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search subjects..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No subject found.</CommandEmpty>
                              <CommandGroup>
                                {getAvailableSubjects(num).map((subject) => (
                                  <CommandItem
                                    key={subject}
                                    value={subject}
                                    onSelect={() => {
                                      handleElectiveChange(num, 'Subject', subject);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        grades[subjectKey] === subject ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {subject}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
