// VeriText AI - Plagiarism Detection Engine
// This module handles text analysis for plagiarism, AI detection, and paraphrase detection

export type MatchedSource = {
  url?: string;
  title?: string;
  author?: string;
  type: 'web' | 'academic' | 'database' | 'student_paper';
  matchPercentage: number;
  matchedText: string;
  originalText?: string;
  startPosition: number;
  endPosition: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  flaggedSections?: FlaggedSection[];
};

export type FlaggedSection = {
  type: 'plagiarism' | 'ai_generated' | 'paraphrased';
  text: string;
  startPosition: number;
  endPosition: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation?: string;
};

export type PlagiarismResult = {
  overallScore: number; // 0-100 similarity percentage
  aiScore: number; // 0-100 AI detection probability
  paraphraseScore: number; // 0-100 paraphrase detection
  originalityScore: number; // 0-100 originality score
  wordCount: number;
  sentenceCount: number;
  matchedSources: MatchedSource[];
  flaggedSections: FlaggedSection[];
};

// Text analysis utilities
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function getSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 20) {
    return 'low';
  }
  if (score < 40) {
    return 'medium';
  }
  if (score < 70) {
    return 'high';
  }
  return 'critical';
}

// Simulated plagiarism detection patterns
// In production, this would integrate with external APIs like Copyleaks, Turnitin, or custom ML models
const COMMON_PHRASES = [
  'according to recent studies',
  'it is widely known that',
  'research has shown that',
  'in conclusion',
  'furthermore',
  'on the other hand',
  'as a result of',
  'due to the fact that',
];

const AI_PATTERNS = [
  /as an AI language model/i,
  /I cannot provide/i,
  /it's important to note that/i,
  /while I understand/i,
  /let me explain/i,
  /in summary/i,
];

// Detect AI-generated content patterns
function detectAIContent(text: string): { score: number; sections: FlaggedSection[] } {
  let aiIndicators = 0;
  const sections: FlaggedSection[] = [];

  // Check for common AI patterns
  for (const pattern of AI_PATTERNS) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      aiIndicators++;
      sections.push({
        type: 'ai_generated',
        text: match[0],
        startPosition: match.index,
        endPosition: match.index + match[0].length,
        confidence: 0.85,
        severity: 'high',
        explanation: 'This phrase is commonly found in AI-generated text',
      });
    }
  }

  // Analyze sentence structure uniformity (AI tends to be very uniform)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  const variance = sentences.reduce((sum, s) => sum + (s.length - avgLength) ** 2, 0) / sentences.length;

  // Low variance in sentence length can indicate AI content
  if (variance < 200 && sentences.length > 5) {
    aiIndicators++;
  }

  // Check for overly formal/structured language
  const formalPatterns = /therefore|furthermore|moreover|consequently|nevertheless|notwithstanding/gi;
  const formalMatches = text.match(formalPatterns);
  if (formalMatches && formalMatches.length > sentences.length * 0.3) {
    aiIndicators++;
  }

  // Calculate AI score (0-100)
  const score = Math.min(100, aiIndicators * 15 + Math.random() * 10);

  return { score, sections };
}

// Detect paraphrased content
function detectParaphrasing(text: string): { score: number; sections: FlaggedSection[] } {
  const sections: FlaggedSection[] = [];
  let paraphraseIndicators = 0;

  // Check for common paraphrasing patterns
  for (const phrase of COMMON_PHRASES) {
    const index = text.toLowerCase().indexOf(phrase);
    if (index !== -1) {
      paraphraseIndicators++;
      sections.push({
        type: 'paraphrased',
        text: text.slice(index, index + phrase.length + 50),
        startPosition: index,
        endPosition: Math.min(index + phrase.length + 50, text.length),
        confidence: 0.6,
        severity: 'low',
        explanation: 'Common academic phrase that may indicate paraphrasing',
      });
    }
  }

  const score = Math.min(100, paraphraseIndicators * 10 + Math.random() * 15);

  return { score, sections };
}

// Simulate web source matching
function findWebMatches(text: string): MatchedSource[] {
  const sources: MatchedSource[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

  // Simulate finding matches for some sentences
  const matchCount = Math.floor(sentences.length * 0.1); // ~10% of sentences might match

  for (let i = 0; i < matchCount && i < sentences.length; i++) {
    const sentence = sentences[i]!.trim();
    const startPos = text.indexOf(sentence);
    const matchPercentage = 70 + Math.random() * 25;

    sources.push({
      url: `https://example-source-${i + 1}.com/article`,
      title: `Academic Article ${i + 1}`,
      author: `Author ${i + 1}`,
      type: Math.random() > 0.5 ? 'academic' : 'web',
      matchPercentage,
      matchedText: sentence,
      originalText: sentence, // In production, this would be the actual source text
      startPosition: startPos,
      endPosition: startPos + sentence.length,
      severity: getSeverity(matchPercentage),
    });
  }

  return sources;
}

// Main plagiarism analysis function
export async function analyzePlagiarism(
  content: string,
  checkType: string = 'plagiarism',
): Promise<PlagiarismResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const wordCount = countWords(content);
  const sentenceCount = countSentences(content);

  // Run different detection algorithms based on check type
  const aiAnalysis = detectAIContent(content);
  const paraphraseAnalysis = detectParaphrasing(content);
  const matchedSources = checkType === 'plagiarism' || checkType === 'code_similarity'
    ? findWebMatches(content)
    : [];

  // Calculate overall plagiarism score
  const sourceMatchScore = matchedSources.length > 0
    ? matchedSources.reduce((sum, s) => sum + s.matchPercentage, 0) / matchedSources.length
    : 0;

  const overallScore = Math.min(100, sourceMatchScore * 0.5
    + aiAnalysis.score * 0.3
    + paraphraseAnalysis.score * 0.2);

  const originalityScore = Math.max(0, 100 - overallScore);

  // Combine all flagged sections
  const allFlaggedSections: FlaggedSection[] = [
    ...aiAnalysis.sections,
    ...paraphraseAnalysis.sections,
  ];

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    aiScore: Math.round(aiAnalysis.score * 10) / 10,
    paraphraseScore: Math.round(paraphraseAnalysis.score * 10) / 10,
    originalityScore: Math.round(originalityScore * 10) / 10,
    wordCount,
    sentenceCount,
    matchedSources,
    flaggedSections: allFlaggedSections,
  };
}

// Code similarity analysis (for programming assignments)
export async function analyzeCodeSimilarity(
  code: string,
  _language: string = 'javascript',
): Promise<PlagiarismResult> {
  // Simulate code analysis delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));

  const lines = code.split('\n').filter(l => l.trim().length > 0);
  const wordCount = countWords(code);

  // Simple code similarity detection
  // In production, this would use AST analysis and code fingerprinting
  const commonPatterns = [
    /function\s+\w+\s*\(/g,
    /for\s*\(/g,
    /while\s*\(/g,
    /if\s*\(/g,
    /class\s+\w+/g,
  ];

  let patternMatches = 0;
  for (const pattern of commonPatterns) {
    const matches = code.match(pattern);
    if (matches) {
      patternMatches += matches.length;
    }
  }

  // Calculate scores
  const codeComplexity = patternMatches / lines.length;
  const overallScore = Math.min(100, codeComplexity * 20 + Math.random() * 20);

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    aiScore: Math.round(Math.random() * 30 * 10) / 10, // AI code detection
    paraphraseScore: 0,
    originalityScore: Math.round((100 - overallScore) * 10) / 10,
    wordCount,
    sentenceCount: lines.length,
    matchedSources: [],
    flaggedSections: [],
  };
}
