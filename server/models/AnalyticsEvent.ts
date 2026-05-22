import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  userId: mongoose.Types.ObjectId;
  eventType: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// 90-day TTL index — MongoDB auto-deletes documents after 90 days
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);
