"use client";

import { useState } from "react";

export function CreateUserAuthForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setMsg("");
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/users/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(json.error || "Erro ao criar usuário");
    setMsg("Usuário criado com sucesso. Recarregue para ver na lista.");
  }

  return (
    <form action={onSubmit} className="card grid gap-2 p-4 md:grid-cols-5">
      <input name="full_name" placeholder="Nome" className="rounded border p-2" required />
      <input name="email" placeholder="E-mail" className="rounded border p-2" required />
      <input name="role_key" placeholder="Perfil" className="rounded border p-2" required />
      <div className="rounded border bg-slate-50 p-2 text-xs text-slate-600">Convite por e-mail: o usuário define a própria senha no primeiro acesso.</div>\n      <button disabled={loading} className="rounded bg-slate-900 p-2 text-white">{loading ? "Convidando..." : "Convidar"}</button>
      {msg ? <p className="md:col-span-5 text-sm text-slate-600">{msg}</p> : null}
    </form>
  );
}

