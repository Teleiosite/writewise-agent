
/**
 * Common types for AI services
 */
export interface AIResponse {
  content: string;
  source: string;
  confidence: number;
}

export const MOCK_PAPERS = [
  {
    title: "Recent Advances in Machine Learning: A Comprehensive Review",
    authors: ["Smith, J.", "Johnson, R.", "Williams, M."],
    year: "2023",
    source: "Journal of Artificial Intelligence Research",
    doi: "10.1234/jair.2023.123"
  },
  {
    title: "Deep Learning Applications in Healthcare",
    authors: ["Brown, A.", "Davis, S."],
    year: "2023",
    source: "Medical AI Journal",
    doi: "10.5678/maj.2023.456"
  },
  {
    title: "Natural Language Processing: State of the Art",
    authors: ["Miller, P.", "Wilson, K."],
    year: "2022",
    source: "Computational Linguistics Quarterly",
    doi: "10.9012/clq.2022.789"
  }
];
