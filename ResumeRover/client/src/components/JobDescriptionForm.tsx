import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";

interface JobDescriptionFormProps {
  jobTitle: string;
  jobDescription: string;
  onJobTitleChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

export function JobDescriptionForm({
  jobTitle,
  jobDescription,
  onJobTitleChange,
  onJobDescriptionChange,
  onAnalyze,
  isAnalyzing,
  disabled,
}: JobDescriptionFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="job-title" className="text-sm font-medium text-gray-700 mb-2">
          Job Title
        </Label>
        <Input
          id="job-title"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          placeholder="e.g., Senior Software Engineer"
          className="mt-1"
          data-testid="input-job-title"
        />
      </div>

      <div>
        <Label htmlFor="job-description" className="text-sm font-medium text-gray-700 mb-2">
          Job Description
        </Label>
        <Textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the job description here..."
          rows={12}
          className="mt-1 resize-none"
          data-testid="textarea-job-description"
        />
      </div>

      <Button
        onClick={onAnalyze}
        disabled={disabled || isAnalyzing}
        className="w-full bg-primary hover:bg-blue-600 text-white"
        size="lg"
        data-testid="button-analyze"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Analyze Resume Match
          </>
        )}
      </Button>
    </div>
  );
}
