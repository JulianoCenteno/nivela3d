"use client";

import { useEffect, useState } from "react";

/** Contador regressivo (mm:ss) que continua de onde parou se a pessoa recarregar a página. */
export function Countdown({ minutes = 15, storageKey }: { minutes?: number; storageKey: string }) {
  const [left, setLeft] = useState(minutes * 60);
  useEffect(() => {
    let end = Date.now() + minutes * 60_000;
    try {
      const saved = Number(sessionStorage.getItem(storageKey));
      if (saved && saved > Date.now()) end = saved;
      else sessionStorage.setItem(storageKey, String(end));
    } catch {}
    const tick = () => setLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [minutes, storageKey]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <span className="tnum inline-flex items-center gap-1 font-extrabold" aria-live="off">
      {mm}:{ss}
    </span>
  );
}
