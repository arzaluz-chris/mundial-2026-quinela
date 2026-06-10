import type { Metadata } from "next";
import Link from "next/link";
import { Outfit } from "next/font/google";
import { Trophy } from "lucide-react";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
    <html lang="es" className={`${outfit.variable} font-sans`}>
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-lime/30 selection:text-pitch min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/dashboard" className="group flex items-center gap-3 font-bold text-ink transition-transform active:scale-95">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pitch to-[#0A4533] text-lime shadow-md transition-transform group-hover:scale-105 group-hover:rotate-3">
                <Trophy size={20} strokeWidth={2.5} />
              </span>
              <span className="text-lg tracking-tight">Quiniela 2026</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm font-semibold text-slate-600">
              <Link href="/dashboard" className="transition-colors hover:text-pitch">
                Dashboard
              </Link>
              <Link href="/leaderboard" className="transition-colors hover:text-pitch">
                Ranking
              </Link>
              <Link href="/admin" className="transition-colors hover:text-pitch">
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
        <Toaster richColors position="top-center" expand={true} />
      </body>
    </html>
  );
}
