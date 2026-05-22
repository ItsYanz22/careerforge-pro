import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  profile: {
    phone?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
  };
  appearance: {
    darkMode: boolean;
    themeMode: 'system' | 'light' | 'dark';
    accentColor: 'emerald' | 'forest' | 'sage' | 'green';
    spacing: 'compact' | 'comfortable' | 'spacious';
    typography: 'default' | 'comfortable' | 'wide';
  };
  resumePreferences: {
    defaultTemplate: string;
    defaultFont: string;
    defaultExportFormat: 'pdf' | 'docx' | 'json';
    autoSaveInterval: number;
    atsOptimizationMode: boolean;
  };
  notificationPreferences: {
    exportNotifications: boolean;
    aiRewriteCompletion: boolean;
    atsScoreUpdates: boolean;
    subscriptionAlerts: boolean;
    resumeSavedAlerts: boolean;
    emailNotifications: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChangeAt?: Date;
  };
}

const userPreferencesSchema = new Schema<IUserPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    profile: {
      phone: String,
      linkedinUrl: String,
      githubUrl: String,
      portfolioUrl: String,
      profilePictureUrl: String,
    },
    appearance: {
      darkMode: { type: Boolean, default: false },
      themeMode: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
      accentColor: { type: String, enum: ['emerald', 'forest', 'sage', 'green'], default: 'emerald' },
      spacing: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
      typography: { type: String, enum: ['default', 'comfortable', 'wide'], default: 'default' },
    },
    resumePreferences: {
      defaultTemplate: { type: String, default: 'Modern' },
      defaultFont: { type: String, default: 'Inter' },
      defaultExportFormat: { type: String, enum: ['pdf', 'docx', 'json'], default: 'pdf' },
      autoSaveInterval: { type: Number, default: 30 },
      atsOptimizationMode: { type: Boolean, default: false },
    },
    notificationPreferences: {
      exportNotifications: { type: Boolean, default: true },
      aiRewriteCompletion: { type: Boolean, default: true },
      atsScoreUpdates: { type: Boolean, default: true },
      subscriptionAlerts: { type: Boolean, default: true },
      resumeSavedAlerts: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false },
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      lastPasswordChangeAt: Date,
    },
  },
  { timestamps: true }
);

export const UserPreferences = mongoose.model<IUserPreferences>(
  'UserPreferences',
  userPreferencesSchema
);
