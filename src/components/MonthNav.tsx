import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { shiftMonth } from "@/lib/period";
import { getT } from "@/i18n/server";

export async function MonthNav({ base, ym, label }: { base: string; ym: string; label: string }) {
  const t = await getT();
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
      <Link href={`${base}?mes=${shiftMonth(ym, -1)}`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink" aria-label={t.common.month.prev}>
        <ChevronLeft size={18} />
      </Link>
      <span className="min-w-36 text-center text-sm font-bold">{label}</span>
      <Link href={`${base}?mes=${shiftMonth(ym, 1)}`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink" aria-label={t.common.month.next}>
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
