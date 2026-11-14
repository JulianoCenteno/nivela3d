"use client";

import { Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/client";

export function DeleteButton({
  id,
  action,
  confirmText,
  label,
}: {
  id: string;
  action: (fd: FormData) => Promise<void>;
  confirmText?: string;
  label?: string;
}) {
  const { t } = useI18n();
  confirmText ??= t.common.actions.removeConfirm;
  label ??= t.common.actions.remove;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn-danger px-3 py-2 text-sm" aria-label={label || t.common.actions.remove}>
        <Trash2 size={16} />
        <span className="hidden sm:inline">{label}</span>
      </button>
    </form>
  );
}
