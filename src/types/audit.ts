import { CompanyDetails } from "../services/geminiService";

export interface Audit {
  id: string;
  company: CompanyDetails;
  answers: Record<string, number>;
  recommendations: string | null;
  overallScore: string;
  date: string;
}
