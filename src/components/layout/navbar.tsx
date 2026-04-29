'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Stethoscope, Menu, User, History, Home, Info } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chat', label: 'Check Symptoms', icon: Stethoscope },
  { href: '/history', label: 'History', icon: History },
  { href: '#about', label: 'About', icon: Info },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 20);
  });

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg"
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
              >
                <Stethoscope className="h-5 w-5 text-white" />
                <motion.div
                  className="absolute inset-0 rounded-xl bg-white/20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  HealthMate
                </span>
                <span className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">
                  AI Symptom Checker
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <motion.div key={link.href} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                onClick={() => router.push('/chat')}
                className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-700 hover:via-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.4 }}
                />
                <Stethoscope className="h-4 w-4 mr-2" />
                Start Check
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08, rotate: 5 }} whileTap={{ scale: 0.94 }}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-slate-200 dark:border-slate-800"
              >
                <User className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="md:hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isOpen ? 'x' : 'menu'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] p-0">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex flex-col h-full p-6"
              >
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 pb-6 border-b">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    HealthMate
                  </span>
                </div>

                {/* Mobile Nav Links */}
                <nav className="flex-1 py-6">
                  <div className="space-y-1">
                    {navLinks.map((link, i) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 + 0.15 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            pathname === link.href
                              ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400'
                              : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50 dark:text-slate-300 dark:hover:bg-teal-950/30'
                          }`}
                        >
                          <link.icon className="h-5 w-5" />
                          <span className="font-medium">{link.label}</span>
                          {pathname === link.href && (
                            <motion.div
                              layoutId="mobile-active"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500"
                            />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="border-t pt-6 space-y-3"
                >
                  <Button
                    onClick={() => { router.push('/chat'); setIsOpen(false); }}
                    className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white"
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Start Symptom Check
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { router.push('/history'); setIsOpen(false); }}
                    className="w-full"
                  >
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </motion.div>
              </motion.div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </motion.header>
  );
}
