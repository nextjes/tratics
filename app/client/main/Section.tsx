import React from "react";
import ClientIcon from "~/client/images/computer-monitor-svgrepo-com.svg?react";
import ServerIcon from "~/client/images/server-svgrepo-com.svg?react";
import { useNodeStatus, useMemoryClock, useLinkStatus } from "~/store/memory";
import ServerSpec from "../ui/ServerSpec";

interface SectionProps {
  isStarted: boolean;
}

const Section = ({ isStarted }: SectionProps) => {
  const clock = useMemoryClock();
  const nodeStatus = useNodeStatus();
  const linkStatus = useLinkStatus();

  const formattedNodeStatus =
    nodeStatus && nodeStatus.length > 0
      ? nodeStatus.map((node: any, index: number) => (
          <React.Fragment key={node.id}>
            {`${node.busyCores}/${node.cores} cores busy`}
            {index < nodeStatus.length - 1 && <br />}
          </React.Fragment>
        ))
      : "No data";

  const formattedLinkStatus =
    linkStatus && linkStatus.length > 0
      ? linkStatus.map((link: any, index: number) => (
          <React.Fragment key={link.id}>
            {`${link.throughput} / ${link.bandwidth} bps`}
            {index < linkStatus.length - 1 && <br />}
          </React.Fragment>
        ))
      : "No data";

  return (
    <section className="flex flex-col gap-7 justify-center items-center">
      <ServerSpec isStarted={isStarted} />
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
