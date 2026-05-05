import { createClient } from "@/lib/supabase/server";
import { roleDashboardTitle } from "@/lib/roles";
import { signOutAction } from "@/lib/actions";
import { CalendarDays, ChartColumnBig, CircleCheckBig, Menu, Trophy, UserRound } from "lucide-react";

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

  const stats = [
    { label: "Cursos concluídos", value: courses.count ?? 0, icon: CircleCheckBig },
    { label: "Pontuação média", value: `${Math.min(99, 60 + (certificates.count ?? 0) * 3)}%`, icon: Trophy },
    { label: "Matrículas", value: enrollments.count ?? 0, icon: UserRound },
    { label: "Comunicados", value: announcements.count ?? 0, icon: CalendarDays },
  ];

  return (
    <main className="min-h-screen p-3 md:p-6">
      <section className="mx-auto grid max-w-[1400px] gap-3 rounded-[2rem] border border-white/10 bg-[#0a0c14] p-3 md:grid-cols-[88px_1fr] md:gap-4 md:p-4">
        <aside className="glass-dark hidden flex-col items-center justify-between p-3 md:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-300/90 text-slate-900"><Menu size={20} /></div>
          <div className="space-y-3 text-slate-300">
            <div className="rounded-xl bg-violet-300 p-2 text-slate-900"><ChartColumnBig size={18} /></div>
            <div className="p-2"><CalendarDays size={18} /></div>
          </div>
          <form action={signOutAction}><button className="rounded-xl border border-white/20 px-3 py-2 text-sm">Sair</button></form>
        </aside>

        <div className="space-y-4">
          <header className="glass-dark p-5 md:p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-300">Universidade Corporativa 360</p>
            <h1 className="mt-2 text-2xl font-bold md:text-4xl">{roleDashboardTitle[profile?.role_key || "student"]}</h1>
            <p className="mt-1 text-slate-300">Olá, {profile?.full_name}</p>
          </header>

          <section className="grid gap-3 md:grid-cols-4">
            {stats.map((s) => (
              <article key={s.label} className="card p-4">
                <div className="mb-3 inline-flex rounded-xl bg-violet-300/20 p-2 text-violet-200"><s.icon size={18} /></div>
                <p className="text-sm text-slate-300">{s.label}</p>
                <p className="mt-1 text-3xl font-semibold">{s.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <article className="card p-5">
              <h2 className="text-2xl font-semibold">Weekly Progress</h2>
              <div className="mt-4 grid grid-cols-7 items-end gap-2">
                {[22, 58, 66, 50, 40, 65, 90].map((h, i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-full rounded-t-xl bg-violet-300/80" style={{ height: `${h * 1.2}px` }} />
                    <p className="text-center text-xs text-slate-400">{["S","T","Q","Q","S","S","D"][i]}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="card p-5">
              <h3 className="text-xl font-semibold">Próximas Aulas</h3>
              <ul className="mt-4 space-y-3">
                {["UI Foundations", "Product Analytics", "Design Systems"].map((n, i) => (
                  <li key={n} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-medium">{n}</p>
                    <p className="text-sm text-slate-300">{["09:00", "11:30", "14:00"][i]} • 45 min</p>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
