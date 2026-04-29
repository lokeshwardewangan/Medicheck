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
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                HealthMate
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered symptom checker that helps you make better health
              decisions. Not a replacement for professional medical care.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
              >
                <GitFork className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
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
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} HealthMate. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500 mx-1" />
            <span>for better health decisions</span>
          </div>
          <p className="text-sm text-slate-600 text-center sm:text-right max-w-xs">
            This tool does not provide medical diagnosis. Always consult a doctor.
          </p>
        </div>
      </div>
    </footer>
  );
}
