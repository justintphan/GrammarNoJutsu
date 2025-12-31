import { useContext, createContext } from "react";

export type AiProvider = {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  apiKeyUrl: string;
};

export type AiProviderContextProps = {
  providers: AiProvider[];
  editProvider: (provider: AiProvider) => void;
  getProvider: (id: string) => AiProvider | null;
  syncProviders: () => Promise<void>;
};

export const AiProviderContext = createContext<AiProviderContextProps | null>(null);


export const useAiProviders = () => {
  const context = useContext(AiProviderContext);
  if (!context) {
    throw new Error("useAiProviders must be used within a AiProviderProvider");
  }
  return context;
};