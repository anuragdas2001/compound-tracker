'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle2, 
  Sparkles, 
  Crown, 
  Zap,
  ArrowRight,
  ShieldCheck,
  LifeBuoy,
  Loader2,
  Check
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const PRICING_TIERS = [
  {
    id: 'STARTER',
    name: 'Starter',
    desc: 'Perfect for building your first consistent routine.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceLabel: '₹0',
    icon: Zap,
    color: '#9CA3AF',
    features: [
      'Track up to 3 daily habits',
      'Basic streak tracking',
      'Standard community access',
      'Bronze & Silver badges',
      '150 Welcome Sparks bonus',
    ],
    buttonText: 'Get Started Free',
    popular: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    desc: 'Unlock the full potential of your self-improvement journey.',
    monthlyPrice: 599,
    yearlyPrice: 416, // ₹4,999/year (~₹416/mo)
    yearlyTotal: 4999,
    icon: Sparkles,
    color: 'var(--c-primary)',
    features: [
      'Unlimited habit tracking',
      'Advanced analytics & 140-day heatmaps',
      'Premium gamification (Gold+ tiers)',
      'Global & National Leaderboards',
      'Custom habit schedules (Mon/Wed/Fri)',
      '+500 Bonus Sparks on upgrade',
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'ELITE',
    name: 'Elite',
    desc: 'For the highly dedicated. Pay once, own it forever.',
    monthlyPrice: 14999,
    yearlyPrice: 14999,
    isLifetime: true,
    icon: Crown,
    color: '#F59E0B',
    features: [
      'Everything in Pro forever',
      'Exclusive Elite profile badge 👑',
      'Early access to beta power-ups',
      'Direct priority developer support',
      'Unlimited custom themes',
      '+2,000 Bonus Sparks on upgrade',
    ],
    buttonText: 'Get Lifetime Access',
    popular: false,
  }
];

const FAQS = [
  {
    q: 'How does the Razorpay checkout work?',
    a: 'Razorpay provides instant payment support for UPI (Google Pay, PhonePe, Paytm), credit/debit cards, netbanking, and EMI with bank-grade 256-bit encryption.'
  },
  {
    q: 'Can I change my plan later?',
    a: 'Absolutely. You can upgrade to Elite lifetime anytime, or downgrade back to Starter from your profile settings.'
  },
  {
    q: 'Is the Elite plan really a one-time payment?',
    a: 'Yes! You pay once via Razorpay and get lifetime access to all current and future Pro/Elite features forever. No monthly or annual renewals.'
  },
  {
    q: 'What happens immediately after payment?',
    a: 'Your account is automatically upgraded instantly in real time. Your habit limit is lifted to unlimited, and bonus Sparks are credited directly to your vault.'
  }
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const currentPlan = (session?.user as any)?.plan || 'STARTER';

  const handleCheckout = async (planId: 'PRO' | 'ELITE') => {
    if (!session?.user) {
      toast.error('Please sign in to upgrade your plan.');
      router.push(`/login?callbackUrl=${encodeURIComponent('/pricing')}`);
      return;
    }

    const interval = planId === 'ELITE' ? 'lifetime' : (isYearly ? 'yearly' : 'monthly');
    setLoadingTier(planId);

    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, interval }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create order.');
        setLoadingTier(null);
        return;
      }

      // If in Dev / Mock mode without real Razorpay keys
      if (orderData.simulated) {
        toast.loading('Simulating payment confirmation...', { duration: 1500 });
        
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            paymentId: `pay_mock_${Date.now()}`,
            signature: 'simulated_dev_signature',
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
          toast.success(`🎉 ${verifyData.message || 'Upgraded successfully!'}`);
          await updateSession();
          router.push('/dashboard?upgraded=true');
        } else {
          toast.error(verifyData.error || 'Verification failed.');
        }
        setLoadingTier(null);
        return;
      }

      // Real Razorpay Checkout flow
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Could not load Razorpay payment gateway. Please check your internet connection.');
        setLoadingTier(null);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Habitly',
        description: `Upgrade to ${orderData.planName}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user?.name || '',
          email: orderData.user?.email || '',
        },
        theme: {
          color: '#a8fe43',
          backdrop_color: 'rgba(12, 13, 17, 0.9)',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              toast.success(`🎉 ${verifyData.message || 'Payment successful!'}`);
              await updateSession();
              router.push('/dashboard?upgraded=true');
            } else {
              toast.error(verifyData.error || 'Payment verification failed.');
            }
          } catch {
            toast.error('Error verifying payment.');
          } finally {
            setLoadingTier(null);
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingTier(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoadingTier(null);
      });
      rzp.open();
    } catch {
      toast.error('Network error while launching checkout.');
      setLoadingTier(null);
    }
  };

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
            Join thousands of others building unstoppable habits with Razorpay-powered instant activation.
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
              <span className="bg-[#10B981]/20 text-[#10B981] text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border border-[#10B981]/30 animate-pulse">Save 30%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto mb-32">
          {PRICING_TIERS.map((tier) => {
            const isPro = tier.id === 'PRO';
            const isElite = tier.id === 'ELITE';
            const isCurrent = currentPlan === tier.id;
            const isLoading = loadingTier === tier.id;

            return (
              <div 
                key={tier.id} 
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl shadow-sm" style={{ backgroundColor: `${tier.color}15`, color: tier.color }}>
                        <tier.icon size={22} />
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--c-text)]" style={fontDisplay}>{tier.name}</h3>
                    </div>

                    {isCurrent && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--c-primary)]/20 text-[var(--c-primary)] border border-[var(--c-primary)]/30 flex items-center gap-1">
                        <Check size={12} /> Active Plan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--c-muted)] font-medium h-10">{tier.desc}</p>
                  
                  <div className="mt-6 mb-8 flex items-end gap-1">
                    <span className="text-4xl sm:text-5xl font-bold text-[var(--c-text)] tracking-tight" style={fontMono}>
                      {tier.id === 'STARTER' 
                        ? '₹0' 
                        : tier.isLifetime 
                          ? `₹${tier.monthlyPrice.toLocaleString()}` 
                          : `₹${(isYearly ? tier.yearlyPrice : tier.monthlyPrice).toLocaleString()}`
                      }
                    </span>
                    {!tier.isLifetime && tier.id !== 'STARTER' && (
                      <span className="text-[var(--c-muted)] font-medium mb-1">/mo</span>
                    )}
                  </div>
                  
                  {/* Billing subtitle */}
                  <div className="h-4 mb-6">
                    {isYearly && isPro && (
                      <p className="text-xs text-[var(--c-primary)] font-semibold">Billed annually (₹{tier.yearlyTotal?.toLocaleString()}/year)</p>
                    )}
                    {!isYearly && isPro && (
                      <p className="text-xs text-[var(--c-muted)] font-medium">Billed monthly</p>
                    )}
                    {isElite && (
                      <p className="text-xs text-[#F59E0B] font-semibold">Pay once • Lifetime ownership</p>
                    )}
                  </div>

                  {/* Action CTA Button */}
                  {tier.id === 'STARTER' ? (
                    <Link 
                      href={session?.user ? "/dashboard" : "/signup"}
                      className="w-full py-4 rounded-[16px] font-bold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 bg-[var(--c-surface)] text-[var(--c-text)] border border-[var(--c-border)] hover:border-[var(--c-primary)]/50 hover:bg-[var(--c-surface-soft)]"
                    >
                      {session?.user ? "Go to Dashboard" : "Get Started Free"}
                      <ArrowRight size={18} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleCheckout(tier.id as 'PRO' | 'ELITE')}
                      disabled={isCurrent || isLoading}
                      className={`w-full py-4 rounded-[16px] font-bold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer ${
                        isCurrent 
                          ? 'opacity-60 cursor-not-allowed bg-[var(--c-surface-soft)] text-[var(--c-muted)] border border-[var(--c-border)]'
                          : isPro 
                            ? 'bg-[var(--c-primary)] text-[var(--c-bg)] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:-translate-y-0.5' 
                            : 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Preparing Razorpay...</span>
                        </>
                      ) : isCurrent ? (
                        <span>Currently Subscribed</span>
                      ) : (
                        <>
                          <span>{tier.buttonText}</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="p-8 pt-8 mt-4 border-t border-[var(--c-border)]/40 flex-1 flex flex-col justify-end">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--c-muted)] mb-4">What's included</p>
                  <ul className="space-y-4">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                           <CheckCircle2 size={18} className={isPro ? 'text-[var(--c-primary)]' : isElite ? 'text-[#F59E0B]' : 'text-[var(--c-muted)]'} />
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
                <p className="font-bold text-[var(--c-text)]">Razorpay Secured</p>
                <p className="text-xs text-[var(--c-muted)] font-medium">UPI, Cards, Netbanking & EMI</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-[var(--c-border)]" />
            <div className="flex items-center gap-3">
              <LifeBuoy size={28} className="text-[#3B82F6]" />
              <div className="text-left">
                <p className="font-bold text-[var(--c-text)]">24/7 Priority Support</p>
                <p className="text-xs text-[var(--c-muted)] font-medium">Always here to help you compound</p>
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
                <p className="font-bold text-[var(--c-text)]">10,000+ Habit Architects</p>
                <p className="text-xs text-[var(--c-muted)] font-medium">Building unstoppable momentum daily</p>
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
