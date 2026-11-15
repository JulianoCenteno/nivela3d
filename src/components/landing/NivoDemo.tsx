"use client";

import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NivoAvatar } from "@/components/NivoAvatar";

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block">
          {line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => (p.startsWith("**") ? <b key={j}>{p.slice(2, -2)}</b> : <span key={j}>{p}</span>))}
        </span>
      ))}
    </>
  );
}

type Msg = { from: "me" | "nivo"; text: string };

/** Demonstração animada do assistente Nivo (sem servidor): toca as perguntas sozinha e aceita cliques nos chips. */
export function NivoDemo({ name, online, chips, answers, typing }: { name: string; online: string; chips: string[]; answers: string[]; typing: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [auto, setAuto] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  const idx = useRef(0);

  const ask = (i: number) => {
    if (busy) return;
    setBusy(true);
    setMsgs((m) => [...m.slice(-3), { from: "me", text: chips[i] }]);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "nivo", text: answers[i] }]);
      setBusy(false);
    }, 1300);
  };

  useEffect(() => {
    if (!auto) return;
    const el = box.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || timer) return;
      const tick = () => {
        ask(idx.current % chips.length);
        idx.current += 1;
        timer = setTimeout(tick, 5200);
      };
      timer = setTimeout(tick, 600);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  useEffect(() => {
    box.current?.querySelector("[data-end]")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [msgs, busy]);

  return (
    <div ref={box} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-30px_rgba(24,43,48,0.35)]">
      <div className="flex items-center gap-3 bg-primary px-5 py-4 text-on-primary">
        <NivoAvatar size={42} />
        <div>
          <p className="font-bold">{name}</p>
          <p className="flex items-center gap-1.5 text-xs opacity-80"><span className="h-2 w-2 rounded-full bg-[#9BE3B4]" />{online}</p>
        </div>
      </div>
      <div className="h-[340px] space-y-3 overflow-y-auto bg-bg p-5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${m.from === "me" ? "bg-primary text-on-primary" : "border border-line bg-surface"}`}>
              <Rich text={m.text} />
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">
              <span className="inline-flex gap-1 align-middle">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:240ms]" />
              </span>{" "}
              {typing}
            </div>
          </div>
        )}
        <div data-end />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line p-4">
        {chips.map((c, i) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setAuto(false);
              ask(i);
            }}
            className="rounded-full border border-line bg-bg px-3 py-1.5 text-sm font-semibold text-ink-2 transition hover:border-primary hover:text-primary"
          >
            {c}
          </button>
        ))}
        <span className="ml-auto hidden items-center text-primary sm:flex"><SendHorizontal size={18} /></span>
      </div>
    </div>
  );
}
