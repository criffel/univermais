import { createClient } from "@/lib/supabase/server";

async function createUser(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const me = await supabase.from("users_profiles").select("organization_id").eq("id", auth.user!.id).single();
  await supabase.from("users_profiles").insert({
    id: crypto.randomUUID(),
    organization_id: me.data?.organization_id,
    full_name: String(formData.get("full_name")),
    email: String(formData.get("email")),
    role_key: String(formData.get("role_key")),
  });
}

export default async function UsersPage(){
  const supabase=await createClient();
  const {data}=await supabase.from("users_profiles").select("id,full_name,email,role_key").order("created_at",{ascending:false}).limit(20);
  return <main className="p-6 space-y-6"><h1 className="text-2xl font-bold">Usuários</h1><form action={createUser} className="card grid gap-3 p-4 md:grid-cols-4"><input name="full_name" placeholder="Nome" className="rounded border p-2" required/><input name="email" placeholder="E-mail" className="rounded border p-2" required/><input name="role_key" placeholder="role_key" className="rounded border p-2" required/><button className="rounded bg-slate-900 p-2 text-white">Criar</button></form><div className="card overflow-auto"><table className="w-full text-sm"><thead><tr><th className="p-2 text-left">Nome</th><th className="p-2 text-left">E-mail</th><th className="p-2 text-left">Perfil</th></tr></thead><tbody>{data?.map((u)=><tr key={u.id}><td className="p-2">{u.full_name}</td><td className="p-2">{u.email}</td><td className="p-2">{u.role_key}</td></tr>)}</tbody></table></div></main>
}
