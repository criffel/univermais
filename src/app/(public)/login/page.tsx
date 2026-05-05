import { signInAction } from "@/lib/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const msg = params.message ? decodeURIComponent(params.message) : "Credenciais inválidas.";

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form action={signInAction} className="card w-full max-w-md space-y-4 p-7">
        <h1 className="text-3xl font-bold">Entrar</h1>
        <p className="text-sm text-slate-500">Acesse sua conta UC360</p>
        {hasError ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p> : null}
        <input name="email" type="email" placeholder="E-mail" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3" required />
        <input name="password" type="password" placeholder="Senha" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3" required />
        <button className="w-full rounded-2xl bg-slate-950 p-3 font-semibold text-white transition hover:bg-slate-800">Acessar</button>
        <a href="/recuperar-senha" className="text-sm text-indigo-600">Recuperar senha</a>
      </form>
    </main>
  );
}
