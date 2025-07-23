import {
  stop,
  start,
  pause,
  resume,
  setSimulationSettings,
  resetSimulationResult,
} from "~/engine/entryPoints";
import Header from "./Header";
import Section from "./Section";
import { useEffect, useState } from "react";
import { STATUS, type SimulationConfig, type Status } from "../lib/types";
import {
  useConfigNodes,
  useElapsedTime,
  useIsSuccess,
  useProcessedRequestCount,
} from "~/store/memory";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "~/components/ui/dialog";
import { Button } from "../ui/button";

const Main = () => {
  const [status, setStatus] = useState<Status>(STATUS.STOPPED);
  const nodes = useConfigNodes();

  const [isOpen, setIsOpen] = useState(false);
  const isSucess = useIsSuccess();
  const processedReuqestCount = useProcessedRequestCount();
  const elapsedTime = useElapsedTime();

  useEffect(() => {
    if (isSucess === undefined) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
  }, [isSucess]);

  const onStartClick = (form: SimulationConfig): void => {
    setSimulationSettings({
      totalRequest: form.requests,
      simulationScale: form.speed,
      difficulty: form.difficulty,
      timeLimit: form.timeLimit * 1000,
      nodes: [{ ...nodes[0], coreCount: form.cores }],
    });

    if (status === STATUS.PAUSED && isSucess === undefined) {
      resume();
    } else {
      start();
    }
    setStatus(STATUS.STARTED);
  };

  const onStopClick = (): void => {
    stop();
    setStatus(STATUS.STOPPED);
  };

  const onPauseClick = (): void => {
    pause();
    setStatus(STATUS.PAUSED);
  };

  const onOpenChange = (open: boolean): void => {
    if (!open) {
      stop();
      setStatus(STATUS.STOPPED);
    }
    setIsOpen(open);
  };

  const onClose = (): void => {
    resetSimulationResult();
    setIsOpen(false);
  };

  return (
    <main className="grid grid-cols-[300px_1fr] h-screen w-full relative">
      <Header
        status={status}
        onStartClick={onStartClick}
        onStopClick={onStopClick}
        onPauseClick={onPauseClick}
      />
      <Section status={status} />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay className="bg-dark-opacity-500 fixed top-0 bottom-0 left-0 right-0" />
          <DialogContent className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl text-chart-1">
                {isSucess ? "SUCCESS!" : "Failed!"}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <div className="flex flex-col items-center gap-3">
                <div className="text-base font-medium">
                  Processed Requests: {processedReuqestCount}
                </div>
                <div className="text-base font-medium">
                  Elapsed Time: {elapsedTime.toFixed(5)} seconds
                </div>
              </div>
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={onClose}>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </main>
  );
};

export default Main;
