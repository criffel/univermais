"use client";
import { motion } from "framer-motion";
import Link from "next/link";
export default function Home() { return <main className="min-h-screen px-6 py-10 md:px-12"><section className="mx-auto max-w-6xl rounded-3xl bg-slate-950 p-10 text-white"><motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold md:text-6xl">Aprendizagem corporativa, educacional e familiar em uma única plataforma</motion.h1><p className="mt-5 max-w-2xl text-slate-300">Universidade Corporativa 360 conecta empresas, instituições e famílias em uma experiência premium de ensino.</p><div className="mt-8 flex gap-4"><Link href="#contato" className="rounded-xl bg-blue-500 px-6 py-3 font-semibold">Solicitar demonstração</Link><Link href="/login" className="rounded-xl border border-white/30 px-6 py-3">Acessar plataforma</Link></div></section></main>; }

