import React, { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { CheckCircle, AlertCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { subscriptionApi } from '@api/subscription.api';
import { useAuthStore } from '../../stores/authStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { motion } from 'framer-motion';
import { notify } from '../../stores/notificationStore';

/**
 * Checkout Success Page
 * Verifies Stripe session, refreshes auth state, shows confirmation.
 */
export const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { session_id?: string };
  const { fetchMe } = useAuthStore();
  const { setSubscription } = useSubscriptionStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [planName, setPlanName] = useState('Pro');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = search?.session_id;

    if (!sessionId) {
      navigate({ to: '/dashboard/subscription' });
      return;
    }

    const verify = async () => {
      try {
        // Verify session with backend
        const session = await subscriptionApi.getCheckoutSession(sessionId);

        if (session.paymentStatus !== 'paid') {
          setErrorMsg('Payment was not completed. Please try again.');
          setStatus('error');
          return;
        }

        // Refresh auth store so feature flags update immediately
        await fetchMe();

        // Sync subscription store
        const sub = await subscriptionApi.getCurrentSubscription();
        setSubscription({
          plan: sub.plan ?? 'pro',
          status: sub.status ?? 'active',
          features: sub.features as any,
          startDate: sub.startDate,
          endDate: sub.endDate,
        });

        setPlanName((sub.plan ?? 'pro').charAt(0).toUpperCase() + (sub.plan ?? 'pro').slice(1));
        notify.subscriptionUpgraded((sub.plan ?? 'pro').charAt(0).toUpperCase() + (sub.plan ?? 'pro').slice(1));
        setStatus('success');

        // Auto-redirect after 4s
        setTimeout(() => navigate({ to: '/dashboard' }), 4000);
      } catch (err: any) {
        console.error('[checkout-success] error:', err);
        setErrorMsg(err?.message ?? 'Failed to verify subscription');
        setStatus('error');
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Loading */}
        {status === 'loading' && (
          <div className="bg-card border-border rounded-2xl border p-10 text-center shadow-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground dark:text-white mb-2">
              Confirming your payment…
            </h1>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              This only takes a moment.
            </p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="bg-card border-border rounded-2xl border p-10 text-center shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome to {planName}!
            </h1>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">
              Your subscription is active. All premium features are now unlocked.
            </p>

            {/* Feature highlights */}
            <div className="bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.1)] rounded-xl p-4 mb-8 text-left space-y-2">
              {[
                'Unlimited resumes',
                'All premium templates',
                'Unlimited AI rewrites',
                'Cover letter generator',
                'Full PDF export',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))]">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)] text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              Redirecting automatically in a few seconds…
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="bg-card border-border rounded-2xl border p-10 text-center shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-2xl mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            <h1 className="text-xl font-semibold text-foreground dark:text-white mb-2">
              Payment verification failed
            </h1>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">
              {errorMsg ?? 'There was an issue confirming your payment.'}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => navigate({ to: '/dashboard/subscription' })}
                className="w-full px-4 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)] text-white rounded-xl font-semibold text-sm transition-colors"
              >
                Back to Subscription
              </button>
              <button
                onClick={() => navigate({ to: '/dashboard' })}
                className="w-full px-4 py-2.5 text-muted-foreground dark:text-muted-foreground hover:bg-background dark:hover:bg-card rounded-xl text-sm transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutSuccessPage;
