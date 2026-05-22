import mongoose, { Document, Schema } from 'mongoose';

export interface IATSReport extends Document {
  resumeId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  overallScore: number;
  keywordMatch: number;
  formattingScore: number;
  readabilityScore: number;
  completeness: number;
  // Week 4 advanced fields (optional — existing documents remain valid)
  semanticScore?: number;
  roleCompatibility?: number;
  formattingCompatibility?: number;
  missingKeywordInsights?: Array<{
    keyword: string;
    estimatedImportance: number;
    suggestedSection: string;
  }>;
  issues: {
    type: 'critical' | 'warning' | 'info';
    message: string;
    field?: string;
  }[];
  suggestions: {
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    impact: string;
  }[];
  hardSkills?: string[];
  softSkills?: string[];
  recruiterLikelihood?: number;
  overallFeedback?: string;
  createdAt: Date;
}

const atsReportSchema = new Schema<IATSReport>(
  {
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    overallScore: { type: Number, required: true },
    keywordMatch: { type: Number, required: true },
    formattingScore: { type: Number, required: true },
    readabilityScore: { type: Number, required: true },
    completeness: { type: Number, required: true },
    // Week 4 advanced fields — all optional, no defaults needed
    semanticScore: { type: Number },
    roleCompatibility: { type: Number },
    formattingCompatibility: { type: Number },
    missingKeywordInsights: [
      {
        keyword: { type: String },
        estimatedImportance: { type: Number },
        suggestedSection: { type: String },
      },
    ],
    issues: [
      {
        type: {
          type: String,
          enum: ['critical', 'warning', 'info'],
          required: true,
        },
        message: { type: String, required: true },
        field: { type: String },
      },
    ],
    suggestions: [
      {
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
          required: true,
        },
        suggestion: { type: String, required: true },
        impact: { type: String, required: true },
      },
    ],
    hardSkills: [{ type: String }],
    softSkills: [{ type: String }],
    recruiterLikelihood: { type: Number },
    overallFeedback: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // ATS Reports are historical snapshots
  }
);

export const ATSReport = mongoose.model<IATSReport>('ATSReport', atsReportSchema);
