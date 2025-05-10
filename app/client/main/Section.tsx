import React from "react";
import ClientIcon from "~/client/images/computer-monitor-svgrepo-com.svg?react";
import ServerIcon from "~/client/images/server-svgrepo-com.svg?react";
import { useSimulationTime, useNodes, useLinks } from "~/store/memory";
import ServerSpec from "../ui/ServerSpec";
import type { ServerTask } from "../lib/types";

interface SectionProps {
  tasks: ServerTask[];
  isStarted: boolean;
  addTask: (taskTime: number) => void;
  deleteTask: (taskId: string) => void;
}

const Section = ({ tasks, isStarted, addTask, deleteTask }: SectionProps) => {
  const clock = useSimulationTime();
  const nodeStatus = useNodes();
  const linkStatus = useLinks();

  const formattedNodeStatus =
    nodeStatus && nodeStatus.length > 0
      ? nodeStatus.map((node: any, index: number) => (
          <React.Fragment key={node.id}>
            [{`${node.cores.map((core: any) => core.status).join(", ")}`}]
            {index < nodeStatus.length - 1 && <br />}
          </React.Fragment>
        ))
      : "No data";

  const formattedLinkStatus =
    linkStatus && linkStatus.length > 0
      ? linkStatus.map((link: any, index: number) => (
          <React.Fragment key={link.id}>
            {`${link.throughput} bps`}
            {index < linkStatus.length - 1 && <br />}
          </React.Fragment>
        ))
      : "No data";

  return (
    <section className="flex flex-col gap-7 justify-center items-center">
      <ServerSpec
        tasks={tasks}
        isStarted={isStarted}
        addTask={addTask}
        deleteTask={deleteTask}
      />
      <div className="flex items-center">
        <ClientIcon className="size-[50px]" />
        <ServerIcon className="size-[50px]" />
      </div>
      {isStarted && (
        <>
          <div>Simulation Time : {clock} seconds </div>
          <div>Node status : {formattedNodeStatus}</div>
          <div>link status : {formattedLinkStatus}</div>
        </>
      )}
    </section>
  );
};

export default Section;
