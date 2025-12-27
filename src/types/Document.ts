// VeriText AI - Document Types

export type DocumentUpload = {
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content?: string;
  studentName?: string;
  studentId?: string;
  courseId?: string;
  language?: string;
};

export type Document = {
  id: number;
  orgId: string;
  userId: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string | null;
  language: string | null;
  courseId: string | null;
  studentName: string | null;
  studentId: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, unknown> | null;
  updatedAt: Date;
  createdAt: Date;
};

export type PlagiarismCheck = {
  id: number;
  documentId: number;
  orgId: string;
  userId: string;
  checkType: 'plagiarism' | 'ai_detection' | 'paraphrase' | 'code_similarity';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  overallScore: number | null;
  aiScore: number | null;
  paraphraseScore: number | null;
  originalityScore: number | null;
  wordCount: number | null;
  sentenceCount: number | null;
  sourceCount: number | null;
  flaggedSections: number | null;
  processingTime: number | null;
  errorMessage: string | null;
  completedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
};

export type MatchedSource = {
  id: number;
  checkId: number;
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceAuthor: string | null;
  sourceType: string | null;
  matchPercentage: number;
  matchedText: string | null;
  originalText: string | null;
  startPosition: number | null;
  endPosition: number | null;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  createdAt: Date;
};

export type FlaggedSection = {
  id: number;
  checkId: number;
  sectionType: string;
  text: string;
  startPosition: number;
  endPosition: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  explanation: string | null;
  matchedSourceId: number | null;
  createdAt: Date;
};

export type Report = {
  id: number;
  checkId: number;
  orgId: string;
  reportType: string | null;
  reportUrl: string | null;
  reportData: ReportData | null;
  isShared: boolean | null;
  sharedWith: string[] | null;
  expiresAt: Date | null;
  createdAt: Date;
};

export type ReportData = {
  document: {
    title: string;
    fileName: string;
    studentName: string | null;
    studentId: string | null;
    courseId: string | null;
    submittedAt: Date;
  };
  results: {
    overallScore: number | null;
    aiScore: number | null;
    paraphraseScore: number | null;
    originalityScore: number | null;
    wordCount: number | null;
    sentenceCount: number | null;
    sourceCount: number | null;
    flaggedSections: number | null;
    processingTime: number | null;
    completedAt: Date | null;
  };
  matchedSources: Array<{
    title: string | null;
    url: string | null;
    author: string | null;
    type: string | null;
    matchPercentage: number;
    severity: string | null;
  }>;
  flaggedContent: Array<{
    type: string;
    text: string;
    confidence: number;
    severity: string | null;
    explanation: string | null;
  }>;
  generatedAt: string;
  reportType: string;
};

export type CheckType = 'plagiarism' | 'ai_detection' | 'paraphrase' | 'code_similarity';
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
