import HomeScreen from "./screens/HomeScreen";
import "./App.css";
import { TaskProvider } from "./contexts/TaskContext/TaskProvider";
import { AiProviderProvider } from "./contexts/AiProviderContext/AiProviderProvider";

function App() {  
  return (
    <AiProviderProvider>
      <TaskProvider>
        <HomeScreen />
      </TaskProvider>
    </AiProviderProvider>
  ); 
}

export default App;
