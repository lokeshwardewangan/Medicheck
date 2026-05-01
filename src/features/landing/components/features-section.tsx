'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { MessageSquare, Shield, Zap, Clock, History, Lock } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Natural Conversation',
    description:
      'Chat naturally about your symptoms like talking to a doctor. No medical jargon required.',
    gradient: 'from-teal-500 to-emerald-500',
    shadow: 'shadow-teal-500/20',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'hover:border-teal-300 dark:hover:border-teal-700',
    iconColor: '#14b8a6',
  },
  {
    icon: Zap,
    title: 'Instant Analysis',
    description:
      'Get AI-powered assessment in under 2 minutes with appropriate care recommendations.',
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/20',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'hover:border-amber-300 dark:hover:border-amber-700',
    iconColor: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description:
      'Automatic detection of emergency symptoms with immediate guidance for critical situations.',
    gradient: 'from-red-500 to-rose-500',
    shadow: 'shadow-red-500/20',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'hover:border-red-300 dark:hover:border-red-700',
    iconColor: '#ef4444',
  },
  {
    icon: History,
    title: 'Health History',
    description:
      'Track your symptoms over time and identify patterns for better health management.',
    gradient: 'from-blue-500 to-indigo-500',
    shadow: 'shadow-blue-500/20',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'hover:border-blue-300 dark:hover:border-blue-700',
    iconColor: '#3b82f6',
  },
  {
    icon: Clock,
    title: '24/7 Available',
    description:
      'Access health guidance anytime, anywhere. No appointments or waiting rooms needed.',
    gradient: 'from-purple-500 to-violet-500',
    shadow: 'shadow-purple-500/20',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'hover:border-purple-300 dark:hover:border-purple-700',
    iconColor: '#8b5cf6',
  },
  {
    icon: Lock,
    title: 'Private & Secure',
    description: 'Your health data is encrypted and stored locally. We prioritize your privacy.',
    gradient: 'from-cyan-500 to-blue-500',
    shadow: 'shadow-cyan-500/20',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    border: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    iconColor: '#06b6d4',
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative h-full rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 dark:border-slate-800 dark:bg-slate-900 ${feature.border} cursor-default overflow-hidden transition-colors duration-300`}
      >
        {/* Hover glow */}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
        />

        {/* Corner shine */}
        <motion.div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/40 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
          transition={{ duration: 0.4 }}
          className={`h-14 w-14 rounded-2xl ${feature.bg} mb-5 flex items-center justify-center shadow-sm`}
        >
          <feature.icon className="h-6 w-6" style={{ color: feature.iconColor }} />
        </motion.div>

        {/* Text */}
        <h3 className="mb-3 text-lg font-semibold text-slate-900 transition-colors duration-200 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {feature.description}
        </p>

        {/* Bottom gradient bar that animates in on hover */}
        <motion.div
          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${feature.gradient} w-0 rounded-b-2xl transition-all duration-500 group-hover:w-full`}
        />
      </motion.div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32 dark:bg-slate-950">
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
      <motion.div
        className="absolute top-1/3 left-0 h-72 w-72 rounded-full bg-teal-400/5 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 bottom-1/3 h-96 w-96 rounded-full bg-cyan-400/5 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={headerInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-3 inline-block text-sm font-semibold tracking-widest text-teal-600 uppercase dark:text-teal-400"
          >
            Why HealthMate
          </motion.span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            <span className="text-slate-900 dark:text-white">Everything you need for </span>
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              better health decisions
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Our AI-powered platform combines advanced technology with medical safety protocols to
            give you reliable health guidance.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
