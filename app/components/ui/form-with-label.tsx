import { cn } from "~/client/lib/utils";

interface FormWithLabelProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

const FormWithLabel = ({
  label,
  children,
  className,
  labelClassName,
}: FormWithLabelProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-2",
        className
      )}
    >
      <h6 className={labelClassName}>{label}</h6>
      {children}
    </div>
  );
};

export default FormWithLabel;
