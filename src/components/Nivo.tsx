"use client";

import { Bot, Send, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { askNivo, type NivoReply } from "@/app/(app)/nivo-actions";
import { useI18n } from "@/i18n/client";

type Msg = { from: "me" | "nivo"; text: string; link?: NivoReply["link"]; chips?: string[] };

/** **negrito**, *itálico* e quebras de linha, sem HTML vindo de fora. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block">
          {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) =>
            part.startsWith("**") ? <b key={j}>{part.slice(2, -2)}</b> : part.startsWith("*") && part.length > 2 ? <i key={j}>{part.slice(1, -1)}</i> : part,
          )}
        </span>
      ))}
    </>
  );
}

export const NIVO_OPEN = "nivo:open";

/** Abre o Nivo de qualquer lugar do app (opcionalmente já com uma pergunta). */
export function openNivo(question?: string) {
  window.dispatchEvent(new CustomEvent(NIVO_OPEN, { detail: question }));
}

export function NivoButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => openNivo()}>
      {children}
    </button>
  );
}

export function Nivo({ firstName }: { firstName: string }) {
  const { t } = useI18n();
  const n = t.finance.nivo;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string | undefined>).detail;
      if (typeof q === "string" && q.trim()) ask(q);
    };
    window.addEventListener(NIVO_OPEN, onOpen);
    return () => window.removeEventListener(NIVO_OPEN, onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open && msgs.length === 0) setMsgs([{ from: "nivo", text: n.hello(firstName), chips: n.chips }]);
  }, [open, msgs.length, n, firstName]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, pending]);

  function ask(q: string) {
    const text = q.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setInput("");
    start(async () => {
      try {
        const r = await askNivo(text);
        setMsgs((m) => [...m, { from: "nivo", ...r }]);
      } catch {
        setMsgs((m) => [...m, { from: "nivo", text: n.unknown, chips: n.chips }]);
      }
    });
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary py-2.5 pl-3 pr-4 font-semibold text-on-primary shadow-lg transition hover:scale-[1.03]"
          aria-label={n.sideTitle}
        >
          <span className="rounded-full bg-white/15 p-1.5">
            <Bot size={20} />
          </span>
          <span className="hidden text-sm sm:inline">{n.name}</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80dvh] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[380px]">
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-on-primary">
            <span className="rounded-full bg-white/15 p-2">
              <Bot size={20} />
            </span>
            <div className="flex-1">
              <p className="font-bold leading-tight">
                {n.name} · {n.role}
              </p>
              <p className="text-xs text-on-primary/80">● {n.online}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/15" aria-label={n.close}>
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-bg p-4 text-[14px] leading-relaxed">
            {msgs.map((m, i) =>
              m.from === "me" ? (
                <div key={i} className="ml-10 rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-on-primary">
                  {m.text}
                </div>
              ) : (
                <div key={i} className="mr-6">
                  <div className="rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-2.5">
                    <Rich text={m.text} />
                    {m.link && (
                      <Link href={m.link.href} onClick={() => setOpen(false)} className="mt-2 inline-block rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
                        {m.link.label} →
                      </Link>
                    )}
                  </div>
                  {m.chips && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.chips.map((c) => (
                        <button key={c} type="button" onClick={() => ask(c)} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink-2 hover:border-primary hover:text-primary">
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
            {pending && <div className="mr-6 w-fit rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-muted">{n.thinking}</div>}
            <div ref={end} />
          </div>

          <form
            className="flex gap-2 border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} className="input flex-1" placeholder={n.placeholder} maxLength={300} />
            <button type="submit" disabled={pending || !input.trim()} className="btn-primary px-3" aria-label={n.send}>
              <Send size={17} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
