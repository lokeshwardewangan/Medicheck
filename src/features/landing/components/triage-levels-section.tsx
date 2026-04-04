'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { AlertTriangle, CheckCircle, Clock, Home, ArrowRight } from 'lucide-react';
import type { TriageLevel } from '@/types';

const triageLevels = [
  {
    icon: AlertTriangle,
    level: 'Emergency' as TriageLevel,
    tagline: 'Call 108 immediately',
    description: 'Life-threatening symptoms requiring immediate emergency services.',
    iconColor: 'text-red-600 dark:text-red-400',
    bg: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/10',
    border: 'border-red-200 dark:border-red-800',
    hoverBorder: 'hover:border-red-400 dark:hover:border-red-600',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    glow: 'shadow-red-500/10',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    examples: ['Chest pain', 'Can\'t breathe', 'Stroke signs', 'Severe bleeding'],
  },
  {
    icon: Clock,
    level: 'Urgent' as TriageLevel,
    tagline: 'See a doctor within 24h',
    description: 'Symptoms that need prompt medical attention but are not immediately life-threatening.',
    iconColor: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10',
    border: 'border-orange-200 dark:border-orange-800',
    hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-600',
    dot: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    glow: 'shadow-orange-500/10',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    examples: ['High fever', 'Severe pain', 'Persistent vomiting'],
  },
  {
    icon: CheckCircle,
    level: 'Routine' as TriageLevel,
    tagline: 'Book an appointment',
    description: 'Schedule a visit to your doctor within a few days for proper evaluation.',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10',
    border: 'border-blue-200 dark:border-blue-800',
    hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    glow: 'shadow-blue-500/10',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    examples: ['Mild infection', 'Minor injuries', 'Recurring issues'],
  },
  {
    icon: Home,
    level: 'Self-Care' as TriageLevel,
    tagline: 'Rest & monitor at home',
    description: 'Manage symptoms at home with basic care. Monitor for any changes.',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10',
    border: 'border-emerald-200 dark:border-emerald-800',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    glow: 'shadow-emerald-500/10',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    examples: ['Common cold', 'Mild headache', 'Minor fatigue'],
  },
];

function TriageCard({ triage, index }: { triage: typeof triageLevels[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className={`relative h-full p-6 rounded-2xl ${triage.bg} border ${triage.border} ${triage.hoverBorder} transition-colors duration-300 shadow-xl ${triage.glow} overflow-hidden cursor-default`}
      >
        {/* Top accent pulse */}
        <motion.div
          className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${triage.dot}`}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
          style={{ originX: 0 }}
        />

        {/* Icon + Badge row */}
        <div className="flex items-start justify-between mb-4 pt-1">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
            className={`w-12 h-12 rounded-xl ${triage.iconBg} flex items-center justify-center`}
          >
            <triage.icon className={`h-6 w-6 ${triage.iconColor}`} />
          </motion.div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${triage.badge}`}>
            {triage.level.toUpperCase()}
          </span>
        </div>

        {/* Title & tagline */}
        <h3 className={`text-lg font-bold mb-1 ${triage.iconColor}`}>{triage.level}</h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
          {triage.tagline}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {triage.description}
        </p>

        {/* Examples */}
        <div className="space-y-1.5">
          {triage.examples.map((ex, i) => (
            <motion.div
              key={ex}
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.1 + 0.4 + i * 0.07 }}
              className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500"
            >
              <motion.div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${triage.dot}`}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              />
              {ex}
            </motion.div>
          ))}
        </div>

        {/* Glow overlay on hover */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/20 to-transparent`} />
      </motion.div>
    </motion.div>
  );
}

export function TriageLevelsSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });
  const disclaimerRef = useRef(null);
  const disclaimerInView = useInView(disclaimerRef, { once: true });

  return (
    <section className="py-20 lg:py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/50 pointer-events-none" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #14b8a6, transparent)' }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={headerInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-block text-sm font-semibold text-teal-600 dark:text-teal-400 tracking-widest uppercase mb-3"
          >
            Care Levels
          </motion.span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-slate-900 dark:text-white">Understanding </span>
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Triage Levels
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Our AI categorizes your symptoms into four clear care levels, so you
            always know the right next step.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {triageLevels.map((triage, index) => (
            <TriageCard key={triage.level} triage={triage} index={index} />
          ))}
        </div>

        {/* Disclaimer */}
        <motion.div
          ref={disclaimerRef}
          initial={{ opacity: 0, y: 16 }}
          animate={disclaimerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Important:</span>{' '}
            Triage levels are AI-guided estimates only. Always consult a qualified
            healthcare professional for actual medical advice and diagnosis.
          </p>
        </motion.div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 p-8 lg:p-12 text-center relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-white/5"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
            Ready to check your symptoms?
          </h3>
          <p className="text-teal-100 mb-6 max-w-md mx-auto">
            Takes less than 2 minutes. No sign-up required.
          </p>
          <motion.a
            href="/chat"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-700 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 text-base"
          >
            Get Started Now
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
