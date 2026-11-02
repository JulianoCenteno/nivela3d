import { AlarmClock, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { Badge, EmpresaHint, UpgradeCard } from "@/components/gestao";
import { Empty, Flash, PageHeader } from "@/components/ui";
import { getContext } from "@/lib/data";
import { money } from "@/lib/format";
import { getOrders } from "@/lib/gestao-data";
import { deadlineInfo, itemsTotals, ORDER_STATUS, type OrderStatus } from "@/lib/orders";
import { fmtDate, todayISO } from "@/lib/period";
import { hasFeature } from "@/lib/plans";

export const metadata = { title: "Pedidos" };

const TABS: { key: "ativos" | OrderStatus | "todos"; label: string }[] = [
  { key: "ativos", label: "Em andamento" },
  { key: "novo", label: "Novos" },
  { key: "producao", label: "Em produção" },
  { key: "pronto", label: "Prontos" },
  { key: "entregue", label: "Entregues" },
  { key: "todos", label: "Todos" },
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string; ver?: string }> }) {
  const sp = await searchParams;
  const { plan } = await getContext();
  if (!hasFeature(plan, "gestao")) {
    return (
      <>
        <PageHeader title="Pedidos" />
        <UpgradeCard
          plan="Profissional"
          title="Todos os pedidos num lugar só"
          text="Saiba o que está na fila, o que está imprimindo e o que já pode ser entregue, sem planilha e sem caderninho."
          bullets={["Etapas: novo, em produção, pronto, entregue", "Prazo de entrega de cada pedido", "Lançar a venda com 1 clique quando entregar"]}
        />
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
        title="Pedidos"
        description="Acompanhe cada pedido da fila de impressão até a entrega."
        action={
          <Link href="/pedidos/novo" className="btn-primary">
            <Plus size={18} /> Novo pedido
          </Link>
        }
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      {auto && alerts.length > 0 && (
        <div className="mb-6 rounded-2xl border border-[#E8C9A8] bg-[#FBF1E6] p-4 dark:border-[#5a4632] dark:bg-[#2b241c]">
          <p className="flex items-center gap-2 font-bold"><AlarmClock size={18} /> Atenção aos prazos</p>
          <ul className="mt-2 space-y-1 text-[15px]">
            {alerts.slice(0, 6).map(({ o, d }) => (
              <li key={o.id}>
                <Link href={`/pedidos/${o.id}`} className="hover:underline">
                  <b className={d!.level === "atrasado" ? "text-negative" : ""}>{d!.text}</b> · nº {o.number} · {o.customer_name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!auto && <div className="mb-6"><EmpresaHint>Alertas de pedidos atrasados e de entrega nos próximos dias:</EmpresaHint></div>}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/pedidos?ver=${t.key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === t.key ? "bg-primary text-on-primary" : "bg-surface-2 text-ink-2 hover:bg-line"}`}
          >
            {t.label} <span className="opacity-70">{count(t.key)}</span>
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty icon={<ClipboardList size={28} />} title="Nenhum pedido aqui" text="Crie um pedido ou transforme um orçamento aprovado em pedido." href="/pedidos/novo" cta="Criar pedido" />
      ) : (
        <ul className="card divide-y divide-line">
          {list.map((o) => {
            const t = itemsTotals(o.items, o.discount, o.shipping);
            const st = ORDER_STATUS[o.status];
            const d = auto ? deadlineInfo(o, today) : null;
            return (
              <li key={o.id}>
                <Link href={`/pedidos/${o.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      <span className="text-muted">nº {o.number} · </span>
                      {o.customer_name}
                    </p>
                    <p className="truncate text-sm text-muted">
                      {o.due_date ? `Entrega ${fmtDate(o.due_date)}` : "Sem prazo"} · {o.items.map((i) => `${i.qty}× ${i.description}`).join(", ")}
                    </p>
                    {d && <p className={`text-sm font-bold ${d.level === "atrasado" ? "text-negative" : "text-ink-2"}`}>{d.text}</p>}
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
