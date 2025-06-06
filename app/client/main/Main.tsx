import { stop, start, pause, resume, setSimulationSettings } from "~/engine/entryPoints";
import Header from "./Header";
import Section from "./Section";
import { useState } from "react";
import {
  STATUS,
  type ServerTask,
  type SimulationConfig,
  type Status,
} from "../lib/types";
import { getRandomId } from "../lib/utils";

const Main = () => {
  const [status, setStatus] = useState<Status>(STATUS.STOPPED);
  const [tasks, setTasks] = useState<ServerTask[]>([]);

  const setTotalRequest = (totalRequests: number) => setSimulationSettings({ totalRequest: totalRequests });
  const setScale = (scale: number) => setSimulationSettings({ simulationScale: scale });
  const setDifficulty = (difficulty: string) => setSimulationSettings({ difficulty });

  const onStartClick = (form: SimulationConfig): void => {
    setTotalRequest(form.requests);
    setScale(form.speed);
    setDifficulty(form.difficulty);
    if (status === STATUS.PAUSED) {
      resume();
    } else {
      start();
    }
    setStatus(STATUS.STARTED);
  };

  const onStopClick = (): void => {
    stop();
    setStatus(STATUS.STOPPED);
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
