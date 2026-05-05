import { createClient } from "@/lib/supabase/server";
import { createPathAction, updatePathAction, deletePathAction } from "@/lib/actions";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

export default async function PathsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  const query = supabase.from("learning_paths").select("id,title,description").order("title").limit(20);
  if (q) query.ilike("title", `%${q}%`);
  const { data } = await query;
  return <main className="p-6 space-y-6"><h1 className="text-2xl font-bold">Trilhas</h1><form className="card p-3"><input name="q" defaultValue={q} placeholder="Buscar trilha" className="w-full rounded border p-2" /></form><form action={createPathAction} className="card grid gap-2 p-4 md:grid-cols-3"><input name="title" placeholder="Título" className="rounded border p-2" required /><input name="description" placeholder="Descrição" className="rounded border p-2" /><button className="rounded bg-slate-900 p-2 text-white">Criar</button></form><div className="card p-4 space-y-3">{data?.map((p) => <div key={p.id} className="grid gap-2 border-b pb-3 md:grid-cols-2"><form action={updatePathAction} className="grid gap-2 md:grid-cols-3"><input type="hidden" name="id" value={p.id} /><input name="title" defaultValue={p.title} className="rounded border p-2" /><input name="description" defaultValue={p.description || ""} className="rounded border p-2" /><button className="rounded border px-3">Salvar</button></form><ConfirmDelete action={deletePathAction} id={p.id} /></div>)}</div></main>;
}
