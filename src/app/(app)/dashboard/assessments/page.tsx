import { createClient } from "@/lib/supabase/server";
import { createAssessmentAction, updateAssessmentAction, deleteAssessmentAction } from "@/lib/actions";
import { ConfirmDelete } from "@/components/ui/confirm-delete";

export default async function AssessmentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  const query = supabase.from("assessments").select("id,title,min_score,attempts_allowed").order("title").limit(20);
  if (q) query.ilike("title", `%${q}%`);
  const { data } = await query;
  return <main className="p-6 space-y-6"><h1 className="text-2xl font-bold">Avaliações</h1><form className="card p-3"><input name="q" defaultValue={q} placeholder="Buscar avaliação" className="w-full rounded border p-2" /></form><form action={createAssessmentAction} className="card grid gap-2 p-4 md:grid-cols-4"><input name="title" placeholder="Título" className="rounded border p-2" required /><input name="min_score" placeholder="Nota mínima" className="rounded border p-2" /><input name="attempts_allowed" placeholder="Tentativas" className="rounded border p-2" /><button className="rounded bg-slate-900 p-2 text-white">Criar</button></form><div className="card p-4 space-y-3">{data?.map((a) => <div key={a.id} className="grid gap-2 border-b pb-3 md:grid-cols-2"><form action={updateAssessmentAction} className="grid gap-2 md:grid-cols-4"><input type="hidden" name="id" value={a.id} /><input name="title" defaultValue={a.title} className="rounded border p-2" /><input name="min_score" defaultValue={String(a.min_score || 70)} className="rounded border p-2" /><input name="attempts_allowed" defaultValue={String(a.attempts_allowed || 2)} className="rounded border p-2" /><button className="rounded border px-3">Salvar</button></form><ConfirmDelete action={deleteAssessmentAction} id={a.id} /></div>)}</div></main>;
}
