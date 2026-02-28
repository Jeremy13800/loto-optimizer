import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Loto FDJ Analyzer',
  description: 'Analyse et génération de grilles optimisées pour le Loto FDJ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <nav className="bg-primary-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                🎰 Loto FDJ Analyzer
              </Link>
              <div className="flex gap-6">
                <Link href="/results" className="hover:text-primary-200 transition">
                  Résultats
                </Link>
                <Link href="/analysis" className="hover:text-primary-200 transition">
                  Analyse
                </Link>
                <Link href="/generator" className="hover:text-primary-200 transition">
                  Générateur
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-400">
              ⚠️ Disclaimer: Cet outil est à but éducatif uniquement. L&apos;optimisation statistique ne garantit aucun gain.
              Les jeux d&apos;argent comportent des risques. Jouez responsable.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
