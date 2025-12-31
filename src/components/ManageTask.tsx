import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, useTasks } from "@/contexts/TaskContext/TaskContext";



// const defaultPrompts: Task[] = [
//   {
//     id: "1",
//     name: "Grammar Correction",
//     systemPrompt:
//       "You are an expert English grammar checker. Correct any grammatical errors, spelling mistakes, and punctuation issues.",
//     userPrompt: "Please correct the following text:\n\n{text}",
//   },
//   {
//     id: "2",
//     name: "Improve Writing",
//     systemPrompt:
//       "You are a professional writing assistant. Improve the clarity, flow, and overall quality of the text.",
//     userPrompt: "Please improve the following text:\n\n{text}",
//   },
//   {
//     id: "3",
//     name: "Rephrase",
//     systemPrompt:
//       "You are a skilled writer. Rephrase the text while maintaining its original meaning.",
//     userPrompt: "Please rephrase the following text:\n\n{text}",
//   },
//   {
//     id: "4",
//     name: "Make Formal",
//     systemPrompt:
//       "You are a professional communication expert. Convert the text to a formal tone suitable for business communication.",
//     userPrompt: "Please make the following text more formal:\n\n{text}",
//   },
//   {
//     id: "5",
//     name: "Make Casual",
//     systemPrompt:
//       "You are a friendly writing assistant. Convert the text to a casual, conversational tone.",
//     userPrompt: "Please make the following text more casual:\n\n{text}",
//   },
// ];

interface ManagePromptsProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ManageTasks({
  open: controlledOpen,
  onOpenChange,
}: ManagePromptsProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;
  const { tasks, addTask, editTask, deleteTask, syncTasks } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    tasks[0]?.id || ''
  );
  
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  const isTaskValid = (task: Task) => {
    return task.name.trim() !== '' && task.taskDescription.trim() !== '';
  };

  const allTasksValid = tasks.every(isTaskValid);  

  const handleAddTask = () => {
    const newTask = addTask({
      name: "New Task",
      taskDescription: ""
    });
 
    setSelectedTaskId(newTask.id);
  };

  const handleDeleteTask = () => {
    if (tasks.length === 0) return;
    deleteTask(selectedTaskId);
    setSelectedTaskId(tasks.length > 1 ? tasks[0].id : '');
  };

  const handleUpdateTask = (field: keyof Task, value: string) => {
    const selectedTask = tasks.find((task) => task.id === selectedTaskId);
    if (!selectedTask) return;
    editTask({ ...selectedTask, [field]: value });  
  };

  const handleSaveAll = async () => {    
    await syncTasks();    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 bg-[#1E1E1E] border-[#3A3A3A]">
        <DialogHeader className="px-6 py-4 border-b border-[#3A3A3A]">
          <DialogTitle className="text-white text-base font-normal">
            Manage Tasks
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-[600px]">
          {/* Left Panel - Prompt List */}
          <div className="w-[200px] border-r border-[#3A3A3A] flex flex-col">
            <div className="p-3">
              <Button onClick={handleAddTask}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm transition-colors",
                    selectedTaskId === task.id
                      ? "bg-[#3A3A3A] text-white"
                      : "text-[#99A1AF] hover:bg-[#2A2A2A]",
                    !isTaskValid(task) && "border-l-2 border-red-500"
                  )}
                >
                  {task.name}
                  {!isTaskValid(task) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Edit Form */}
          <div className="flex-1 flex flex-col">
            {selectedTask && (
              <>
                <div className="flex items-center justify-between px-6 py-3 border-b border-[#3A3A3A]">
                  <span className="text-sm text-white">{selectedTask.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteTask}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Task Name */}
                  <div className="space-y-2">
                    <label className="text-sm text-white">Task Name</label>
                    <Input
                      value={selectedTask.name}
                      onChange={(e) => handleUpdateTask("name", e.target.value)}
                      className={cn("bg-[#2A2A2A] border-[#3A3A3A] text-white",
                        selectedTask.name.trim() === '' && "border-red-500"
                      )}

                    />
                    {selectedTask.name.trim() === '' && (
                      <p className="text-xs text-red-500">Task name is required</p>
                    )}
                  </div>

                  {/* Task Description */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-white">Task Description</label>
                      <p className="text-xs text-[#6A7282] mt-0.5">
                        This defines the AI's role and behavior
                      </p>
                    </div>
                    <Textarea
                      value={selectedTask.taskDescription}
                      onChange={(e) =>
                        handleUpdateTask("taskDescription", e.target.value)
                      }
                      className={cn("bg-[#2A2A2A] border-[#3A3A3A] text-white min-h-[100px] resize-none",
                        selectedTask.taskDescription.trim() === '' && "border-red-500"
                      )}
                    />
                    {selectedTask.taskDescription.trim() === '' && (
                      <p className="text-xs text-red-500">Task description is required</p>
                    )}
                  </div>                 
                </div>
              </>
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
          <Button
            onClick={handleSaveAll}
            disabled={!allTasksValid || tasks.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Save All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
