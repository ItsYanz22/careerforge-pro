import { useEffect, useState } from 'react';
import { Check, Crown, Zap, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../stores/authStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { subscriptionApi } from '../../api/subscription.api';
import { PremiumBadge } from '../../components/premium/PremiumUI';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { notify } from '../../stores/notificationStore';

interface Plan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  interval: string;
  popular?: boolean;
  features: string[];
}

const FAQ_ITEMS = [
  { q: 'Can I switch plans anytime?', a: 'Yes — upgrade or downgrade at any time. Changes take effect immediately.' },
  { q: 'What payment methods do you accept?', a: 'All major credit and debit cards via Stripe: Visa, Mastercard, Amex, and more.' },
  { q: 'Is there a free trial?', a: "The Free plan lets you explore CareerForge Pro. Upgrade whenever you're ready." },
  { q: 'Can I cancel anytime?', a: 'Absolutely — cancel with no penalties. Access continues until the end of your billing period.' },
];

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'mo',
    features: [
      '1 Resume',
      'Basic templates',
      'PDF export',
      'ATS score check',
      '5 AI rewrites/month',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15,
    interval: 'mo',
    popular: true,
    features: [
      'Unlimited resumes',
      'All 12+ premium templates',
      'Unlimited AI rewrites',
      'Advanced ATS engine',
      'Job matching & tailoring',
      'DOCX export',
      'Version history',
      'Cover letter generator',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'mo',
    features: [
      'Everything in Pro',
      'Unlimited team seats',
      'Advanced ATS analytics',
      'Priority support',
      'Custom branding',
      'SSO & admin controls',
    ],
  },
];

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();
  const { setSubscription } = useSubscriptionStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [plansData, sub] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getCurrentSubscription(),
      ]);
      setPlans(plansData as Plan[]);
      setCurrentSub(sub);
      setSubscription({ plan: sub.plan, status: sub.status, features: sub.features as any, startDate: sub.startDate, endDate: sub.endDate });
    } catch (err: any) {
      console.error('[subscription] loadData error:', err);
      // Fallback: use default free plan and default plans
      setPlans(DEFAULT_PLANS);
      setCurrentSub({
        plan: 'free',
        status: 'active',
        features: {
          premiumTemplates: false,
          unlimitedExports: false,
          advancedAI: false,
          coverLetterGenerator: false,
          advancedATS: false,
          unlimitedResumes: false,
        },
      });
      setSubscription({
        plan: 'free',
        status: 'active',
        features: {
          premiumTemplates: false,
          unlimitedExports: false,
          advancedAI: false,
          coverLetterGenerator: false,
          advancedATS: false,
          unlimitedResumes: false,
        },
        startDate: undefined,
        endDate: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: 'pro' | 'enterprise') => {
    if (!user) { navigate({ to: '/auth/login' }); return; }
    try {
      setProcessingPlan(planId);
      const res = await subscriptionApi.createCheckoutSession(planId);
      if (res.url) window.location.href = res.url;
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to start checkout');
    } finally { setProcessingPlan(null); }
  };

  const handleBillingPortal = async () => {
    try {
      setProcessingPlan('portal');
      const res = await subscriptionApi.createBillingPortalSession();
      if (res.url) window.location.href = res.url;
    } catch { toast.error('Failed to open billing portal'); }
    finally { setProcessingPlan(null); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? Access continues until the end of your billing period.')) return;
    try {
      setProcessingPlan('cancel');
      await subscriptionApi.cancelSubscription();
      notify.subscriptionCancelled();
      toast.success('Subscription canceled');
      await fetchMe();
      loadData();
    } catch { toast.error('Failed to cancel subscription'); }
    finally { setProcessingPlan(null); }
  };

  const currentPlan = currentSub?.plan ?? 'free';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[hsl(var(--primary))] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground max-w-md mx-auto">
            Start free. Upgrade when you need more power.
          </p>
          {currentPlan !== 'free' && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.1)] border border-[hsl(var(--primary)_/_0.3)] dark:border-[hsl(var(--primary)_/_0.2)] rounded-full text-sm text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))]">
              <Crown className="w-3.5 h-3.5" />
              Current plan: <span className="font-semibold capitalize">{currentPlan}</span>
              <span className="text-[hsl(var(--primary))]">·</span>
              <span className="capitalize">{currentSub?.status}</span>
            </div>
          )}
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 mb-16 items-center pt-10 pb-10">
          {plans.map((plan, i) => {
            const isCurrent = plan.id === currentPlan;
            const isPro = plan.id === 'pro';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ delay: i * 0.08, duration: 0.2 }}
                className={`relative rounded-2xl p-7 flex flex-col transition-colors ${
                  isPro
                    ? 'text-white lg:scale-105 lg:-my-2 z-10 pt-14'
                    : 'bg-card border-border text-foreground'
                }`}
                style={isPro ? {
                  background: 'var(--gradient-primary)',
                  boxShadow: 'var(--shadow-accent)',
                } : { boxShadow: 'var(--shadow-card)' }}
              >
                {/* Popular badge */}
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <PremiumBadge text="Most Popular" />
                  </div>
                )}

                {/* Current badge */}
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isPro ? 'bg-white/20 text-white' : 'bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))]'}`}>
                      Current
                    </span>
                  </div>
                )}

                {/* Plan info */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    {plan.id === 'enterprise' && <Crown className="w-4 h-4 text-amber-400" />}
                    <h2 className={`text-base font-bold ${isPro ? 'text-white' : 'text-foreground'}`}>
                      {plan.name}
                    </h2>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${isPro ? 'text-white' : 'text-foreground'}`}>
                      ${plan.price}
                    </span>
                    <span className={`text-sm ${isPro ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground dark:text-muted-foreground'}`}>
                      /{plan.interval}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isPro ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--primary))]'}`} />
                      <span className={isPro ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.id === 'free' ? (
                  <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-secondary dark:bg-card text-muted-foreground cursor-not-allowed">
                    {isCurrent ? 'Current Plan' : 'Free Forever'}
                  </button>
                ) : isCurrent ? (
                  <div className="space-y-2">
                    <button onClick={handleBillingPortal} disabled={!!processingPlan}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${isPro ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}>
                      {processingPlan === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                      Manage Billing
                    </button>
                    <button onClick={handleCancel} disabled={!!processingPlan}
                      className={`w-full py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-60 ${isPro ? 'text-primary-100 hover:bg-white/10' : 'text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20'}`}>
                      {processingPlan === 'cancel' ? 'Canceling…' : 'Cancel Subscription'}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleUpgrade(plan.id as 'pro' | 'enterprise')} disabled={!!processingPlan}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
                      isPro
                        ? 'bg-white text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)]'
                        : 'border border-border dark:border-border text-zinc-700 dark:text-zinc-300 hover:bg-background dark:hover:bg-card'
                    }`}>
                    {processingPlan === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>{isPro ? <Zap className="w-4 h-4" /> : <Crown className="w-4 h-4" />} Upgrade to {plan.name} <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-foreground text-center mb-7">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="bg-card border-border rounded-xl border p-5" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">{item.q}</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
