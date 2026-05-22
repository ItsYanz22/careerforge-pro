import mongoose, { Schema, Document } from 'mongoose';

export interface IJobMatch extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescription: string;
  jobTitle?: string;
  jobCompany?: string;
  matchPercentage: number;
  keywordDensity: number;
  semanticSimilarity: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  hardSkillsMatch: {
    matched: string[];
    density: number;
  };
  softSkillsMatch: {
    matched: string[];
    density: number;
  };
  recommendations: Array<{
    category: 'critical' | 'high' | 'medium' | 'low';
    section: string;
    suggestion: string;
    impact: string;
    estimatedScoreIncrease: number;
  }>;
  tailoringNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobMatchSchema = new Schema<IJobMatch>(
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
    jobDescription: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
    },
    jobCompany: {
      type: String,
    },
    matchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    keywordDensity: {
      type: Number,
      required: true,
    },
    semanticSimilarity: {
      type: Number,
      required: true,
    },
    matchedKeywords: [String],
    missingKeywords: [String],
    hardSkillsMatch: {
      matched: [String],
      density: Number,
    },
    softSkillsMatch: {
      matched: [String],
      density: Number,
    },
    recommendations: [
      {
        category: {
          type: String,
          enum: ['critical', 'high', 'medium', 'low'],
        },
        section: String,
        suggestion: String,
        impact: String,
        estimatedScoreIncrease: Number,
      },
    ],
    tailoringNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
JobMatchSchema.index({ userId: 1, resumeId: 1 });
JobMatchSchema.index({ matchPercentage: -1 });
JobMatchSchema.index({ createdAt: -1 });

export const JobMatch = mongoose.model<IJobMatch>('JobMatch', JobMatchSchema);
