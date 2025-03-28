import ClientIcon from "~/client/images/computer-monitor-svgrepo-com.svg?react";
import ServerIcon from "~/client/images/server-svgrepo-com.svg?react";
import { useNodeStatus, useMemoryClock } from "~/store/memory";

const Section = () => {
  const clock = useMemoryClock();
  const nodeStatus = useNodeStatus();

  return (
    <section className="flex flex-col gap-7 justify-center items-center">
      <div className="flex items-center">
        <ClientIcon className="size-[50px]" />
        <ServerIcon className="size-[50px]" />
      </div>
      <div>Simulation Time : {clock} seconds </div>
      <div>Node Working Core : {nodeStatus}</div>
    </section>
  );
};

export default Section;
