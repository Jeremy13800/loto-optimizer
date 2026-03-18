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
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              <Link
                href="/"
                className="text-xl sm:text-2xl font-bold text-gradient tracking-tight flex items-center gap-2"
              >
                <span className="text-2xl sm:text-3xl filter drop-shadow-md">
                  🎰
                </span>{" "}
                Loto FDJ Analyzer
              </Link>
              <div className="flex gap-4 sm:gap-8 text-sm font-medium">
                <Link
                  href="/results"
                  className="text-slate-300 hover:text-white hover:text-shadow-glow transition-all"
                >
                  Résultats
                </Link>
                <Link
                  href="/analysis"
                  className="text-slate-300 hover:text-white hover:text-shadow-glow transition-all"
                >
                  Analyse
                </Link>
                <Link
                  href="/generator"
                  className="text-slate-300 hover:text-white hover:text-shadow-glow transition-all"
                >
                  Générateur
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen pt-28 pb-12">{children}</main>
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
