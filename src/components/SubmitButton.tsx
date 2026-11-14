"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useI18n } from "@/i18n/client";

export function SubmitButton({
  children,
  className = "btn-primary",
  pendingText,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  pendingText ??= t.common.actions.saving;
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 size={18} className="animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}
