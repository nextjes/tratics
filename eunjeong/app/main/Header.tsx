import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { DEFAULT_REQUEST_COUNTS } from "~/lib/constants";

interface HeaderProps {
  onStartClick: (requestCounts: number) => void;
}

const Header = ({ onStartClick }: HeaderProps) => {
  const [requestCounts, setRequestCounts] = useState(DEFAULT_REQUEST_COUNTS);

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
      <Button onClick={handleStartClick} className="bg-slate-500">
        Start
      </Button>
    </header>
  );
};

export default Header;
