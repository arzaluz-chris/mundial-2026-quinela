import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { Notice } from "@/components/notice";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-md content-center px-4 py-10">
      <div className="panel p-6">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Usa tu correo para entrar a la quiniela privada.
        </p>
        <div className="mt-5">
          <Notice error={params.error} message={params.message} />
        </div>
        <form action={signIn} className="mt-5 grid gap-4">
          <input type="hidden" name="next" value={params.next || "/dashboard"} />
          <label className="grid gap-1 text-sm font-medium">
            Email
            <input className="field" type="email" name="email" required />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Password
            <input className="field" type="password" name="password" required />
          </label>
          <button className="btn btn-primary" type="submit">
            Entrar
          </button>
        </form>
        <div className="mt-5 flex justify-between text-sm">
          <Link href="/auth/register" className="font-medium text-pitch">
            Crear cuenta
          </Link>
          <Link href="/auth/reset-password" className="font-medium text-pitch">
            Reset password
          </Link>
        </div>
      </div>
    </main>
  );
}
