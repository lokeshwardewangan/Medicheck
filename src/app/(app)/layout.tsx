import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

// T7 will add a session check + RLS context here so unauthenticated users
// are redirected to /login before this layout renders.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
