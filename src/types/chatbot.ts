export interface ChatbotConfig {
  max_tokens: number;
  choices: number;
  temperature: number;
}

export interface ChatbotTemplate {
  id: number;
  name: string;
  description: string;
  default_role_prompt: string;
  default_config: ChatbotConfig;
  default_model: string;
  created_at: string;
}
