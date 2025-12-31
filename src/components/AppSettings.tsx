import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import ManageTasks from "@/components/ManageTask";
import ManageAI from "@/components/ManageAI";

export default function AppSettings() {
  const [manageTasksOpen, setManageTasksOpen] = useState(false);
  const [manageAIOpen, setManageAIOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-1.5">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="mt-1 w-40 rounded-md border p-1"
        >
          <DropdownMenuItem
            className="text-sm"
            onSelect={() => setManageTasksOpen(true)}
          >
            Manage Task
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-sm"
            onSelect={() => setManageAIOpen(true)}
          >
            Manage AI
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ManageTasks open={manageTasksOpen} onOpenChange={setManageTasksOpen} />
      <ManageAI open={manageAIOpen} onOpenChange={setManageAIOpen} />
    </>
  );
}
