import ServerIcon from "~/client/images/server-svgrepo-com.svg?react";

interface ServerSpecProps {
  isStarted: boolean;
}

const ServerSpec = ({ isStarted }: ServerSpecProps) => {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center mt-6">
      <div className="w-[300px] bg-slate-600 text-slate-300 border rounded-md flex flex-col gap-2 border-slate-400 text-center py-4">
        <div className="flex items-center gap-1 border-b border-slate-400 pb-2 px-4 justify-center">
          <ServerIcon className="size-[24px] [&_path]:fill-slate-300" />
          Spec
        </div>
        <div className="text-slate-100 px-6 pb-2 text-lg font-bold">2 core</div>
        <div>
          {!isStarted && (
            <button className="cursor-pointer border border-slate-300 bg-slate-800 px-1.5 py-2 rounded-md hover:bg-slate-400 hover:text-slate-800">
              add task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerSpec;
