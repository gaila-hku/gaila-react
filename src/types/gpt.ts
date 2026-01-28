export interface GptLog {
  id: number;
  user_id: number;
  assignment_tool_id: number;
  user_question: string;
  gpt_answer: string;
  whole_prompt: string;
  user_ask_time: number;
  gpt_response_time?: number;
  prompt_nature_category?: number;
  prompt_aspect_category?: number;
  is_structured?: boolean;
}

export interface IdeationScaffoldResult {
  idea_scaffolds: {
    heading: string;
    question: string;
  }[];
}

// export interface IdeationIdeaResult {
//   sections: {
//     title: string;
//     content: string[];
//     notes: string;
//   }[];
//   summary: string;
// }

export interface OutlineReviewResult {
  comments: {
    title: string;
    comment: string;
    explanation: string;
  }[];
}

// export interface GrammarResult {
//   score: number;
//   mistakes: {
//     severity: any;
//     description: string;
//     original_sentence: string;
//     corrected_sentence: string;
//   }[];
// }

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

export interface RevisionResult {
  revision_items: {
    aspect_id: string;
    aspect_title: string;
    max_suggestions: number;
    suggestions: {
      order: number;
      current_text: string;
      replace_text: string;
      applicability: 'low' | 'medium' | 'high';
    }[];
    explanation: string;
  }[];
}

export interface PromptHistoryItem extends GptLog {
  tool_key: string;
}

export interface StudentRevisionExplanation {
  id: number;
  user_id: number;
  gpt_log_id: number;
  aspect_id: string;
  saved_at: number;
  response_type?: 'agree' | 'disagree' | 'partial';
  explanation?: string;
}

export interface StudentRevisionExplanationListingItem
  extends Omit<StudentRevisionExplanation, 'gpt_log_id'> {
  gpt_log: Pick<
    GptLog,
    'id' | 'user_ask_time' | 'user_question' | 'gpt_answer' | 'is_structured'
  >;
}

export interface VocabGenerateItem {
  text: string;
  type: 'word' | 'phrase';
}

export interface VocabGenerateResult {
  items: VocabGenerateItem[];
}

export interface DashboardGenerateReferenceItem {
  text: string;
  explanation: string;
  referenced: boolean;
}

export interface DashboardGenerateResult {
  reading: {
    total_annotations: number;
    annotations: DashboardGenerateReferenceItem[];
    suggestions: string;
  };
  language: {
    total_vocabularies: number;
    vocabs: DashboardGenerateReferenceItem[];
    suggestions: string;
  };
  outline: {
    total_outline_points: number;
    outline_points: DashboardGenerateReferenceItem[];
    suggestions: string;
  };
  checklist: {
    total_checklist_items: number;
    checklist_items: DashboardGenerateReferenceItem[];
    suggestions: string;
  };
  overall_suggestion: string;
}
