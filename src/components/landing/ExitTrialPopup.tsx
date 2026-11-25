"use client";

import { useEffect, useState } from "react";
import { NivoAvatar } from "@/components/NivoAvatar";

type Txt = { kicker: string; title: string; p: string; cta: string; close: string };

/**
 * Pop-up de saída com o teste grátis. Aparece uma vez por sessão:
 * no computador, quando o mouse sai pelo topo da página; no celular,
 * quando a pessoa rola rápido para cima depois de já ter descido bastante.
 */
export function ExitTrialPopup({ t, href }: { t: Txt; href: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const KEY = "nv_exit_trial";
    try { if (sessionStorage.getItem(KEY)) return; } catch {}
    const armedAt = Date.now() + 8000;
    let shown = false;
    const show = () => {
      if (shown || Date.now() < armedAt) return;
      shown = true;
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      setOpen(true);
    };
    const onOut = (e: MouseEvent) => { if (!e.relatedTarget && e.clientY <= 0) show(); };
    let lastY = window.scrollY, lastT = Date.now(), maxY = 0;
    const onScroll = () => {
      const y = window.scrollY, now = Date.now();
      maxY = Math.max(maxY, y);
      const deep = maxY > (document.documentElement.scrollHeight - window.innerHeight) * 0.35;
      if (deep && lastY - y > 140 && now - lastT < 350) show();
      lastY = y; lastT = now;
    };
    document.addEventListener("mouseout", onOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { document.removeEventListener("mouseout", onOut); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="exit-trial-title" className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/55 p-4 sm:items-center" onClick={() => setOpen(false)}>
      <div className="relative w-full max-w-md rounded-3xl bg-surface p-7 text-center shadow-2xl sm:p-9" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label={t.close} onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full px-2 text-2xl leading-none text-muted hover:text-ink">×</button>
        <div className="mx-auto w-16"><NivoAvatar size={64} /></div>
        <p className="mt-3 text-sm font-bold uppercase tracking-wider text-[#B4372B]">{t.kicker}</p>
        <h2 id="exit-trial-title" className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{t.title}</h2>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">{t.p}</p>
        <a href={href} className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#2F8F5B] px-6 py-4 text-lg font-extrabold text-white shadow-[0_14px_30px_-10px_rgba(47,143,91,0.7)] hover:bg-[#287D4F]">
          {t.cta} →
        </a>
        <button type="button" onClick={() => setOpen(false)} className="mt-4 text-sm text-muted underline underline-offset-4 hover:text-ink">{t.close}</button>
      </div>
    </div>
  );
}
