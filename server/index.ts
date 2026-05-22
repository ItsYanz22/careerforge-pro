import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Load environment variables first
dotenv.config()

// Initialize Express app
const app: Express = express()
const PORT = process.env.PORT || 3000

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠ MONGODB_URI not set — running without database')
        return
      }
      throw new Error('MONGODB_URI environment variable is not set')
    }
    await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || 'careerforge-pro',
    })
    console.log('✓ MongoDB connected successfully')
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠ MongoDB connection failed:', error)
    } else {
      console.error('✗ MongoDB connection failed:', error)
      process.exit(1)
    }
  }
}

// Route imports
import authRoutes from './api/auth'
import resumeRoutes from './api/resumes'
import atsRoutes from './api/ats'
import aiRoutes from './api/ai'
import coachRoutes from './api/coach'
import jobsRoutes from './api/jobs'
import subscriptionRoutes from './api/subscriptions'
import coverLettersRoutes from './api/coverLetters'
import certificationsRoutes from './api/certifications'
import exportRoutes from './api/export'
import settingsRoutes from './api/settings'
import analyticsRoutes from './api/analytics'
import sharesRoutes from './api/shares'
import githubRoutes from './api/github'
import { validateEnv } from './utils/validateEnv'
import logger from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import { getHealthStatus } from './utils/healthCheck'
import { seedDemoAccount } from './scripts/seedDemoAccounts'

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https:', 'wss:'],
    },
  },
}))

// Allow all localhost origins in development; restrict in production
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true)
    }
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean)
    if (allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
}))

app.use(compression())

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`[${req.method}] ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.id,
    });
  });
  next();
});

// Stripe webhook MUST receive raw body — register before express.json()
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(morgan('dev'))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const healthStatus = await getHealthStatus()
    res.status(healthStatus.status === 'healthy' ? 200 : 503).json(healthStatus)
  } catch (error) {
    logger.error('Health check failed', error)
    res.status(503).json({ status: 'unhealthy', error: 'Health check failed' })
  }
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/ats', atsRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/ai', coachRoutes)
app.use('/api/jobs', jobsRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/cover-letters', coverLettersRoutes)
app.use('/api/certifications', certificationsRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/shares', sharesRoutes)
app.use('/api/github', githubRoutes)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    validateEnv()
    await connectDB()
    // Seed demo account in all environments (idempotent)
    await seedDemoAccount()
    app.listen(PORT, () => {
      logger.info(`🚀 CareerForge Pro → http://localhost:${PORT}`)
      logger.info(`📡 API → http://localhost:${PORT}/api`)
      logger.info(`✓ Server started in ${process.env.NODE_ENV} mode`)
    })
  } catch (err) {
    logger.error('Failed to start server', err)
    process.exit(1)
  }
}

start()

export default app
