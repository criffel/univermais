import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

function template(type: string, payload: { name?: string; title?: string; body?: string; course?: string }) {
  const base = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto"><h1 style="color:#0f172a">Universidade Corporativa 360</h1>`;
  const end = `<p style="color:#475569">Equipe UC360</p></div>`;
  if (type === "welcome") return `${base}<h2>Boas-vindas ${payload.name || ""}</h2><p>Seu acesso está pronto.</p>${end}`;
  if (type === "invite") return `${base}<h2>Convite de acesso</h2><p>Você foi convidado para a plataforma.</p>${end}`;
  if (type === "reminder") return `${base}<h2>Lembrete de curso</h2><p>Continue o curso ${payload.course || ""}.</p>${end}`;
  if (type === "certificate") return `${base}<h2>Certificado emitido</h2><p>Seu certificado já está disponível.</p>${end}`;
  return `${base}<h2>${payload.title || "Comunicado"}</h2><p>${payload.body || ""}</p>${end}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY ausente" }, { status: 500 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });

  const rl = checkRateLimit(`emails:${auth.user.id}`, 12, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Muitas tentativas. Aguarde 1 minuto." }, { status: 429 });

  const { data: profile } = await supabase.from("users_profiles").select("role_key").eq("id", auth.user.id).single();
  const allowed = ["super_admin", "org_admin", "coordinator"];
  if (!profile || !allowed.includes(profile.role_key)) return NextResponse.json({ ok: false, error: "Sem permissão" }, { status: 403 });

  const { to, type, payload } = await req.json();
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "noreply@yourdomain.com",
    to: Array.isArray(to) ? to : [to],
    subject: `UC360 - ${type}`,
    html: template(type, payload || {}),
  });

  return NextResponse.json({ ok: true });
}
