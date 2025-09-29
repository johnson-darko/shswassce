// Use environment variable for Paystack key
const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Calculator as CalculatorIcon, ChevronUp, ChevronDown, GraduationCap, School, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTheme } from "@/context/ThemeContext"; // Adjust path if needed

import { checkEligibilityOffline } from '../lib/offline-eligibility-engine';
import { group1Explanations } from '../lib/eligibility/group1-eligibility';
import { customExplanations } from '../lib/eligibility/custom-eligibility';
import requirementsKnust from '../data/requirements-knust.json';
import { useLocation } from "wouter";

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

import type { EligibilityResult } from '@shared/schema';

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

export default function CalculatorPage() {
  // Listen for route changes to trigger re-render
  const [location] = useLocation();

  // Payment state (persisted in localStorage)
  const [hasPaid, setHasPaid] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasPaid') === 'true';
    }
    return false;
  });

  // Listen for payment status changes (in case localStorage changes in another tab)
  useEffect(() => {
    const checkPaid = () => setHasPaid(localStorage.getItem('hasPaid') === 'true');
    window.addEventListener('storage', checkPaid);
    return () => window.removeEventListener('storage', checkPaid);
  }, []);
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
  
  // Eligibility checking states
  const [eligibilityResults, setEligibilityResults] = useState<EligibilityResult[]>([]);
  const [showEligibility, setShowEligibility] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Program and university filter states
  const [programs, setPrograms] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [filteredResult, setFilteredResult] = useState<EligibilityResult | null>(null);
  const [alternatives, setAlternatives] = useState<EligibilityResult[]>([]);
  const [relatedPrograms, setRelatedPrograms] = useState<EligibilityResult[]>([]);
  const [otherQualifying, setOtherQualifying] = useState<EligibilityResult[]>([]);

  // Track saved program IDs
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // State to control visibility of the calculator section
  const [showCalculator, setShowCalculator] = useState(true);

  // Modal state for eligibility explanation
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [explanationText, setExplanationText] = useState('');
  const [requirementsSection, setRequirementsSection] = useState('');

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

  // Fetch all programs and universities for filter dropdowns
  useEffect(() => {
    async function fetchPrograms() {
      const allResults = await checkEligibilityOffline(grades); // grades from form
      setEligibilityResults(allResults);
      setPrograms([...new Set(allResults.map(r => r.programName))]);
      setUniversities([...new Set(allResults.map(r => r.universityName))]);
      setOtherQualifying(allResults.filter(r => r.status === 'eligible'));
    }
    fetchPrograms();
  }, [grades]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedPrograms') || '[]');
    setSavedIds(saved.map((p: EligibilityResult) => p.programId + '|' + p.universityName));
  }, [eligibilityResults]);

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

  // Function to check program eligibility
  const checkProgramEligibility = async () => {
    setIsCheckingEligibility(true);
    setShowEligibility(true);
    setShowCalculator(false); // Hide calculator section
    try {
      const { checkEligibilityOffline } = await import('@/lib/offline-eligibility-engine');
      // Support both UCC and KNUST key formats
      const mappedGrades = {
        // UCC keys
        'english language': grades.english,
        'mathematics': grades.mathematics,
        'integrated science': grades.science,
        'social studies': grades.social,
        // KNUST keys
        english: grades.english,
        mathematics: grades.mathematics,
        science: grades.science,
        social: grades.social,
        elective1Subject: grades.elective1Subject,
        elective1Grade: grades.elective1Grade,
        elective2Subject: grades.elective2Subject,
        elective2Grade: grades.elective2Grade,
        elective3Subject: grades.elective3Subject,
        elective3Grade: grades.elective3Grade,
        elective4Subject: grades.elective4Subject,
        elective4Grade: grades.elective4Grade,
      };
      const results = await checkEligibilityOffline(mappedGrades);
      setEligibilityResults(results);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'eligible':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'borderline':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'not_eligible':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'multiple_tracks':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'borderline':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'not_eligible':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'multiple_tracks':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const result = calculateAggregate();

  // Handler for filter
  function handleFilter() {
    if (selectedProgram && !selectedUniversity) {
      // Show all universities that offer the selected program
      const filtered = eligibilityResults.filter(r => r.programName === selectedProgram);
      setFilteredResult(filtered);
      setAlternatives([]);
      setRelatedPrograms([]);
      return;
    }
    let filtered = null;
    if (selectedProgram && selectedUniversity) {
      filtered = eligibilityResults.find(r =>
        r.programName === selectedProgram && r.universityName === selectedUniversity
      );
      if (!filtered) {
        setFilteredResult({
          programName: selectedProgram,
          universityName: selectedUniversity,
          status: 'not_offered',
          message: 'This university does not offer the selected program.',
          details: [],
          recommendations: [],
        } as any);
        setAlternatives(
          eligibilityResults.filter(r =>
            r.programName === selectedProgram && r.universityName !== selectedUniversity
          )
        );
        setRelatedPrograms([]);
        return;
      }
    } else if (selectedProgram) {
      filtered = eligibilityResults.find(r => r.programName === selectedProgram);
    }
    setFilteredResult(filtered);
    setAlternatives(
      eligibilityResults.filter(r =>
        r.programName === selectedProgram && (!selectedUniversity || r.universityName !== selectedUniversity) && r.status === 'eligible'
      )
    );
    setRelatedPrograms(
      eligibilityResults.filter(r =>
        (selectedUniversity ? r.universityName === selectedUniversity : true) &&
        r.status === 'eligible' &&
        r.programName !== selectedProgram &&
        r.faculty === filtered?.faculty
      )
    );
  }

  // Add save logic
  function saveProgram(program: EligibilityResult) {
    const saved = JSON.parse(localStorage.getItem('savedPrograms') || '[]');
    const id = program.programId + '|' + program.universityName;
    if (!saved.some((p: EligibilityResult) => p.programId === program.programId && p.universityName === program.universityName)) {
      saved.push(program);
      localStorage.setItem('savedPrograms', JSON.stringify(saved));
      setSavedIds(prev => [...prev, id]);
    }
  }

  // Handler to show explanation modal
  const handleShowExplanation = (programName: string, selectedResult?: EligibilityResult) => {
    // Helper to normalize names for matching
    function normalize(str: string) {
      return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }
    let reqObj = null;
    if (selectedResult) {
      reqObj = requirementsKnust.find((r: any) =>
        normalize(r.programName) === normalize(selectedResult.programName) &&
        normalize(r.universityName) === normalize(selectedResult.universityName)
      );
    }
    let reqSection = '';
    if (reqObj) {
      reqSection += 'Program Requirements:';
      if (reqObj.coreSubjects?.compulsory?.length) {
        reqSection += '\nCore Subjects: ' + reqObj.coreSubjects.compulsory.join(', ');
      }
      if (reqObj.electiveSubjects?.length) {
        reqSection += '\nElective Subjects:';
        reqObj.electiveSubjects.forEach((el: any) => {
            // Handle both 'groups' and 'subjects' for electives
            if (el.groups) {
              // If groups is an array of objects or strings
              if (Array.isArray(el.groups)) {
                const groupNames = el.groups.map((g: any) => typeof g === 'string' ? g : g.name).join(', ');
                reqSection += `\n- Any ${el.count} from groups: ${groupNames} (Min Grade ${el.min_grade || el.minGrade || ''})`;
              }
            } else if (el.group) {
              reqSection += `\n- ${el.group}: ${el.subjects.join(', ')} (Min ${el.minCount}, Grade ${el.minGrade || el.min_grade || ''})`;
            } else if (el.type === 'single') {
              reqSection += `\n- ${el.subject} (Min Grade ${el.min_grade})`;
            } else if (el.type === 'any') {
              reqSection += `\n- Any ${el.count} of: ${el.subjects.join(', ')} (Min Grade ${el.min_grade})`;
            }
        });
      }
      if (reqObj.aggregatePoints) {
        reqSection += `\nAggregate Points: ${reqObj.aggregatePoints}`;
      }
      if (reqObj.additionalRequirements) {
        reqSection += `\nAdditional: ${reqObj.additionalRequirements}`;
      }
    }
    setRequirementsSection(reqSection);
    // Try to match program name in a case-insensitive way
    const normalizedName = programName.trim().toUpperCase();
    const group1Key = Object.keys(group1Explanations).find(k => k.trim().toUpperCase() === normalizedName);
    const customKey = Object.keys(customExplanations).find(k => k.trim().toUpperCase() === normalizedName);
    let explanation = '';
    // Always filter out 'You meet all CORE requirements' and 'Aggregate:' from details
    const filterDetails = (details: string[]) => details.filter(d => !d.startsWith('You meet all CORE requirements') && !d.startsWith('Aggregate:'));
    if (group1Key) {
      explanation = group1Explanations[group1Key];
      if (selectedResult?.details?.length) {
        const filteredDetails = filterDetails(selectedResult.details);
        if (filteredDetails.length > 0) {
          explanation += '\n\nDetails:';
          explanation += '\n' + filteredDetails.join('\n');
        }
      }
    } else if (customKey) {
      explanation = customExplanations[customKey];
      if (selectedResult?.details?.length) {
        const filteredDetails = filterDetails(selectedResult.details);
        if (filteredDetails.length > 0) {
          explanation += '\n\nDetails:';
          explanation += '\n' + filteredDetails.join('\n');
        }
      }
    } else if (selectedResult?.details?.length) {
      const filteredDetails = filterDetails(selectedResult.details);
      explanation = 'Program Eligibility Explained';
      if (filteredDetails.length > 0) {
        explanation += '\n\nDetails:';
        explanation += '\n' + filteredDetails.join('\n');
      }
    } else {
      explanation = 'Program Eligibility Explained\nNo detailed explanation available.';
    }
    setExplanationText(explanation);
    setExplanationModalOpen(true);
  };

  const { theme } = useTheme();
  return (
  <div className={"container mx-auto px-4 py-8 min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-500 w-full"} style={{background: theme === 'dark' ? '#111827' : undefined}} data-testid="calculator">
  <div className="max-w-4xl mx-auto text-gray-900 dark:text-gray-100">
        {showCalculator && (
          <>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CalculatorIcon className="h-8 w-8 text-scorecard-blue dark:text-blue-200" />
                <h1 className="text-base font-bold text-scorecard-blue dark:text-blue-200">WASSCE Aggregate Calculator</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs">
                Calculate your aggregate score based on your WASSCE grades. 
                Your aggregate is calculated using all 4 core subjects + your best 3 elective subjects.
              </p>
            </div>
            <Card className={`w-full rounded-xl shadow-lg border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-blue-900 dark:via-purple-900 dark:to-gray-800 text-scorecard-blue dark:text-blue-100 flex flex-col mb-6`} data-testid="calculator-input">
              <CardHeader>
                <CardTitle className="text-center text-scorecard-blue text-base" style={theme === 'dark' ? { color: 'rgb(62,83,127)' } : {}}>Enter Your WASSCE Grades</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center" style={theme === 'dark' ? { color: 'rgb(200,210,255)' } : {}}>
                {/* Core Subjects */}
                <div className="mb-8" data-testid="core-subjects">
                  <h3 className="font-semibold text-scorecard-blue dark:text-blue-100 mb-4">Core Subjects (All Required)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subjects.core.map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
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
                      const datalistId = `elective-subjects-list-${num}`;
                      return (
                        <div key={num} className="border-2 border-blue-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-700 dark:text-gray-200 italic">Elective Subject {num}</h4>
                            <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded uppercase font-medium">
                              ELECTIVE
                            </span>
                          </div>
                          <div className="space-y-3">
                            {/* Subject Selection - HTML Searchable Input with Datalist */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select a subject</label>
                              <input
                                type="search"
                                className="w-full h-11 border rounded px-2"
                                list={datalistId}
                                value={grades[subjectKey] || ""}
                                onChange={e => handleElectiveChange(num, 'Subject', e.target.value)}
                                data-testid={`select-elective-${num}-subject`}
                                placeholder="Type or select a subject"
                                autoComplete="off"
                              />
                              <datalist id={datalistId}>
                                {getAvailableSubjects(num).map(subject => (
                                  <option key={subject} value={subject} />
                                ))}
                              </datalist>
                            </div>
                            {/* Grade Selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Grade</label>
                              <select
                                className="w-full h-11 border rounded px-2"
                                value={grades[gradeKey] || ""} 
                                onChange={e => handleElectiveChange(num, 'Grade', e.target.value)}
                                data-testid={`select-elective-${num}-grade`}
                                disabled={!grades[subjectKey]}
                              >
                                <option value="">Select Grade</option>
                                {gradeOptions.map(grade => (
                                  <option key={grade} value={grade}>{grade}</option>
                                ))}
                              </select>
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
                        <div className="text-sm text-slate-300 dark:text-slate-200 mb-1">Best Score</div>
                        <h2 className="text-2xl font-bold mb-4">Your Best Aggregate Score</h2>
                        <div className="mb-4">
                          <div className="text-sm text-slate-300 dark:text-slate-200 mb-2">Subjects:</div>
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
                  <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-2">Alternative Combinations</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">These are other valid subject combinations and their aggregate scores:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.alternatives.map((alt, index) => (
                      <Card key={index} className="border-slate-200" data-testid={`alternative-${index + 1}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-100">{alt.name}</h3>
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

                {/* Check All Program Eligibility Button */}
                <div className="text-center mt-8">
                  {!hasPaid ? (
                    <Button
                      onClick={() => {
                        // Ask user for email
                        const email = window.prompt('Enter your email address for payment receipt:');
                        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                          alert('Please enter a valid email address to receive the payment receipt.');
                          return;
                        }
                        // Paystack integration
                        const paystack = (window as any).PaystackPop && (window as any).PaystackPop.setup ? (window as any).PaystackPop : null;
                        if (paystack) {
                          paystack.setup({
                            key: paystackKey,
                            email,
                            amount: 500, // Amount in pesewas (5 cedis = 500 pesewas)
                            currency: 'GHS', // Ghana Cedis
                            callback: function(response: any) {
                              setHasPaid(true);
                              localStorage.setItem('hasPaid', 'true');
                            },
                            onClose: function() {
                              // Optionally handle close
                            }
                          }).openIframe();
                        } else {
                          alert('Paystack is not loaded. Please check your internet connection.');
                        }
                      }}
                      size="lg"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white px-8 py-3 mb-8 shadow-lg rounded-full font-bold text-lg"
                      data-testid="pay-btn"
                    >
                      <span className="inline-flex items-center">
                        <svg className="h-5 w-5 mr-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V7a2 2 0 012-2h12a2 2 0 012 2v7c0 2.21-3.582 4-8 4z" /></svg>
                        Pay to Unlock Eligibility
                      </span>
                    </Button>
                  ) : (
                    <>
                      <div className="mb-4 flex justify-center">
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold text-base">
                          <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Payment Completed
                        </span>
                      </div>
                      <Button 
                        onClick={checkProgramEligibility}
                        disabled={!result || isCheckingEligibility}
                        size="lg"
                        className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 mb-[4rem]"
                        data-testid="check-eligibility-btn"
                      >
                        {isCheckingEligibility ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Checking Eligibility...
                          </>
                        ) : (
                          <>
                            <GraduationCap className="h-5 w-5 mr-2" />
                            Check All Program Eligibility
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Program Eligibility Results */}
        {showEligibility && (
          <div className="mt-8">
            <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-700">Program Eligibility Results</h2>
                {/* Hide Calculator button removed */}
              </div>

              <CollapsibleContent className="space-y-4">
                {/* This will collapse the calculator and alternatives sections */}
              </CollapsibleContent>

              {/* Always visible eligibility results */}
              {isCheckingEligibility ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mr-3" />
                  <span className="text-lg text-slate-600">Checking your eligibility...</span>
                </div>
              ) : eligibilityResults.length > 0 ? (
                <div className="space-y-6">
                  {/* Eligible Programs */}
                  {eligibilityResults.filter(r => r.status === 'eligible' || r.status === 'multiple_tracks').length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Programs You Qualify For ({eligibilityResults.filter(r => r.status === 'eligible' || r.status === 'multiple_tracks').length})
                      </h3>
                      <p>Read any additional requirements</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eligibilityResults
                          .filter(r => r.status === 'eligible' || r.status === 'multiple_tracks')
                          .map((result, index) => (
                            <Card key={index} className="border-green-200 bg-green-50" data-testid={`eligible-program-${index}`}> 
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-green-800">{result.programName}</h4>
                                    <p className="text-sm text-green-600">{result.universityName}</p>
                                    {result.level && (
                                      <Badge variant="secondary" className="mt-1 text-xs">
                                        {result.level}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {getStatusIcon(result.status)}
                                    <Button
                                      size="sm"
                                      variant={savedIds.includes(result.programId + '|' + result.universityName) ? 'default' : 'outline'}
                                      className={savedIds.includes(result.programId + '|' + result.universityName) ? 'bg-green-600 text-white' : ''}
                                      onClick={() => saveProgram(result)}
                                      disabled={savedIds.includes(result.programId + '|' + result.universityName)}
                                    >
                                      {savedIds.includes(result.programId + '|' + result.universityName) ? 'Saved' : 'Save'}
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-sm text-green-700">{result.message}</p>
                                  {/* Question icon for explanation */}
                                  <Button size="icon" variant="ghost" onClick={() => handleShowExplanation(result.programName, result)}>
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                  </Button>
                                </div>
                                {/* ...existing code for details/careerOutcomes... */}
                                {result.details.length > 0 && (
                                  <div className="text-xs text-green-600">
                                    <ul className="list-disc list-inside space-y-1">
                                      {result.details.map((detail, idx) => (
                                        <li key={idx}>{detail}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.careerOutcomes && result.careerOutcomes.length > 0 && (
                                  <div className="mt-2 text-xs text-green-700">
                                    <strong>Career Outcomes:</strong>
                                    <ul className="list-disc list-inside space-y-1">
                                      {result.careerOutcomes.map((career, idx) => (
                                        <li key={idx}>{career}</li>
                                      ))}
                                    </ul>
                                    And Many More...
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Borderline Programs */}
                  {eligibilityResults.filter(r => r.status === 'borderline').length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-orange-700 mb-4 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Close Matches - Consider Applying ({eligibilityResults.filter(r => r.status === 'borderline').length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eligibilityResults
                          .filter(r => r.status === 'borderline')
                          .map((result, index) => (
                            <Card key={index} className="border-orange-200 bg-orange-50" data-testid={`borderline-program-${index}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-orange-800">{result.programName}</h4>
                                    <p className="text-sm text-orange-600">{result.universityName}</p>
                                    {result.level && (
                                      <Badge variant="secondary" className="mt-1 text-xs">
                                        {result.level}
                                      </Badge>
                                    )}
                                  </div>
                                  {getStatusIcon(result.status)}
                                </div>
                                <p className="text-sm text-orange-700 mb-2">{result.message}</p>
                                {result.details && result.details.length > 0 && (
                                  <div className="text-xs text-orange-700 mb-2">
                                    <strong>Why you're close, and what you need for full eligibility:</strong>
                                    <ul className="list-disc list-inside space-y-1 mt-1">
                                      {result.details.map((detail, idx) => (
                                        <li key={idx}>{detail}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {result.recommendations && result.recommendations.length > 0 && (
                                  <div className="text-xs text-orange-600">
                                    <strong>Recommendations:</strong>
                                    <ul className="list-disc list-inside space-y-1 mt-1">
                                      {result.recommendations.map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Not Eligible Programs */}
                  {eligibilityResults.filter(r => r.status === 'not_eligible').length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center">
                        <XCircle className="h-5 w-5 mr-2" />
                        Programs Not Currently Available ({eligibilityResults.filter(r => r.status === 'not_eligible').length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eligibilityResults
                          .filter(r => r.status === 'not_eligible')
                          .slice(0, 6) // Show only first 6 not eligible
                          .map((result, index) => (
                            <Card key={index} className="border-red-200 bg-red-50" data-testid={`not-eligible-program-${index}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-red-800">{result.programName}</h4>
                                    <p className="text-sm text-red-600">{result.universityName}</p>
                                  </div>
                                  {getStatusIcon(result.status)}
                                </div>
                                <p className="text-sm text-red-700 mb-2">{result.message}</p>
                                {result.recommendations && result.recommendations.length > 0 && (
                                  <div className="text-xs text-red-600">
                                    <strong>To qualify:</strong>
                                    <ul className="list-disc list-inside space-y-1 mt-1">
                                      {result.recommendations.slice(0, 2).map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No eligibility results to display. Click "Check Program Eligibility" to get started.</p>
                </div>
              )}
            </Collapsible>
          </div>
        )}

        {/* Step 1: Broad eligibility summary */}
        {/*
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-700 mb-4">Broad Eligibility Results</h2>
          <ul className="space-y-2">
            {eligibilityResults.slice(0, 5).map(r => (
              <li key={r.programId} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-gray-800">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{r.programName}</div>
                  <div className="text-xs text-slate-500">{r.universityName}</div>
                </div>
                <div className="text-sm">
                  {r.status === 'eligible' ? (
                    <span className="text-green-600 font-semibold">✅ Eligible</span>
                  ) : r.status === 'borderline' ? (
                    <span className="text-orange-600 font-semibold">⚠️ Borderline</span>
                  ) : (
                    <span className="text-red-600 font-semibold">❌ Not Eligible</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        */}

        {/* Step 2: Check Specific Program (hidden until after eligibility is checked) */}
        {showEligibility && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Check Specific Program</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Searchable Program Combobox */}
              <Popover open={openPopovers[100] || false} onOpenChange={open => setOpenPopovers(prev => ({ ...prev, 100: open }))}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPopovers[100] || false}
                    className="w-full justify-between font-normal h-11"
                  >
                    {selectedProgram || "Select a program"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search programs..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No program found.</CommandEmpty>
                      <CommandGroup>
                        {programs.map((program) => (
                          <CommandItem
                            key={program}
                            value={program}
                            onSelect={() => {
                              setSelectedProgram(program);
                              setSelectedUniversity('');
                              setOpenPopovers(prev => ({ ...prev, 100: false }));
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedProgram === program ? "opacity-100" : "opacity-0")} />
                            {program}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {/* Searchable University Combobox */}
              <Popover open={openPopovers[200] || false} onOpenChange={open => setOpenPopovers(prev => ({ ...prev, 200: open }))}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPopovers[200] || false}
                    className="w-full justify-between font-normal h-11"
                  >
                    {selectedUniversity || "Select a university"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search universities..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No university found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          key="all-universities"
                          value="Select All Universities"
                          onSelect={() => {
                            setSelectedUniversity('');
                            setOpenPopovers(prev => ({ ...prev, 200: false }));
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedUniversity === '' ? "opacity-100" : "opacity-0")} />
                          Select All Universities
                        </CommandItem>
                        {universities.map((university) => (
                          <CommandItem
                            key={university}
                            value={university}
                            onSelect={() => {
                              setSelectedUniversity(university);
                              setOpenPopovers(prev => ({ ...prev, 200: false }));
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedUniversity === university ? "opacity-100" : "opacity-0")} />
                            {university}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleFilter}
                disabled={!selectedProgram}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              >
                Check
              </Button>
            </div>
            {Array.isArray(filteredResult) ? (
              <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-gray-800 border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-slate-700">{selectedProgram} - Universities Offering This Program</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
                  {filteredResult.map((res: EligibilityResult, i: number) => (
                    <li key={i}>
                      <span className="font-semibold">{res.universityName}</span>: {res.status === 'eligible' ? '✅ Eligible' : res.status === 'borderline' ? '⚠️ Borderline' : '❌ Not Eligible'}
                      <ul className="ml-4 list-disc">
                        {res.details?.map((d, idx) => <li key={idx}>{d}</li>)}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ) : filteredResult && (
              <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-gray-800 border dark:border-gray-700">
                <h3 className="text-lg font-semibold text-slate-700">{filteredResult.programName} at {filteredResult.universityName}</h3>
                <div className="text-sm text-slate-500 mb-2">
                  {filteredResult.status === 'eligible' ? '✅ Eligible' : '❌ This university does not offer the selected program.'}
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                  {filteredResult.details?.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {filteredResult && filteredResult.status === 'not_offered' && (
              <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-300">
                <div className="mb-2 text-sm text-yellow-700">Other universities that offer this program:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {alternatives.map(a => (
                    <li key={a.programId}>
                      {a.programName} at {a.universityName}: {a.status === 'eligible' ? '✅ Eligible' : a.status === 'borderline' ? '⚠️ Borderline' : '❌ Not Eligible'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Alternatives if not eligible */}
        {filteredResult && filteredResult.status !== 'eligible' && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-700 mb-2">Alternatives</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Same program at other universities:</strong>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                  {alternatives.map(a => <li key={a.programId}>{a.programName} at {a.universityName}</li>)}
                </ul>
              </div>
              <div>
                <strong>Related programs in same faculty:</strong>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                  {relatedPrograms.map(r => <li key={r.programId}>{r.programName} at {r.universityName}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Bonus Discovery */}
         {/*
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-4">You also qualify for these other programs</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            {otherQualifying.filter(r => r.programName !== selectedProgram).slice(0, 5).map(r => (
              <li key={r.programId}>{r.programName} at {r.universityName}</li>
            ))}
          </ul>
        </div>
        */}

        {!result && (
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" data-testid="calculator-instructions">
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

        {/* Modal for explanation */}
        <Dialog open={explanationModalOpen} onOpenChange={setExplanationModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Program Eligibility Explained</DialogTitle>
            </DialogHeader>
            {requirementsSection && (
              <div className="text-sm text-blue-900 bg-blue-50 rounded p-3 mb-3 whitespace-pre-line">
                {requirementsSection}
              </div>
            )}
            <div className="text-base text-gray-700 py-2">{explanationText}</div>
            <Button onClick={() => setExplanationModalOpen(false)} className="mt-4">Close</Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}