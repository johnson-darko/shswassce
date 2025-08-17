import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { University, Program, Requirement } from "@shared/schema";
import { useComparison } from "@/hooks/use-comparison";
import { Link, useParams } from "wouter";
import { 
  ArrowLeft, 
  Check, 
  ExternalLink, 
  MapPin, 
  Users, 
  GraduationCap, 
  DollarSign,
  TrendingUp,
  Clock,
  BookOpen,
  Award
} from "lucide-react";

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToComparison, removeFromComparison, isSelected, selectedUniversities } = useComparison();

  const { data: university, isLoading: universityLoading, error: universityError } = useQuery({
    queryKey: ['/api/universities', id],
    queryFn: async () => {
      const response = await fetch(`/api/universities/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch university');
      }
      return response.json() as Promise<University>;
    },
    enabled: !!id,
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['/api/universities', id, 'programs'],
    queryFn: async () => {
      const response = await fetch(`/api/universities/${id}/programs`);
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      return response.json() as Promise<Program[]>;
    },
    enabled: !!id,
  });

  const { data: scholarships = [] } = useQuery({
    queryKey: ['/api/universities', id, 'scholarships'],
    queryFn: async () => {
      const response = await fetch(`/api/universities/${id}/scholarships`);
      if (!response.ok) {
        throw new Error('Failed to fetch scholarships');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch requirements for each program
  const { data: allRequirements = new Map() } = useQuery({
    queryKey: ['/api/programs/requirements', programs.map(p => p.id)],
    queryFn: async () => {
      const requirementsMap = new Map<string, Requirement[]>();
      
      await Promise.all(
        programs.map(async (program) => {
          try {
            const response = await fetch(`/api/programs/${program.id}/requirements`);
            if (response.ok) {
              const requirements = await response.json();
              requirementsMap.set(program.id, requirements);
            }
          } catch (error) {
            console.error(`Failed to fetch requirements for program ${program.id}:`, error);
          }
        })
      );
      
      return requirementsMap;
    },
    enabled: programs.length > 0,
  });

  if (!id) {
    return (
      <div className="min-h-screen bg-scorecard-bg py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid University ID</h1>
        </div>
      </div>
    );
  }

  if (universityError) {
    return (
      <div className="min-h-screen bg-scorecard-bg py-8">
        <div className="max-w-7xl mx-auto px-4 text-center" data-testid="error-state">
          <h1 className="text-2xl font-bold text-red-600 mb-4">University Not Found</h1>
          <p className="text-scorecard-gray mb-8">The university you're looking for could not be found.</p>
          <Link href="/search">
            <Button className="bg-scorecard-blue hover:bg-blue-900 text-white" data-testid="button-back-search">
              Back to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (universityLoading || !university) {
    return (
      <div className="min-h-screen bg-scorecard-bg py-8">
        <div className="max-w-7xl mx-auto px-4" data-testid="loading-skeleton">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-12 bg-gray-300 rounded w-3/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selected = isSelected(university.id);

  const handleToggleComparison = () => {
    if (selected) {
      removeFromComparison(university.id);
    } else {
      if (selectedUniversities.size < 10) {
        addToComparison(university);
      }
    }
  };

  const getUniversityInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  const getTypeColor = (type: string) => {
    return type === 'Public' ? 'bg-blue-100 text-scorecard-blue' : 'bg-red-100 text-red-700';
  };

  const formatRequirements = (requirements: Requirement) => {
    const coreSubjects = requirements.coreSubjects as Record<string, string>;
    const electiveSubjects = requirements.electiveSubjects as Array<{subject: string, min_grade: string}>;
    
    return {
      core: Object.entries(coreSubjects).map(([subject, grade]) => `${subject}: ${grade} or better`),
      electives: electiveSubjects.map(elective => `${elective.subject}: ${elective.min_grade} or better`)
    };
  };

  return (
    <div className="min-h-screen bg-scorecard-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8" data-testid="university-header">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/search">
              <Button variant="outline" size="icon" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-scorecard-blue">University Details</h1>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-scorecard-blue rounded-lg flex items-center justify-center text-white font-bold text-2xl" data-testid="university-logo">
                      {getUniversityInitials(university.name)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-scorecard-blue mb-3" data-testid="university-name">
                        {university.name}
                      </h2>
                      <div className="flex items-center gap-2 text-scorecard-gray mb-4">
                        <MapPin className="h-5 w-5" />
                        <span data-testid="university-location">{university.location}, {university.region}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <Badge className={getTypeColor(university.type)} data-testid="type-badge">
                          {university.type}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-700" data-testid="size-badge">
                          <Users className="mr-1 h-3 w-3" />
                          {university.size}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-700" data-testid="setting-badge">
                          {university.setting}
                        </Badge>
                      </div>
                      {university.description && (
                        <p className="text-scorecard-gray" data-testid="university-description">
                          {university.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:w-80">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center" data-testid="stat-graduation">
                      <div className="text-3xl font-bold text-scorecard-blue">
                        {university.graduationRate ? `${university.graduationRate}%` : 'N/A'}
                      </div>
                      <div className="text-sm text-scorecard-gray">Graduation Rate</div>
                    </div>
                    <div className="text-center" data-testid="stat-acceptance">
                      <div className="text-3xl font-bold text-orange-600">
                        {university.acceptanceRate ? `${university.acceptanceRate}%` : 'N/A'}
                      </div>
                      <div className="text-sm text-scorecard-gray">Acceptance Rate</div>
                    </div>
                    <div className="text-center" data-testid="stat-cost">
                      <div className="text-2xl font-bold text-green-600">
                        {university.annualCost ? `₵${university.annualCost.toLocaleString()}` : 'N/A'}
                      </div>
                      <div className="text-sm text-scorecard-gray">Annual Cost</div>
                    </div>
                    <div className="text-center" data-testid="stat-earnings">
                      <div className="text-2xl font-bold text-purple-600">
                        {university.medianEarnings ? `₵${university.medianEarnings.toLocaleString()}` : 'N/A'}
                      </div>
                      <div className="text-sm text-scorecard-gray">Median Earnings</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleToggleComparison}
                      disabled={!selected && selectedUniversities.size >= 10}
                      className={`w-full ${selected 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-scorecard-blue hover:bg-blue-900 text-white'
                      }`}
                      data-testid="button-toggle-compare"
                    >
                      <Check className={`mr-2 h-4 w-4 ${selected ? 'block' : 'hidden'}`} />
                      {selected ? 'Added to Compare' : 'Add to Compare'}
                    </Button>
                    
                    {university.website && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(university.website, '_blank')}
                        className="w-full border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                        data-testid="button-visit-website"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="programs" className="space-y-6" data-testid="university-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="programs" data-testid="tab-programs">Programs</TabsTrigger>
            <TabsTrigger value="requirements" data-testid="tab-requirements">Requirements</TabsTrigger>
            <TabsTrigger value="scholarships" data-testid="tab-scholarships">Scholarships</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-4" data-testid="content-programs">
            <h3 className="text-2xl font-bold text-scorecard-blue mb-6">Academic Programs</h3>
            {programsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4 space-y-3">
                      <div className="h-6 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : programs.length === 0 ? (
              <Card data-testid="no-programs">
                <CardContent className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-scorecard-gray mb-4" />
                  <h4 className="text-lg font-semibold text-scorecard-blue mb-2">No Programs Available</h4>
                  <p className="text-scorecard-gray">Program information is not currently available for this university.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((program) => (
                  <Card key={program.id} className="hover:shadow-md transition-shadow" data-testid={`program-card-${program.id}`}>
                    <CardHeader>
                      <CardTitle className="text-lg text-scorecard-blue" data-testid={`program-name-${program.id}`}>
                        {program.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-scorecard-blue" data-testid={`program-level-${program.id}`}>
                          {program.level}
                        </Badge>
                        {program.duration && (
                          <Badge className="bg-gray-100 text-gray-700" data-testid={`program-duration-${program.id}`}>
                            <Clock className="mr-1 h-3 w-3" />
                            {program.duration} months
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {program.description && (
                        <p className="text-sm text-scorecard-gray mb-4" data-testid={`program-description-${program.id}`}>
                          {program.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        {program.tuitionLocal && (
                          <div className="flex justify-between text-sm">
                            <span className="text-scorecard-gray">Local Tuition:</span>
                            <span className="font-semibold text-green-600" data-testid={`tuition-local-${program.id}`}>
                              ₵{program.tuitionLocal.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {program.tuitionInternational && (
                          <div className="flex justify-between text-sm">
                            <span className="text-scorecard-gray">International:</span>
                            <span className="font-semibold text-green-600" data-testid={`tuition-intl-${program.id}`}>
                              ₵{program.tuitionInternational.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4" data-testid="content-requirements">
            <h3 className="text-2xl font-bold text-scorecard-blue mb-6">Admission Requirements</h3>
            {programs.length === 0 ? (
              <Card data-testid="no-requirements">
                <CardContent className="text-center py-12">
                  <GraduationCap className="mx-auto h-12 w-12 text-scorecard-gray mb-4" />
                  <h4 className="text-lg font-semibold text-scorecard-blue mb-2">No Requirements Available</h4>
                  <p className="text-scorecard-gray">Admission requirements are not currently available.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {programs.map((program) => {
                  const requirements = allRequirements.get(program.id)?.[0];
                  if (!requirements) return null;

                  const formattedReqs = formatRequirements(requirements);

                  return (
                    <Card key={program.id} data-testid={`requirements-card-${program.id}`}>
                      <CardHeader>
                        <CardTitle className="text-scorecard-blue" data-testid={`req-program-name-${program.id}`}>
                          {program.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h5 className="font-semibold text-scorecard-blue mb-2">Core Subjects</h5>
                          <ul className="space-y-1">
                            {formattedReqs.core.map((req, index) => (
                              <li key={index} className="text-sm text-scorecard-gray" data-testid={`core-req-${program.id}-${index}`}>
                                • {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-scorecard-blue mb-2">Elective Subjects</h5>
                          <ul className="space-y-1">
                            {formattedReqs.electives.map((req, index) => (
                              <li key={index} className="text-sm text-scorecard-gray" data-testid={`elective-req-${program.id}-${index}`}>
                                • {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {requirements.additionalRequirements && (
                          <div>
                            <h5 className="font-semibold text-scorecard-blue mb-2">Additional Requirements</h5>
                            <p className="text-sm text-scorecard-gray" data-testid={`additional-req-${program.id}`}>
                              {requirements.additionalRequirements}
                            </p>
                          </div>
                        )}

                        {requirements.aggregatePoints && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="font-medium text-scorecard-blue">Maximum Aggregate: </span>
                            <span className="font-bold text-scorecard-blue" data-testid={`aggregate-${program.id}`}>
                              {requirements.aggregatePoints} points
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scholarships" className="space-y-4" data-testid="content-scholarships">
            <h3 className="text-2xl font-bold text-scorecard-blue mb-6">Scholarships & Financial Aid</h3>
            {scholarships.length === 0 ? (
              <Card data-testid="no-scholarships">
                <CardContent className="text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-scorecard-gray mb-4" />
                  <h4 className="text-lg font-semibold text-scorecard-blue mb-2">No Scholarships Listed</h4>
                  <p className="text-scorecard-gray">
                    Scholarship information is not currently available. Contact the university directly for financial aid opportunities.
                  </p>
                  {university.website && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(university.website, '_blank')}
                      className="mt-4 border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                      data-testid="button-contact-university"
                    >
                      Contact University
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scholarships.map((scholarship: any, index: number) => (
                  <Card key={scholarship.id || index} data-testid={`scholarship-card-${index}`}>
                    <CardHeader>
                      <CardTitle className="text-scorecard-blue" data-testid={`scholarship-name-${index}`}>
                        {scholarship.name}
                      </CardTitle>
                      {scholarship.amount && (
                        <Badge className="bg-green-100 text-green-700 w-fit" data-testid={`scholarship-amount-${index}`}>
                          ₵{scholarship.amount.toLocaleString()}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {scholarship.eligibilityText && (
                        <p className="text-sm text-scorecard-gray mb-4" data-testid={`scholarship-eligibility-${index}`}>
                          {scholarship.eligibilityText}
                        </p>
                      )}
                      {scholarship.link && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(scholarship.link, '_blank')}
                          className="w-full border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                          data-testid={`scholarship-link-${index}`}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Learn More
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Bar */}
        <div className="mt-12 text-center space-y-4" data-testid="action-bar">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/eligibility">
              <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-check-eligibility">
                <GraduationCap className="mr-2 h-4 w-4" />
                Check Your Eligibility
              </Button>
            </Link>
            {selectedUniversities.size > 0 && (
              <Link href="/compare">
                <Button 
                  variant="outline" 
                  className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                  data-testid="button-view-comparison"
                >
                  View Comparison ({selectedUniversities.size})
                </Button>
              </Link>
            )}
            <Link href="/search">
              <Button 
                variant="outline" 
                className="border-scorecard-blue text-scorecard-blue hover:bg-scorecard-blue hover:text-white"
                data-testid="button-search-more"
              >
                Search More Universities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
