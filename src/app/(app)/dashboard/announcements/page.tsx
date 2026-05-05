import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

async function createAnnouncement(formData: FormData){
  "use server";
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  const me = await supabase.from("users_profiles").select("organization_id").eq("id", auth.user.id).single();
  const organization_id = me.data?.organization_id;
  const title=String(formData.get("title")); const body=String(formData.get("body"));
  await supabase.from("announcements").insert({ organization_id, title, body });
  const { data: users } = await supabase.from("users_profiles").select("email").eq("organization_id", organization_id);
  if (process.env.RESEND_API_KEY && users?.length) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "noreply@yourdomain.com", to: users.map(u=>u.email), subject: `Comunicado: ${title}`, html: `<h2>${title}</h2><p>${body}</p>` });
  }
}

export default async function AnnouncementsPage(){
  const supabase=await createClient();
  const { data } = await supabase.from("announcements").select("id,title,body,created_at").order("created_at",{ascending:false}).limit(20);
  return <main className="p-6 space-y-6"><h1 className="text-2xl font-bold">Comunicados</h1><form action={createAnnouncement} className="card space-y-3 p-4"><input name="title" placeholder="Título" className="w-full rounded border p-2" required/><textarea name="body" placeholder="Mensagem" className="w-full rounded border p-2" rows={4} required/><button className="rounded bg-slate-900 px-4 py-2 text-white">Publicar e enviar e-mail</button></form><div className="card p-4">{!data?.length?<p className="text-sm text-slate-500">Nenhum comunicado.</p>:data.map((a)=><article key={a.id} className="border-b py-3"><h3 className="font-semibold">{a.title}</h3><p className="text-sm text-slate-600">{a.body}</p></article>)}</div></main>;
}
