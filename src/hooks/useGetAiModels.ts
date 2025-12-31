import { useAiProviders } from "@/contexts/AiProviderContext/AiProviderContext";

export interface Model {
  value: string;
  label: string;
  provider: string;
}

const MODELS: Model[] = [
  // OpenAI
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
  { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { value: "gpt-4.1", label: "GPT-4.1", provider: "openai" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini", provider: "openai" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano", provider: "openai" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "openai" },
  { value: "o3", label: "o3", provider: "openai" },
  { value: "o3-pro", label: "o3 Pro", provider: "openai" },
  { value: "o4-mini", label: "o4 Mini", provider: "openai" },
  { value: "o1", label: "o1", provider: "openai" },
  { value: "o1-mini", label: "o1 Mini", provider: "openai" },

  // Anthropic
  { value: "claude-opus-4-1-20250805", label: "Claude Opus 4.1", provider: "anthropic" },
  { value: "claude-opus-4-20250514", label: "Claude Opus 4", provider: "anthropic" },
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", provider: "anthropic" },
  { value: "claude-3-7-sonnet-20250219", label: "Claude 3.7 Sonnet", provider: "anthropic" },
  { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "anthropic" },
  { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", provider: "anthropic" },
  { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku", provider: "anthropic" },

  // Google
  { value: "gemini-3-pro", label: "Gemini 3 Pro", provider: "google-gemini" },  
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "google-gemini" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "google-gemini" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite", provider: "google-gemini" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "google-gemini" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite", provider: "google-gemini" },
];

const useGetAiModels = () => { 
    const { providers } = useAiProviders();
    const disabledProviders = providers.filter((p) => !p.enabled).map((p) => p.id);
    return MODELS.filter((m) => !disabledProviders.includes(m.provider));    
}

export default useGetAiModels;