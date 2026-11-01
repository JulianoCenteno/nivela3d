"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({
  id,
  action,
  confirmText = "Remover este item?",
  label = "Remover",
}: {
  id: string;
  action: (fd: FormData) => Promise<void>;
  confirmText?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn-danger px-3 py-2 text-sm" aria-label={label || "Remover"}>
        <Trash2 size={16} />
        <span className="hidden sm:inline">{label}</span>
      </button>
    </form>
  );
}
