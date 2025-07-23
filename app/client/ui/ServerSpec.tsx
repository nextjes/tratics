import ServerIcon from "~/client/images/server-svgrepo-com.svg?react";
import type { Status } from "../lib/types";
import {
  useConfigNodes,
  useSimulationTime,
  useSuccessRequest,
  useTimeLimit,
  useTotalRequest,
} from "~/store/memory";
import { Progress } from "~/components/ui/progress";

interface ServerSpecProps {
  status: Status;
}

const ServerSpec = ({ status }: ServerSpecProps) => {
  const time = useSimulationTime();
  const totalRequests = useTotalRequest();
  const successRequests = useSuccessRequest();
  const configNodes = useConfigNodes();
  const timeLimit = useTimeLimit();

  return (
    <div className="absolute right-5 top-5 flex flex-col justify-center items-center mt-6">
      <div className="w-[300px] bg-slate-600 text-slate-300 border rounded-md flex flex-col gap-2 border-slate-400 text-center py-4">
        <div className="flex items-center gap-1 border-b border-slate-400 pb-2 px-4 justify-center">
          <ServerIcon className="size-[24px] [&_path]:fill-slate-300" />
          Spec
        </div>
        <div className="text-slate-100 px-6 py-3 text-lg font-bold">
          {configNodes[0].coreCount} core
        </div>
        {status !== "stopped" && (
          <div className="flex flex-col gap-3">
            <h6>Status</h6>
            <div className="grid grid-cols-[1fr_2fr] gap-2 px-6">
              <div className="text-left">Time</div>
              <div>
                {time}s / {Math.round(timeLimit / 1000)}s
              </div>
              <div className="text-left">Requests</div>
              <div className="flex flex-col gap-1">
                <Progress
                  value={(successRequests / totalRequests) * 100 || 0}
                  className="h-5"
                />
                <span className="text-sm text-slate-400">{`${successRequests} / ${totalRequests} (${(
                  (successRequests / totalRequests) * 100 || 0
                ).toFixed(2)}%)`}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerSpec;
