import { redirect } from "next/navigation";
import { getContext } from "@/lib/data";

/** Telas do financeiro e do plano: só o dono da conta. */
export async function requireOwner() {
  const c = await getContext();
  if (c.role !== "dono") redirect("/pedidos");
  return c;
}
