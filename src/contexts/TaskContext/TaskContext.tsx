import { useContext, createContext } from "react";

export type Task = {
  id: string;
  name: string;
  taskDescription: string;
};

export type TaskContextProps = {
  tasks: Task[];
  addTask: (newTask: Omit<Task, 'id'>) => Task;
  editTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  syncTasks: () => Promise<void>;
};

export const TaskContext = createContext<TaskContextProps | null>(null);


export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};