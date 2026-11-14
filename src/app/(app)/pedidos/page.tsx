import { AlarmClock, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { Badge, EmpresaHint, UpgradeCard } from "@/components/gestao";
import { Empty, Flash, PageHeader } from "@/components/ui";
import { getContext } from "@/lib/data";
import { getOrders } from "@/lib/gestao-data";
import { deadlineInfo, deadlineText, itemsTotals, ORDER_TONE, type OrderStatus } from "@/lib/orders";
import { todayISO } from "@/lib/period";
import { hasFeature } from "@/lib/plans";
import { getI18n, getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).ops.orders.title };
}

const TABS: { key: "ativos" | Exclude<OrderStatus, "cancelado"> | "todos" }[] = [
  { key: "ativos" },
  { key: "novo" },
  { key: "producao" },
  { key: "pronto" },
  { key: "entregue" },
  { key: "todos" },
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string; ver?: string }> }) {
  const sp = await searchParams;
  const { plan } = await getContext();
  const { t: tt, fmt } = await getI18n();
  const o_ = tt.ops.orders;
  const money = fmt.money;
  if (!hasFeature(plan, "gestao")) {
    return (
      <>
        <PageHeader title={o_.title} />
        <UpgradeCard plan="Profissional" title={o_.lockedTitle} text={o_.lockedText} bullets={o_.lockedBullets} />
      </>
    );
  }
  const auto = hasFeature(plan, "automacoes");
  const today = todayISO();
  const orders = await getOrders();
  const tab = (TABS.find((t) => t.key === sp.ver)?.key ?? "ativos") as (typeof TABS)[number]["key"];
  const list = orders.filter((o) =>
    tab === "todos" ? true : tab === "ativos" ? ["novo", "producao", "pronto"].includes(o.status) : o.status === tab,
  );
  const alerts = auto ? orders.map((o) => ({ o, d: deadlineInfo(o, today) })).filter((x) => x.d) : [];
  const count = (k: string) =>
    k === "todos" ? orders.length : k === "ativos" ? orders.filter((o) => ["novo", "producao", "pronto"].includes(o.status)).length : orders.filter((o) => o.status === k).length;

  return (
    <>
      <PageHeader
        title={o_.title}
        description={o_.desc}
        action={
          <Link href="/pedidos/novo" className="btn-primary">
            <Plus size={18} /> {o_.new}
          </Link>
        }
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      {auto && alerts.length > 0 && (
        <div className="mb-6 rounded-2xl border border-[#E8C9A8] bg-[#FBF1E6] p-4 dark:border-[#5a4632] dark:bg-[#2b241c]">
          <p className="flex items-center gap-2 font-bold"><AlarmClock size={18} /> {o_.deadlines}</p>
          <ul className="mt-2 space-y-1 text-[15px]">
            {alerts.slice(0, 6).map(({ o, d }) => (
              <li key={o.id}>
                <Link href={`/pedidos/${o.id}`} className="hover:underline">
                  <b className={d!.level === "atrasado" ? "text-negative" : ""}>{deadlineText(d!, tt.gestao.deadline)}</b> · {tt.ops.quotes.num(o.number)} · {o.customer_name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!auto && <div className="mb-6"><EmpresaHint>{o_.alertsUpsell}</EmpresaHint></div>}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/pedidos?ver=${t.key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === t.key ? "bg-primary text-on-primary" : "bg-surface-2 text-ink-2 hover:bg-line"}`}
          >
            {o_.tabs[t.key]} <span className="opacity-70">{count(t.key)}</span>
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty icon={<ClipboardList size={28} />} title={o_.emptyTitle} text={o_.emptyText} href="/pedidos/novo" cta={o_.create} />
      ) : (
        <ul className="card divide-y divide-line">
          {list.map((o) => {
            const t = itemsTotals(o.items, o.discount, o.shipping);
            const st = { tone: ORDER_TONE[o.status], label: tt.gestao.orderStatus[o.status] };
            const d = auto ? deadlineInfo(o, today) : null;
            return (
              <li key={o.id}>
                <Link href={`/pedidos/${o.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      <span className="text-muted">{tt.ops.quotes.num(o.number)} · </span>
                      {o.customer_name}
                    </p>
                    <p className="truncate text-sm text-muted">
                      {o.due_date ? o_.due(fmt.short(o.due_date)) : o_.noDue} · {o.items.map((i) => `${i.qty}× ${i.description}`).join(", ")}
                    </p>
                    {d && <p className={`text-sm font-bold ${d.level === "atrasado" ? "text-negative" : "text-ink-2"}`}>{deadlineText(d, tt.gestao.deadline)}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tnum font-bold">{money(t.total)}</p>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
