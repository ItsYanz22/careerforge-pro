import mongoose, { Document, Schema } from 'mongoose';

export interface UserFeatures {
  premiumTemplates: boolean;
  unlimitedExports: boolean;
  advancedAI: boolean;
  coverLetterGenerator: boolean;
  advancedATS: boolean;
  unlimitedResumes: boolean;
  // Week 4 feature flags
  jobMatching: boolean;
  collaboration: boolean;
  versionComparison: boolean;
  docxExport: boolean;
  pdfExport: boolean; // Free users get basic PDF export
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  currentPlan: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  features: UserFeatures;
  aiUsageCount: number;
  aiUsageResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Optional for OAuth
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    subscription: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
      deprecated: true, // Use currentPlan instead
    },
    stripeCustomerId: {
      type: String,
    },
    currentPlan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active',
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    aiUsageCount: {
      type: Number,
      default: 0,
    },
    aiUsageResetDate: {
      type: Date,
      default: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      },
    },
    features: {
      type: {
        premiumTemplates: { type: Boolean, default: false },
        unlimitedExports: { type: Boolean, default: false },
        advancedAI: { type: Boolean, default: false },
        coverLetterGenerator: { type: Boolean, default: false },
        advancedATS: { type: Boolean, default: false },
        unlimitedResumes: { type: Boolean, default: false },
        // Week 4 feature flags
        jobMatching: { type: Boolean, default: false },
        collaboration: { type: Boolean, default: false },
        versionComparison: { type: Boolean, default: false },
        docxExport: { type: Boolean, default: false },
        pdfExport: { type: Boolean, default: true }, // All users get basic PDF export
      },
      default: {
        premiumTemplates: false,
        unlimitedExports: false,
        advancedAI: false,
        coverLetterGenerator: false,
        advancedATS: false,
        unlimitedResumes: false,
        jobMatching: false,
        collaboration: false,
        versionComparison: false,
        docxExport: false,
        pdfExport: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups — email is already unique: true above, so no separate index needed
userSchema.index({ stripeCustomerId: 1 });

// Exclude password from being returned in queries
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Helper method to check if user has feature
userSchema.methods.hasFeature = function (feature: keyof UserFeatures): boolean {
  return this.features?.[feature] === true;
};

export const User = mongoose.model<IUser>('User', userSchema);
