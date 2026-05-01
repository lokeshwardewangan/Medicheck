'use client';

import Link from 'next/link';
import { Stethoscope, GitFork, X, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  Platform: [
    { label: 'Check Symptoms', href: '/chat' },
    { label: 'View History', href: '/history' },
    { label: 'My Profile', href: '/profile' },
  ],
  Info: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Triage Levels', href: '#triage' },
    { label: 'Features', href: '#features' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use', href: '#' },
    { label: 'Medical Disclaimer', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      {/* Main Footer */}
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 shadow-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">
                HealthMate
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-400">
              AI-powered symptom checker that helps you make better health decisions. Not a
              replacement for professional medical care.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-teal-600"
              >
                <GitFork className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-teal-600"
              >
                <X className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 font-semibold text-white">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-teal-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Bottom Bar */}
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-sm text-slate-500 sm:text-left">
            © {new Date().getFullYear()} HealthMate. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span>Built with</span>
            <Heart className="mx-1 h-4 w-4 fill-rose-500 text-rose-500" />
            <span>for better health decisions</span>
          </div>
          <p className="max-w-xs text-center text-sm text-slate-600 sm:text-right">
            This tool does not provide medical diagnosis. Always consult a doctor.
          </p>
        </div>
      </div>
    </footer>
  );
}
