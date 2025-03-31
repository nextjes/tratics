import { stop, start } from "~/engine/entryPoints";
import Header from "./Header";
import Section from "./Section";
import { useState } from "react";
import type { ServerTask } from "../lib/types";
import { getRandomId } from "../lib/utils";

const Main = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [tasks, setTasks] = useState<ServerTask[]>([]);

  const onStartClick = (requestCounts: number): void => {
    console.log(requestCounts);
    start();
    setIsStarted(true);
  };

  const onStopClick = (): void => {
    stop();
    setIsStarted(false);
  };

  const addTask = (taskTime: number): void => {
    setTasks((prev) => [...prev, { id: getRandomId(), time: taskTime }]);
  };

  const deleteTask = (taskId: string): void => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <main>
      <Header onStartClick={onStartClick} onStopClick={onStopClick} />
      <Section
        tasks={tasks}
        isStarted={isStarted}
        addTask={addTask}
        deleteTask={deleteTask}
      />
    </main>
  );
};

export default Main;
