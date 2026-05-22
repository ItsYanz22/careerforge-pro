import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@careerforge-pro.com';

export const emailService = {
  sendWelcomeEmail: async (email: string, name: string) => {
    if (!process.env.SENDGRID_API_KEY) return;
    
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: 'Welcome to CareerForge Pro! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #10b981;">Welcome, ${name}!</h1>
          <p>We're thrilled to have you on board. CareerForge Pro is here to help you build the perfect resume and land your dream job.</p>
          <p>Start by creating your first resume or checking your ATS score.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Go to Dashboard</a>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[Email] Welcome email sent to ${email}`);
    } catch (error) {
      console.error('[Email] Failed to send welcome email', error);
    }
  },

  sendSubscriptionSuccessEmail: async (email: string, plan: string) => {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('[Email] SENDGRID_API_KEY not set — skipping subscription email');
      return;
    }

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: 'CareerForge Pro — Subscription Activated! 👑',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #10b981;">Pro Plan Activated</h1>
          <p>Thank you for subscribing to the <strong>${plan}</strong> plan.</p>
          <p>You now have unlimited access to all premium features:</p>
          <ul>
            <li>Unlimited PDF & DOCX Exports</li>
            <li>Premium Resume Templates</li>
            <li>Advanced AI Resume Coach</li>
            <li>Job Matching & Tailoring</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Start Building</a>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[Email] subscription_confirmation sent to ${email}`);
    } catch (error) {
      console.error('[Email] Failed to send subscription email', { to: email, type: 'subscription_confirmation', error });
    }
  },

  sendExportConfirmationEmail: async (
    email: string,
    name: string,
    format: 'PDF' | 'DOCX',
    resumeTitle: string,
    dashboardUrl: string
  ) => {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('[Email] SENDGRID_API_KEY not set — skipping export confirmation email');
      return;
    }

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: `CareerForge Pro — Your ${format} is ready!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #10b981;">Export Successful</h1>
          <p>Hi ${name},</p>
          <p>Your resume <strong>"${resumeTitle}"</strong> has been exported as a <strong>${format}</strong> file.</p>
          <p>Head back to your dashboard to manage your resumes or run another ATS analysis.</p>
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Go to Dashboard</a>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[Email] export_confirmation sent to ${email}`);
    } catch (error) {
      console.error('[Email] Failed to send export confirmation email', { to: email, type: 'export_confirmation', error });
    }
  },

  sendATSImprovementEmail: async (
    email: string,
    name: string,
    oldScore: number,
    newScore: number,
    suggestions: string[]
  ) => {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('[Email] SENDGRID_API_KEY not set — skipping ATS improvement email');
      return;
    }

    const improvement = newScore - oldScore;
    const suggestionList = suggestions.slice(0, 3).map(s => `<li>${s}</li>`).join('');

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: `CareerForge Pro — Your ATS score improved by ${improvement} points! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #10b981;">ATS Score Improved!</h1>
          <p>Hi ${name},</p>
          <p>Great news! Your resume ATS score improved from <strong>${oldScore}</strong> to <strong>${newScore}</strong> — a gain of <strong>+${improvement} points</strong>.</p>
          <h3 style="color: #10b981;">Top Suggestions to Keep Improving:</h3>
          <ul>${suggestionList}</ul>
          <a href="${process.env.FRONTEND_URL}/dashboard/ats" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">View Full ATS Report</a>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[Email] ats_improvement sent to ${email}`);
    } catch (error) {
      console.error('[Email] Failed to send ATS improvement email', { to: email, type: 'ats_improvement', error });
    }
  },

  sendPasswordResetEmail: async (email: string, name: string, resetLink: string) => {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('[Email] SENDGRID_API_KEY not set — skipping password reset email');
      return;
    }

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: 'CareerForge Pro — Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #10b981;">Reset Your Password</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your CareerForge Pro password. Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[Email] password_reset sent to ${email}`);
    } catch (error) {
      console.error('[Email] Failed to send password reset email', { to: email, type: 'password_reset', error });
    }
  },
};
