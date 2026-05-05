import { signInAction } from "@/lib/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const msg = params.message ? decodeURIComponent(params.message) : "Credenciais inválidas.";

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form action={signInAction} className="card w-full max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        {hasError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p> : null}
        <input name="email" type="email" placeholder="E-mail" className="w-full rounded-xl border p-3" required />
        <input name="password" type="password" placeholder="Senha" className="w-full rounded-xl border p-3" required />
        <button className="w-full rounded-xl bg-slate-900 p-3 text-white">Acessar</button>
        <a href="/recuperar-senha" className="text-sm text-blue-600">Recuperar senha</a>
      </form>
    </main>
  );
}
