import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { requireSession } from '@/server/auth/session';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Middleware blocks unauthenticated requests at the edge via cookie presence.
  // This server-side check additionally validates the session against the DB
  // and redirects if it's expired or revoked.
  await requireSession();

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
