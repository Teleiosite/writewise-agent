
import { CitationType, CitationStyle } from "./types";

export const formatCitation = (citation: CitationType, style: CitationStyle): string => {
  switch (style) {
    case "APA":
      return `${citation.authors.join(", ")} (${citation.year}). ${citation.title}. ${citation.source}.${citation.doi ? ` https://doi.org/${citation.doi}` : ""}`;
    case "MLA":
      return `${citation.authors.join(", ")}. "${citation.title}." ${citation.source}, ${citation.year}.`;
    case "Chicago":
      return `${citation.authors.join(" and ")}. "${citation.title}." ${citation.source} (${citation.year}).`;
    case "Harvard":
      return `${citation.authors.join(", ")} ${citation.year}, '${citation.title}', ${citation.source}.`;
    default:
      return `${citation.authors.join(", ")} (${citation.year}). ${citation.title}. ${citation.source}.`;
  }
};

export const citationStyles: CitationStyle[] = ["APA", "MLA", "Chicago", "Harvard"];
