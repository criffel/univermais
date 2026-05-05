import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  full_name: z.string().min(3),
  email: z.string().email(),
  role_key: z.enum(["super_admin", "org_admin", "coordinator", "instructor", "manager", "student", "parent", "child"]),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });

  const { data: me } = await supabase.from("users_profiles").select("organization_id,role_key").eq("id", auth.user.id).single();
  if (!me || !["super_admin", "org_admin", "coordinator"].includes(me.role_key)) {
    return NextResponse.json({ ok: false, error: "Sem permissão" }, { status: 403 });
  }

  const rl = checkRateLimit(`users-create:${auth.user.id}`, 8, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Muitas tentativas. Tente em 1 minuto." }, { status: 429 });

  const parsed = schema.parse(await req.json());
  const admin = createAdminClient();

  const { data: created, error: authError } = await admin.auth.admin.inviteUserByEmail(parsed.email, {
    data: { full_name: parsed.full_name, role_key: parsed.role_key },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });

  if (authError || !created.user) {
    return NextResponse.json({ ok: false, error: authError?.message || "Erro ao convidar usuário" }, { status: 400 });
  }

  const { error: profileError } = await supabase.from("users_profiles").insert({
    id: created.user.id,
    organization_id: me.organization_id,
    full_name: parsed.full_name,
    email: parsed.email,
    role_key: parsed.role_key,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ ok: false, error: profileError.message }, { status: 400 });
  }

  await supabase.from("activity_logs").insert({
    organization_id: me.organization_id,
    user_id: auth.user.id,
    action: "user.invite",
    metadata: { created_user_id: created.user.id, email: parsed.email, role_key: parsed.role_key },
  });

  return NextResponse.json({ ok: true, user_id: created.user.id });
}
