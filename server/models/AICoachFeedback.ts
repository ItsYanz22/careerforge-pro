import mongoose, { Schema, Document } from 'mongoose';

export interface IAICoachFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  section: 'experience' | 'summary' | 'skills' | 'education' | 'projects' | 'full';
  bulletIndex?: number;
  content: string;
  issues: Array<{
    type: 'weak' | 'passive' | 'vague' | 'short' | 'grammar' | 'formatting';
    text: string;
    severity: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  suggestions: Array<{
    category: 'action-verb' | 'metric' | 'keyword' | 'structure' | 'clarity' | 'impact';
    suggestion: string;
    example: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  originalVersion: string;
  improvedVersion?: string;
  scoreImpact: number;
  status: 'pending' | 'reviewed' | 'applied'; // User acceptance status
  createdAt: Date;
  updatedAt: Date;
}

const AICoachFeedbackSchema = new Schema<IAICoachFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    section: {
      type: String,
      enum: ['experience', 'summary', 'skills', 'education', 'projects', 'full'],
      required: true,
    },
    bulletIndex: {
      type: Number,
    },
    content: {
      type: String,
      required: true,
    },
    issues: [
      {
        type: {
          type: String,
          enum: ['weak', 'passive', 'vague', 'short', 'grammar', 'formatting'],
        },
        text: String,
        severity: {
          type: String,
          enum: ['high', 'medium', 'low'],
        },
        explanation: String,
      },
    ],
    suggestions: [
      {
        category: {
          type: String,
          enum: ['action-verb', 'metric', 'keyword', 'structure', 'clarity', 'impact'],
        },
        suggestion: String,
        example: String,
        impact: String,
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
        },
      },
    ],
    originalVersion: {
      type: String,
      required: true,
    },
    improvedVersion: {
      type: String,
    },
    scoreImpact: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'applied'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
AICoachFeedbackSchema.index({ userId: 1, resumeId: 1 });
AICoachFeedbackSchema.index({ createdAt: -1 });

export const AICoachFeedback = mongoose.model<IAICoachFeedback>('AICoachFeedback', AICoachFeedbackSchema);
