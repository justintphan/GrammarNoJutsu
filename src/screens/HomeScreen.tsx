import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppSettings from "@/components/AppSettings";
import ModelSelector from "@/components/ModelSelector";
import { Copy, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { useTasks } from "@/contexts/TaskContext/TaskContext";
import { Model } from "@/hooks/useGetAiModels";
import { useExecuteTask } from "@/hooks/useExecuteTask";

export default function HomeScreen() {
  const { tasks } = useTasks();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedTask, setSelectedTask] = useState<string | undefined>();
  const [selectedModel, setSelectedModel] = useState<Model | undefined>(undefined);
  const { executeTask, loading: executing } = useExecuteTask();

  const handleClear = () => {
    setInputText("");
  };

  const handleUseAsInput = () => {
    setInputText(outputText);
    setOutputText("");
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(outputText);
  };

  const handleProcess = async () => {
    if (!selectedTask || !selectedModel || !inputText) {
      return;
    }
    try {
      const res = await executeTask({ 
        taskId: selectedTask, 
        providerId: selectedModel.provider, 
        model: selectedModel.value, 
        input: inputText 
      });
      
      setOutputText(res.content);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      setSelectedTask(tasks[0].id);
    }
  }, [tasks, selectedTask]);

  const canExecute = !!selectedTask && !!selectedModel && !!inputText && !executing;

  const selectedTaskName = tasks.find((task) => task.id === selectedTask)?.name;

  return (
    <div className="bg-[#1E1E1E] text-white h-screen flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <header className="shrink-0 bg-[#2A2A2A] border-b border-[#3A3A3A] px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-normal text-white">Language Assistant</h1>
          </div>
          <div className="flex items-center gap-4">
            <AppSettings />
          </div>
        </div>
      </header>

      {/* Controls Bar - Fixed */}
      <div className="shrink-0 bg-[#252525] border-b border-[#3A3A3A] px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#99A1AF]">Task:</span>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>{task.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#99A1AF]">Model:</span>
            <ModelSelector value={selectedModel} onValueChange={setSelectedModel} />
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 grid grid-cols-2 gap-0 min-h-0">
        {/* Input Section */}
        <div className="border-r border-[#3A3A3A] flex flex-col bg-[#2A2A2A] min-h-0">
          <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#3A3A3A]">
            <span className="text-sm text-[#99A1AF]">Input</span>
            <Button
              variant="ghost"
              onClick={handleClear}
              className="flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          </div>
          <div className="flex-1 p-6 min-h-0">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Processed text will appear here..."
              className="w-full h-full bg-transparent border-none resize-none focus-visible:ring-0 text-white placeholder:text-[#6A7282] overflow-auto"
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col bg-[#2A2A2A] min-h-0">
          <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#3A3A3A]">
            <span className="text-sm text-[#99A1AF]">Output</span>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleUseAsInput}
                className="flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Use as Input
              </Button>
              <Button
                variant="ghost"
                onClick={handleCopy}
                className="flex items-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
          </div>
          <div className="flex-1 p-6 min-h-0">
            <Textarea
              value={outputText}
              readOnly
              placeholder="Processed text will appear here..."
              className="w-full h-full bg-transparent border-none resize-none focus-visible:ring-0 text-white placeholder:text-[#6A7282] overflow-auto"
            />
          </div>
        </div>
      </div>

      {/* Action Button - Fixed */}
      <div className="shrink-0 p-6 border-t border-[#3A3A3A] bg-[#252525]">
        <Button disabled={!canExecute} onClick={handleProcess} className="w-full py-6">
          {
            executing ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )
          }
          {selectedTaskName}
        </Button>
      </div>
    </div>
  );
}
