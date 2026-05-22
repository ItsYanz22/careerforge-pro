import mongoose, { Schema, Document } from 'mongoose';

export interface ICoverLetter extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId?: mongoose.Types.ObjectId | null;
  sourceType: 'existing' | 'uploaded';
  uploadedResumeName?: string;
  uploadedResumeText?: string;
  parsedResumeData?: any;
  title: string;
  jobDescription: string;
  tone: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CoverLetterSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', default: null },
  sourceType: { 
    type: String, 
    enum: ['existing', 'uploaded'], 
    required: true,
    default: 'existing'
  },
  uploadedResumeName: { type: String },
  uploadedResumeText: { type: String },
  parsedResumeData: { type: Schema.Types.Mixed },
  title: { type: String, required: true },
  jobDescription: { type: String, required: true },
  tone: { type: String, default: 'professional' },
  content: { type: String, required: true },
}, { timestamps: true });

export const CoverLetter = mongoose.model<ICoverLetter>('CoverLetter', CoverLetterSchema);
