import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { FileProcessor } from "./services/fileProcessor";
import { FreeAIAnalyzer } from "./services/freeAiAnalyzer";
import { insertAnalysisSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze resume endpoint
  app.post("/api/analyze", upload.single('resume'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No resume file uploaded" });
      }

      const { jobTitle, jobDescription } = req.body;

      if (!jobTitle || !jobDescription) {
        return res.status(400).json({ error: "Job title and description are required" });
      }

      // Validate file
      const validation = FileProcessor.validateFile(req.file);
      if (!validation.isValid) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: validation.error });
      }

      const resumeText = await FileProcessor.extractText(req.file.path, req.file.mimetype);
      const analysisResult = await FreeAIAnalyzer.analyzeResume(resumeText, jobTitle, jobDescription);

      const analysisData = {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        jobTitle,
        jobDescription,
        resumeText,
        atsScore: analysisResult.atsScore,
        keywordScore: analysisResult.keywordScore,
        skillsScore: analysisResult.skillsScore,
        matchedKeywords: analysisResult.matchedKeywords,
        missingKeywords: analysisResult.missingKeywords,
        recommendations: analysisResult.recommendations,
        skillsAnalysis: analysisResult.skillsAnalysis,
      };

      const validatedData = insertAnalysisSchema.parse(analysisData);
      const savedAnalysis = await storage.createAnalysis(validatedData);

      fs.unlinkSync(req.file.path);
      res.json({
        id: savedAnalysis.id,
        ...analysisResult
      });
    } catch (error) {
      console.error('Analysis error:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to analyze resume" 
        });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
