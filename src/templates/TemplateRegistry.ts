import { ComponentType } from 'react';
import Modern from './Modern';
import Executive from './Executive';
import ATSClassic from './ATSClassic';
import Minimal from './Minimal';
import Tech from './Tech';
import Creative from './Creative';
import Harvard from './Harvard';
import Startup from './Startup';
import Corporate from './Corporate';
import Elegant from './Elegant';
import Developer from './Developer';

export interface TemplateProps {
  resume: any;
  theme?: any;
  font?: string;
  spacing?: any;
}

/**
 * Single source of truth for all resume templates.
 * Both the live preview and the print renderer resolve templates
 * exclusively via this registry — no inline conditional chains.
 */
export const TEMPLATE_REGISTRY: Record<string, ComponentType<TemplateProps>> = {
  // Canonical keys
  modern:    Modern,
  tech:      Tech,
  executive: Executive,
  creative:  Creative,
  minimal:   Minimal,
  atsClassic: ATSClassic,
  harvard:   Harvard,
  startup:   Startup,
  corporate: Corporate,
  elegant:   Elegant,
  developer: Developer,

  // Legacy aliases (kept for backward compatibility)
  'modern-blue':    Modern,
  'modern-minimal': Minimal,
  'minimalist':     Minimal,
  'classic':        ATSClassic,
  'ats-optimized':  ATSClassic,
};

/**
 * Resolve a template component by key.
 * Falls back to Modern if the key is not registered.
 */
export function getTemplate(templateKey: string): ComponentType<TemplateProps> {
  return TEMPLATE_REGISTRY[templateKey] ?? TEMPLATE_REGISTRY['modern'];
}

/** All registered template keys */
export const TEMPLATE_KEYS = Object.keys(TEMPLATE_REGISTRY) as string[];
