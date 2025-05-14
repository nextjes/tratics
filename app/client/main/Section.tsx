import React from "react";
import ClientIcon from "~/client/images/computer-monitor-svgrepo-com.svg?react";
import ServerIcon from "~/client/images/server-svgrepo-com.svg?react";
import { useNodes, useLinks } from "~/store/memory";
import ServerSpec from "../ui/ServerSpec";
import type { ServerTask, Status } from "../lib/types";

interface SectionProps {
  tasks: ServerTask[];
  status: Status;
  addTask: (taskTime: number) => void;
  deleteTask: (taskId: string) => void;
}

const Section = ({ tasks, status, addTask, deleteTask }: SectionProps) => {
  const nodeStatus = useNodes();
  const linkStatus = useLinks();

  return (
    <section className="flex flex-col gap-7 justify-center items-center">
      <ServerSpec
        tasks={tasks}
        status={status}
        addTask={addTask}
        deleteTask={deleteTask}
      />
      <div className="flex items-center">
        <ClientIcon className="size-[50px]" />
        <ServerIcon className="size-[50px]" />
      </div>
      {status !== "stopped" && (
        <>
          <div className="flex flex-col gap-1">
            Node status :
            <div className="flex flex-col gap-1">
              {nodeStatus && nodeStatus.length > 0 ? (
                <>
                  {nodeStatus.map((node) => (
                    <div key={node.id}>
                      {`[${node.cores.map((core) => core.status).join(", ")}]`}
                    </div>
                  ))}
                </>
              ) : (
                "No data"
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            link status :
            <div className="flex flex-col gap-1">
              {linkStatus && linkStatus.length > 0 ? (
                <>
                  {linkStatus.map((link) => (
                    <div key={`${link.srcId}-${link.dstId}`}>
                      {`${link.throughput} bps`}
                    </div>
                  ))}
                </>
              ) : (
                "No data"
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Section;
