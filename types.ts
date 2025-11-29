export enum RelationshipMode {
  WORK = 'WORK',
  ROMANCE = 'ROMANCE',
  FRIEND = 'FRIEND',
  OTHER = 'OTHER',
}

export interface AnalysisResult {
  intimacyScore: number;
  balanceRatio: {
    speaker1: { name: string; percentage: number };
    speaker2: { name: string; percentage: number };
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  avgResponseTime: {
    speaker1: { name: string; time: number | null }; // in minutes
    speaker2: { name: string; time: number | null };
  };
  summary: string;
  recommendation: string;
  sentimentFlow: {
    time_percentage: number;
    sentiment_score: number; // -1 to 1
  }[];
  responseHeatmap: number[]; // 24-hour array
  suggestedReplies: string[];
  suggestedTopics: string[];
}

export interface SimulationParams {
  responseTimePercentage: number;
}

export interface SimulationResult {
  newIntimacyScore: number;
  newRecommendation: string;
}

export interface StoredAnalysis {
  id: string;
  date: string;
  mode: RelationshipMode;
  speaker1Name: string;
  speaker2Name: string;
  result: AnalysisResult;
}