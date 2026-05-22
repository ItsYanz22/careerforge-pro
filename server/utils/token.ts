import jwt from 'jsonwebtoken'

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: (process.env.JWT_EXPIRE as unknown as number) || '7d',
  })
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret')
  } catch (error) {
    return null
  }
}

export const calculateATSScore = (
  keywordMatch: number,
  formattingScore: number,
  readabilityScore: number,
  completeness: number
): number => {
  const weights = {
    keywords: 0.4,
    formatting: 0.2,
    readability: 0.2,
    completeness: 0.2,
  }

  return Math.round(
    keywordMatch * weights.keywords +
      formattingScore * weights.formatting +
      readabilityScore * weights.readability +
      completeness * weights.completeness
  )
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const parseErrorResponse = (error: any): { message: string; code: string } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    }
  }

  if (typeof error === 'object' && error !== null) {
    return {
      message: error.message || 'An error occurred',
      code: error.code || 'UNKNOWN_ERROR',
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  }
}

export default {
  generateToken,
  verifyToken,
  calculateATSScore,
  validateEmail,
  parseErrorResponse,
}
