import { createClient } from "@/lib/supabase/server";
import { createCourseAction, updateCourseAction, deleteCourseAction } from "@/lib/actions";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  const query = supabase.from("courses").select("id,title,workload_hours,is_active").order("title").limit(20);
  if (q) query.ilike("title", `%${q}%`);
  const { data } = await query;
  return <main className="p-6 space-y-6"><h1 className="text-2xl font-bold">Cursos</h1><form className="card p-3"><input name="q" defaultValue={q} placeholder="Buscar curso" className="w-full rounded border p-2" /></form><form action={createCourseAction} className="card grid gap-2 p-4 md:grid-cols-3"><input name="title" placeholder="Título" className="rounded border p-2" required /><input name="workload" placeholder="Carga horária" className="rounded border p-2" /><button className="rounded bg-slate-900 p-2 text-white">Criar</button></form><div className="card p-4 space-y-3">{data?.map((c) => <div key={c.id} className="grid gap-2 border-b pb-3 md:grid-cols-2"><form action={updateCourseAction} className="grid gap-2 md:grid-cols-4"><input type="hidden" name="id" value={c.id} /><input name="title" defaultValue={c.title} className="rounded border p-2" /><input name="workload" defaultValue={String(c.workload_hours || 0)} className="rounded border p-2" /><select name="is_active" defaultValue={String(c.is_active)} className="rounded border p-2"><option value="true">Ativo</option><option value="false">Inativo</option></select><button className="rounded border px-3">Salvar</button></form><ConfirmDelete action={deleteCourseAction} id={c.id} /></div>)}</div></main>;
}
