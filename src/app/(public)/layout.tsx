import Link from 'next/link';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header simplifié pour les pages publiques */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            StudyLink
          </Link>
          <nav>
            <ul className="flex gap-6">
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Connexion
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-grow">{children}</main>

      {/* Footer simplifié */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StudyLink. Tous droits réservés.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">
                Conditions d&apos;utilisation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
