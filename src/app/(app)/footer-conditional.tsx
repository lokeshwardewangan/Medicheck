'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/footer';

const NO_FOOTER_ROUTES = ['/chat'];

export function FooterConditional() {
  const pathname = usePathname();
  if (NO_FOOTER_ROUTES.some((r) => pathname?.startsWith(r))) return null;
  return <Footer />;
}
