import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "RESEND_API_KEY não configurada" }, { status: 500 });
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "noreply@universidade360.com",
    to: [process.env.RESEND_FROM_EMAIL || "contato@universidade360.com"],
    subject: "Nova solicitação de demonstração - Universidade Corporativa 360",
    html: `<h2>${name}</h2><p>${email}</p><p>${message}</p>`,
  });
  return NextResponse.json({ ok: true });
}
