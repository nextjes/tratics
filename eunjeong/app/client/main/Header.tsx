import { useState } from "react";
import { Button } from "~/client/ui/button";
import { Input } from "~/client/ui/input";
import { DEFAULT_REQUEST_COUNTS } from "~/client/lib/constants";
import { useIsRunning } from "~/store/memory";

interface HeaderProps {
  onStartClick: (requestCounts: number) => void;
  onStopClick: () => void;
}

const Header = ({ onStartClick, onStopClick }: HeaderProps) => {
  const [requestCounts, setRequestCounts] = useState(DEFAULT_REQUEST_COUNTS);
  const isRunning = useIsRunning();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const regExp = /^[0-9]*$/;
    const { value } = e.target;
    if (!regExp.test(value)) return;
    setRequestCounts(Number(value));
  };

  const handleStartClick = () => {
    if (!requestCounts) return;
    onStartClick(requestCounts);
  };

  const handleStopClick = () => {
    onStopClick();
  };

  return (
    <header className="py-8 bg-slate-800 text-slate-200 w-full flex justify-center items-center gap-10">
      <div className="flex items-center justify-center gap-3">
        <h6>Requests</h6>
        <Input
          onChange={handleInputChange}
          value={requestCounts}
          className="max-w-[150px] bg-slate-50 text-slate-950"
        />
      </div>
      {isRunning ? (
        <Button onClick={handleStopClick} className="bg-red-400">
          Stop
        </Button>
      ) : (
        <Button onClick={handleStartClick} className="bg-slate-500">
          Start
        </Button>
      )}
    </header>
  );
};

export default Header;
