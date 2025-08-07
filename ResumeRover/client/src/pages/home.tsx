import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { JobDescriptionForm } from "@/components/JobDescriptionForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Briefcase, ChartLine, Upload, Key, List, CheckCircle, File, Users, Mail } from "lucide-react";
import { AnalysisResult } from "@shared/schema";

interface AnalysisResponse extends AnalysisResult {
  id: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !jobTitle || !jobDescription) {
        throw new Error("Please upload a resume and fill in job details");
      }

      const formData = new FormData();
      formData.append('resume', selectedFile);
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
      toast({
        title: "Analysis Complete",
        description: "Your resume has been successfully analyzed!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    analyzeMutation.mutate();
  };

  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setJobTitle("");
    setJobDescription("");
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="text-primary h-8 w-8 mr-3" data-testid="logo" />
              <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">ATS Resume Checker</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-how-it-works">How it Works</a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-tips">Tips</a>
              <a href="#" className="text-gray-600 hover:text-primary transition-colors" data-testid="link-contact">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="hero-title">Optimize Your Resume for ATS</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="hero-description">
            Get instant feedback on how well your resume matches job descriptions and improve your chances of getting noticed by hiring managers.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Resume Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center" data-testid="upload-section-title">
              <Upload className="text-primary mr-3" />
              Upload Your Resume
            </h3>
            
            <FileUpload 
              onFileSelect={setSelectedFile} 
              selectedFile={selectedFile}
              data-testid="file-upload"
            />
          </div>

          {/* Job Description Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center" data-testid="job-section-title">
              <Briefcase className="text-primary mr-3" />
              Job Description
            </h3>
            
            <JobDescriptionForm
              jobTitle={jobTitle}
              jobDescription={jobDescription}
              onJobTitleChange={setJobTitle}
              onJobDescriptionChange={setJobDescription}
              onAnalyze={handleAnalyze}
              isAnalyzing={analyzeMutation.isPending}
              disabled={!selectedFile || !jobTitle.trim() || !jobDescription.trim()}
              data-testid="job-form"
            />
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <AnalysisResults 
            result={analysisResult} 
            onNewAnalysis={handleNewAnalysis}
            data-testid="analysis-results"
          />
        )}

        {/* Tips Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center" data-testid="tips-title">Tips for ATS Optimization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center" data-testid="tip-formats">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="text-primary h-8 w-8" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Use Standard Formats</h4>
              <p className="text-gray-600 text-sm">Stick to common file formats like PDF or DOCX for better ATS compatibility.</p>
            </div>
            <div className="text-center" data-testid="tip-keywords">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="text-secondary h-8 w-8" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Match Keywords</h4>
              <p className="text-gray-600 text-sm">Include relevant keywords from the job description naturally in your resume.</p>
            </div>
            <div className="text-center" data-testid="tip-formatting">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <List className="text-warning h-8 w-8" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Simple Formatting</h4>
              <p className="text-gray-600 text-sm">Use clear headings, bullet points, and avoid complex graphics or tables.</p>
            </div>
            <div className="text-center" data-testid="tip-proofreading">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-purple-500 h-8 w-8" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Proofread Carefully</h4>
              <p className="text-gray-600 text-sm">Ensure perfect spelling and grammar as ATS systems are sensitive to errors.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <FileText className="text-primary h-8 w-8 mr-3" />
                <h3 className="text-xl font-bold" data-testid="footer-title">ATS Resume Checker</h3>
              </div>
              <p className="text-gray-300 mb-4">Optimize your resume for Applicant Tracking Systems and increase your chances of landing your dream job.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" data-testid="footer-resources-title">Resources</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-link-templates">Resume Templates</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-link-guide">ATS Guide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-link-tips">Interview Tips</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-link-advice">Career Advice</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" data-testid="footer-support-title">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-link-help">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-link-contact">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-link-privacy">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors" data-testid="footer-link-terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300" data-testid="footer-copyright">&copy; 2024 ATS Resume Checker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
