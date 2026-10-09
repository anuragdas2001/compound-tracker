'use client';

import { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Crown, 
  Zap,
  ArrowRight,
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const PRICING_TIERS = [
  {
    name: 'Starter',
    desc: 'Perfect for building your first consistent routine.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    color: '#9CA3AF', // Gray
    features: [
      'Track up to 3 daily habits',
      'Basic streak tracking',
      'Standard community access',
      'Bronze & Silver badges'
    ],
    buttonText: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    desc: 'Unlock the full potential of your self-improvement journey.',
    monthlyPrice: 8,
    yearlyPrice: 6, // $72/year
    icon: Sparkles,
    color: 'var(--c-primary)',
    features: [
      'Unlimited habit tracking',
      'Advanced analytics & heatmaps',
      'Premium gamification (Gold+ tiers)',
      'Global & National Leaderboards',
      'Custom habit schedules'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Elite',
    desc: 'For the highly dedicated. Pay once, own it forever.',
    monthlyPrice: 199,
    yearlyPrice: 199,
    isLifetime: true,
    icon: Crown,
    color: '#F59E0B', // Amber/Gold
    features: [
      'Everything in Pro forever',
      'Exclusive Elite profile badge',
      'Early access to beta features',
      'Direct priority support',
      'Custom app themes'
    ],
    buttonText: 'Get Lifetime Access',
    popular: false,
  }
];

const FAQS = [
  {
    q: 'Can I change my plan later?',
    a: 'Absolutely. You can upgrade, downgrade, or cancel your Pro subscription at any time from your settings.'
  },
  {
    q: 'What happens if I cancel Pro?',
    a: 'You will keep all your data and unlocked badges, but your account will revert to the Starter limitations at the end of your billing cycle.'
  },
  {
    q: 'Is the Elite plan really a one-time payment?',
    a: 'Yes! You pay once and get access to all current and future Pro/Elite features forever. No recurring charges.'
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <main
      className="min-h-screen text-[var(--c-text)] pb-32 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--c-bg)',
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=JetBrains+Mono:wght@400;500&display=swap"
      />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(var(--c-grid) 1px, transparent 1px), linear-gradient(90deg, var(--c-grid) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[var(--c-primary)] opacity-[0.05] blur-[150px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-20 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--c-primary)]/10 text-[var(--c-primary)] border border-[var(--c-primary)]/20 text-sm font-bold tracking-wide uppercase mb-6 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <Sparkles size={16} />
            Level Up Your Life
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--c-text)] tracking-tight drop-shadow-sm mb-6" style={fontDisplay}>
            Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--c-primary)] to-[#4ADE80]">consistency.</span>
          </h1>
          <p className="text-xl text-[var(--c-muted)] font-medium leading-relaxed">
            Join thousands of others building unstoppable habits. Choose the plan that perfectly matches your ambition.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold transition-colors duration-300 ${!isYearly ? 'text-[var(--c-text)]' : 'text-[var(--c-muted)]'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-16 h-8 rounded-full bg-[var(--c-surface-soft)] border border-[var(--c-border)] transition-colors focus:outline-none"
            >
              <div 
                className={`absolute top-1 bottom-1 w-6 bg-[var(--c-primary)] rounded-full shadow-sm transition-all duration-500 ease-out ${isYearly ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`}
              />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-2 transition-colors duration-300 ${isYearly ? 'text-[var(--c-text)]' : 'text-[var(--c-muted)]'}`}>
              Yearly
              <span className="bg-[#10B981]/20 text-[#10B981] text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border border-[#10B981]/30 animate-pulse">Save 25%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto mb-32">
          {PRICING_TIERS.map((tier, idx) => {
            const isPro = tier.popular;
            
            return (
              <div 
                key={idx} 
                className={`relative rounded-[32px] transition-all duration-500 flex flex-col ${
                  isPro 
                    ? 'border-2 border-[var(--c-primary)] bg-[var(--c-surface)] shadow-[0_20px_50px_rgba(34,197,94,0.15)] md:-translate-y-4 md:scale-105 z-10'
                    : 'border border-[var(--c-border)]/60 bg-[var(--c-surface-soft)]/50 hover:bg-[var(--c-surface)] hover:border-[var(--c-border)]'
                }`}
              >
                {/* Popular Badge */}
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--c-primary)] to-[#4ADE80] text-[var(--c-bg)] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap z-20">
                    Most Popular
                  </div>
                )}
                
                {/* Glow effect for Pro */}
                {isPro && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[var(--c-primary)]/5 to-transparent rounded-[32px] pointer-events-none" />
                )}

                <div className="p-8 pb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: `${tier.color}15`, color: tier.color }}>
                      <tier.icon size={22} />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--c-text)]" style={fontDisplay}>{tier.name}</h3>
                  </div>
                  <p className="text-sm text-[var(--c-muted)] font-medium h-10">{tier.desc}</p>
                  
                  <div className="mt-6 mb-8 flex items-end gap-1">
                    <span className="text-5xl font-bold text-[var(--c-text)] tracking-tight" style={fontMono}>
                      ${tier.isLifetime ? tier.monthlyPrice : (isYearly ? tier.yearlyPrice : tier.monthlyPrice)}
                    </span>
                    {!tier.isLifetime && (
                      <span className="text-[var(--c-muted)] font-medium mb-1">/mo</span>
                    )}
                  </div>
                  
                  {/* Monthly billed annually text */}
                  <div className="h-4 mb-6">
                    {isYearly && !tier.isLifetime && tier.monthlyPrice > 0 && (
                      <p className="text-xs text-[var(--c-primary)] font-semibold">Billed annually (${tier.yearlyPrice * 12}/year)</p>
                    )}
                    {tier.isLifetime && (
                      <p className="text-xs text-[#F59E0B] font-semibold">One-time payment</p>
                    )}
                  </div>

                  <button className={`w-full py-4 rounded-[16px] font-bold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 group ${
                    isPro 
                      ? 'bg-[var(--c-primary)] text-[var(--c-bg)] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:-translate-y-0.5' 
                      : 'bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] hover:border-[var(--c-primary)]/50 hover:bg-[var(--c-surface-soft)]'
                  }`}>
                    {tier.buttonText}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="p-8 pt-8 mt-4 border-t border-[var(--c-border)]/40 flex-1 flex flex-col justify-end">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-muted)] mb-4">What's included</p>
                  <ul className="space-y-4">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                           <CheckCircle2 size={18} className={isPro ? 'text-[var(--c-primary)]' : 'text-[var(--c-muted)]'} />
                        </div>
                        <span className="text-sm font-medium text-[var(--c-text)]/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            );
          })}
        </div>
        
        {/* Trusted By / Feature highlights row */}
        <div className="border-y border-[var(--c-border)]/40 py-12 mb-24 bg-[var(--c-surface-soft)]/20">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 text-center">
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} className="text-[var(--c-primary)]" />
              <div className="text-left">
                <p className="font-bold text-[var(--c-text)]">Secure Payment</p>
                <p className="text-xs text-[var(--c-muted)] font-medium">256-bit encryption</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-[var(--c-border)]" />
            <div className="flex items-center gap-3">
              <LifeBuoy size={28} className="text-[#3B82F6]" />
              <div className="text-left">
                <p className="font-bold text-[var(--c-text)]">24/7 Support</p>
                <p className="text-xs text-[var(--c-muted)] font-medium">Always here to help</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-[var(--c-border)]" />
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--c-bg)] bg-gradient-to-br from-[#F59E0B] to-[#EF4444]" />
                <div className="w-8 h-8 rounded-full border-2 border-[var(--c-bg)] bg-gradient-to-br from-[var(--c-primary)] to-[#3B82F6]" />
                <div className="w-8 h-8 rounded-full border-2 border-[var(--c-bg)] bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]" />
              </div>
              <div className="text-left ml-2">
                <p className="font-bold text-[var(--c-text)]">10,000+ Users</p>
                <p className="text-xs text-[var(--c-muted)] font-medium">Building habits daily</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[var(--c-text)] mb-10" style={fontDisplay}>Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)] hover:bg-[var(--c-surface-soft)]/50 transition-colors">
                <h4 className="text-lg font-bold text-[var(--c-text)] mb-2">{faq.q}</h4>
                <p className="text-[var(--c-muted)] font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
