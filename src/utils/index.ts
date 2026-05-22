// Export formatting utilities
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

export const formatDateFull = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatMonthYear = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

export const calculateDuration = (startDate: string, endDate?: string): string => {
  if (!startDate) return '';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);

  return parts.join(' ') || '0 mo';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// String utilities
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// ATS Score calculation
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
  };

  return Math.round(
    keywordMatch * weights.keywords +
      formattingScore * weights.formatting +
      readabilityScore * weights.readability +
      completeness * weights.completeness
  );
};

// Resume validation
export const validateResume = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.personal?.firstName || !data.personal?.lastName) {
    errors.push('First and last name are required');
  }

  if (!data.personal?.email || !isValidEmail(data.personal.email)) {
    errors.push('Valid email is required');
  }

  if (!data.experience || data.experience.length === 0) {
    errors.push('At least one experience entry is required');
  }

  if (!data.education || data.education.length === 0) {
    errors.push('At least one education entry is required');
  }

  if (!data.skills || data.skills.length === 0) {
    errors.push('At least one skill is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Color utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export default {
  formatDate,
  formatDateFull,
  formatMonthYear,
  calculateDuration,
  isValidEmail,
  isValidUrl,
  isValidPhone,
  truncate,
  capitalizeWords,
  slugify,
  formatFileSize,
  downloadFile,
  readFileAsText,
  calculateATSScore,
  validateResume,
  hexToRgb,
  rgbToHex,
};
