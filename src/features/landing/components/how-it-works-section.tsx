'use client';

import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { MessageSquare, ClipboardCheck, FileText, HeartPulse, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Describe Your Symptoms',
    description:
      "Start a natural conversation with our AI. Tell us what you're experiencing in your own words — just like talking to a doctor.",
    gradient: 'from-teal-500 to-emerald-500',
    shadow: 'shadow-teal-500/30',
    dotColor: 'bg-teal-500',
  },
  {
    number: '02',
    icon: ClipboardCheck,
    title: 'Answer Follow-up Questions',
    description:
      'Our AI asks smart follow-up questions about duration, severity, and other factors to build a complete picture of your condition.',
    gradient: 'from-blue-500 to-indigo-500',
    shadow: 'shadow-blue-500/30',
    dotColor: 'bg-blue-500',
  },
  {
    number: '03',
    icon: FileText,
    title: 'Review Your Summary',
    description:
      "Confirm the details you've provided. Make any edits needed to ensure accuracy before receiving your assessment.",
    gradient: 'from-purple-500 to-violet-500',
    shadow: 'shadow-purple-500/30',
    dotColor: 'bg-purple-500',
  },
  {
    number: '04',
    icon: HeartPulse,
    title: 'Get Your Assessment',
    description:
      'Receive a clear triage level — Emergency, Urgent, Routine, or Self-care — with personalized next steps.',
    gradient: 'from-rose-500 to-pink-500',
    shadow: 'shadow-rose-500/30',
    dotColor: 'bg-rose-500',
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex gap-5 lg:gap-8"
    >
      {/* Icon column */}
      <div className="flex flex-shrink-0 flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`h-14 w-14 rounded-2xl bg-gradient-to-br lg:h-16 lg:w-16 ${step.gradient} flex items-center justify-center shadow-xl ${step.shadow} relative z-10`}
        >
          <step.icon className="h-7 w-7 text-white" />
        </motion.div>

        {/* Connector line */}
        {index < steps.length - 1 && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.12 + 0.4 }}
            style={{ originY: 0 }}
            className={`my-2 w-0.5 flex-1 bg-gradient-to-b ${step.gradient} min-h-[40px] opacity-30`}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="flex-1 pb-10"
      >
        {/* Step number */}
        <span className="mb-2 inline-block text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500">
          STEP {step.number}
        </span>

        <h3 className="mb-3 text-xl font-semibold text-slate-900 lg:text-2xl dark:text-white">
          {step.title}
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400">{step.description}</p>

        {/* Arrow hint */}
        {index < steps.length - 1 && (
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.3 }}
            className="mt-3 text-slate-300 dark:text-slate-700"
          >
            <ArrowRight className="h-4 w-4 rotate-90" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 lg:py-32 dark:from-slate-950 dark:to-slate-900"
    >
      {/* Parallax background element */}
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-teal-400/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-cyan-400/5 blur-3xl" />
      </motion.div>

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center lg:mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={headerInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-3 inline-block text-sm font-semibold tracking-widest text-teal-600 uppercase dark:text-teal-400"
          >
            Simple Process
          </motion.span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            <span className="text-slate-900 dark:text-white">How It </span>
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Get personalized health guidance in four simple steps. No appointments, no waiting
            rooms.
          </p>
        </motion.div>

        {/* Steps — two column layout on large screens */}
        <div className="mx-auto max-w-3xl lg:max-w-5xl">
          <div className="grid gap-0 lg:grid-cols-2 lg:gap-x-16">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <motion.a
            href="/chat"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-teal-500/25 transition-shadow duration-300 hover:shadow-2xl"
          >
            <MessageSquare className="h-5 w-5" />
            Start Your Check Now
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
