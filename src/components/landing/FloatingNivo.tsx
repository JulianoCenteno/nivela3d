"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

/** Nivo flutuando no canto da página de vendas, com um balão que leva para a oferta. */
export function FloatingNivo({ text, cta, href }: { text: string; cta: string; href: string }) {
  const [bubble, setBubble] = useState(false);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setBubble(true), 3500);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-4 right-3 z-40 flex items-end gap-2 sm:bottom-6 sm:right-6">
      {bubble && !closed && (
        <div className="nivo-pop pointer-events-auto relative mb-10 max-w-[230px] rounded-2xl rounded-br-md border border-line bg-surface p-3.5 pr-7 text-sm shadow-[0_18px_40px_-12px_rgba(16,25,28,0.35)]">
          <button type="button" onClick={() => setClosed(true)} className="absolute right-1.5 top-1.5 rounded-md p-1 text-muted hover:bg-surface-2" aria-label="Fechar">
            <X size={14} />
          </button>
          <p className="font-semibold leading-snug text-ink">{text}</p>
          <a href={href} className="mt-2 inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary hover:bg-primary-hover">
            {cta}
          </a>
        </div>
      )}
      <a href={href} onClick={() => setBubble(true)} className="nivo-float pointer-events-auto block w-[84px] sm:w-[104px]" aria-label="Nivo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/nivo.svg" alt="Nivo" width={104} height={104} className="h-auto w-full drop-shadow-[0_14px_18px_rgba(16,25,28,0.35)]" />
      </a>
    </div>
  );
}
