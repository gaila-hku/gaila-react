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
