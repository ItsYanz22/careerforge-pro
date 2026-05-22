import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Sparkles, X, ArrowRight, Crown } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../stores/authStore';
import { UserFeatures } from '../../types';

// ── LockIndicator ─────────────────────────────────────────────────────────────

interface LockIndicatorProps {
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Subtle lock overlay for premium template thumbnails.
 */
export const LockIndicator: React.FC<LockIndicatorProps> = ({
  size = 'md',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div
      className={`
        absolute inset-0 flex items-center justify-center
        bg-black/40 backdrop-blur-[1px] rounded-inherit
        ${className}
      `}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="p-1.5 bg-white/90 rounded-full shadow-sm">
          <Lock className={`${iconSize} text-foreground-muted`} />
        </div>
        {size === 'md' && (
          <span className="text-white text-[10px] font-medium bg-black/50 px-2 py-0.5 rounded-full">
            Pro
          </span>
        )}
      </div>
    </div>
  );
};

// ── UpgradeModal ──────────────────────────────────────────────────────────────

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  description?: string;
}

/**
 * Elegant upgrade prompt modal rendered as portal.
 * Reads feature availability from authStore — no hardcoded plan checks.
 * Renders at document root to overlay entire screen above header/sidebar.
 */
export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName,
  description,
}) => {
  const navigate = useNavigate();

  // Lock/unlock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate({ to: '/dashboard/subscription' });
  };

  // Render as portal at document root (outside DashboardLayout)
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full-screen Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - positioned on top of everything */}
      <div className="relative bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.1)] rounded-xl mb-4">
          <Crown className="w-6 h-6 text-[hsl(var(--primary))]" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Unlock {featureName}
        </h3>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-6">
          {description ??
            `${featureName} is available on the Pro plan. Upgrade to access this and all other premium features.`}
        </p>

        {/* Pro features teaser */}
        <ul className="space-y-2 mb-6">
          {[
            'Unlimited resumes',
            'All premium templates',
            'Unlimited AI rewrites',
            'Cover letter generator',
            'Full PDF export',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground-muted">
              <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--primary))] flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUpgrade}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl
              bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)] active:scale-[0.98]
              text-white text-sm font-semibold
              transition-all duration-150 shadow-sm
            "
          >
            Upgrade to Pro
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="
              w-full px-4 py-2.5 rounded-xl
              text-muted-foreground dark:text-muted-foreground text-sm
              hover:bg-background dark:hover:bg-card
              transition-colors
            "
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>,
    document.body  // Render at body root to appear above all other elements
  );
};

// ── FeatureGate ───────────────────────────────────────────────────────────────

interface FeatureGateProps {
  feature: keyof UserFeatures;
  featureName: string;
  description?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that gates children behind a feature flag.
 * Reads from authStore.user.features — never checks plan name directly.
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  featureName,
  description,
  children,
  fallback,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const hasFeature = user?.features?.[feature] === true;

  if (hasFeature) return <>{children}</>;

  return (
    <>
      <div
        className="cursor-pointer"
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setModalOpen(true)}
      >
        {fallback ?? (
          <div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground text-sm">
            <Lock className="w-4 h-4" />
            <span>{featureName}</span>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureName={featureName}
        description={description}
      />
    </>
  );
};

// ── PremiumBadge ──────────────────────────────────────────────────────────────

interface PremiumBadgeProps {
  size?: 'sm' | 'md';
  text?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  size = 'md',
  text = 'Pro',
}) => {
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-semibold rounded-full
        bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))]
        ${padding}
      `}
    >
      <Crown className="w-3 h-3" />
      {text}
    </span>
  );
};

// ── usePremiumFeature hook ────────────────────────────────────────────────────

/**
 * Hook to check feature access and manage upgrade modal state.
 * Usage:
 *   const { hasAccess, modalProps, requireAccess } = usePremiumFeature('premiumTemplates', 'Premium Templates');
 */
export function usePremiumFeature(
  feature: keyof UserFeatures,
  featureName: string,
  description?: string
) {
  const [modalOpen, setModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const hasAccess = user?.features?.[feature] === true;

  const requireAccess = (callback?: () => void) => {
    if (hasAccess) {
      callback?.();
    } else {
      setModalOpen(true);
    }
  };

  const modalProps = {
    isOpen: modalOpen,
    onClose: () => setModalOpen(false),
    featureName,
    description,
  };

  return { hasAccess, modalProps, requireAccess };
}
