import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/format";
import { cleanItems, itemsTotals } from "@/lib/orders";
import { approveQuote } from "./actions";

export const metadata: Metadata = { title: "Orçamento", robots: { index: false } };

type Pub = {
  number: number;
  customer_name: string;
  items: unknown;
  discount: number;
  shipping: number;
  valid_until: string | null;
  delivery_days: number | null;
  notes: string | null;
  status: string;
  business_name: string;
  expired: boolean;
};

const br = (iso: string) => iso.split("-").reverse().join("/");

export default async function PublicQuote({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ r?: string }> }) {
  const [{ token }, sp] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_quote", { p_token: token });
  if (!data) notFound();
  const q = data as Pub;
  const items = cleanItems(q.items);
  const t = itemsTotals(items, Number(q.discount), Number(q.shipping));
  const approved = q.status === "aprovado" || q.status === "convertido" || sp.r === "aprovado" || sp.r === "ja_aprovado";
  const blocked = !approved && (q.expired || q.status === "recusado");

  return (
    <main className="min-h-dvh bg-bg px-4 py-10">
      <div className="mx-auto max-w-lg">
        <p className="text-center text-sm font-bold uppercase tracking-wider text-sage">{q.business_name}</p>
        <h1 className="mt-1 text-center text-3xl font-extrabold tracking-tight">Orçamento nº {q.number}</h1>
        <p className="mt-1 text-center text-muted">Para {q.customer_name}</p>

        <section className="card mt-8 p-6">
          <ul className="divide-y divide-line">
            {items.map((i, k) => (
              <li key={k} className="flex justify-between gap-4 py-3">
                <span><b>{i.qty}×</b> {i.description}</span>
                <span className="tnum font-semibold">{money(i.qty * i.unit_price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-4">
            {Number(q.discount) > 0 && <div className="flex justify-between"><dt className="text-muted">Desconto</dt><dd className="tnum">-{money(q.discount)}</dd></div>}
            {Number(q.shipping) > 0 && <div className="flex justify-between"><dt className="text-muted">Frete</dt><dd className="tnum">{money(q.shipping)}</dd></div>}
            <div className="flex justify-between text-xl font-extrabold"><dt>Total</dt><dd className="tnum">{money(t.total)}</dd></div>
          </dl>
          <div className="mt-4 space-y-1 text-sm text-muted">
            {q.delivery_days ? <p>Prazo de produção: {q.delivery_days} dias após a aprovação</p> : null}
            {q.valid_until ? <p>Válido até {br(q.valid_until)}</p> : null}
          </div>
          {q.notes && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-[15px]">{q.notes}</p>}
        </section>

        <div className="mt-6">
          {approved ? (
            <div className="rounded-2xl bg-primary-soft p-5 text-center text-primary">
              <CheckCircle2 className="mx-auto" size={30} />
              <p className="mt-2 text-lg font-bold">Orçamento aprovado!</p>
              <p className="text-[15px]">Seu pedido já está na fila de produção. Obrigado!</p>
            </div>
          ) : blocked ? (
            <p className="rounded-2xl bg-surface-2 p-5 text-center text-muted">Este orçamento não está mais disponível. Fale com {q.business_name} para um novo.</p>
          ) : (
            <form action={approveQuote}>
              <input type="hidden" name="token" value={token} />
              <SubmitButton className="btn-primary w-full py-4 text-lg" pendingText="Aprovando…">Aprovar orçamento</SubmitButton>
              <p className="mt-2 text-center text-sm text-muted">Ao aprovar, seu pedido entra na fila de produção.</p>
            </form>
          )}
        </div>
        <p className="mt-10 text-center text-xs text-muted">Orçamento gerado com Nivela 3D</p>
      </div>
    </main>
  );
}
