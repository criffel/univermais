import { createClient } from "@/lib/supabase/server";
import { roleDashboardTitle } from "@/lib/roles";
import { signOutAction } from "@/lib/actions";
import Link from "next/link";

export default async function Dashboard(){
  const supabase=await createClient();
  const {data:u}=await supabase.auth.getUser();
  if(!u.user) return <main className="p-6">Sessão expirada</main>;
  const {data:profile}=await supabase.from("users_profiles").select("role_key,organization_id,full_name").eq("id",u.user.id).single();
  const orgId=profile?.organization_id;
  const [enrollments,certificates,announcements,courses]=await Promise.all([
    supabase.from("enrollments").select("id",{count:"exact",head:true}).eq("organization_id",orgId),
    supabase.from("certificates").select("id",{count:"exact",head:true}).eq("organization_id",orgId),
    supabase.from("announcements").select("id",{count:"exact",head:true}).eq("organization_id",orgId),
    supabase.from("courses").select("id",{count:"exact",head:true}).eq("organization_id",orgId),
  ]);
  const cards=[["Matrículas",enrollments.count??0],["Certificados",certificates.count??0],["Comunicados",announcements.count??0],["Cursos",courses.count??0]];
  return <main className="p-6"><div className="mb-6 flex items-center justify-between"><div><h1 className="text-3xl font-bold">{roleDashboardTitle[profile?.role_key||"student"]}</h1><p className="text-slate-500">{profile?.full_name}</p></div><form action={signOutAction}><button className="rounded-xl border px-4 py-2">Sair</button></form></div><nav className="mb-6 flex flex-wrap gap-3 text-sm"><Link href="/dashboard/users" className="rounded-xl border px-3 py-2">Usuários</Link><Link href="/dashboard/courses" className="rounded-xl border px-3 py-2">Cursos</Link><Link href="/dashboard/paths" className="rounded-xl border px-3 py-2">Trilhas</Link><Link href="/dashboard/assessments" className="rounded-xl border px-3 py-2">Avaliações</Link><Link href="/dashboard/announcements" className="rounded-xl border px-3 py-2">Comunicados</Link></nav><div className="grid gap-4 md:grid-cols-4">{cards.map(([k,v])=><div key={String(k)} className="card p-4"><p className="text-sm text-slate-500">{k}</p><p className="text-2xl font-bold">{String(v)}</p></div>)}</div></main>;
}
