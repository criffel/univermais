import { createClient } from "@/lib/supabase/server";
import { roleDashboardTitle } from "@/lib/roles";
import { signOutAction } from "@/lib/actions";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return <main className="p-6">Sessão expirada</main>;

  const { data: profile } = await supabase.from("users_profiles").select("role_key,organization_id,full_name").eq("id", u.user.id).single();
  const orgId = profile?.organization_id;

  const [enrollments, certificates, announcements, courses] = await Promise.all([
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("certificates").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("announcements").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
  ]);

  const cards = [
    ["Matrículas", enrollments.count ?? 0],
    ["Certificados", certificates.count ?? 0],
    ["Comunicados", announcements.count ?? 0],
    ["Cursos", courses.count ?? 0],
  ];

  return (
    <main className="p-6 md:p-8">
      <div className="card mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{roleDashboardTitle[profile?.role_key || "student"]}</h1>
            <p className="text-slate-500">{profile?.full_name}</p>
          </div>
          <form action={signOutAction}><button className="rounded-2xl border px-4 py-2">Sair</button></form>
        </div>
      </div>

      <nav className="mb-6 flex flex-wrap gap-2 text-sm">
        {[
          ["/dashboard/users", "Usuários"],
          ["/dashboard/courses", "Cursos"],
          ["/dashboard/paths", "Trilhas"],
          ["/dashboard/assessments", "Avaliações"],
          ["/dashboard/announcements", "Comunicados"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 transition hover:border-indigo-400 hover:text-indigo-700">{label}</Link>
        ))}
      </nav>

      <section className="grid gap-4 md:grid-cols-4">
        {cards.map(([k, v]) => (
          <article key={String(k)} className="card p-5">
            <p className="text-sm text-slate-500">{k}</p>
            <p className="mt-2 text-3xl font-bold">{String(v)}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
