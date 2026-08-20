import { 
  AcademicCitation, 
  CitationStyle, 
  InTextStyle, 
  formatReference, 
  formatInTextCitation, 
  generateCompleteBibliography 
} from "@/services/citationEngine";

export const formatCitation = (citation: AcademicCitation, style: CitationStyle = "APA"): string => {
  return formatReference(citation, style);
};

export const formatInText = (
  citation: AcademicCitation, 
  style: CitationStyle = "APA", 
  mode: InTextStyle = "parenthetical",
  pageNumber?: string
): string => {
  return formatInTextCitation(citation, style, mode, pageNumber);
};

export const formatAllReferences = (
  citations: AcademicCitation[], 
  style: CitationStyle = "APA"
): string => {
  return generateCompleteBibliography(citations, style);
};

export const citationStyles: CitationStyle[] = [
  "APA", 
  "MLA", 
  "Chicago", 
  "Harvard", 
  "IEEE", 
  "Vancouver", 
  "Nature"
];
