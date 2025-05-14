import { stop, start, pause, resume } from "~/engine/entryPoints";
import Header from "./Header";
import Section from "./Section";
import { useState } from "react";
import {
  type ServerTask,
  type SimulationConfig,
  type Status,
} from "../lib/types";
import { getRandomId } from "../lib/utils";

const Main = () => {
  const [status, setStatus] = useState<Status>("stopped");
  const [tasks, setTasks] = useState<ServerTask[]>([]);

  const onStartClick = (form: SimulationConfig): void => {
    console.log(form);
    if (status === "paused") {
      resume();
    } else {
      start();
    }
    setStatus("started");
  };

  const onStopClick = (): void => {
    stop();
    setStatus("stopped");
  };

  const addTask = (taskTime: number): void => {
    setTasks((prev) => [...prev, { id: getRandomId(), time: taskTime }]);
  };

  const deleteTask = (taskId: string): void => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const onPauseClick = (): void => {
    pause();
    setStatus("paused");
  };

  return (
    <main>
      <Header
        status={status}
        onStartClick={onStartClick}
        onStopClick={onStopClick}
        onPauseClick={onPauseClick}
      />
      <Section
        tasks={tasks}
        status={status}
        addTask={addTask}
        deleteTask={deleteTask}
      />
    </main>
  );
};

export default Main;
