import { ReactNode, useState, useEffect } from "react";
import { AiProviderContext } from "./AiProviderContext";
import { AiProvider } from "./AiProviderContext";
import { invoke } from "@tauri-apps/api/core";

export function AiProviderProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<AiProvider[]>([]);

  useEffect(() => {
    const loadProviders = async () => {
      const providers = await invoke("load_ai_providers");
      setProviders(providers as AiProvider[]);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadProviders();
  }, [])

  const editProvider = (provider: AiProvider) => {
    const updatedProviders = providers.map(p => p.id === provider.id ? { ...p, ...provider } : p);
    setProviders(updatedProviders);
  }

  const getProvider = (id: string) => {
    return providers.find(p => p.id === id) || null;
  }

  const syncProviders = async () => {
    await invoke("save_ai_providers", { providers });
  }

  return (
    <AiProviderContext.Provider value={{ providers, editProvider, getProvider, syncProviders }}>
      {children}
    </AiProviderContext.Provider>
  );
}