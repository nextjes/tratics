import Header from "./Header";
import Section from "./Section";

const Main = () => {
  const onStartClick = (requestCounts: number): void => {
    console.log(requestCounts);
  };

  return (
    <main>
      <Header onStartClick={onStartClick} />
      <Section />
    </main>
  );
};

export default Main;
