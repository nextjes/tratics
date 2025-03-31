import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "./button";
import { Input } from "./input";
import { useState } from "react";

interface AddTaskModalProps {
  addTask: (taskTime: number) => void;
  onDialogClose: () => void;
}

const AddTaskModal = ({ addTask, onDialogClose }: AddTaskModalProps) => {
  const [taskTime, setTaskTime] = useState("");

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !taskTime) return;
    handleAddClick();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const regExp = /^[0-9]*$/;
    if (!regExp.test(value)) return;
    setTaskTime(value);
  };

  const handleAddClick = () => {
    if (!taskTime) return;
    addTask(+taskTime);
    setTaskTime("");
    onDialogClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Task</DialogTitle>
      </DialogHeader>
      <div>
        <label>작업 소요 시간(ms)</label>
        <Input
          value={taskTime}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
      </div>
      <DialogFooter>
        <Button onClick={handleAddClick} disabled={!taskTime}>
          Add
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddTaskModal;
