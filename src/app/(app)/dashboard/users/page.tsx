import { createClient } from "@/lib/supabase/server";
import { updateUserAction, deleteUserAction } from "@/lib/actions";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { CreateUserAuthForm } from "@/components/ui/create-user-auth-form";

const LIMIT = 10;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const from = (currentPage - 1) * LIMIT;
  const to = from + LIMIT - 1;

  const supabase = await createClient();
  const query = supabase.from("users_profiles").select("id,full_name,email,role_key", { count: "exact" }).order("full_name").range(from, to);
  if (q) query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count || 0) / LIMIT));

  return <main className="p-6 space-y-6"><h1 className="text-2xl font-bold">Usuários</h1><form className="card p-3"><input name="q" defaultValue={q} placeholder="Buscar" className="w-full rounded border p-2" /></form><CreateUserAuthForm /><div className="card p-4 space-y-3">{data?.map((u) => <div key={u.id} className="grid gap-2 border-b pb-3 md:grid-cols-3"><form action={updateUserAction} className="grid gap-2 md:col-span-2 md:grid-cols-3"><input type="hidden" name="id" value={u.id} /><input name="full_name" defaultValue={u.full_name} className="rounded border p-2" /><input value={u.email} disabled className="rounded border p-2 bg-slate-50" /><input name="role_key" defaultValue={u.role_key} className="rounded border p-2" /><button className="rounded border px-3">Salvar</button></form><ConfirmDelete action={deleteUserAction} id={u.id} /></div>)}</div><div className="flex items-center justify-between text-sm"><a className="rounded border px-3 py-1" href={`?q=${encodeURIComponent(q)}&page=${Math.max(1, currentPage - 1)}`}>Anterior</a><span>Página {currentPage} de {totalPages}</span><a className="rounded border px-3 py-1" href={`?q=${encodeURIComponent(q)}&page=${Math.min(totalPages, currentPage + 1)}`}>Próxima</a></div></main>;
}
