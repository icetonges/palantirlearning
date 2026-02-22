// lib/navigation.ts
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all navigation.
// Add/remove entries here → ALL surfaces update automatically:
//   ✦ Top navbar
//   ✦ Mobile hamburger menu
//   ✦ Footer navigation
//   ✦ Home page cards
//   ✦ Auth middleware route protection
//   ✦ Sidebar on knowledge pages
// ─────────────────────────────────────────────────────────────────────────────

export type NavItem = {
  label: string          // Display name
  href: string           // Route path
  icon: string           // Emoji icon
  description: string    // Subtitle for home cards and tooltips
  private: boolean       // Requires authentication
  category?: string      // Maps to KnowledgeCategory enum (knowledge tabs only)
  color: string          // Tailwind gradient classes for home card
  badge?: string         // Optional badge text (e.g. "New", "AI")
}

export const NAV_ITEMS: NavItem[] = [
  {
    label:       'Home',
    href:        '/',
    icon:        '◎',
    description: 'Dashboard: AI highlights, latest news, and platform overview',
    private:     false,
    color:       'from-palantir-800 to-palantir-600',
  },
  {
    label:       'Foundry',
    href:        '/foundry',
    icon:        '⬡',
    description: 'Data integration, transforms, datasets, ML, Workshop, and Contour',
    private:     false,
    category:    'FOUNDRY',
    color:       'from-blue-900 to-blue-700',
  },
  {
    label:       'Ontology',
    href:        '/ontology',
    icon:        '◈',
    description: 'Object types, link types, actions, OSDK, and semantic data layer',
    private:     false,
    category:    'ONTOLOGY',
    color:       'from-violet-900 to-violet-700',
  },
  {
    label:       'AIP',
    href:        '/aip',
    icon:        '✦',
    description: 'AI Platform: Logic functions, Copilot, Studio agents, and LLM integration',
    private:     false,
    category:    'AIP',
    color:       'from-cyan-900 to-cyan-700',
    badge:       'AI',
  },
  {
    label:       'Apollo',
    href:        '/apollo',
    icon:        '⊙',
    description: 'Software distribution, fleet management, and air-gapped deployments',
    private:     false,
    category:    'APOLLO',
    color:       'from-emerald-900 to-emerald-700',
  },
  {
    label:       'News & Intel',
    href:        '/news',
    icon:        '◉',
    description: 'Daily Palantir news, contract awards, AI-generated executive briefings',
    private:     false,
    color:       'from-orange-900 to-orange-700',
    badge:       'Live',
  },
  {
    label:       'Study',
    href:        '/study',
    icon:        '◇',
    description: 'AI-generated flashcards, quizzes, and progress tracking',
    private:     false,
    color:       'from-rose-900 to-rose-700',
    badge:       'AI',
  },
  {
    label:       'Resources',
    href:        '/resources',
    icon:        '◫',
    description: 'Official docs, SDKs, GitHub repos, YouTube, and curated learning links',
    private:     false,
    color:       'from-teal-900 to-teal-700',
  },
  {
    label:       'Notes',
    href:        '/notes',
    icon:        '◱',
    description: 'Capture notes and upload documents — auto-generates knowledge pages',
    private:     false,
    color:       'from-night-800 to-night-600',
  },
  {
    label:       'Archive',
    href:        '/archive',
    icon:        '◰',
    description: 'Full searchable archive of all knowledge pages, indexed by date',
    private:     false,
    color:       'from-slate-800 to-slate-600',
  },
]

// Knowledge tabs (have category, are private, auto-generate sub-pages)
export const KNOWLEDGE_TABS = NAV_ITEMS.filter(
  (item) => item.category && item.private
)

// Public tabs (no auth required)
export const PUBLIC_TABS = NAV_ITEMS.filter((item) => !item.private)

// Private routes for middleware
export const PRIVATE_ROUTES = NAV_ITEMS
  .filter((item) => item.private)
  .map((item) => item.href)

// Sub-categories for each knowledge domain
export const SUBCATEGORIES: Record<string, string[]> = {
  FOUNDRY: [
    'Core Concepts',
    'Data Connection & Ingestion',
    'Datasets & Branches',
    'Transforms',
    'PySpark & Python',
    'SQL Transforms',
    'Contour Analytics',
    'Workshop Apps',
    'Slate',
    'Foundry ML',
    'OSDK in Foundry',
    'Security & Markings',
    'DevTools & CLI',
  ],
  ONTOLOGY: [
    'Core Concepts',
    'Object Types',
    'Link Types',
    'Actions & Rules',
    'OSDK (TypeScript)',
    'OSDK (Python)',
    'Time Series',
    'Search & Filtering',
    'Ontology Sync',
    'Aggregations',
  ],
  AIP: [
    'Core Concepts',
    'AIP Logic',
    'AIP Copilot',
    'AIP Studio',
    'Function Repository',
    'LLM Configuration',
    'Prompt Engineering',
    'Security & Governance',
    'Use Cases',
    'Performance',
  ],
  APOLLO: [
    'Core Concepts',
    'Software Distribution',
    'Fleet Management',
    'Enrollment',
    'Configuration Policies',
    'Health Monitoring',
    'Apollo CLI',
    'Air-Gapped Deployments',
    'Government & DoD',
  ],
}

// Category → display color
export const CATEGORY_COLORS: Record<string, string> = {
  FOUNDRY:   'text-blue-400',
  ONTOLOGY:  'text-violet-400',
  AIP:       'text-cyan-400',
  APOLLO:    'text-emerald-400',
  GENERAL:   'text-slate-400',
  NEWS:      'text-orange-400',
  RESOURCES: 'text-teal-400',
}

export const CATEGORY_BG: Record<string, string> = {
  FOUNDRY:   'bg-blue-900/30 border-blue-700/50',
  ONTOLOGY:  'bg-violet-900/30 border-violet-700/50',
  AIP:       'bg-cyan-900/30 border-cyan-700/50',
  APOLLO:    'bg-emerald-900/30 border-emerald-700/50',
  GENERAL:   'bg-slate-900/30 border-slate-700/50',
  NEWS:      'bg-orange-900/30 border-orange-700/50',
  RESOURCES: 'bg-teal-900/30 border-teal-700/50',
}
