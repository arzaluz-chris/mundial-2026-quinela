import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiniela Mundial 2026",
  description: "Predicciones privadas para la Copa Mundial FIFA 2026."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-ink">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-pitch text-white">
                <Trophy size={19} />
              </span>
              Quiniela 2026
            </Link>
            <nav className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <Link href="/dashboard" className="hover:text-pitch">
                Dashboard
              </Link>
              <Link href="/leaderboard" className="hover:text-pitch">
                Ranking
              </Link>
              <Link href="/admin" className="hover:text-pitch">
                Admin
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
