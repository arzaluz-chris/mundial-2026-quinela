import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Notice } from "@/components/notice";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-md content-center px-4 py-10">
      <div className="panel p-6">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <div className="mt-5">
          <Notice error={params.error} />
        </div>
        <form action={signUp} className="mt-5 grid gap-4">
          <label className="grid gap-1 text-sm font-medium">
            Nombre visible
            <input className="field" name="display_name" required />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Email
            <input className="field" type="email" name="email" required />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Password
            <input className="field" type="password" name="password" minLength={8} required />
          </label>
          <button className="btn btn-primary" type="submit">
            Registrarme
          </button>
        </form>
        <Link href="/auth/login" className="mt-5 inline-block text-sm font-medium text-pitch">
          Ya tengo cuenta
        </Link>
      </div>
    </main>
  );
}
