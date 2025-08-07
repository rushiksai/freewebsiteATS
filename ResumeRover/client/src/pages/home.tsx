
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileText, Target, BarChart3, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { JobDescriptionForm } from "@/components/JobDescriptionForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AnalysisResult {
  atsScore: number;
  keywordScore: number;
  skillsScore: number;
  matchedKeywords: Array<{ keyword: string; count: number }>;
  missingKeywords: Array<{ keyword: string; priority: string }>;
  recommendations: string[];
  skillsAnalysis: Array<{ category: string; score: number }>;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeResume = useMutation({
    mutationFn: async ({ file, jobTitle, jobDescription }: { file: File; jobTitle: string; jobDescription: string }) => {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobTitle', jobTitle);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
    },
  });

  const handleAnalyze = (jobTitle: string, jobDescription: string) => {
    if (!selectedFile) return;
    analyzeResume.mutate({ file: selectedFile, jobTitle, jobDescription });
  };

  const renderCircularProgress = (score: number, label: string) => (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#10b981"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{score}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-700">{label}</span>
    </div>
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600 flex items-center">
            <Target className="w-6 h-6 mr-2" />
            ResumeRover
          </h1>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg text-blue-700">
              <BarChart3 className="w-5 h-5 mr-3" />
              <span className="font-medium">Resume Analysis</span>
            </div>
            <div className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
              <FileText className="w-5 h-5 mr-3" />
              <span>My Resumes</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {!analysisResult ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis</h2>
              <p className="text-gray-600">Upload your resume and job description to get instant ATS compatibility feedback</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-600" />
                    Upload Resume
                  </CardTitle>
                  <CardDescription>
                    Upload your resume in PDF, DOC, or DOCX format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload 
                    onFileSelect={setSelectedFile} 
                    selectedFile={selectedFile}
                  />
                </CardContent>
              </Card>

              {/* Job Description Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Job Description
                  </CardTitle>
                  <CardDescription>
                    Enter the job details you want to match against
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JobDescriptionForm
                    onAnalyze={handleAnalyze}
                    isAnalyzing={analyzeResume.isPending}
                    disabled={!selectedFile}
                  />
                </CardContent>
              </Card>
            </div>

            {analyzeResume.isPending && (
              <div className="mt-8 flex justify-center">
                <LoadingSpinner />
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resume Analysis Results</h2>
                <p className="text-gray-600">Company - Job Title</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">Track</Button>
                <Button variant="outline">Print</Button>
              </div>
            </div>

            {/* Main Results Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Match Rate */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Match Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    {renderCircularProgress(analysisResult.atsScore, "Overall Match")}
                    
                    <div className="w-full mt-6 space-y-4">
                      <Button className="w-full" variant="default">
                        Upload & rescan
                      </Button>
                      <Button className="w-full" variant="outline">
                        <span className="text-yellow-600 mr-2">⚡</span>
                        Power Edit
                      </Button>
                    </div>

                    {/* Detailed Scores */}
                    <div className="w-full mt-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Searchability</span>
                        <span className="text-sm font-medium">{analysisResult.keywordScore}%</span>
                      </div>
                      <Progress value={analysisResult.keywordScore} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hard Skills</span>
                        <span className="text-sm font-medium">{analysisResult.skillsScore}%</span>
                      </div>
                      <Progress value={analysisResult.skillsScore} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Soft Skills</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Searchability Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Searchability
                      <Badge className="ml-2 bg-blue-100 text-blue-800">IMPORTANT</Badge>
                    </CardTitle>
                    <CardDescription>
                      An ATS (Applicant Tracking System) is a software used by 90% of companies and recruiters to search for resumes and manage the hiring process. Below is how well your resume appears in an ATS and a recruiter search.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Fix the red Xs to ensure your resume is easily searchable by recruiters and parsed correctly by the ATS.
                      </p>
                    </div>

                    {/* ATS Tips */}
                    <div className="space-y-4">
                      <div className="border-l-4 border-red-400 pl-4">
                        <div className="flex items-start">
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm text-gray-700">Adding this job's company name and web address can help us provide you ATS-specific tips.</p>
                            <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">Update scan information</Button>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-red-400 pl-4">
                        <div className="flex items-start">
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm text-gray-700">We did not find an address in your resume. Recruiters use your address to validate your location for job matches.</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-green-400 pl-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm text-gray-700">You provided your email. Recruiters use your email to contact you for job matches.</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-green-400 pl-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm text-gray-700">You provided your phone number.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-l-4 border-green-400 pl-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-700">We found a summary section on your resume. Good job! The summary provides a quick overview of the candidate's qualifications, helping recruiters and hiring managers promptly grasp the value the candidate can offer in the position.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Headings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Section Headings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-400 pl-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm text-gray-700">We found the education section in your resume.</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-green-400 pl-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm text-gray-700">We found the work experience section in your resume.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
              <Button 
                onClick={() => setAnalysisResult(null)}
                variant="outline"
                size="lg"
              >
                Analyze Another Resume
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
