export interface DataSummary {
  rowCount: number;
  columnCount: number;
  headers: string[];
  missingValueRate: number;
  numericColumns: string[];
  categoricalColumns: string[];
  sampleRows: Record<string, unknown>[];
  numericStats?: Record<string, { min: number; max: number; mean: number; sum: number }>;
  topValues?: Record<string, string[]>;
}

export interface ParsedData {
  type: "csv" | "xlsx" | "text";
  rawText?: string;
  headers?: string[];
  rows?: Record<string, unknown>[];
  summary?: DataSummary;
  fileName?: string;
}

export interface Insight {
  id: number;
  text: string;
  signal: string;
  category: "revenue" | "operations" | "customers" | "inventory" | "general";
}

export interface Risk {
  id: number;
  text: string;
  confidence: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
}

export interface RecommendedAction {
  text: string;
  priority: "immediate" | "this-week" | "this-month";
  rationale: string;
}

export interface AnalysisResult {
  insights: Insight[];
  risks: Risk[];
  action: RecommendedAction;
  confidence: number;
  dataQualityNote?: string | null;
  generatedAt: string;
}

export interface StoredSession {
  result: AnalysisResult;
  summary?: DataSummary;
  fileName?: string;
  timestamp: number;
}

export interface AnalyzeRequest {
  parsedData?: ParsedData;
  rawText?: string;
}
