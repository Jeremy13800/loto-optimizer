import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loto FDJ Analyzer",
  description: "Analyse et génération de grilles optimisées pour le Loto FDJ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${outfit.className} bg-dark-900 text-slate-200 min-h-screen selection:bg-primary-500/30 selection:text-white`}
      >
        <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
          <div className="container mx-auto px-3 sm:px-6 py-2.5 sm:py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-base sm:text-2xl font-bold text-gradient tracking-tight flex items-center gap-1 sm:gap-2 shrink-0"
              >
                <span className="text-lg sm:text-3xl">🎰</span>
                <span className="hidden sm:inline">Loto FDJ Analyzer</span>
                <span className="inline sm:hidden text-sm">Loto FDJ</span>
              </Link>
              <div className="flex gap-2.5 sm:gap-8 text-xs sm:text-sm font-medium">
                <Link
                  href="/results"
                  className="text-slate-300 hover:text-white transition-all whitespace-nowrap"
                >
                  Résultats
                </Link>
                <Link
                  href="/analysis"
                  className="text-slate-300 hover:text-white transition-all whitespace-nowrap"
                >
                  Analyse
                </Link>
                <Link
                  href="/generator"
                  className="text-slate-300 hover:text-white transition-all whitespace-nowrap"
                >
                  Générateur
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen pt-20 sm:pt-28 pb-12">{children}</main>
        <footer className="border-t border-white/5 bg-dark-900/80 py-8 mt-12 backdrop-blur-md">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
              <span className="text-yellow-500/80 mr-2">⚠️ Disclaimer:</span>
              Cet outil est à but éducatif uniquement. L&apos;optimisation
              statistique ne garantit aucun gain. Les jeux d&apos;argent
              comportent des risques. Jouez responsable.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
