import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useGetAiModels from "@/hooks/useGetAiModels";

interface Model {
  value: string;
  label: string;
  provider: string;
}

interface ModelSelectorProps {
  value: Model | undefined;
  onValueChange: (value: Model | undefined) => void;
}

export default function ModelSelector({
  value,
  onValueChange,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const models = useGetAiModels();

  const selectedModel = models.find((model) => model.value === value?.value);
  const groupedModels = useMemo(() => {
    const groups: Record<string, Model[]> = {};
    models.forEach((model) => {
      if (!groups[model.provider]) {
        groups[model.provider] = [];
      }
      groups[model.provider].push(model);
    });
    return groups;
  }, [models]);

  useEffect(() => {
    if (!value && Object.keys(groupedModels).length > 0) {      
      onValueChange(Object.values(groupedModels)[0][0]);
    }
  }, [groupedModels, value, onValueChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[200px] justify-between bg-transparent border-input hover:bg-transparent hover:text-white",
            !value && "text-muted-foreground"
          )}
        >
          {selectedModel ? selectedModel.label : "Select model..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            {Object.entries(groupedModels).map(([provider, models]) => (
              <CommandGroup key={provider} heading={provider}>
                {models.map((model) => (
                  <CommandItem
                    key={model.value}
                    value={model.label}
                    onSelect={() => {
                      onValueChange(model.value === value?.value ? undefined : model);
                      setOpen(false);
                    }}
                  >
                    {model.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value?.value === model.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
