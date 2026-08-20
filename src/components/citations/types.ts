import { AcademicCitation, CitationStyle, InTextStyle, AcademicWorkType } from '@/services/citationEngine';

export type CitationType = AcademicCitation;
export type { CitationStyle, InTextStyle, AcademicWorkType };

export interface CitationManagerProps {
  onInsertCitation: (citation: string) => void;
  onInsertBibliography?: (bibliography: string) => void;
}
