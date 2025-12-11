export interface GptLog {
  id: number;
  user_id: number;
  assignment_tool_id: number;
  user_question: string;
  gpt_answer: string;
  whole_prompt: string;
  user_ask_time: number;
  gpt_response_time?: number;
  prompt_category?: string;
  is_structured?: boolean;
}

export interface RevisionResult {
  score: number;
  mistakes: {
    severity: any;
    description: string;
    original_sentence: string;
    corrected_sentence: string;
  }[];
}
export interface DictionaryResult {
  original_word: string;
  parts_of_speech: string;
  translation: string;
  definition: string;
  examples: string[];
}

export interface AutoGradeResult {
  overall_score: number;
  max_score: number;
  overall_feedback: string;
  criteria_scores: {
    criteria: string;
    score: number;
    max_score: number;
    feedback: string;
  }[];
}
