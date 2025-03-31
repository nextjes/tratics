import ServerIcon from "~/client/images/server-svgrepo-com.svg?react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import AddTaskModal from "./AddTaskModal";
import type { ServerTask } from "../lib/types";
import { useState } from "react";

interface ServerSpecProps {
  isStarted: boolean;
  tasks: ServerTask[];
  addTask: (taskTime: number) => void;
  deleteTask: (taskId: string) => void;
}

const ServerSpec = ({
  tasks,
  isStarted,
  addTask,
  deleteTask,
}: ServerSpecProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            {!isStarted && (
              <DialogTrigger className="cursor-pointer border border-slate-300 bg-slate-800 px-1.5 py-2 rounded-md hover:bg-slate-400 hover:text-slate-800 mt-5">
                add task
              </DialogTrigger>
            )}
            <AddTaskModal addTask={addTask} onDialogClose={onDialogClose} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ServerSpec;
