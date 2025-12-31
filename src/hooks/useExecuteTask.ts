import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

interface ExecuteTaskResponse {
    content: string;
}

export const useExecuteTask = () => {
    const [loading, setLoading] = useState(false);
    const executeTask = async (params: {taskId: string, providerId: string, model: string, input: string}) => {
        setLoading(true);
        const result = await invoke<ExecuteTaskResponse>("execute_task", params);
        setLoading(false);
        return result;
    }   

    return { executeTask, loading };
}