"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getContext } from "@/lib/data";
import { isExpenseCategory } from "@/lib/finance";
import { fnum, friendlyError, fstr } from "@/lib/format";
import { todayISO } from "@/lib/period";
import { getT } from "@/i18n/server";

const back = (path: string, kind: "ok" | "erro", msg: string): never => {
  revalidatePath("/", "layout");
  redirect(`${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(msg)}`);
};

const monthOf = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? d.slice(0, 7) : "");

export async function saveExpense(fd: FormData) {
  const t = await getT();
  const f = t.finance.expenses;
  const { supabase, accountId } = await getContext();
  const description = fstr(fd, "description");
  const amount = fnum(fd, "amount");
  const cat = String(fd.get("category") ?? "");
  const spentAt = String(fd.get("spent_at") ?? "") || todayISO();
  const path = `/despesas?mes=${monthOf(spentAt)}`;
  if (!description || amount <= 0) back(path, "erro", f.needDesc);
  const { error } = await supabase.from("expenses").insert({
    user_id: accountId,
    description,
    category: isExpenseCategory(cat) ? cat : "outros",
    amount,
    spent_at: spentAt,
  });
  if (error) back(path, "erro", error.code === "42P01" ? f.notReady : friendlyError(error.message, t.common.errors));
  back(path, "ok", f.saved);
}

export async function deleteExpense(fd: FormData) {
  const t = await getT();
  const { supabase } = await getContext();
  await supabase.from("expenses").delete().eq("id", String(fd.get("id")));
  back("/despesas", "ok", t.finance.expenses.removed);
}

export async function saveGoals(fd: FormData) {
  const t = await getT();
  const { supabase, accountId } = await getContext();
  const { data: cur } = await supabase.from("settings").select("user_id").eq("user_id", accountId).maybeSingle();
  const goals = { goal_revenue: Math.max(0, fnum(fd, "goal_revenue")), goal_profit: Math.max(0, fnum(fd, "goal_profit")), updated_at: new Date().toISOString() };
  const { error } = cur
    ? await supabase.from("settings").update(goals).eq("user_id", accountId)
    : await supabase.from("settings").insert({ user_id: accountId, ...goals });
  if (error) back("/metas", "erro", friendlyError(error.message, t.common.errors));
  back("/metas", "ok", t.finance.goals.saved);
}
