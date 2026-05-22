import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../../stores/authStore';
import { subscriptionApi } from '../../../api/subscription.api';
import { CreditCard, Calendar, Check, ArrowRight, Loader2, ExternalLink, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SubscriptionSettings() {
  const { user, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const [subData, setSubData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      const sub = await subscriptionApi.getCurrentSubscription();
      setSubData(sub);
    } catch {
      // Fall back to user data from auth store
      setSubData({
        plan: user?.currentPlan ?? 'free',
        status: user?.subscriptionStatus ?? 'active',
        features: user?.features,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      const res = await subscriptionApi.createCheckoutSession('pro');
      if (res.url) window.location.href = res.url;
    } catch {
      toast.error('Failed to start checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBillingPortal = async () => {
    try {
      setIsProcessing(true);
      const res = await subscriptionApi.createBillingPortalSession();
      if (res.url) window.location.href = res.url;
    } catch {
      toast.error('Failed to open billing portal');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? Access continues until the end of your billing period.')) return;
    try {
      setIsProcessing(true);
      await subscriptionApi.cancelSubscription();
      toast.success('Subscription cancelled');
      await fetchMe();
      loadSubscription();
    } catch {
      toast.error('Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-[hsl(var(--primary))] animate-spin" />
      </div>
    );
  }

  const plan = subData?.plan ?? 'free';
  const isPro = plan !== 'free';
  const status = subData?.status ?? 'active';
  const renewalDate = subData?.endDate
    ? new Date(subData.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const FREE_FEATURES = ['1 Resume', 'Basic Templates', '5 AI Rewrites / month', 'Basic PDF Export'];
  const PRO_FEATURES  = ['Unlimited Resumes', 'All Premium Templates', 'Unlimited AI Rewrites', 'Cover Letter Generator', 'Full PDF Export'];

  return (
    <div className="space-y-5">
      {/* Current plan card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border-2 p-6 ${
          isPro
            ? 'bg-gradient-to-br from-[hsl(var(--primary)_/_0.05)] to-[hsl(var(--primary)_/_0.15)] border-[hsl(var(--primary)_/_0.2)] dark:border-[hsl(var(--primary)_/_0.2)]'
            : 'bg-card border-border'
        }`}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isPro && <Crown className="w-5 h-5 text-[hsl(var(--primary))]" />}
              <h3 className="text-xl font-bold text-foreground capitalize">{plan} Plan</h3>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              status === 'active'
                ? 'bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))]'
                : 'bg-warning/10 text-warning'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
          {isPro && (
            <span className="text-2xl font-black text-foreground">
              $15<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </span>
          )}
        </div>

        <ul className="space-y-2.5 mb-6">
          {(isPro ? PRO_FEATURES : FREE_FEATURES).map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="space-y-2">
          {!isPro ? (
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Upgrade to Pro — $15/month
            </button>
          ) : (
            <>
              <button
                onClick={handleBillingPortal}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Manage Billing
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="w-full py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors disabled:opacity-60">
                Cancel Subscription
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Billing details */}
      {isPro && (
        <div className="bg-card border-border rounded-2xl border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Billing Details
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'Next renewal', value: renewalDate },
              { label: 'Billing cycle', value: 'Monthly' },
              { label: 'Plan price', value: '$15.00 / month' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-border last:border-0">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View full plans */}
      <button
        onClick={() => navigate({ to: '/dashboard/subscription' })}
        className="w-full py-2.5 text-sm font-medium text-muted-foreground dark:text-muted-foreground hover:text-[hsl(var(--primary))] dark:hover:text-[hsl(var(--primary))] hover:bg-background dark:hover:bg-card rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <CreditCard className="w-4 h-4" />
        View all plans
      </button>
    </div>
  );
}
