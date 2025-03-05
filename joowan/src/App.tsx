import React from "react";
import { start, pause } from "@/SimulationEngine/main";

function App() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
    </div>
  );
}

export default App;
