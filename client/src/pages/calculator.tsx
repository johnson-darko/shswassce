import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Calculator as CalculatorIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CalculatorGrades {
  english: string;
  mathematics: string;
  science: string;
  social: string;
  elective1Subject: string;
  elective1Grade: string;
  elective2Subject: string;
  elective2Grade: string;
  elective3Subject: string;
  elective3Grade: string;
  elective4Subject: string;
  elective4Grade: string;
}

const gradeOptions = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const subjects = {
  core: [
    { key: 'english' as keyof CalculatorGrades, label: 'English Language' },
    { key: 'mathematics' as keyof CalculatorGrades, label: 'Mathematics' },
    { key: 'science' as keyof CalculatorGrades, label: 'Integrated Science' },
    { key: 'social' as keyof CalculatorGrades, label: 'Social Studies' },
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

const gradeValues: Record<string, number> = {
  'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'D7': 7, 'E8': 8, 'F9': 9
};

export default function Calculator() {
  const [grades, setGrades] = useState<CalculatorGrades>({
    english: '',
    mathematics: '',
    science: '',
    social: '',
    elective1Subject: '',
    elective1Grade: '',
    elective2Subject: '',
    elective2Grade: '',
    elective3Subject: '',
    elective3Grade: '',
    elective4Subject: '',
    elective4Grade: '',
  });
  
  const [openPopovers, setOpenPopovers] = useState<Record<number, boolean>>({});

  // Load grades from localStorage on component mount
  useEffect(() => {
    const savedGrades = localStorage.getItem('calculatorGrades');
    if (savedGrades) {
      try {
        setGrades(JSON.parse(savedGrades));
      } catch (error) {
        console.error('Failed to parse saved grades:', error);
      }
    }
  }, []);

  // Save grades to localStorage whenever grades change
  useEffect(() => {
    localStorage.setItem('calculatorGrades', JSON.stringify(grades));
  }, [grades]);

  const handleCoreGradeChange = (subject: keyof CalculatorGrades, grade: string) => {
    setGrades({
      ...grades,
      [subject]: grade,
    });
  };

  const handleElectiveChange = (electiveNumber: number, field: 'Subject' | 'Grade', value: string) => {
    const subjectKey = `elective${electiveNumber}Subject` as keyof CalculatorGrades;
    const gradeKey = `elective${electiveNumber}Grade` as keyof CalculatorGrades;
    
    if (field === 'Subject') {
      // Clear the grade when subject changes
      setGrades({
        ...grades,
        [subjectKey]: value,
        [gradeKey]: '',
      });
      // Close the popover
      setOpenPopovers(prev => ({ ...prev, [electiveNumber]: false }));
    } else {
      setGrades({
        ...grades,
        [gradeKey]: value,
      });
    }
  };
  
  const getSelectedSubjects = () => {
    const selected: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const subjectKey = `elective${i}Subject` as keyof CalculatorGrades;
      const subject = grades[subjectKey];
      if (subject) selected.push(subject);
    }
    return selected;
  };
  
  const getAvailableSubjects = (currentElectiveNumber: number) => {
    const selectedSubjects = getSelectedSubjects();
    const currentSubjectKey = `elective${currentElectiveNumber}Subject` as keyof CalculatorGrades;
    const currentSubject = grades[currentSubjectKey];
    
    return electiveSubjectOptions.filter(subject => 
      !selectedSubjects.includes(subject) || subject === currentSubject
    );
  };

  const getElectiveCount = () => {
    let count = 0;
    for (let i = 1; i <= 4; i++) {
      const subjectKey = `elective${i}Subject` as keyof CalculatorGrades;
      if (grades[subjectKey]) count++;
    }
    return count;
  };

  const calculateAggregate = () => {
    const coreGrades = [grades.english, grades.mathematics, grades.science, grades.social];
    const electiveGrades = [
      grades.elective1Grade,
      grades.elective2Grade, 
      grades.elective3Grade,
      grades.elective4Grade
    ].filter(grade => grade !== '');

    // Check if we have all core subjects
    if (coreGrades.some(grade => !grade)) {
      return null;
    }

    // Check if we have at least 2 elective grades (minimum requirement)
    if (electiveGrades.length < 2) {
      return null;
    }

    // Calculate core total (all 4 subjects required)
    const coreTotal = coreGrades.reduce((sum, grade) => sum + gradeValues[grade], 0);
    
    // Calculate elective total (best 3 subjects, or all if less than 3)
    const sortedElectives = electiveGrades.sort((a, b) => gradeValues[a] - gradeValues[b]);
    const bestElectives = sortedElectives.slice(0, 3);
    const electiveTotal = bestElectives.reduce((sum, grade) => sum + gradeValues[grade], 0);
    
    return {
      coreTotal,
      electiveTotal,
      aggregate: coreTotal + electiveTotal,
      electiveCount: electiveGrades.length,
      bestElectivesUsed: bestElectives.length
    };
  };

  const result = calculateAggregate();

  return (
    <div className="container mx-auto px-4 py-8" data-testid="calculator">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CalculatorIcon className="h-8 w-8 text-scorecard-blue" />
            <h1 className="text-3xl font-bold text-scorecard-blue">WASSCE Aggregate Calculator</h1>
          </div>
          <p className="text-gray-600">
            Calculate your aggregate score based on your WASSCE grades. 
            Your aggregate is calculated using all 4 core subjects + your best 3 elective subjects.
          </p>
        </div>

        <Card className="w-full bg-scorecard-bg mb-6" data-testid="calculator-input">
          <CardHeader>
            <CardTitle className="text-center text-scorecard-blue">Enter Your WASSCE Grades</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Core Subjects */}
            <div className="mb-8" data-testid="core-subjects">
              <h3 className="font-semibold text-scorecard-blue mb-4">Core Subjects (All Required)</h3>
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-scorecard-blue">Elective Subjects</h3>
                <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-700 font-medium">
                    Selected: {getElectiveCount()} of 4 subjects
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((num) => {
                      const subjectKey = `elective${num}Subject` as keyof CalculatorGrades;
                      const hasSubject = !!grades[subjectKey];
                      return (
                        <div 
                          key={num} 
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                            hasSubject 
                              ? "bg-green-500 border-green-500 text-white" 
                              : "bg-white border-gray-300 text-gray-400"
                          )}
                        >
                          {hasSubject ? <Check className="w-4 h-4" /> : num}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => {
                  const subjectKey = `elective${num}Subject` as keyof CalculatorGrades;
                  const gradeKey = `elective${num}Grade` as keyof CalculatorGrades;
                  
                  return (
                    <div key={num} className="border-2 border-blue-200 rounded-lg p-4 bg-white shadow-sm">
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
                                className="w-full justify-between font-normal h-11"
                                data-testid={`select-elective-${num}-subject`}
                              >
                                {grades[subjectKey] || "Select a subject"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="start">
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
                            <SelectTrigger className="w-full h-11">
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

        {/* Results Section */}
        {result && (
          <Card className="bg-green-50 border-green-200" data-testid="calculator-result">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CalculatorIcon className="h-5 w-5" />
                Your WASSCE Aggregate Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">{result.coreTotal}</div>
                  <div className="text-sm text-green-600">Core Subjects</div>
                  <div className="text-xs text-gray-500">(4 subjects)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">{result.electiveTotal}</div>
                  <div className="text-sm text-green-600">Best Electives</div>
                  <div className="text-xs text-gray-500">({result.bestElectivesUsed} subjects)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-900">{result.aggregate}</div>
                  <div className="text-sm text-green-600 font-medium">Total Aggregate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-800">
                    {result.aggregate <= 6 ? "Excellent" : 
                     result.aggregate <= 12 ? "Very Good" : 
                     result.aggregate <= 18 ? "Good" : 
                     result.aggregate <= 24 ? "Credit" : "Pass"}
                  </div>
                  <div className="text-sm text-blue-600">Performance</div>
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  <strong>How it's calculated:</strong> All 4 core subjects ({result.coreTotal} points) + 
                  your best {result.bestElectivesUsed} elective subjects ({result.electiveTotal} points) = 
                  <strong> {result.aggregate} aggregate</strong>. Lower scores are better!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {!result && (
          <Card className="bg-gray-50 border-gray-200" data-testid="calculator-instructions">
            <CardContent className="pt-6">
              <Alert>
                <AlertDescription>
                  <strong>Instructions:</strong> Fill in all 4 core subjects and at least 2 elective subjects 
                  to calculate your aggregate score. Your aggregate will be calculated using all core subjects 
                  plus your best 3 elective subjects.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}