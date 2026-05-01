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
          ? 'border-b bg-white/90 shadow-sm shadow-slate-200/50 backdrop-blur-xl dark:bg-slate-950/90 dark:shadow-slate-900/50'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/" className="group flex items-center gap-2">
              <motion.div
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 shadow-lg"
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
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-lg font-bold text-transparent">
                  HealthMate
                </span>
                <span className="-mt-1 hidden text-[10px] text-muted-foreground sm:block">
                  AI Symptom Checker
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <motion.div key={link.href} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href={link.href}
                    className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-slate-600 hover:bg-teal-50 hover:text-teal-600 dark:text-slate-300 dark:hover:bg-teal-950/30 dark:hover:text-teal-400'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute right-2 bottom-0 left-2 h-0.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                onClick={() => router.push('/chat')}
                className="group relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white shadow-lg shadow-teal-500/25 transition-all duration-300 hover:from-teal-700 hover:via-emerald-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-500/30"
              >
                <motion.span
                  className="absolute inset-0 bg-white/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.4 }}
                />
                <Stethoscope className="mr-2 h-4 w-4" />
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
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
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
                className="flex h-full flex-col p-6"
              >
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 border-b pb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-lg font-bold text-transparent">
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
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                            pathname === link.href
                              ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400'
                              : 'text-slate-600 hover:bg-teal-50 hover:text-teal-600 dark:text-slate-300 dark:hover:bg-teal-950/30'
                          }`}
                        >
                          <link.icon className="h-5 w-5" />
                          <span className="font-medium">{link.label}</span>
                          {pathname === link.href && (
                            <motion.div
                              layoutId="mobile-active"
                              className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-500"
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
                  className="space-y-3 border-t pt-6"
                >
                  <Button
                    onClick={() => {
                      router.push('/chat');
                      setIsOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white"
                  >
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Start Symptom Check
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push('/history');
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    <History className="mr-2 h-4 w-4" />
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
