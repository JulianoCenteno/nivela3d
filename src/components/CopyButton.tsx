"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/client";

export function CopyButton({ text, label, className = "btn-ghost" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const { t } = useI18n();
  label ??= t.common.actions.copy;
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
    >
      {done ? <Check size={17} /> : <Copy size={17} />}
      {done ? t.common.actions.copied : label}
    </button>
  );
}
