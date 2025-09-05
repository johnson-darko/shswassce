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
    const coreGradesData = [
      { subject: 'English Language', grade: grades.english },
      { subject: 'Mathematics', grade: grades.mathematics },
      { subject: 'Integrated Science', grade: grades.science },
      { subject: 'Social Studies', grade: grades.social }
    ].filter(item => item.grade !== '');

    const electiveGradesData = [
      { subject: grades.elective1Subject, grade: grades.elective1Grade },
      { subject: grades.elective2Subject, grade: grades.elective2Grade },
      { subject: grades.elective3Subject, grade: grades.elective3Grade },
      { subject: grades.elective4Subject, grade: grades.elective4Grade }
    ].filter(item => item.grade !== '' && item.subject !== '');

    // Check if we have at least 3 core and 3 elective subjects
    if (coreGradesData.length < 3 || electiveGradesData.length < 3) {
      return null;
    }

    // Filter subjects with C6 or better (grades 1-6)
    const validCoreGrades = coreGradesData.filter(item => gradeValues[item.grade] <= 6);
    const validElectiveGrades = electiveGradesData.filter(item => gradeValues[item.grade] <= 6);

    if (validCoreGrades.length < 3 || validElectiveGrades.length < 3) {
      return null;
    }

    // English and Mathematics (Core) are mandatory - always include them
    const englishCore = validCoreGrades.find(item => item.subject === 'English Language');
    const mathCore = validCoreGrades.find(item => item.subject === 'Mathematics');
    
    if (!englishCore || !mathCore) {
      return null; // Must have both English and Math
    }

    // Sort remaining core subjects (Science and Social Studies) by grade
    const otherCoreSubjects = validCoreGrades.filter(
      item => item.subject !== 'English Language' && item.subject !== 'Mathematics'
    ).sort((a, b) => gradeValues[a.grade] - gradeValues[b.grade]);

    // Best core: English + Math + best of remaining core subjects
    const bestCore = [englishCore, mathCore, ...otherCoreSubjects.slice(0, 1)];
    
    // Sort electives by grade value (lower is better)
    const sortedElectives = validElectiveGrades.sort((a, b) => gradeValues[a.grade] - gradeValues[b.grade]);
    const bestElectives = sortedElectives.slice(0, 3);

    const coreTotal = bestCore.reduce((sum, item) => sum + gradeValues[item.grade], 0);
    const electiveTotal = bestElectives.reduce((sum, item) => sum + gradeValues[item.grade], 0);

    // Calculate alternative combinations
    const alternatives = calculateAlternativeCombinations(validCoreGrades, validElectiveGrades, bestCore, bestElectives);

    return {
      bestCore,
      bestElectives,
      coreTotal,
      electiveTotal,
      aggregate: coreTotal + electiveTotal,
      alternatives,
      totalSubjects: 6
    };
  };

  const calculateAlternativeCombinations = (
    validCore: Array<{subject: string, grade: string}>, 
    validElectives: Array<{subject: string, grade: string}>,
    bestCore: Array<{subject: string, grade: string}>,
    bestElectives: Array<{subject: string, grade: string}>
  ) => {
    const alternatives: Array<{
      name: string,
      core: Array<{subject: string, grade: string}>,
      electives: Array<{subject: string, grade: string}>,
      aggregate: number
    }> = [];

    // English and Math are always required
    const englishCore = validCore.find(item => item.subject === 'English Language')!;
    const mathCore = validCore.find(item => item.subject === 'Mathematics')!;
    
    // Get other core subjects (Science and Social Studies)
    const otherCoreSubjects = validCore.filter(
      item => item.subject !== 'English Language' && item.subject !== 'Mathematics'
    );

    // Generate all combinations of electives (3 out of available)
    const getCombinations = (arr: Array<{subject: string, grade: string}>, size: number): Array<Array<{subject: string, grade: string}>> => {
      if (size === 1) return arr.map(el => [el]);
      return arr.flatMap((el, i) => 
        getCombinations(arr.slice(i + 1), size - 1).map(combo => [el, ...combo])
      );
    };

    const electiveCombinations = getCombinations(validElectives, 3);

    let altCount = 1;
    
    // Generate ALL possible combinations:
    // 1. English + Math + Science + different elective combinations  
    // 2. English + Math + Social Studies + different elective combinations
    
    for (const thirdCore of otherCoreSubjects) {
      const coreCombo = [englishCore, mathCore, thirdCore];
      
      for (const electiveCombo of electiveCombinations) {
        const coreTotal = coreCombo.reduce((sum, item) => sum + gradeValues[item.grade], 0);
        const electiveTotal = electiveCombo.reduce((sum, item) => sum + gradeValues[item.grade], 0);
        const aggregate = coreTotal + electiveTotal;

        // Skip the best combination (already shown)
        const coreSubjects = coreCombo.map(c => c.subject).sort().join(',');
        const electiveSubjects = electiveCombo.map(e => e.subject).sort().join(',');
        const bestCoreSubjects = bestCore.map(c => c.subject).sort().join(',');
        const bestElectiveSubjects = bestElectives.map(e => e.subject).sort().join(',');
        
        const isBestCombo = coreSubjects === bestCoreSubjects && electiveSubjects === bestElectiveSubjects;
        
        if (!isBestCombo) {
          alternatives.push({
            name: `Alternative ${altCount}`,
            core: coreCombo,
            electives: electiveCombo,
            aggregate
          });
          altCount++;
        }
      }
    }

    return alternatives.sort((a, b) => a.aggregate - b.aggregate);
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

        {/* Best Score Results Section */}
        {result && (
          <>
            <Card className="bg-slate-700 text-white mb-6" data-testid="calculator-result">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Best Score</div>
                    <h2 className="text-2xl font-bold mb-4">Your Best Aggregate Score</h2>
                    <div className="mb-4">
                      <div className="text-sm text-slate-300 mb-2">Subjects:</div>
                      <div className="flex flex-wrap gap-2">
                        {result.bestCore.map((item, index) => (
                          <span key={index} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                            {item.subject} (Core)
                          </span>
                        ))}
                        {result.bestElectives.map((item, index) => (
                          <span key={index} className="bg-teal-600 px-3 py-1 rounded-full text-sm">
                            {item.subject} (Elective)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold">{result.aggregate}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Combinations Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Alternative Combinations</h2>
              <p className="text-gray-600 mb-6">These are other valid subject combinations and their aggregate scores:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.alternatives.map((alt, index) => (
                  <Card key={index} className="border-slate-200" data-testid={`alternative-${index + 1}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-700">{alt.name}</h3>
                        <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
                          {alt.aggregate}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="text-xs text-gray-600 mb-1">Subjects:</div>
                        <div className="space-y-1">
                          {alt.core.map((item, idx) => (
                            <div key={idx} className="text-sm text-blue-700 font-medium">
                              {item.subject} (Core)
                            </div>
                          ))}
                          {alt.electives.map((item, idx) => (
                            <div key={idx} className="text-sm text-teal-700 font-medium">
                              {item.subject} (Elective)
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {!result && (
          <Card className="bg-gray-50 border-gray-200" data-testid="calculator-instructions">
            <CardContent className="pt-6">
              <Alert>
                <AlertDescription>
                  <strong>Instructions:</strong> Fill in your grades for core and elective subjects 
                  to calculate your WASSCE aggregate score. Your aggregate will be calculated using your 
                  best 3 core subjects + best 3 elective subjects (6 subjects total). Only subjects with grades C6 or better will be considered.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}