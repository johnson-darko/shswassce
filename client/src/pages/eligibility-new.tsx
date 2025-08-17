import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Filter,
  Edit,
  BookOpen,
  GraduationCap,
  MapPin,
  Clock,
  Award,
  Heart,
  Download,
  Share,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star
} from "lucide-react";
import { wassceeGradesSchema, type WassceeGrades, type EligibilityResult, type ProgramWithDetails } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const gradeOptions = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const gradeFormSchema = wassceeGradesSchema.extend({});
type GradeFormData = z.infer<typeof gradeFormSchema>;

export default function EnhancedEligibilityPage() {
  const [step, setStep] = useState<'grades' | 'programs' | 'results'>('grades');
  const [savedGrades, setSavedGrades] = useState<WassceeGrades | null>(null);
  const [selectedPrograms, setSelectedPrograms] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [sortBy, setSortBy] = useState('best_match');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load user preferences
  const { data: userPreferences } = useQuery({
    queryKey: ['/api/user/preferences'],
    queryFn: async () => {
      const response = await fetch('/api/user/preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    },
  });

  // Load saved grades from preferences
  useEffect(() => {
    if (userPreferences?.grades) {
      setSavedGrades(userPreferences.grades);
      setStep('programs');
    }
    if (userPreferences?.favoritePrograms) {
      setFavorites(new Set(userPreferences.favoritePrograms));
    }
  }, [userPreferences]);

  // Grade input form
  const gradeForm = useForm<GradeFormData>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: savedGrades || {}
  });

  // Search programs
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['/api/programs/search', { 
      query: searchQuery, 
      level: levelFilter, 
      region: regionFilter, 
      type: typeFilter, 
      field: fieldFilter 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (levelFilter) params.append('level', levelFilter);
      if (regionFilter) params.append('region', regionFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (fieldFilter) params.append('field', fieldFilter);
      
      const response = await fetch(`/api/programs/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch programs');
      return response.json() as Promise<ProgramWithDetails[]>;
    },
    enabled: step === 'programs'
  });

  // Save grades mutation
  const saveGradesMutation = useMutation({
    mutationFn: async (grades: WassceeGrades) => {
      return apiRequest('/api/user/preferences', 'POST', { grades });
    },
    onSuccess: () => {
      setSavedGrades(gradeForm.getValues());
      setStep('programs');
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
    }
  });

  // Check eligibility mutation
  const eligibilityMutation = useMutation({
    mutationFn: async ({ grades, programIds }: { grades: WassceeGrades; programIds: string[] }) => {
      const response = await apiRequest('/api/check-program-eligibility', 'POST', { grades, programIds });
      return response as EligibilityResult[];
    },
    onSuccess: () => {
      setStep('results');
    }
  });

  // Save favorites mutation
  const saveFavoritesMutation = useMutation({
    mutationFn: async (favoritePrograms: string[]) => {
      return apiRequest('/api/user/preferences', 'POST', { 
        favoritePrograms,
        grades: savedGrades 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
    }
  });

  const handleGradeSubmit = (data: GradeFormData) => {
    saveGradesMutation.mutate(data);
  };

  const handleProgramToggle = (programId: string) => {
    const newSelected = new Set(selectedPrograms);
    if (newSelected.has(programId)) {
      newSelected.delete(programId);
    } else {
      newSelected.add(programId);
    }
    setSelectedPrograms(newSelected);
  };

  const handleFavoriteToggle = (programId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(programId)) {
      newFavorites.delete(programId);
    } else {
      newFavorites.add(programId);
    }
    setFavorites(newFavorites);
    saveFavoritesMutation.mutate(Array.from(newFavorites));
  };

  const handleCheckEligibility = () => {
    if (savedGrades && selectedPrograms.size > 0) {
      eligibilityMutation.mutate({
        grades: savedGrades,
        programIds: Array.from(selectedPrograms)
      });
    }
  };

  const handleEditGrades = () => {
    setStep('grades');
  };

  const filteredPrograms = programs.filter(program => {
    if (showFavorites && !favorites.has(program.id)) return false;
    return true;
  });

  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    switch (sortBy) {
      case 'best_match':
        // TODO: Implement best match scoring based on saved grades
        return a.name.localeCompare(b.name);
      case 'deadline':
        return (a.applicationDeadline || '').localeCompare(b.applicationDeadline || '');
      case 'cost_asc':
        return (a.tuitionLocal || 0) - (b.tuitionLocal || 0);
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getStatusIcon = (status: EligibilityResult['status']) => {
    switch (status) {
      case 'eligible':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'borderline':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'not_eligible':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: EligibilityResult['status']) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-100 text-green-800';
      case 'borderline':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_eligible':
        return 'bg-red-100 text-red-800';
    }
  };

  if (step === 'grades') {
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
                      {[
                        { key: 'english', label: 'English Language' },
                        { key: 'mathematics', label: 'Mathematics (Core)' },
                        { key: 'science', label: 'Integrated Science' },
                        { key: 'social', label: 'Social Studies' }
                      ].map(({ key, label }) => (
                        <FormField
                          key={key}
                          control={gradeForm.control}
                          name={key as keyof GradeFormData}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-scorecard-gray">{label}</FormLabel>
                              <FormControl>
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                  <SelectTrigger data-testid={`select-${key}`}>
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
                      ))}
                    </div>
                  </div>

                  {/* Elective Subjects */}
                  <div>
                    <h3 className="text-lg font-semibold text-scorecard-blue mb-4">Elective Subjects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'electiveMath', label: 'Elective Mathematics' },
                        { key: 'physics', label: 'Physics' },
                        { key: 'chemistry', label: 'Chemistry' },
                        { key: 'biology', label: 'Biology' },
                        { key: 'economics', label: 'Economics' },
                        { key: 'government', label: 'Government' },
                        { key: 'literature', label: 'Literature in English' },
                        { key: 'geography', label: 'Geography' }
                      ].map(({ key, label }) => (
                        <FormField
                          key={key}
                          control={gradeForm.control}
                          name={key as keyof GradeFormData}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-scorecard-gray">{label}</FormLabel>
                              <FormControl>
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                  <SelectTrigger data-testid={`select-${key}`}>
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
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      className="bg-scorecard-blue hover:bg-blue-900 text-white px-8 py-3 text-lg"
                      disabled={saveGradesMutation.isPending}
                      data-testid="button-save-grades"
                    >
                      {saveGradesMutation.isPending ? 'Saving...' : 'Save Grades & Continue'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'programs') {
    return (
      <div className="min-h-screen bg-scorecard-bg py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header with grades summary */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-scorecard-blue mb-2">
                Select Programs to Check
              </h1>
              <p className="text-scorecard-gray">
                Choose the programs you're interested in for eligibility checking
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleEditGrades}
              className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
              data-testid="button-edit-grades"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Grades
            </Button>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-scorecard-gray mb-2">
                    Search Programs
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by program name..."
                      className="pl-10"
                      data-testid="input-search-programs"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-scorecard-gray mb-2">Level</label>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger data-testid="select-level-filter">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                        <SelectItem value="Master's">Master's</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-scorecard-gray mb-2">Region</label>
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger data-testid="select-region-filter">
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Regions</SelectItem>
                        <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                        <SelectItem value="Ashanti">Ashanti</SelectItem>
                        <SelectItem value="Central">Central</SelectItem>
                        <SelectItem value="Eastern">Eastern</SelectItem>
                        <SelectItem value="Northern">Northern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-scorecard-gray mb-2">Institution Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger data-testid="select-type-filter">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="Public">Public</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-scorecard-gray mb-2">Field</label>
                    <Select value={fieldFilter} onValueChange={setFieldFilter}>
                      <SelectTrigger data-testid="select-field-filter">
                        <SelectValue placeholder="All Fields" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Fields</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-scorecard-gray mb-2">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger data-testid="select-sort-by">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="best_match">Best Match</SelectItem>
                        <SelectItem value="deadline">Application Deadline</SelectItem>
                        <SelectItem value="cost_asc">Cost (Low to High)</SelectItem>
                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="favorites"
                    checked={showFavorites}
                    onCheckedChange={(checked) => setShowFavorites(checked as boolean)}
                    data-testid="checkbox-show-favorites"
                  />
                  <label htmlFor="favorites" className="text-sm font-medium text-scorecard-gray">
                    Show only favorites
                  </label>
                </div>
                
                <Badge variant="outline" className="ml-auto">
                  {selectedPrograms.size} selected
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Programs Grid */}
          {programsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-scorecard-blue mb-2" data-testid={`program-name-${program.id}`}>
                          {program.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-scorecard-gray mb-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>{program.level}</span>
                          {program.duration && (
                            <>
                              <Clock className="h-4 w-4 ml-2" />
                              <span>{program.duration} months</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-scorecard-gray mb-3">
                          <MapPin className="h-4 w-4" />
                          <span>{program.universityName}</span>
                          <Badge className="bg-gray-100 text-gray-700 ml-auto">
                            {program.universityType}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFavoriteToggle(program.id)}
                        className="p-1"
                        data-testid={`button-favorite-${program.id}`}
                      >
                        <Heart 
                          className={`h-5 w-5 ${favorites.has(program.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-400 hover:text-red-500'
                          }`} 
                        />
                      </Button>
                    </div>

                    {program.description && (
                      <p className="text-sm text-scorecard-gray mb-4 line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {program.applicationDeadline && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-600 font-medium">
                            Deadline: {new Date(program.applicationDeadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {program.tuitionLocal && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-600 font-medium">
                            ₵{program.tuitionLocal.toLocaleString()} / year
                          </span>
                        </div>
                      )}
                      
                      {program.careerOutcomes && program.careerOutcomes.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span className="text-purple-600">
                            {program.careerOutcomes.slice(0, 2).join(', ')}
                            {program.careerOutcomes.length > 2 && '...'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`program-${program.id}`}
                          checked={selectedPrograms.has(program.id)}
                          onCheckedChange={() => handleProgramToggle(program.id)}
                          data-testid={`checkbox-program-${program.id}`}
                        />
                        <label htmlFor={`program-${program.id}`} className="text-sm font-medium">
                          Select for eligibility check
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Check Eligibility Button */}
          {selectedPrograms.size > 0 && (
            <div className="fixed bottom-6 right-6">
              <Button
                onClick={handleCheckEligibility}
                className="bg-scorecard-blue hover:bg-blue-900 text-white px-8 py-4 text-lg shadow-lg"
                disabled={eligibilityMutation.isPending}
                data-testid="button-check-eligibility"
              >
                {eligibilityMutation.isPending 
                  ? 'Checking...' 
                  : `Check Eligibility (${selectedPrograms.size})`
                }
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'results' && eligibilityMutation.data) {
    return (
      <div className="min-h-screen bg-scorecard-bg py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-scorecard-blue mb-2">
                Eligibility Results
              </h1>
              <p className="text-scorecard-gray">
                Your eligibility status for {eligibilityMutation.data.length} selected programs
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('programs')}
                className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                data-testid="button-back-programs"
              >
                Back to Programs
              </Button>
              <Button
                variant="outline"
                onClick={handleEditGrades}
                className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                data-testid="button-edit-grades-results"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Grades
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {eligibilityMutation.data.filter(r => r.status === 'eligible').length}
                  </div>
                  <div className="text-sm text-scorecard-gray">Fully Eligible</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {eligibilityMutation.data.filter(r => r.status === 'borderline').length}
                  </div>
                  <div className="text-sm text-scorecard-gray">Borderline</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">
                    {eligibilityMutation.data.filter(r => r.status === 'not_eligible').length}
                  </div>
                  <div className="text-sm text-scorecard-gray">Not Eligible</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results List */}
          <div className="space-y-4">
            {eligibilityMutation.data.map((result) => (
              <Card key={result.programId} className={`border-l-4 ${
                result.status === 'eligible' ? 'border-l-green-500' :
                result.status === 'borderline' ? 'border-l-yellow-500' :
                'border-l-red-500'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(result.status)}
                        <h3 className="text-xl font-bold text-scorecard-blue" data-testid={`result-program-${result.programId}`}>
                          {result.programName}
                        </h3>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-scorecard-gray font-medium">{result.universityName}</p>
                      <p className="text-sm text-scorecard-gray mt-1">{result.message}</p>
                    </div>
                  </div>

                  <Tabs defaultValue="details" className="w-full">
                    <TabsList>
                      <TabsTrigger value="details">Requirements Details</TabsTrigger>
                      {result.recommendations && (
                        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="details" className="mt-4">
                      <div className="space-y-2">
                        {result.details.map((detail, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    {result.recommendations && (
                      <TabsContent value="recommendations" className="mt-4">
                        <div className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                              <span>💡 {rec}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
              data-testid="button-export-results"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
            <Button
              variant="outline"
              className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
              data-testid="button-share-results"
            >
              <Share className="mr-2 h-4 w-4" />
              Share Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}