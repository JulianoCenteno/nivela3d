import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { shiftMonth } from "@/lib/period";

export function MonthNav({ base, ym, label }: { base: string; ym: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
      <Link href={`${base}?mes=${shiftMonth(ym, -1)}`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink" aria-label="Mês anterior">
        <ChevronLeft size={18} />
      </Link>
      <span className="min-w-36 text-center text-sm font-bold">{label}</span>
      <Link href={`${base}?mes=${shiftMonth(ym, 1)}`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink" aria-label="Próximo mês">
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
