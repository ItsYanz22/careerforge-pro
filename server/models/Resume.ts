import mongoose, { Document, Schema } from 'mongoose';

const resumeDataSchema = new Schema({
  personal: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    location: String,
    linkedIn: String,
    portfolio: String,
    github: String,
  },
  summary: String,
  experience: [
    {
      _id: String,
      jobTitle: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      isCurrentRole: Boolean,
      description: String,
      bulletPoints: [String],
      originalBulletPoints: [String],
    },
  ],
  education: [
    {
      _id: String,
      school: String,
      degree: String,
      field: String,
      graduationDate: String,
      gpa: String,
      description: String,
    },
  ],
  skills: [
    {
      category: String,
      items: [String],
    },
  ],
  certifications: [
    {
      _id: String,
      name: String,
      issuer: String,
      issueDate: String,
      expiryDate: String,
      credentialId: String,
      credentialUrl: String,
    },
  ],
  projects: [
    {
      _id: String,
      title: String,
      description: String,
      technologies: [String],
      startDate: String,
      endDate: String,
      link: String,
    },
  ],
  languages: [
    {
      _id: String,
      name: String,
      proficiency: {
        type: String,
        enum: ['Elementary', 'Intermediate', 'Advanced', 'Native'],
      },
    },
  ],
  volunteerExperience: [
    {
      _id: String,
      organization: String,
      role: String,
      location: String,
      startDate: String,
      endDate: String,
      description: String,
    },
  ],
}, { _id: false });

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  template: string;
  font: string;
  theme: string;
  spacing: {
    lineHeight: string;
    margins: {
      top: string;
      bottom: string;
      left: string;
      right: string;
    };
    sectionGap: string;
    bulletPointGap: string;
  };
  data: any;
  atsScore?: number;
  isPublic: boolean;
  shareId: string;
  comments: Array<{
    _id: mongoose.Types.ObjectId;
    text: string;
    recruiterName?: string;
    createdAt: Date;
    ipHash?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      default: 'modern-blue',
    },
    font: {
      type: String,
      default: 'roboto',
    },
    theme: {
      type: String,
      default: 'light',
    },
    spacing: {
      lineHeight: { type: String, default: 'normal' },
      margins: {
        top: { type: String, default: '24px' },
        bottom: { type: String, default: '24px' },
        left: { type: String, default: '24px' },
        right: { type: String, default: '24px' },
      },
      sectionGap: { type: String, default: '16px' },
      bulletPointGap: { type: String, default: '4px' },
    },
    data: {
      type: resumeDataSchema,
      default: () => ({}),
    },
    atsScore: {
      type: Number,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      unique: true,
      index: true,
      default: () => Math.random().toString(36).substring(2, 12),
    },
    comments: {
      type: [
        {
          text: { type: String, required: true, maxlength: 1000 },
          recruiterName: { type: String, maxlength: 100 },
          createdAt: { type: Date, default: Date.now },
          ipHash: { type: String },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
