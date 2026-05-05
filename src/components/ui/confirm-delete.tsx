"use client";
import { useState } from "react";

export function ConfirmDelete({ action, id }: { action: (formData: FormData) => Promise<void>; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="text-red-600" onClick={() => setOpen(true)}>Excluir</button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-slate-600">Essa ação não pode ser desfeita.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded border px-3 py-2" onClick={() => setOpen(false)}>Cancelar</button>
              <form action={action}>
                <input type="hidden" name="id" value={id} />
                <button className="rounded bg-red-600 px-3 py-2 text-white">Excluir</button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
