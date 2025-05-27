export interface WordPair {
  id: number;
  basque: string;
  spanish: string;
  synonyms_basque?: string;
  synonyms_spanish?: string;
}

export type LearningMode = 'selection' | 'words' | 'verbs' | 'suffixes';
export type Suffix = 'kor' | 'pen' | null;