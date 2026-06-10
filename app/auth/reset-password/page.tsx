import { resetPassword } from "@/lib/actions/auth";
import { Notice } from "@/components/notice";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-md content-center px-4 py-10">
      <div className="panel p-6">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Te enviaremos un enlace para recuperar el acceso.
        </p>
        <div className="mt-5">
          <Notice error={params.error} />
        </div>
        <form action={resetPassword} className="mt-5 grid gap-4">
          <input
            type="hidden"
            name="origin"
            value={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}
          />
          <label className="grid gap-1 text-sm font-medium">
            Email
            <input className="field" type="email" name="email" required />
          </label>
          <button className="btn btn-primary" type="submit">
            Enviar instrucciones
          </button>
        </form>
      </div>
    </main>
  );
}
