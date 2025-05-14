import ServerIcon from "~/client/images/server-svgrepo-com.svg?react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import AddTaskModal from "./AddTaskModal";
import type { ServerTask, Status } from "../lib/types";
import { useState } from "react";
import {
  useSimulationTime,
  useSuccessRequest,
  useTotalRequest,
} from "~/store/memory";

interface ServerSpecProps {
  status: Status;
  tasks: ServerTask[];
  addTask: (taskTime: number) => void;
  deleteTask: (taskId: string) => void;
}

const ServerSpec = ({
  tasks,
  status,
  addTask,
  deleteTask,
}: ServerSpecProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const time = useSimulationTime();
  const totalRequests = useTotalRequest();
  const successRequests = useSuccessRequest();

  const onDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDeleteClick =
    (taskId: string): VoidFunction =>
    (): void => {
      deleteTask(taskId);
    };

  return (
    <div className="h-full w-full flex flex-col justify-center items-center mt-6">
      <div className="w-[400px] bg-slate-600 text-slate-300 border rounded-md flex flex-col gap-2 border-slate-400 text-center py-4">
        <div className="flex items-center gap-1 border-b border-slate-400 pb-2 px-4 justify-center">
          <ServerIcon className="size-[24px] [&_path]:fill-slate-300" />
          Spec
        </div>
        <div className="text-slate-100 px-6 pb-2 text-lg font-bold">2 core</div>
        <div>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="px-6 py-1.5 flex w-full justify-between hover:bg-slate-200 hover:text-slate-800"
            >
              <div className="flex items-center gap-2 w-[250px]">
                <div className="flex-1 grow-[1.5]">{task.id}: </div>
                <div className="flex-2 text-left">{task.time} ms</div>
              </div>
              <button
                className="border border-slate-950 p-1 rounded-sm bg-slate-500 cursor-pointer"
                onClick={handleDeleteClick(task.id)}
              >
                delete
              </button>
            </div>
          ))}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {status === "stopped" && (
              <DialogTrigger className="cursor-pointer border border-slate-300 bg-slate-800 px-1.5 py-2 rounded-md hover:bg-slate-400 hover:text-slate-800 mt-5">
                add task
              </DialogTrigger>
            )}
            <AddTaskModal addTask={addTask} onDialogClose={onDialogClose} />
          </Dialog>
        </div>
        {status !== "stopped" && (
          <div>
            <h6>Status</h6>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <div>Time</div>
              <div>{time}s</div>
              <div>Requests</div>
              <div>{`${successRequests} / ${totalRequests} (${(
                (successRequests / totalRequests) * 100 || 0
              ).toFixed(2)}%)`}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerSpec;
