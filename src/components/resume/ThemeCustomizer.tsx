import { useResumeStore } from '../../stores/resumeStore';
import { useAuthStore } from '../../stores/authStore';
import { TemplateType, FontType, ThemeType, SpacingConfig } from '../../types';
import { LayoutTemplate, Type, Palette, MoveVertical, Search } from 'lucide-react';
import { useState } from 'react';
import { getThemeColors } from '../../utils/theme-mapper';
import { LockIndicator, UpgradeModal } from './../../components/premium/PremiumUI';

export const TEMPLATES: { id: TemplateType; name: string; description: string; isPremium: boolean }[] = [
  { id: 'modern-blue',   name: 'Modern',     description: 'Clean, two-column layout',          isPremium: false },
  { id: 'ats-optimized', name: 'ATS Classic', description: 'Maximum parsing compatibility',     isPremium: false },
  { id: 'executive',     name: 'Executive',  description: 'Professional, single-column',        isPremium: true },
  { id: 'minimalist',    name: 'Minimal',    description: 'Lots of whitespace, modern',         isPremium: true },
  { id: 'tech',          name: 'Tech',       description: 'Code-inspired terminal look',        isPremium: true },
  { id: 'creative',      name: 'Creative',   description: 'Bold colors and sidebar',            isPremium: true },
  { id: 'harvard',       name: 'Harvard',    description: 'Classic Ivy League format',          isPremium: true },
  { id: 'startup',       name: 'Startup',    description: 'Bold & Modern for tech',             isPremium: true },
  { id: 'corporate',     name: 'Corporate',  description: 'Traditional & Reliable',             isPremium: true },
  { id: 'elegant',       name: 'Elegant',    description: 'Refined & Sophisticated',            isPremium: true },
  { id: 'developer',     name: 'Developer',  description: 'Clean Monospace aesthetics',         isPremium: true },
];

const FONTS_CATEGORIZED = [
  {
    category: 'Modern Professional',
    fonts: [
      { id: 'inter', name: 'Inter' },
      { id: 'manrope', name: 'Manrope' },
      { id: 'plusjakarta', name: 'Plus Jakarta' },
      { id: 'satoshi', name: 'Satoshi' },
      { id: 'generalsans', name: 'General Sans' },
    ]
  },
  {
    category: 'Corporate & ATS-Friendly',
    fonts: [
      { id: 'roboto', name: 'Roboto' },
      { id: 'opensans', name: 'Open Sans' },
      { id: 'lato', name: 'Lato' },
      { id: 'sourcesanspro', name: 'Source Sans Pro' },
      { id: 'ibmplexsans', name: 'IBM Plex Sans' },
    ]
  },
  {
    category: 'Elegant & Executive',
    fonts: [
      { id: 'merriweather', name: 'Merriweather' },
      { id: 'playfair', name: 'Playfair Display' },
      { id: 'lora', name: 'Lora' },
      { id: 'librebaskerville', name: 'Libre Baskerville' },
      { id: 'cormorant', name: 'Cormorant' },
    ]
  },
  {
    category: 'Creative & Modern',
    fonts: [
      { id: 'poppins', name: 'Poppins' },
      { id: 'montserrat', name: 'Montserrat' },
      { id: 'outfit', name: 'Outfit' },
      { id: 'urbanist', name: 'Urbanist' },
      { id: 'spacegrotesk', name: 'Space Grotesk' },
    ]
  }
];

const COLORS_CATEGORIZED = [
  {
    category: 'Green Collection',
    themes: [
      { id: 'emerald', name: 'Emerald Professional' },
      { id: 'forest', name: 'Forest Minimal' },
      { id: 'sage', name: 'Sage Elegant' },
      { id: 'mint', name: 'Mint Modern' },
      { id: 'olive', name: 'Olive Executive' },
    ]
  },
  {
    category: 'Neutral Collection',
    themes: [
      { id: 'monochrome', name: 'Monochrome ATS' },
      { id: 'graphite', name: 'Graphite' },
      { id: 'warmstone', name: 'Warm Stone' },
      { id: 'softivory', name: 'Soft Ivory' },
      { id: 'midnight', name: 'Midnight Professional' },
    ]
  },
  {
    category: 'Luxury Collection',
    themes: [
      { id: 'gold', name: 'Gold Executive' },
      { id: 'deepemerald', name: 'Deep Emerald' },
      { id: 'platinum', name: 'Platinum' },
      { id: 'charcoal', name: 'Charcoal Elite' },
      { id: 'pearl', name: 'Pearl Minimal' },
    ]
  },
  {
    category: 'Modern Startup',
    themes: [
      { id: 'moderngreen', name: 'Modern Green' },
      { id: 'slateemerald', name: 'Slate & Emerald' },
      { id: 'darksage', name: 'Dark Sage' },
      { id: 'frostedmint', name: 'Frosted Mint' },
      { id: 'matteforest', name: 'Matte Forest' },
    ]
  }
];

const SPACING_MODES: { id: 'compact' | 'balanced' | 'spacious'; name: string; config: SpacingConfig }[] = [
  { 
    id: 'compact', 
    name: 'Compact', 
    config: { lineHeight: 'compact', margins: { top: '12px', bottom: '12px', left: '20px', right: '20px' }, sectionGap: '12px', bulletPointGap: '4px' } 
  },
  { 
    id: 'balanced', 
    name: 'Balanced', 
    config: { lineHeight: 'normal', margins: { top: '24px', bottom: '24px', left: '32px', right: '32px' }, sectionGap: '20px', bulletPointGap: '8px' } 
  },
  { 
    id: 'spacious', 
    name: 'Spacious', 
    config: { lineHeight: 'spacious', margins: { top: '32px', bottom: '32px', left: '48px', right: '48px' }, sectionGap: '28px', bulletPointGap: '12px' } 
  },
];

export default function ThemeCustomizer() {
  const { currentResume, updateTemplate, updateFont, updateTheme, updateSpacing } = useResumeStore();
  const user = useAuthStore((s) => s.user);
  const hasPremiumTemplates = user?.features?.premiumTemplates === true;
  const [fontSearch, setFontSearch] = useState('');
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; name: string }>({ open: false, name: '' });

  if (!currentResume) return null;

  const handleTemplateClick = (template: typeof TEMPLATES[0]) => {
    // Note: We now allow previewing premium templates. 
    // The restriction is enforced at the export stage in ExportButton.tsx
    updateTemplate(currentResume._id, template.id);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Design System</h2>
        <p className="text-sm text-muted-foreground mb-6">Customize the complete look and feel of your resume.</p>
      </div>

      {/* Templates */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
          <LayoutTemplate size={16} className="text-[hsl(var(--primary))]" />
          Template
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((template) => {
            const isActive = currentResume.template === template.id;
            const isLocked = template.isPremium && !hasPremiumTemplates;
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className={`relative flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)]/50 shadow-sm'
                    : 'border-border hover:border-border hover:bg-background'
                }`}
              >
                {isLocked && (
                  <LockIndicator size="sm" className="rounded-xl" />
                )}
                <span className={`font-bold mb-1 ${isActive ? 'text-[hsl(var(--primary))]' : 'text-foreground'}`}>
                  {template.name}
                </span>
                <span className={`text-xs ${isActive ? 'text-[hsl(var(--primary))]/80' : 'text-muted-foreground'}`}>
                  {template.description}
                </span>
              </button>
            );
          })}
        </div>

        <UpgradeModal
          isOpen={upgradeModal.open}
          onClose={() => setUpgradeModal({ open: false, name: '' })}
          featureName={upgradeModal.name}
          description="Unlock all premium templates with a Pro subscription."
        />
      </section>

      {/* Typography */}
      <section className="space-y-4 pt-6 border-t border-zinc-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
            <Type size={16} className="text-[hsl(var(--primary))]" />
            Typography
          </h3>
          <div className="relative w-32">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={fontSearch}
              onChange={(e) => setFontSearch(e.target.value)}
              className="w-full text-xs pl-7 pr-3 py-1.5 bg-secondary border-none rounded-lg focus:ring-1 focus:ring-[hsl(var(--primary))] text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          {FONTS_CATEGORIZED.map((category) => {
            const filteredFonts = category.fonts.filter(f => f.name.toLowerCase().includes(fontSearch.toLowerCase()));
            if (filteredFonts.length === 0) return null;
            
            return (
              <div key={category.category} className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category.category}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {filteredFonts.map((font) => {
                    const isActive = currentResume.font === font.id;
                    return (
                      <button
                        key={font.id}
                        onClick={() => updateFont(currentResume._id, font.id as FontType)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 ${
                          isActive 
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))] font-bold shadow-sm' 
                            : 'border-border hover:border-border text-foreground bg-background'
                        }`}
                      >
                        <span className="text-sm truncate">{font.name}</span>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Colors */}
      <section className="space-y-4 pt-6 border-t border-zinc-100">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
          <Palette size={16} className="text-[hsl(var(--primary))]" />
          Color Palette
        </h3>
        
        <div className="space-y-6">
          {COLORS_CATEGORIZED.map((category) => (
            <div key={category.category} className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{category.category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.themes.map((theme) => {
                  const isActive = currentResume.theme === theme.id;
                  const themeColors = getThemeColors(theme.id as ThemeType);
                  return (
                    <button
                      key={theme.id}
                      onClick={() => updateTheme(currentResume._id, theme.id as ThemeType)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 ${
                        isActive 
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] shadow-sm' 
                          : 'border-border hover:border-border bg-white'
                      }`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: themeColors.primary }}></div>
                        <div className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: themeColors.background }}></div>
                      </div>
                      <span className={`text-sm font-semibold truncate ${isActive ? 'text-[hsl(var(--primary))]' : 'text-foreground'}`}>
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section className="space-y-4 pt-6 border-t border-zinc-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
            <MoveVertical size={16} className="text-[hsl(var(--primary))]" />
            Spacing
          </h3>
          <span className="text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] px-2 py-1 rounded-md">
            {currentResume.spacing?.lineHeight === 'compact' ? 'Compact' : currentResume.spacing?.lineHeight === 'spacious' ? 'Spacious' : 'Balanced'}
          </span>
        </div>
        
        <div className="px-1 pt-2">
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="1"
            value={currentResume.spacing?.lineHeight === 'compact' ? 0 : currentResume.spacing?.lineHeight === 'spacious' ? 2 : 1}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              const mode = SPACING_MODES[val];
              updateSpacing(currentResume._id, mode.config);
            }}
            className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-[hsl(var(--primary))] outline-none"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentResume.spacing?.lineHeight === 'compact' ? 0 : currentResume.spacing?.lineHeight === 'spacious' ? 100 : 50)}%, hsl(var(--muted)) ${(currentResume.spacing?.lineHeight === 'compact' ? 0 : currentResume.spacing?.lineHeight === 'spacious' ? 100 : 50)}%, hsl(var(--muted)) 100%)`
            }}
          />
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mt-3 font-semibold">
            <span className={currentResume.spacing?.lineHeight === 'compact' ? 'text-foreground' : ''}>Compact</span>
            <span className={currentResume.spacing?.lineHeight === 'normal' || !currentResume.spacing?.lineHeight ? 'text-foreground' : ''}>Balanced</span>
            <span className={currentResume.spacing?.lineHeight === 'spacious' ? 'text-foreground' : ''}>Spacious</span>
          </div>
        </div>
      </section>
    </div>
  );
}
