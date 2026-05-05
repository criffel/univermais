"use client";

import { motion } from "framer-motion";
import { GraduationCap, Building2, UsersRound } from "lucide-react";
import Link from "next/link";

const audiences = [
  { title: "Empresas", text: "Onboarding, compliance, trilhas por setor e métricas de performance.", icon: Building2 },
  { title: "Instituições", text: "Turmas, professores, avaliações e gestão pedagógica em um só lugar.", icon: GraduationCap },
  { title: "Pais e Filhos", text: "Acompanhamento de progresso, tarefas, certificados e comunicados.", icon: UsersRound },
];

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-8 md:px-10">
      <section className="mx-auto max-w-7xl glass-dark p-8 text-white md:p-12">
        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
          Aprendizagem corporativa, educacional e familiar em uma única plataforma
        </motion.h1>
        <p className="mt-5 max-w-2xl text-slate-300">Universidade Corporativa 360 com experiência premium, analytics e governança multi-tenant.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-2xl bg-blue-500 px-6 py-3 font-semibold transition hover:bg-blue-400">Acessar plataforma</Link>
          <Link href="#audiencias" className="rounded-2xl border border-white/30 px-6 py-3 transition hover:bg-white/10">Ver soluções</Link>
        </div>
      </section>

      <section id="audiencias" className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-3">
        {audiences.map((a, i) => (
          <motion.article key={a.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-6">
            <a.icon className="mb-4 h-8 w-8 text-indigo-600" />
            <h3 className="text-xl font-semibold">{a.title}</h3>
            <p className="mt-2 text-slate-600">{a.text}</p>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
