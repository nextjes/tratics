import { stop, start } from "~/engine/entryPoints";
import Header from "./Header";
import Section from "./Section";
import { useState } from "react";

const Main = () => {
  const [isStarted, setIsStarted] = useState(false);

  const onStartClick = (requestCounts: number): void => {
    console.log(requestCounts);
    start();
    setIsStarted(true);
  };

  const onStopClick = (): void => {
    stop();
    setIsStarted(false);
  };

  return (
    <main>
      <Header onStartClick={onStartClick} onStopClick={onStopClick} />
      <Section isStarted={isStarted} />
    </main>
  );
};

export default Main;
