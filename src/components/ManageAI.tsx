import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save, ExternalLink, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiProvider, useAiProviders } from "@/contexts/AiProviderContext/AiProviderContext";


interface ManageAIProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ManageAI({
  open: controlledOpen,
  onOpenChange,
}: ManageAIProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;
  const { providers, editProvider, syncProviders } = useAiProviders();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  useEffect(() => {
    if (!selectedProviderId) {
      setSelectedProviderId(providers[0]?.id || '');
    }   
  }, [providers, selectedProviderId]);

  const handleUpdateProvider = (
    field: keyof AiProvider,
    value: string | boolean
  ) => {
    if (!selectedProvider) return;
    const updatedProvider = { ...selectedProvider, [field]: value };
    editProvider(updatedProvider);
  };

  const handleSaveSettings = () => {    
    void syncProviders();
    setOpen(false);
  };

  const isApiKeyMissing = selectedProvider && !selectedProvider.apiKey;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 bg-[#1E1E1E] border-[#3A3A3A]">
        <DialogHeader className="px-6 py-4 border-b border-[#3A3A3A]">
          <DialogTitle className="text-white text-lg font-medium">
            AI Provider Settings
          </DialogTitle>
          <DialogDescription className="text-[#99A1AF] text-sm">
            Configure your AI providers and API keys
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[400px]">
          {/* Left Panel - Provider List */}
          <div className="w-[180px] border-r border-[#3A3A3A] flex flex-col">
            <div className="px-4 py-3 border-b border-[#3A3A3A]">
              <span className="text-xs text-[#6A7282] uppercase tracking-wide">
                AI Providers
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProviderId(provider.id)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between",
                    selectedProviderId === provider.id
                      ? "bg-[#3A3A3A] text-white"
                      : "text-[#99A1AF] hover:bg-[#2A2A2A]"
                  )}
                >
                  <span>{provider.name}</span>
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      provider.enabled ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Provider Settings */}
          <div className="flex-1 flex flex-col">
            {selectedProvider && (
              <div className="p-6 space-y-6">
                {/* Provider Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white text-base font-medium">
                      {selectedProvider.name}
                    </h3>
                    <p className="text-[#6A7282] text-sm mt-0.5">
                      Configure provider settings
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#99A1AF]">Enabled</span>
                    <Switch
                      checked={selectedProvider.enabled}
                      onCheckedChange={(checked) =>
                        handleUpdateProvider("enabled", checked)
                      }
                    />
                  </div>
                </div>

                {/* API Key Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white">API Key</label>
                    <a
                      href={selectedProvider.apiKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      Get API Key
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <Input
                    type="password"
                    value={selectedProvider.apiKey}
                    onChange={(e) =>
                      handleUpdateProvider("apiKey", e.target.value)
                    }
                    placeholder={`Enter your ${selectedProvider.name} API key...`}
                    className="bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-[#6A7282]"
                  />
                </div>

                {/* Warning Message */}
                {isApiKeyMissing && (
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">
                      API key required to use this provider
                    </span>
                  </div>
                )}

                {/* Security Notice */}
                <div className="bg-[#2A2A2A] rounded-md p-4 border border-[#3A3A3A]">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[#6A7282] mt-0.5" />
                    <p className="text-sm text-[#6A7282]">
                      Your API keys are stored locally in your machine and only
                      sent to the respective AI provider's API.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#3A3A3A]">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            className="bg-[#3A3A3A] hover:bg-[#4A4A4A] text-white border-0"
          >
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
