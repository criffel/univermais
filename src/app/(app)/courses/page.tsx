import { createClient } from "@/lib/supabase/server";

async function createCourse(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const me = await supabase.from("users_profiles").select("organization_id").eq("id", auth.user!.id).single();
  await supabase.from("courses").insert({ organization_id: me.data?.organization_id, title: String(formData.get("title")), workload_hours: Number(formData.get("workload") || 0) });
}
export default async function CoursesPage(){ const supabase=await createClient(); const {data}=await supabase.from("courses").select("id,title,workload_hours,is_active").order("created_at",{ascending:false}).limit(20); return <main className="p-6 space-y-6"><h1 className="text-2xl font-bold">Cursos</h1><form action={createCourse} className="card grid gap-3 p-4 md:grid-cols-3"><input name="title" placeholder="Título" className="rounded border p-2" required/><input name="workload" placeholder="Carga horária" className="rounded border p-2"/><button className="rounded bg-slate-900 p-2 text-white">Criar</button></form><div className="card p-4">{data?.map((c)=><div key={c.id} className="border-b py-2">{c.title} • {c.workload_hours}h</div>)}</div></main>; }
