import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

interface ExecuteTaskResponse {
    content: string;
}

export const useExecuteTask = () => {
    const [loading, setLoading] = useState(false);
    
    const executeTask = async (params: {taskId: string, providerId: string, model: string, input: string}) => {
        try {
            setLoading(true);
            return invoke<ExecuteTaskResponse>("execute_task", params);            
        } finally {
            setLoading(false);
        }
    }   

    return { executeTask, loading };
}