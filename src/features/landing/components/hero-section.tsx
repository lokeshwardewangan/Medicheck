'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, ArrowRight, Sparkles, Shield, Clock, Activity } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
  type Variants,
} from 'motion/react';
import { useEffect, useState, useRef } from 'react';

// Typing animation hook
function useTypingEffect(texts: string[], speed = 60, pause = 1800) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), speed);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), speed / 2);
    } else if (deleting && charIndex === 0) {
      timeout = setTimeout(() => {
        setDeleting(false);
        setTextIndex((i) => (i + 1) % texts.length);
      }, 0);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed, pause]);

  return texts[textIndex].slice(0, charIndex);
}

// Animated stat counter
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = to / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, to]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// Floating card micro animation
function FloatingCard({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, type: 'spring', stiffness: 100 }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Chat bubble animation
const chatMessages = [
  { role: 'ai', text: "Hello! I'm here to help. What symptoms are you experiencing?" },
  { role: 'user', text: 'I have a headache and fever for 2 days' },
  { role: 'ai', text: 'I understand. How severe is the headache on a scale of 1-10?' },
  { role: 'user', text: 'Around 6-7, quite uncomfortable' },
];

function AnimatedChat() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < chatMessages.length) {
      const timer = setTimeout(
        () => setVisibleCount((v) => v + 1),
        visibleCount === 0 ? 800 : 1400
      );
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  return (
    <div className="min-h-[220px] space-y-3">
      <AnimatePresence>
        {chatMessages.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 120 }}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'ai' && (
              <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600">
                <Stethoscope className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-tr-none bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
                  : 'rounded-tl-none bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      {visibleCount < chatMessages.length && visibleCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600">
            <Stethoscope className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex gap-1 rounded-2xl rounded-tl-none bg-slate-100 px-4 py-2.5 dark:bg-slate-800">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-slate-400"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function HeroSection() {
  const router = useRouter();
  const typedText = useTypingEffect([
    'Headache and fever?',
    'Chest pain or tightness?',
    'Feeling dizzy or weak?',
    'Stomach ache after eating?',
    'Sore throat for 3 days?',
  ]);

  // Parallax on mouse move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [4, -4]), {
    stiffness: 100,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-4, 4]), {
    stiffness: 100,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Stagger for text lines
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'tween', duration: 0.6 } },
  };

  return (
    <section
      className="relative flex min-h-[92vh] items-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30" />

      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-[-10%] left-[10%] h-[500px] w-[500px] rounded-full bg-teal-400/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[5%] bottom-[-10%] h-[400px] w-[400px] rounded-full bg-cyan-400/20 blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-[40%] right-[20%] h-[300px] w-[300px] rounded-full bg-emerald-400/15 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ── LEFT COLUMN ── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={item} className="mb-6 inline-flex">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Badge className="rounded-full border border-teal-200 bg-teal-100/80 px-4 py-2 text-sm font-medium text-teal-800 shadow-sm dark:border-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                  <motion.span
                    animate={{ rotate: [0, 15, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="mr-2 inline-block"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </motion.span>
                  AI-Powered Health Assistant
                </Badge>
              </motion.div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="mb-4 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl"
            >
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-slate-400">
                Understand Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent">
                Symptoms Better
              </span>
            </motion.h1>

            {/* Typing effect sub-headline */}
            <motion.div
              variants={item}
              className="mb-4 flex h-8 items-center justify-center lg:justify-start"
            >
              <span className="mr-2 text-lg text-slate-500 dark:text-slate-400">Try asking:</span>
              <span className="text-lg font-medium text-teal-600 dark:text-teal-400">
                {typedText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="ml-0.5 inline-block h-5 w-0.5 bg-teal-500 align-middle"
                />
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={item}
              className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-slate-600 lg:mx-0 dark:text-slate-400"
            >
              Chat naturally with our AI and get instant guidance on the right level of care — from
              self-care tips to emergency recommendations. No appointments needed.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={item}
              className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  onClick={() => router.push('/chat')}
                  className="group relative h-14 overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-8 text-base text-white shadow-xl shadow-teal-500/30 hover:from-teal-700 hover:via-emerald-700 hover:to-cyan-700"
                >
                  <motion.span
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.4 }}
                  />
                  <Stethoscope className="mr-2 h-5 w-5" />
                  Start Symptom Check
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/history')}
                  className="h-14 rounded-xl border-slate-300 px-8 text-base dark:border-slate-700"
                >
                  View History
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-slate-200 pt-8 lg:justify-start dark:border-slate-800"
            >
              {[
                { icon: Shield, label: 'Private & Secure', color: 'text-teal-600' },
                { icon: Clock, label: '24/7 Available', color: 'text-emerald-600' },
                { icon: Activity, label: 'AI-Powered', color: 'text-cyan-600' },
              ].map(({ icon: Icon, label, color }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex cursor-default items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span>{label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap justify-center gap-8 lg:justify-start"
            >
              {[
                { value: 95, suffix: '%', label: 'Accuracy Rate' },
                { value: 2, suffix: 'min', label: 'Avg. Assessment' },
                { value: 50, suffix: 'k+', label: 'Checks Done' },
              ].map(({ value, suffix, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <p className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent">
                    <CountUp to={value} suffix={suffix} />
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT COLUMN — Chat card ── */}
          <div className="hidden lg:block">
            <motion.div
              style={{ rotateX, rotateY, transformPerspective: 1200 }}
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 80 }}
              className="relative"
            >
              {/* Main chat card */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xl shadow-teal-500/10 dark:border-slate-800 dark:bg-slate-900">
                {/* Card glow */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-950/20 dark:to-transparent" />

                {/* Header */}
                <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30"
                  >
                    <Stethoscope className="h-5 w-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      HealthMate AI
                    </p>
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-emerald-500"
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <p className="text-xs text-slate-500">Online · Analyzing symptoms</p>
                    </div>
                  </div>
                  {/* Traffic lights decoration */}
                  <div className="flex gap-1.5">
                    {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c) => (
                      <div key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
                    ))}
                  </div>
                </div>

                {/* Animated chat messages */}
                <AnimatedChat />

                {/* Input bar */}
                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <motion.div
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                    whileHover={{ borderColor: '#14b8a6' }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="flex-1 text-sm text-slate-400">Describe your symptoms...</span>
                    <motion.div
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 shadow-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowRight className="h-4 w-4 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Floating card — Safe */}
              <FloatingCard
                delay={0.8}
                className="absolute -top-5 -right-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                    <Shield className="h-4.5 h-5 w-4.5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">
                      Secure & Private
                    </p>
                    <p className="text-[10px] text-slate-500">Data never leaves your device</p>
                  </div>
                </div>
              </FloatingCard>

              {/* Floating card — Speed */}
              <FloatingCard
                delay={1.1}
                className="absolute -bottom-5 -left-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/40">
                    <Clock className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">
                      Under 2 Minutes
                    </p>
                    <p className="text-[10px] text-slate-500">Instant AI assessment</p>
                  </div>
                </div>
              </FloatingCard>

              {/* Floating card — Result */}
              <FloatingCard
                delay={1.4}
                className="absolute top-1/2 -right-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">
                      Smart Triage
                    </p>
                    <p className="text-[10px] text-slate-500">4 care levels detected</p>
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <p className="text-xs text-slate-400">Scroll to explore</p>
          <motion.div className="flex h-8 w-5 justify-center rounded-full border-2 border-slate-300 pt-1.5 dark:border-slate-700">
            <motion.div
              className="h-1.5 w-1 rounded-full bg-teal-500"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
