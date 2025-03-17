import { pause, start } from "~/engine/entryPoints";
import Header from "./Header";
import Section from "./Section";

const Main = () => {
  const onStartClick = (requestCounts: number): void => {
    console.log(requestCounts);
    start();
  };

  const onStopClick = (): void => {
    pause();
  };

  return (
    <main>
      <Header onStartClick={onStartClick} onStopClick={onStopClick} />
      <Section />
    </main>
  );
};

export default Main;
