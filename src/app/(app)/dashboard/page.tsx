import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions";
import { BarChart3, Bell, BookOpen, ChartPie, CreditCard, GraduationCap, LayoutDashboard, LogOut, MessageSquare, Search, Settings, Users } from "lucide-react";

const menu = [
  { label: "Dashboards", icon: LayoutDashboard },
  { label: "Enrollment", icon: Users },
  { label: "Course", icon: BookOpen },
  { label: "Manage Teacher", icon: GraduationCap },
  { label: "Payment Report", icon: CreditCard },
  { label: "Message", icon: MessageSquare },
  { label: "Notification", icon: Bell },
  { label: "Setting", icon: Settings },
];

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return <main className="p-6">Sessão expirada</main>;

  const { data: profile } = await supabase.from("users_profiles").select("organization_id,full_name").eq("id", u.user.id).single();
  const orgId = profile?.organization_id;

  const [courses, enrollments, certs, announcements] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("certificates").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    supabase.from("announcements").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
  ]);

  const stats = [
    ["Total Courses", courses.count ?? 0, "+12.05%"],
    ["Total Enrollments", enrollments.count ?? 0, "+8.20%"],
    ["Total Certificates", certs.count ?? 0, "+6.10%"],
    ["Total Notices", announcements.count ?? 0, "+4.02%"],
  ];

  return (
    <main className="min-h-screen p-3 md:p-6">
      <section className="mx-auto grid max-w-[1400px] gap-4 rounded-3xl border border-black/10 bg-white/95 p-3 md:grid-cols-[250px_1fr] md:p-4">
        <aside className="card h-fit p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-xl bg-violet-100 p-2 text-violet-700"><GraduationCap size={18} /></div>
            <h2 className="text-lg font-semibold">LMS 360</h2>
          </div>
          <nav className="space-y-1">
            {menu.map((m, i) => (
              <button key={m.label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm ${i === 0 ? "bg-violet-100 text-violet-700" : "text-slate-600 hover:bg-slate-100"}`}>
                <m.icon size={16} />
                {m.label}
              </button>
            ))}
          </nav>
          <form action={signOutAction} className="mt-6">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"><LogOut size={16} />Logout</button>
          </form>
        </aside>

        <div className="space-y-4">
          <header className="card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">LMS Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Welcome back, {profile?.full_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-200 p-2"><Bell size={16} /></button>
              <button className="rounded-xl border border-slate-200 p-2"><Search size={16} /></button>
            </div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([k, v, g]) => (
              <article key={String(k)} className="card p-4">
                <p className="text-sm text-slate-500">{k}</p>
                <p className="mt-2 text-3xl font-bold">{String(v)}</p>
                <p className="mt-1 text-xs text-emerald-600">{String(g)}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
            <article className="card p-4">
              <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Overview</h3><span className="text-xs text-slate-500">Last 7 Days</span></div>
              <div className="grid h-44 grid-cols-7 items-end gap-2">
                {[45, 62, 38, 74, 56, 66, 52].map((h, i) => <div key={i} className="rounded-t-lg bg-violet-500/70" style={{ height: `${h * 1.6}px` }} />)}
              </div>
            </article>
            <article className="card p-4">
              <h3 className="mb-3 font-semibold">Top Instructors</h3>
              <ul className="space-y-2 text-sm">
                {["Jane Doe", "Linda Davis", "Susan Hall", "Thomas"].map((n, i) => (
                  <li key={n} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span>{n}</span><span className="text-violet-600">{[69,88,65,50][i]}%</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-center"><ChartPie className="text-violet-500" size={90} /></div>
            </article>
          </section>

          <section className="card overflow-auto p-4">
            <h3 className="mb-3 font-semibold">Best Selling Courses</h3>
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-slate-500"><tr><th className="py-2">Course</th><th>Instructor</th><th>Sales</th><th>Amount</th></tr></thead>
              <tbody>
                {["Starting Online Courses", "Deploy Career in Short Courses", "Complete Java Program", "Training and Learning"].map((c, i) => (
                  <tr key={c} className="border-t border-slate-100"><td className="py-3">{c}</td><td>{["Jane Doe","Mary Johnson","Linda Davis","Patricia Taylor"][i]}</td><td>{[200,300,190,350][i]}</td><td>${[900,1500,650,1860][i]}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </section>
    </main>
  );
}
