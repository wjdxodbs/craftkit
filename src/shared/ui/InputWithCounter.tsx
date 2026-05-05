import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { labelCls } from "@/shared/ui/styles";

type Props = Omit<React.ComponentProps<"input">, "maxLength"> & {
  id: string;
  value: string;
  maxLength: number;
  label?: string;
};

export function InputWithCounter({
  id,
  value,
  maxLength,
  label,
  className,
  ...rest
}: Props) {
  const isNearMax = value.length >= maxLength * 0.9;
  const field = (
    <div className="relative">
      <Input
        {...rest}
        id={id}
        value={value}
        maxLength={maxLength}
        className={cn("pr-14", className)}
      />
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px]",
          isNearMax ? "text-[#a78bfa]" : "text-[#888]",
        )}
      >
        {value.length} / {maxLength}
      </span>
    </div>
  );

  if (!label) return field;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={labelCls}>
        {label}
      </Label>
      {field}
    </div>
  );
}
