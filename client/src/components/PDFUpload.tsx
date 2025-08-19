import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParsedProgram {
  name: string;
  faculty?: string;
  level: string;
  applicantType: string;
  coreSubjects: string[] | Record<string, string>;
  electiveCount?: number;
  electiveSubjects?: Array<{
    subject: string;
    min_grade: string;
    options?: string[];
    requirements?: string;
  }>;
  additionalRequirements?: string;
}

interface ParseResult {
  university: string;
  programsFound: number;
  programsCreated?: number;
  requirementsCreated?: number;
  programs: ParsedProgram[];
}

export function PDFUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, preview: boolean = false) => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      if (preview) {
        setIsPreviewing(true);
        setPreviewMode(true);
      } else {
        setIsUploading(true);
        setPreviewMode(false);
      }

      const endpoint = preview ? '/api/admin/preview-pdf' : '/api/admin/parse-pdf';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ParseResult = await response.json();
      setResult(data);

      if (!preview) {
        toast({
          title: "PDF Processed Successfully",
          description: `Found ${data.programsFound} programs, created ${data.programsCreated} new programs and ${data.requirementsCreated} requirements`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process PDF",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsPreviewing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      handleFileUpload(file, true); // Preview first
    }
  };

  const saveToDatabase = () => {
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (file) {
      handleFileUpload(file, false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Admission Requirements Parser
          </CardTitle>
          <CardDescription>
            Upload a university PDF document to extract program-specific admission requirements.
            The system will automatically parse WASSCE/SSSCE requirements for each program.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="pdf-upload" 
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> PDF document
                </p>
                <p className="text-xs text-gray-500">PDF files only (MAX. 10MB)</p>
              </div>
              <input 
                id="pdf-upload" 
                type="file" 
                accept=".pdf"
                className="hidden" 
                onChange={handleFileChange}
                disabled={isUploading || isPreviewing}
              />
            </label>
          </div>

          {isPreviewing && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Analyzing PDF...</span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Analysis Results</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">University:</span> {result.university}
                  </div>
                  <div>
                    <span className="font-medium">Programs Found:</span> {result.programsFound}
                  </div>
                  {result.programsCreated !== undefined && (
                    <>
                      <div>
                        <span className="font-medium">Programs Created:</span> {result.programsCreated}
                      </div>
                      <div>
                        <span className="font-medium">Requirements Created:</span> {result.requirementsCreated}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Extracted Programs:</h4>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {result.programs.map((program, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid gap-2">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-lg">{program.name}</h5>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {program.applicantType}
                          </span>
                        </div>
                        {program.faculty && (
                          <p className="text-sm text-gray-600">{program.faculty}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Level:</span> {program.level}
                          </div>
                          <div>
                            <span className="font-medium">Core Subjects:</span>{' '}
                            {Array.isArray(program.coreSubjects) 
                              ? program.coreSubjects.join(', ')
                              : Object.keys(program.coreSubjects).join(', ')
                            }
                          </div>
                        </div>
                        {program.electiveSubjects && program.electiveSubjects.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Elective Requirements:</span>
                            <div className="mt-1 space-y-1">
                              {program.electiveSubjects.map((elective, eIndex) => (
                                <div key={eIndex} className="text-xs bg-gray-50 p-2 rounded">
                                  {elective.options ? (
                                    <div>
                                      <strong>{elective.subject}:</strong> Choose from: {elective.options.join(', ')}
                                    </div>
                                  ) : (
                                    <div>
                                      <strong>{elective.subject}:</strong> Minimum grade {elective.min_grade}
                                    </div>
                                  )}
                                  {elective.requirements && (
                                    <div className="text-gray-600 mt-1">{elective.requirements}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {program.additionalRequirements && (
                          <div className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Additional:</span> {program.additionalRequirements}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {previewMode && (
                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={saveToDatabase}
                    disabled={isUploading}
                    className="flex items-center gap-2"
                    data-testid="button-save-to-database"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Save to Database
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setResult(null);
                      setPreviewMode(false);
                      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}