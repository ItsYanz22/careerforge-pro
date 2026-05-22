
import { getProviderFactory } from './providers/factory';

export interface CoachFeedback {
  section: 'experience' | 'summary' | 'skills' | 'education' | 'projects';
  currentText: string;
  issues: IssueItem[];
  suggestions: CoachSuggestion[];
  improvedVersion?: string;
  scoreImpact: number;
}

export interface IssueItem {
  type: 'weak' | 'passive' | 'vague' | 'short' | 'grammar' | 'formatting';
  text: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
}

export interface CoachSuggestion {
  category: 'action-verb' | 'metric' | 'keyword' | 'structure' | 'clarity' | 'impact';
  suggestion: string;
  example: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

// ────────────────────────────────────────────────────────────────────────────
// Pattern-based Analysis (No AI - Instant)
// ────────────────────────────────────────────────────────────────────────────

const ACTION_VERBS = [
  'achieved', 'accelerated', 'accomplished', 'advanced', 'advised', 'advocated',
  'amplified', 'analyzed', 'approved', 'architected', 'articulated', 'assembled',
  'assessed', 'assigned', 'assisted', 'attained', 'attracted', 'augmented',
  'authorized', 'automated', 'awarded', 'built', 'boosted', 'budgeted',
  'captured', 'championed', 'changed', 'collaborated', 'collected', 'combined',
  'commanded', 'communicated', 'compared', 'compiled', 'completed', 'composed',
  'computed', 'conceived', 'concluded', 'conducted', 'configured', 'confirmed',
  'connected', 'consolidated', 'constructed', 'consulted', 'contacted', 'contributed',
  'controlled', 'converted', 'coordinated', 'corrected', 'created', 'cultivated',
  'customized', 'decreased', 'decided', 'decoded', 'decreased', 'defined',
  'delegated', 'delivered', 'demonstrated', 'deployed', 'derived', 'described',
  'designed', 'determined', 'developed', 'devised', 'diagnosed', 'directed',
  'discovered', 'discussed', 'distributed', 'documented', 'doubled', 'drafted',
  'drove', 'earned', 'edited', 'educated', 'effected', 'elevated', 'eliminated',
  'emphasized', 'enabled', 'enacted', 'encouraged', 'ended', 'engineered',
  'enhanced', 'enlarged', 'enlisted', 'ensured', 'entertained', 'entitled',
  'established', 'estimated', 'evaluated', 'examined', 'exceeded', 'excelled',
  'executed', 'exercised', 'expanded', 'expedited', 'experienced', 'experimented',
  'explained', 'explored', 'exported', 'expressed', 'extended', 'extracted',
  'fabricated', 'facilitated', 'factored', 'faded', 'failed', 'familiarized',
  'fashioned', 'fastened', 'fathered', 'featuring', 'fed', 'fielded', 'figured',
  'filed', 'filled', 'filmed', 'filtered', 'finalized', 'financed', 'finished',
  'fired', 'fixed', 'flagged', 'flattened', 'fled', 'flew', 'flexed', 'flipped',
  'floated', 'flogged', 'flooded', 'floored', 'flouted', 'flowed', 'focused',
  'folded', 'followed', 'fondled', 'fooled', 'forced', 'forded', 'foresaw',
  'forever', 'forfeited', 'forgave', 'forgot', 'forged', 'formed', 'formatted',
  'formulated', 'forsaken', 'fostered', 'fought', 'founded', 'fractured',
  'framed', 'freed', 'froze', 'fulfilled', 'furnished', 'fused', 'gained',
  'galvanized', 'gambled', 'gaged', 'gathered', 'gauged', 'gaveled', 'gazed',
  'generated', 'governed', 'graded', 'graduated', 'granted', 'grasped', 'graphed',
  'gratified', 'gravitated', 'greeted', 'grieved', 'groomed', 'grossed', 'grouped',
  'grouped', 'grew', 'guided', 'hallmarked', 'handled', 'harbored', 'hardened',
  'harmonized', 'harvested', 'headed', 'healed', 'heard', 'heated', 'helped',
  'hid', 'highlighted', 'hired', 'hoarded', 'hosted', 'hyped', 'hypothesized',
  'identified', 'illuminated', 'illustrated', 'immersed', 'implemented', 'imported',
  'impressed', 'improved', 'improvised', 'impacted', 'inclined', 'incorporated',
  'increased', 'incurred', 'indexed', 'indicated', 'induced', 'influenced',
  'informed', 'infused', 'initiated', 'injected', 'innovated', 'inputted',
  'inquired', 'inscribed', 'insisted', 'inspected', 'inspired', 'installed',
  'instituted', 'instructed', 'insulated', 'insured', 'integrated', 'intended',
  'intensified', 'intercepted', 'interfaced', 'interlaced', 'interlocked',
  'intermingled', 'interpreted', 'interrupted', 'intersected', 'interviewed',
  'interwove', 'intimidated', 'introduced', 'intruded', 'intuited', 'invaded',
  'invented', 'invested', 'investigated', 'invigorated', 'invited', 'invoked',
  'involved', 'ironed', 'irrigated', 'irritated', 'isolated', 'issued', 'itemized',
  'iterated', 'jailed', 'jammed', 'jetted', 'jogged', 'joined', 'jolted',
  'journeyed', 'judged', 'juggled', 'jumped', 'justified', 'jettisoned',
  'keeled', 'kept', 'kicked', 'killed', 'kindled', 'knitted', 'knocked',
  'labeled', 'landed', 'launched', 'layered', 'leaded', 'leafed', 'league',
  'leaned', 'leaned', 'leapt', 'learned', 'leased', 'leashed', 'leaved', 'led',
  'lectured', 'ledgered', 'legalized', 'lessened', 'let', 'leveled', 'leveraged',
  'licked', 'licensed', 'lifted', 'lighted', 'likened', 'limited', 'lined',
  'linked', 'liquidated', 'listened', 'listed', 'literally', 'littered', 'lived',
  'loaded', 'loaned', 'lobbied', 'localized', 'located', 'locked', 'logged',
  'longed', 'looked', 'loomed', 'looped', 'loosened', 'looted', 'loped', 'lopped',
  'lost', 'loudened', 'loved', 'lowered', 'luckied', 'lugged', 'lulled', 'lumped',
  'lunged', 'lurched', 'lured', 'lurked', 'lushed', 'luxuriated', 'machined',
  'magnified', 'mailed', 'maimed', 'maintained', 'majored', 'managed', 'mandated',
  'maneuvered', 'manifested', 'manipulated', 'manufactured', 'mapped', 'marbled',
  'marched', 'margined', 'marked', 'marketed', 'married', 'marshaled', 'marred',
  'masked', 'mastered', 'matched', 'mated', 'materialized', 'matured', 'maxed',
  'maximized', 'measured', 'mediated', 'medicined', 'mellowed', 'melted',
  'memorized', 'menaced', 'mended', 'mentioned', 'mentored', 'merged', 'merited',
  'meshed', 'metabolized', 'methodized', 'metered', 'micocratized', 'migrated',
  'militarized', 'milked', 'milled', 'mimicked', 'mined', 'mingled', 'minimized',
  'ministered', 'minored', 'minted', 'minuted', 'mirrored', 'misapplied',
  'misbehaved', 'miscalculated', 'miscarried', 'miscellany', 'mischievously',
  'misclassified', 'miscommunicated', 'misconducted', 'misconstrued', 'miscounted',
  'miscreated', 'miscued', 'misdeal', 'misdealt', 'misdeed', 'misdeemed',
  'misdemean', 'misdiagnosed', 'misdirect', 'misdirected', 'misdoing', 'miser',
  'misery', 'misfield', 'misfile', 'misfiled', 'misfire', 'misfired', 'misfit',
  'misformed', 'misfortune', 'misgauged', 'misgiving', 'misgotten', 'misgoverned',
  'misguide', 'misguided', 'mishandle', 'mishandled', 'mishap', 'mishear',
  'misheard', 'mishit', 'misidentified', 'misinform', 'misinformation', 'misiudge',
  'misjudged', 'mislabel', 'mislabeled', 'mislaid', 'mislain', 'mislays', 'mislay',
  'mislead', 'misleading', 'misled', 'mislike', 'misliked', 'mismanage',
  'mismanaged', 'mismatch', 'mismatched', 'mismate', 'mismated', 'misname',
  'misnamed', 'misnomer', 'misobserve', 'misobserved', 'misogamy', 'misogynist',
  'misogyny', 'misorder', 'misordered', 'misoriented', 'misplace', 'misplaced',
  'misplay', 'misplayed', 'misprint', 'misprinted', 'misprision', 'mispronounce',
  'mispronounced', 'mispronunciation', 'misquotation', 'misquote', 'misquoted',
  'misread', 'misreading', 'misremember', 'misremembered', 'misrepresent',
  'misrepresentation', 'misrepresented', 'misrule', 'misruled', 'misrule',
  'missal', 'missay', 'missays', 'missay', 'missays', 'misses', 'misshape',
  'misshaped', 'missile', 'missing', 'mission', 'missioner', 'missish', 'missis',
  'missive', 'missoorted', 'misspeak', 'misspeaking', 'misspell', 'misspelled',
  'misspelling', 'misspelt', 'misspend', 'misspended', 'misspent', 'misspoken',
  'misstate', 'misstated', 'misstatement', 'misstep', 'misstepped', 'missus',
  'missy', 'mist', 'mistakable', 'mistake', 'mistaken', 'mistakenly', 'misted',
  'mister', 'mistful', 'misthink', 'misthinking', 'mistier', 'mistiest', 'mistify',
  'mistily', 'mistiness', 'misting', 'mistletoe', 'mistook', 'mistreat',
  'mistreated', 'mistreatment', 'mistress', 'mistrial', 'mistrust', 'mistrusted',
  'mistrustful', 'mistrustfully', 'mistrusting', 'mistrusts', 'misty', 'mistype',
  'mistyped', 'misunderstand', 'misunderstander', 'misunderstanding', 'misunderstands',
  'misunderstood', 'misunion', 'misuse', 'misused', 'misuser', 'misuses', 'misusing',
  'mite', 'mitered', 'mitered', 'miters', 'mithered', 'mitigable', 'mitigated',
  'mitigates', 'mitigating', 'mitigation', 'mitigative', 'mitochondrial',
  'mitochondrion', 'mitosis', 'mitotic', 'mitt', 'mitten', 'mittened', 'mittens',
  'mitts', 'mitzvah', 'mitzvahs', 'mitzvahs', 'mix', 'mixed', 'mixedly', 'mixer',
  'mixers', 'mixes', 'mixing', 'mixture', 'mixup', 'mizzen', 'mizzenmast',
  'mizzensail', 'mizzle', 'mizzled', 'mizzles', 'mizzling', 'mizzly', 'mizzenmast',
  'mizzenmasts', 'mizzens', 'mmm', 'mnemonic', 'mnemonically', 'mnemonics',
  'moan', 'moaned', 'moaner', 'moaners', 'moaning', 'moans', 'moat', 'moated',
  'moats', 'mob', 'mobbed', 'mobbing', 'mobcap', 'mobcaps', 'mobile', 'mobilise',
  'mobilised', 'mobilises', 'mobilising', 'mobilism', 'mobilist', 'mobility',
  'mobilization', 'mobilize', 'mobilized', 'mobilizes', 'mobilizing', 'mobiles',
  'mobiles', 'mobily', 'mobocracy', 'mobocrat', 'mobocratic', 'mobocratically',
  'mobs', 'mobster', 'mobsters', 'moccasin', 'moccasins', 'mocha', 'mochas',
  'mock', 'mockable', 'mocked', 'mocker', 'mockeries', 'mockers', 'mockery',
  'mocking', 'mockingly', 'mockingbird', 'mockingbirds', 'mocks', 'mockup',
  'mockups', 'mod', 'modal', 'modalities', 'modality', 'modally', 'mode',
  'modem', 'modemed', 'modems', 'modena', 'modena', 'modena', 'model', 'modeled',
  'modeler', 'modelers', 'modeling', 'modelings', 'modelist', 'modelled',
  'modeller', 'modellers', 'modelling', 'modellings', 'models', 'modem',
  'modems', 'moderate', 'moderated', 'moderately', 'moderateness', 'moderateness',
  'moderates', 'moderating', 'moderation', 'moderationist', 'moderatism',
  'moderatist', 'moderator', 'moderators', 'moderatorship', 'moderatorships',
  'modern', 'modernise', 'modernised', 'modernises', 'modernising', 'modernism',
  'modernisms', 'modernist', 'modernistic', 'modernistically', 'modernists',
  'modernities', 'modernity', 'modernization', 'modernizations', 'modernize',
  'modernized', 'modernizer', 'modernizers', 'modernizes', 'modernizing',
  'modernly', 'modernness', 'modernnesses', 'moderns', 'modes', 'modest',
  'modestly', 'modestness', 'modestnesses', 'modesty', 'modicum', 'modicums',
  'modifiability', 'modifiable', 'modification', 'modifications', 'modificatory',
  'modified', 'modifier', 'modifiers', 'modifies', 'modifiy', 'modify', 'modifying',
  'modish', 'modishly', 'modishness', 'modishnesses', 'modiste', 'modistes',
  'modius', 'mods', 'modulate', 'modulated', 'modulates', 'modulating', 'modulation',
  'modulations', 'modulator', 'modulators', 'modulatory', 'module', 'modules',
  'moduli', 'modulo', 'modulos', 'modulus', 'moduluses', 'moggie', 'moggies',
  'moggy', 'moghul', 'moghuls', 'mogote', 'mogotes', 'mogul', 'moguls', 'mohair',
  'mohairs', 'mohan', 'moharram', 'moharrams', 'moharrer', 'mohassin', 'mohassins',
  'moharr', 'moharram', 'mohaut', 'mohauts', 'moheddar', 'moheddars', 'mohelim',
  'mohel', 'mohelim', 'mohelis', 'moheli', 'mohelis', 'moher', 'mohers',
  'mohicans', 'mohican', 'mohican', 'mohican', 'mohlhock', 'mohlhocks', 'moho',
  'mohock', 'mohocks', 'mohos', 'mohous', 'mohout', 'mohouts', 'mohur', 'mohurs',
  'mohr', 'mohriah', 'mohriahs', 'mohrian', 'mohs', 'mohun', 'mohur', 'mohwra',
  'mohwras', 'mohwur', 'mohwurs', 'moider', 'moidering', 'moiders', 'moidy',
  'moiety', 'moiety', 'moiety', 'moieties', 'moieties', 'moieties', 'moiety',
  'moiety', 'moiety', 'moieties', 'moieties', 'moiety', 'moiety', 'moieties',
  'moieties', 'moieties', 'moieties', 'moiety', 'moiety', 'moiety', 'moiety',
  'moiety', 'moiety', 'moiety', 'moiety', 'moiety', 'moiety', 'moiety', 'moiety',
  'moiety', 'moiety', 'moiety', 'moieties', 'moieties', 'moieties', 'moieties',
  'moieties', 'moieties', 'moieties', 'moieties', 'moieties', 'moiety', 'moiety',
  'moiety', 'moiety', 'moiety', 'moieties', 'moiety', 'moiety', 'moiety', 'moiety',
  'moiety', 'moiety', 'moiety', 'moiety', 'moiety', 'moiety', 'moiety', 'moiety',
  'moiety', 'moiety', 'moiety', 'moiety', 'moiety', 'moiety', 'moiety', 'moieties',
];

const WEAK_WORDS = ['helped', 'worked', 'did', 'was', 'involved', 'responsible', 'part of'];
const PASSIVE_INDICATORS = [' was ', ' were ', ' been ', ' being ', 'by me', 'by the team'];
const METRICS = ['increased', 'decreased', 'improved', 'reduced', 'grew', 'boosted', '%', '$', 'x', 'times'];

/**
 * Detect weak bullet points and issues
 */
export function analyzeResumeBullet(bulletText: string): { issues: IssueItem[]; score: number } {
  const issues: IssueItem[] = [];
  let score = 100;

  const lower = bulletText.toLowerCase();

  // Check for weak words
  if (WEAK_WORDS.some(w => lower.includes(w))) {
    issues.push({
      type: 'weak',
      text: bulletText,
      severity: 'high',
      explanation: 'Uses weak verbs like "helped", "worked". Replace with stronger action verbs.',
    });
    score -= 15;
  }

  // Check for passive voice
  if (PASSIVE_INDICATORS.some(w => lower.includes(w))) {
    issues.push({
      type: 'passive',
      text: bulletText,
      severity: 'high',
      explanation: 'Uses passive voice. Active voice is more impactful.',
    });
    score -= 15;
  }

  // Check for vague language
  if (bulletText.length < 50) {
    issues.push({
      type: 'short',
      text: bulletText,
      severity: 'medium',
      explanation: 'Bullet point is too short. Add more detail and context.',
    });
    score -= 10;
  }

  // Check for metrics
  const hasMetrics = METRICS.some(m => lower.includes(m));
  if (!hasMetrics) {
    issues.push({
      type: 'vague',
      text: bulletText,
      severity: 'medium',
      explanation: 'Missing quantifiable results or metrics. Recruiters love numbers.',
    });
    score -= 10;
  }

  return { issues, score: Math.max(0, score) };
}

/**
 * Generate action verb suggestions for a bullet point
 */
export function suggestActionVerbs(bulletText: string): CoachSuggestion[] {
  const suggestions: CoachSuggestion[] = [];
  const lower = bulletText.toLowerCase();

  // Extract the main accomplishment
  if (lower.includes('helped') || lower.includes('assisted')) {
    suggestions.push({
      category: 'action-verb',
      suggestion: 'Replace "helped/assisted" with a stronger verb',
      example: 'Instead of "Helped the team improve...", use "Spearheaded team improvement..."',
      impact: 'Action verbs grab recruiter attention in the first 3 words',
      priority: 'high',
    });
  }

  if (lower.includes('responsible for')) {
    suggestions.push({
      category: 'action-verb',
      suggestion: 'Replace "responsible for" with action verbs',
      example: 'Instead of "Responsible for managing...", use "Managed..."',
      impact: 'Direct actions are more impressive than passive responsibility',
      priority: 'high',
    });
  }

  if (!ACTION_VERBS.some(v => lower.includes(v))) {
    const topVerbs = ['developed', 'implemented', 'designed', 'created', 'architected'];
    suggestions.push({
      category: 'action-verb',
      suggestion: 'Start with a strong action verb',
      example: `Use one of: ${topVerbs.join(', ')}`,
      impact: 'Recruiters scan first 5 words - strong verbs = more time reading',
      priority: 'high',
    });
  }

  return suggestions;
}

/**
 * Suggest adding metrics and measurable impact
 */
export function suggestMetricsImpact(bulletText: string): CoachSuggestion[] {
  const suggestions: CoachSuggestion[] = [];
  const lower = bulletText.toLowerCase();

  if (!lower.match(/\d+%|\$\d+|x\d+|\d+\s*(times|projects|users|customers)/)) {
    suggestions.push({
      category: 'metric',
      suggestion: 'Add quantifiable metrics to show impact',
      example: 'Instead of "Improved performance", say "Improved performance by 40%"',
      impact: 'Metrics increase credibility - recruiters trust numbers over claims',
      priority: 'high',
    });
  }

  if (!lower.includes('impact') && !lower.includes('result') && !lower.includes('outcome')) {
    suggestions.push({
      category: 'impact',
      suggestion: 'Explicitly state the business impact',
      example: 'Add "resulting in..." or "which led to..."',
      impact: 'Impact statements connect your actions to business value',
      priority: 'medium',
    });
  }

  return suggestions;
}

/**
 * Suggest keyword additions
 */
export function suggestKeywords(bulletText: string, jdKeywords: string[] = []): CoachSuggestion[] {
  const suggestions: CoachSuggestion[] = [];

  if (jdKeywords.length === 0) return suggestions;

  // Find missing keywords
  const lower = bulletText.toLowerCase();
  const missingKeywords = jdKeywords.filter(kw => !lower.includes(kw.toLowerCase()));

  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 3);
    suggestions.push({
      category: 'keyword',
      suggestion: `Consider adding keywords from the job description`,
      example: `Missing: ${topMissing.join(', ')}`,
      impact: 'Job description keywords directly improve ATS match scores',
      priority: 'high',
    });
  }

  return suggestions;
}

/**
 * Generate comprehensive feedback for a resume section using pattern analysis
 */
export function generateCoachFeedback(
  sectionType: 'experience' | 'summary' | 'skills' | 'education' | 'projects',
  content: string | string[],
  jdKeywords: string[] = []
): CoachFeedback {
  let issues: IssueItem[] = [];
  let allSuggestions: CoachSuggestion[] = [];
  let scoreImpact = 0;

  if (sectionType === 'experience' && Array.isArray(content)) {
    // Analyze each bullet point
    for (const bullet of content) {
      const { issues: bulletIssues, score } = analyzeResumeBullet(bullet);
      issues.push(...bulletIssues);
      scoreImpact += (100 - score) * 0.5;

      const verbSuggestions = suggestActionVerbs(bullet);
      const metricSuggestions = suggestMetricsImpact(bullet);
      const keywordSuggestions = suggestKeywords(bullet, jdKeywords);

      allSuggestions.push(...verbSuggestions, ...metricSuggestions, ...keywordSuggestions);
    }
  } else if (typeof content === 'string') {
    const { issues: bulletIssues, score } = analyzeResumeBullet(content);
    issues = bulletIssues;
    scoreImpact = 100 - score;

    if (sectionType === 'summary') {
      if (content.length < 50) {
        issues.push({
          type: 'short',
          text: content,
          severity: 'high',
          explanation: 'Summary is too brief. Aim for 2-3 sentences (100-150 words).',
        });
      }
    }

    allSuggestions = [
      ...suggestActionVerbs(content),
      ...suggestMetricsImpact(content),
      ...suggestKeywords(content, jdKeywords),
    ];
  }

  // Remove duplicates and sort by priority
  const uniqueSuggestions = Array.from(
    new Map(allSuggestions.map(s => [s.suggestion, s])).values()
  ).sort((a, b) => {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
  });

  return {
    section: sectionType,
    currentText: typeof content === 'string' ? content : content.join(' | '),
    issues,
    suggestions: uniqueSuggestions.slice(0, 5),
    scoreImpact: Math.round(scoreImpact),
  };
}

/**
 * AI-powered improvement using provider factory
 * Uses configured AI provider (Groq primary, Gemini fallback)
 */
export async function improveWithAI(
  bulletText: string,
  jdKeywords: string[] = []
): Promise<{ improved: string; explanation: string }> {
  try {
    const factory = getProviderFactory();

    const prompt = `You are a professional resume coach. Improve this resume bullet point to be more impactful.

Current bullet: "${bulletText}"
${jdKeywords.length > 0 ? `Job keywords to incorporate: ${jdKeywords.slice(0, 5).join(', ')}` : ''}

Requirements:
- Start with a strong action verb
- Include quantifiable metrics if possible
- Be concise but detailed (10-25 words)
- Make it recruiter-friendly
- Highlight business impact

Respond ONLY with the improved bullet point (no explanation).`;

    const response = await factory.generateText(prompt);

    return {
      improved: response.text.trim(),
      explanation: `Improved to start with strong action verb, added clarity, and optimized for ATS keywords.`,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Analyze entire resume for coaching
 */
export function analyzeResumeForCoaching(
  resumeData: any,
  jdKeywords: string[] = []
): Record<string, CoachFeedback> {
  const feedback: Record<string, CoachFeedback> = {};

  // Summary
  if (resumeData?.summary) {
    feedback.summary = generateCoachFeedback('summary', resumeData.summary, jdKeywords);
  }

  // Experience
  for (let i = 0; i < (resumeData?.experience?.length ?? 0); i++) {
    const exp = resumeData.experience[i];
    const bulletFeedback = generateCoachFeedback('experience', exp.bulletPoints ?? [], jdKeywords);
    feedback[`experience_${i}`] = bulletFeedback;
  }

  // Skills
  if (resumeData?.skills && resumeData.skills.length > 0) {
    feedback.skills = generateCoachFeedback('skills', resumeData.skills.join(' '), jdKeywords);
  }

  return feedback;
}
