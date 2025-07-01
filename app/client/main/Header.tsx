import { useState } from "react";
import { Button } from "~/client/ui/button";
import { Input } from "~/client/ui/input";
import { DEFAULT_CORES, DEFAULT_REQUEST_COUNTS } from "~/client/lib/constants";
import FormWithLabel from "~/components/ui/form-with-label";
import {
  SPPED,
  STATUS,
  type SimulationConfig,
  type Status,
} from "../lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { setSimulationSettings } from "~/engine/entryPoints";
import { useSimulationScale } from "~/store/memory";

interface HeaderProps {
  status: Status;
  onStartClick: (form: SimulationConfig) => void;
  onStopClick: () => void;
  onPauseClick: () => void;
}

const Header = ({
  status,
  onStartClick,
  onStopClick,
  onPauseClick,
}: HeaderProps) => {
  const [requestCounts, setRequestCounts] = useState(DEFAULT_REQUEST_COUNTS);
  const [cores, setCores] = useState(DEFAULT_CORES);
  const [timeLimit, setTimeLimit] = useState(30);
  const speed = useSimulationScale();

  const handleCoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const regExp = /^[0-9]*$/;
    const { value } = e.target;
    if (!regExp.test(value)) return;
    const coreValue = Number(value);
    setCores(coreValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const regExp = /^[0-9]*$/;
    const { value } = e.target;
    if (!regExp.test(value)) return;
    setRequestCounts(Number(value));
  };

  const handleStartClick = () => {
    if (!requestCounts) return;

    if (!cores) {
      alert("Please set the number of cores.");
      return;
    }

    if (!timeLimit) {
      alert("Please set the time limit.");
      return;
    }

    onStartClick({
      requests: requestCounts,
      difficulty: "NORMAL",
      nodes: 1,
      cores,
      speed,
      timeLimit,
    });
  };

  const onSpeedChange = (value: string) => {
    setSimulationSettings({ simulationScale: +value });
  };

  const handleStopClick = () => {
    onStopClick();
  };

  return (
    <header className="py-8 bg-slate-800 text-slate-200 w-full flex flex-col justify-center items-center gap-10">
      <div className="flex justify-center items-center gap-3">
        <FormWithLabel label="Difficulty">
          <Input defaultValue={"NORMAL"} disabled />
        </FormWithLabel>
        <FormWithLabel label="Nodes">
          <Input defaultValue={1} disabled />
        </FormWithLabel>
      </div>
      <div className="flex justify-center items-center gap-5">
        <FormWithLabel label="Cores">
          <Input
            onChange={handleCoreChange}
            disabled={status !== STATUS.STOPPED}
            value={cores}
            className="max-w-[150px] bg-slate-50 text-slate-950"
          />
        </FormWithLabel>
        <FormWithLabel label="Requests">
          <Input
            onChange={handleInputChange}
            disabled={status !== STATUS.STOPPED}
            value={requestCounts}
            className="max-w-[150px] bg-slate-50 text-slate-950"
          />
        </FormWithLabel>
        <FormWithLabel label="Time Limit(second)">
          <Input
            onChange={(e) => {
              const regExp = /^[0-9]*$/;
              const { value } = e.target;
              if (!regExp.test(value)) return;
              setTimeLimit(Number(value));
            }}
            disabled={status !== STATUS.STOPPED}
            value={timeLimit}
            className="max-w-[150px] bg-slate-50 text-slate-950"
          />
        </FormWithLabel>
      </div>
      <div className="flex justify-center items-center gap-3">
        {status !== "stopped" ? (
          <>
            {status === STATUS.STARTED ? (
              <Button onClick={onPauseClick} className="bg-slate-500">
                Pause
              </Button>
            ) : (
              <Button onClick={handleStartClick} className="bg-slate-500">
                Start
              </Button>
            )}
            <Button onClick={handleStopClick} className="bg-red-400">
              Stop
            </Button>
          </>
        ) : (
          <Button onClick={handleStartClick} className="bg-slate-500">
            Start
          </Button>
        )}
        <Select value={speed.toString()} onValueChange={onSpeedChange}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Speed" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(SPPED).map((key) => (
              <SelectItem
                key={key}
                value={SPPED[key as keyof typeof SPPED].toString()}
              >
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
};

export default Header;
