
import { useState, useEffect } from "react";
import { generateUUID } from "../../lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { Task } from "./TaskContext";
import { TaskContext } from "./TaskContext";

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const result = await invoke('load_tasks');
                setTasks(result as Task[]);
            } catch (error) {
                console.error('Failed to load tasks:', error);
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        loadTasks();
    }, []);

    // TODO: Implement actual task loading and management
    const addTask = ({name, taskDescription}: Omit<Task, 'id'>) => {
        const newTask: Task = {
            id: generateUUID(),
            name,
            taskDescription
        };
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);        
        return newTask;
    };

    const editTask = (taskData: Task) => {
        try {
            const updatedTasks = tasks.map(task => task.id === taskData.id ? { 
                ...task, 
                name: taskData.name, 
                taskDescription: taskData.taskDescription
            } : task);
            setTasks(updatedTasks);    
        } catch (error) {
            console.error('Failed to edit task:', error);
        }
    };

    const deleteTask = (id: string) => {        
        try {
            const updatedTasks = tasks.filter(task => task.id !== id);
            setTasks(updatedTasks);
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const syncTasks = async () => {
        await invoke('save_tasks', { tasks });
    };

  return <TaskContext.Provider value={{ tasks, addTask, editTask, deleteTask, syncTasks }}>{children}</TaskContext.Provider>;
};