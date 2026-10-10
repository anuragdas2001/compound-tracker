"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Check, 
  Flame, 
  Target, 
  Zap, 
  Brain, 
  Rocket, 
  Dumbbell, 
  BookOpen, 
  Coffee 
} from "lucide-react";

// --- Data ---
const QUESTIONS = [
  {
    id: "goal",
    title: "What brings you to Compound?",
    subtitle: "We'll tailor your experience based on your primary goal.",
    options: [
      { id: "build", label: "Build a new habit", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
      { id: "break", label: "Break a bad habit", icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
      { id: "goal", label: "Achieve a specific goal", icon: Target, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      { id: "explore", label: "Just exploring", icon: Rocket, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
    ]
  },
  {
    id: "focus",
    title: "What's your main area of focus?",
    subtitle: "Choose the area you want to improve the most right now.",
    options: [
      { id: "health", label: "Health & Fitness", icon: Dumbbell, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
      { id: "productivity", label: "Productivity", icon: Coffee, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
      { id: "learning", label: "Learning & Growth", icon: BookOpen, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
      { id: "mindfulness", label: "Mindfulness", icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" }
    ]
  },
  {
    id: "experience",
    title: "Have you tracked habits before?",
    subtitle: "This helps us adjust the complexity of our tools.",
    options: [
      { id: "beginner", label: "I'm completely new to this", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      { id: "tried", label: "I've tried but struggled", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
      { id: "pro", label: "I'm a seasoned tracker", icon: Target, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }
    ]
  }
];

// --- Components ---
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentQuestion = QUESTIONS[step];
  
  const handleSelect = (optionId: string) => {
    // Only proceed if a question exists
    if (!currentQuestion) return;
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        setStep(s => s + 1);
      } else {
        finishOnboarding();
      }
    }, 450); // slight delay for animation
  };

  const finishOnboarding = () => {
    setIsFinishing(true);
    // Simulate setting up account
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push('/dashboard'), 600);
          return 100;
        }
        return p + 5;
      });
    }, 50);
  };

  const variants = {
    initial: { opacity: 0, x: 40, filter: "blur(8px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -40, filter: "blur(8px)" }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050b08] overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-30"
          style={{
            background: "conic-gradient(from 90deg at 50% 50%, #050b08 0%, rgba(34,197,94,0.06) 25%, #050b08 50%, rgba(56,189,248,0.06) 75%, #050b08 100%)"
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%27.8%27 numOctaves=%272%27 stitchTiles=%27stitch%27/></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.06%27/></svg>')] opacity-[0.15] mix-blend-overlay" />
        
        {/* Glow behind the card */}
        <motion.div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[140px]"
           animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6">
        <AnimatePresence mode="wait">
          {!isFinishing && currentQuestion ? (
            <motion.div
              key={step}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full"
            >
              {/* Progress Bar */}
              <div className="mb-12">
                <div className="flex items-center justify-between text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                  <span>Step {step + 1} of {QUESTIONS.length}</span>
                  <span className="text-primary">{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                    initial={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                    animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-12">
                <motion.h1 
                  className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 drop-shadow-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  {currentQuestion.title}
                </motion.h1>
                <motion.p 
                  className="text-lg text-white/60"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {currentQuestion.subtitle}
                </motion.p>
              </div>

              {/* Options Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  const Icon = opt.icon;
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative group flex flex-col items-start p-6 rounded-3xl border transition-all duration-300 text-left overflow-hidden
                        ${isSelected ? 'bg-primary/[0.12] border-primary/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/25 hover:shadow-lg'}
                      `}
                    >
                      {/* Spotlight hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className={`mb-5 p-3.5 rounded-2xl ${opt.bg} ${opt.border} border shadow-inner`}>
                        <Icon className={`h-6 w-6 ${opt.color}`} />
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-1 transition-colors ${isSelected ? 'text-green-300' : 'text-white'}`}>
                        {opt.label}
                      </h3>
                      
                      {/* Selected Indicator */}
                      <div className={`absolute top-6 right-6 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${isSelected ? 'border-primary bg-primary text-black scale-110' : 'border-white/20 text-transparent scale-100'}`}>
                        <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : isFinishing ? (
             <motion.div
              key="finishing"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              className="w-full text-center py-20"
            >
              <div className="relative mx-auto w-40 h-40 mb-12">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{progress}%</span>
                </div>
              </div>
              <motion.h2 
                className="text-4xl font-extrabold text-white mb-4 tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Personalizing your experience
              </motion.h2>
              <motion.p 
                className="text-lg text-white/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Applying the Compound methodology to your goals...
              </motion.p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
