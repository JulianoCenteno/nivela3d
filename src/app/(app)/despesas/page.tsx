import { Wallet } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { Donut } from "@/components/finance";
import { MonthNav } from "@/components/MonthNav";
import { SubmitButton } from "@/components/SubmitButton";
import { Flash, PageHeader } from "@/components/ui";
import { getExpenses } from "@/lib/data";
import { CATEGORY_COLOR, EXPENSE_CATEGORIES, expensesByCategory, isExpenseCategory } from "@/lib/finance";
import { requireOwner } from "@/lib/guard";
import { monthRange, todayISO } from "@/lib/period";
import { getI18n, getT } from "@/i18n/server";
import { LOCALE_TAG } from "@/i18n/config";
import { deleteExpense, saveExpense } from "../finance-actions";

export async function generateMetadata() {
  return { title: (await getT()).finance.expenses.title };
}

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string; mes?: string }> }) {
  await requireOwner();
  const sp = await searchParams;
  const { t, fmt, locale } = await getI18n();
  const e_ = t.finance.expenses;
  const cat = t.finance.cat;
  const period = monthRange(sp.mes, LOCALE_TAG[locale]);
  const expenses = await getExpenses(period.from, period.to);
  const total = expenses.reduce((a, e) => a + e.amount, 0);
  const split = expensesByCategory(expenses);
  const today = todayISO();
  const defDate = today >= period.from && today <= period.to ? today : period.from;

  return (
    <>
      <PageHeader title={e_.title} description={e_.desc} action={<MonthNav base="/despesas" ym={period.ym} label={period.label} />} />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {expenses.length === 0 ? (
            <div className="card flex items-center gap-4 p-6 text-muted">
              <Wallet className="shrink-0 text-sage" /> {e_.none(period.label)}
            </div>
          ) : (
            <ul className="card divide-y divide-line">
              {expenses.map((e) => {
                const c = isExpenseCategory(e.category) ? e.category : "outros";
                return (
                  <li key={e.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{e.description}</p>
                      <p className="text-sm text-muted">
                        {fmt.short(e.spent_at)} · {cat[c]}
                      </p>
                    </div>
                    <p className="tnum shrink-0 font-semibold text-negative">− {fmt.money(e.amount)}</p>
                    <DeleteButton id={e.id} action={deleteExpense} label="" confirmText={e_.removeConfirm} />
                  </li>
                );
              })}
              <li className="flex justify-between bg-surface-2 px-5 py-3.5 font-bold">
                <span>{e_.total}</span>
                <span className="tnum">{fmt.money(total)}</span>
              </li>
            </ul>
          )}

          <section className="card p-6">
            <h2 className="font-bold">{e_.byCategory}</h2>
            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
              <Donut
                parts={split.map(([c, v]) => ({ label: cat[c], value: v, color: CATEGORY_COLOR[c] }))}
                center={fmt.money(total)}
                sub={t.finance.dash.total}
              />
              {split.length === 0 ? (
                <p className="text-muted">{e_.empty}</p>
              ) : (
                <ul className="w-full space-y-2.5">
                  {split.map(([c, v]) => (
                    <li key={c} className="flex items-center gap-2.5 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
                      <span className="flex-1 font-semibold text-ink-2">{cat[c]}</span>
                      <span className="tnum text-muted">{fmt.pct(total ? (v / total) * 100 : 0)}</span>
                      <span className="tnum w-28 text-right font-bold">{fmt.money(v)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <form action={saveExpense} className="card h-fit space-y-4 p-6">
          <h2 className="text-lg font-bold">{e_.form.title}</h2>
          <div>
            <label className="label" htmlFor="description">{e_.form.desc}</label>
            <input id="description" name="description" className="input" placeholder={e_.form.descPh} required maxLength={120} />
          </div>
          <div>
            <label className="label" htmlFor="category">{e_.form.category}</label>
            <select id="category" name="category" className="input" defaultValue="filamento">
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{cat[c]}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="amount">{e_.form.amount}</label>
              <input id="amount" name="amount" className="input tnum" inputMode="decimal" placeholder="0,00" required />
            </div>
            <div>
              <label className="label" htmlFor="spent_at">{e_.form.date}</label>
              <input id="spent_at" name="spent_at" type="date" className="input" defaultValue={defDate} required />
            </div>
          </div>
          <SubmitButton className="btn-primary w-full">{e_.form.save}</SubmitButton>
        </form>
      </div>
    </>
  );
}
