import { signInAction } from "@/lib/actions";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form action={signInAction} className="card w-full max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <input name="email" type="email" placeholder="E-mail" className="w-full rounded-xl border p-3" required />
        <input name="password" type="password" placeholder="Senha" className="w-full rounded-xl border p-3" required />
        <button className="w-full rounded-xl bg-slate-900 p-3 text-white">Acessar</button>
        <a href="/recuperar-senha" className="text-sm text-blue-600">Recuperar senha</a>
      </form>
    </main>
  );
}
