"use client";

import { useEffect } from "react";

/**
 * Conta visitas e cliques nas páginas de upsell/downsell (tabela funnel_events no Supabase).
 * funnel = código do checkout de origem (vem do link "Sim, quero" do Digital Hub), para separar
 * Central 3D, STL Católico etc.
 */
export function FunnelTracker({ step, locale, funnel }: { step: "upsell" | "downsell"; locale: string; funnel?: string }) {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    let visitor = "";
    try {
      visitor = localStorage.getItem("nv_vid") || "";
      if (!visitor) {
        visitor = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("nv_vid", visitor);
      }
    } catch {}
    const send = (event: "view" | "yes" | "no") =>
      fetch(`${url}/rest/v1/funnel_events`, {
        method: "POST",
        keepalive: true,
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ step, event, locale, funnel: funnel || null, visitor: visitor || null }),
      }).catch(() => {});
    send("view");
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a[data-fe]") as HTMLAnchorElement | null;
      const ev = a?.dataset.fe;
      if (ev === "yes" || ev === "no") send(ev);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [step, locale, funnel]);
  return null;
}
