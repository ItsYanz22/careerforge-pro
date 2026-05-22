import mongoose from 'mongoose'

interface IResumeShare {
  _id?: string
  resumeId: string
  userId: string
  shareToken: string
  sharedWith: string[] // Array of email addresses or user IDs
  shareType: 'public' | 'private' | 'link'
  permissions: {
    canView: boolean
    canComment: boolean
    canDownload: boolean
    canShare: boolean
    canEdit: boolean
  }
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  viewedBy: {
    userId?: string
    email: string
    viewedAt: Date
  }[]
  comments: {
    id: string
    userId: string
    userName: string
    text: string
    section: string // resume section being commented on
    createdAt: Date
    updatedAt: Date
    resolved: boolean
  }[]
  metadata: {
    isPublic: boolean
    allowComments: boolean
    allowDownload: boolean
    customMessage?: string
  }
}

const resumeShareSchema = new mongoose.Schema<IResumeShare>(
  {
    resumeId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    shareToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => require('crypto').randomBytes(32).toString('hex'),
    },
    sharedWith: {
      type: [String],
      default: [],
    },
    shareType: {
      type: String,
      enum: ['public', 'private', 'link'],
      default: 'private',
    },
    permissions: {
      canView: { type: Boolean, default: true },
      canComment: { type: Boolean, default: true },
      canDownload: { type: Boolean, default: false },
      canShare: { type: Boolean, default: false },
      canEdit: { type: Boolean, default: false },
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    viewedBy: [
      {
        userId: String,
        email: { type: String, required: true },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        id: { type: String, default: () => require('crypto').randomUUID() },
        userId: String,
        userName: String,
        text: { type: String, required: true },
        section: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false },
      },
    ],
    metadata: {
      isPublic: { type: Boolean, default: false },
      allowComments: { type: Boolean, default: true },
      allowDownload: { type: Boolean, default: false },
      customMessage: String,
    },
  },
  { timestamps: true }
)

// Indexes for common queries
resumeShareSchema.index({ userId: 1, createdAt: -1 })
resumeShareSchema.index({ shareToken: 1 })
resumeShareSchema.index({ sharedWith: 1 })
resumeShareSchema.index({ expiresAt: 1 })

// Auto-delete expired shares (TTL index)
resumeShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const ResumeShare = mongoose.model<IResumeShare>('ResumeShare', resumeShareSchema)
export type { IResumeShare }
