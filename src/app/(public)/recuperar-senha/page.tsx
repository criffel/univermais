import { resetPasswordAction } from "@/lib/actions";

export default function RecoverPage() {
  return <main className="grid min-h-screen place-items-center p-6"><form action={resetPasswordAction} className="card w-full max-w-md space-y-4 p-6"><h1 className="text-2xl font-semibold">Recuperar senha</h1><input name="email" type="email" placeholder="E-mail" className="w-full rounded-xl border p-3" required /><button className="w-full rounded-xl bg-slate-900 p-3 text-white">Enviar link</button></form></main>;
}
