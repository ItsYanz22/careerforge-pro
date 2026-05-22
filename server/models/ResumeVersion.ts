import mongoose, { Document, Schema } from 'mongoose';

export interface IResumeVersion extends Document {
  resumeId: mongoose.Types.ObjectId;
  versionNumber: number;
  data: any; // Entire resume data snapshot
  template?: string;
  theme?: string;
  font?: string;
  spacing?: any;
  atsScore?: number; // ATS score at time of version save
  createdAt: Date;
}

const resumeVersionSchema = new Schema<IResumeVersion>(
  {
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    template: {
      type: String,
    },
    theme: {
      type: String,
    },
    font: {
      type: String,
    },
    spacing: {
      type: Schema.Types.Mixed,
    },
    atsScore: {
      type: Number,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Versions are immutable
  }
);

// Ensure version number is unique per resume
resumeVersionSchema.index({ resumeId: 1, versionNumber: 1 }, { unique: true });

export const ResumeVersion = mongoose.model<IResumeVersion>('ResumeVersion', resumeVersionSchema);
