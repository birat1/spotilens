import { ArrowBigUp, ArrowBigDown, CircleDotDashed,Minus } from "lucide-react";

type RankChangeDelta = {
    type: "UP" | "DOWN" | "SAME" | "NEW";
    delta: number;
}

type RankChangeProps = {
    change?: RankChangeDelta;
}

export function RankChange({ change }: RankChangeProps) {
  if (!change) return null;

  if (change.type === 'UP') {
    return (
      <span className="flex items-center gap-1 text-green-500">
        <ArrowBigUp fill="currentColor" className="size-4" aria-hidden="true" />
        <span className="text-xs font-bold">{change.delta}</span>
      </span>
    );
  }

  if (change.type === 'DOWN') {
    return (
      <span className="flex items-center gap-1 text-red-500">
        <ArrowBigDown fill="currentColor" className="size-4" aria-hidden="true" />
        <span className="text-xs font-bold">{change.delta}</span>
      </span>
    );
  }

  if (change.type === 'SAME') {
    return (
      <Minus
        className="size-3 fill-current text-muted-foreground"
        aria-hidden="true"
      />
    );
  }

  return (
    <span className="flex items-center gap-1 text-primary">
      <CircleDotDashed className="size-4" aria-hidden="true" />
      <span className="text-[10px] font-bold uppercase">New</span>
    </span>
  );
}
