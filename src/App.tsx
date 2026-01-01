import HomeScreen from "./screens/HomeScreen";
import "./App.css";
import { TaskProvider } from "./contexts/TaskContext/TaskProvider";
import { AiProviderProvider } from "./contexts/AiProviderContext/AiProviderProvider";
import { Toaster } from "@/components/ui/sonner"

function App() {  
  return (
    <AiProviderProvider>
      <TaskProvider>
        <HomeScreen />
        <Toaster />
      </TaskProvider>
    </AiProviderProvider>
  ); 
}

export default App;
