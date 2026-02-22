// app/learn/page.tsx — Official Palantir Learning Hub
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Learn — Official Palantir Courses & Learning Guide',
  description: 'All official Palantir courses from learn.palantir.com with verified URLs, plus an in-depth guide to mastering the Palantir stack.',
}

const COURSES = [
  { title: 'Getting Started with Palantir Learn', slug: 'getting-started-with-palantir-learn', duration: '5 min', type: 'Guide', level: 'Beginner', foundryRequired: false, roles: ['Everyone'], summary: 'A one-page orientation to the Learn site — start here before anything else.', plain: 'Your map of the whole learning platform.' },
  { title: 'Introduction to Foundry & AIP for Enterprise Organizations', slug: 'introduction-to-foundry-aip-for-enterprise-organizations', duration: '15 min', type: 'Overview', level: 'Beginner', foundryRequired: false, roles: ['Everyone'], summary: 'Conceptual overview of what Foundry and AIP are and why organizations use them.', plain: 'The essential "what is Palantir?" course — no technical background needed.' },
  { title: 'Scoping Use Cases for Foundry & AIP', slug: 'scoping-use-cases-for-foundry-aip', duration: '15 min', type: 'Overview', level: 'Beginner', foundryRequired: false, roles: ['Everyone', 'Program Manager'], summary: 'How to identify and evaluate problems that Foundry and AIP can solve.', plain: 'Teaches you to think about which problems are a good fit for Palantir. Critical for managers.' },
  { title: 'Foundry & AIP Aware', slug: 'foundry-aip-aware', duration: '8 hrs', type: 'Deep Dive', level: 'Beginner–Intermediate', foundryRequired: false, roles: ['Everyone'], summary: 'Comprehensive immersive course: build in Foundry & AIP, scope use cases, understand enterprise IT context.', plain: 'The most complete beginner course. Best starting point if you have 8 hours.' },
  { title: 'Speedrun: Your First End-to-End Workflow', slug: 'speedrun-your-first-e2e-workflow', duration: '60–90 min', type: 'Speedrun', level: 'Beginner', foundryRequired: true, roles: ['Data Engineer', 'Application Developer', 'Data Analyst', 'Data Scientist', 'Frontend Developer'], summary: 'Build a full Foundry workflow from raw data to operational application in one session.', plain: 'The #1 recommended first course. You build something real in 60–90 minutes.' },
  { title: 'Speedrun: Your First AIP Workflow', slug: 'speedrun-your-e2e-aip-workflow', duration: '60–90 min', type: 'Speedrun', level: 'Intermediate', foundryRequired: true, roles: ['AI Engineer'], summary: 'Build an AI-powered workflow to parse PDF media sets using AIP components.', plain: 'Hands-on first AIP project — build a real AI workflow that reads and processes documents.' },
  { title: 'Speedrun: Your First Agentic AIP Workflow', slug: 'speedrun-your-first-agentic-aip-workflow', duration: '60–90 min', type: 'Speedrun', level: 'Advanced', foundryRequired: true, roles: ['AI Engineer'], summary: 'Build an agentic workflow using AIP and the Ontology with human-in-the-loop teaming.', plain: 'Build AI agents that reason and take actions — with humans approving key decisions.' },
  { title: 'Speedrun: Data Science Fundamentals', slug: 'speedrun-data-science-fundamentals', duration: '60–90 min', type: 'Speedrun', level: 'Intermediate', foundryRequired: true, roles: ['Data Scientist'], summary: 'Use Foundry and AIP for Data Science — modeling, analysis, and ML workflows.', plain: 'For data scientists: bring your Python/ML skills into Foundry without relearning your workflow.' },
  { title: 'Speedrun: Your First Ontology Function', slug: 'speedrun-your-first-ontology-function', duration: '45–60 min', type: 'Speedrun', level: 'Intermediate', foundryRequired: true, roles: ['Application Developer', 'Frontend Developer'], summary: 'Build TypeScript Functions that pull data from and update Ontology Objects via a Workshop app.', plain: 'The bridge between no-code Workshop and custom code — write logic that operates on real Ontology data.' },
  { title: 'Speedrun: Mining Your First Business Process', slug: 'speedrun-mining-your-first-business-process', duration: '60–90 min', type: 'Speedrun', level: 'Intermediate', foundryRequired: true, roles: ['Application Developer', 'Data Analyst'], summary: "Use Foundry's Machinery app to visualize business processes, find bottlenecks, and create alerts.", plain: 'Process mining made visual — see where your workflows slow down.' },
  { title: 'Deep Dive: Creating Your First Data Connection', slug: 'deep-dive-data-connection', duration: '45–60 min', type: 'Deep Dive', level: 'Intermediate', foundryRequired: true, roles: ['Data Engineer'], summary: "Use Foundry's Data Connection app to securely retrieve data from various source systems.", plain: 'How to connect Foundry to your existing databases, files, and APIs — the first step in every project.' },
  { title: 'Deep Dive: Building Your First Pipeline', slug: 'deep-dive-building-your-first-pipeline', duration: '60–90 min', type: 'Deep Dive', level: 'Intermediate', foundryRequired: true, roles: ['Data Engineer', 'AI Engineer'], summary: "Best practices for Pipeline Builder, Foundry's no-code pipelining tool.", plain: 'Build automated data pipelines without writing code — drag-and-drop transformation on a schedule.' },
  { title: 'Deep Dive: Transforming Data with Code Repositories', slug: 'deep-dive-transforming-your-data-with-code-repositories', duration: '60 min', type: 'Deep Dive', level: 'Advanced', foundryRequired: true, roles: ['Data Engineer'], summary: "Write Python/Spark transforms inside Foundry's integrated Code Repository environment.", plain: 'For engineers who want full control: Python or PySpark transforms with version control built in.' },
  { title: 'Deep Dive: Creating Your First Ontology', slug: 'deep-dive-creating-your-first-ontology', duration: '60–90 min', type: 'Deep Dive', level: 'Intermediate', foundryRequired: true, roles: ['Application Developer', 'Frontend Developer'], summary: "What the Foundry Ontology is, why it's valuable, and how to build your own.", plain: "The Ontology is the heart of Palantir. This course shows you how to design one that mirrors your real business — objects, relationships, and actions." },
  { title: 'Deep Dive: Building Your First Application', slug: 'deep-dive-building-your-first-application', duration: '60–90 min', type: 'Deep Dive', level: 'Intermediate', foundryRequired: true, roles: ['Application Developer'], summary: 'Use Workshop to build an interactive operational workflow on top of your Ontology.', plain: 'Build a real app your team can use — maps, tables, forms, and alerts — all connected to live Foundry data.' },
  { title: 'Deep Dive: Data Analysis in Contour', slug: 'deep-dive-data-analysis-in-contour', duration: '60–90 min', type: 'Deep Dive', level: 'Beginner–Intermediate', foundryRequired: true, roles: ['Data Analyst'], summary: 'Transform, join, and visualize tabular data using Contour.', plain: "Contour is like Excel for millions of rows. Filter and visualize data visually, no code required." },
  { title: 'Deep Dive: Data Analysis in Quiver', slug: 'deep-dive-data-analysis-in-quiver', duration: '60–90 min', type: 'Deep Dive', level: 'Intermediate', foundryRequired: true, roles: ['Data Analyst'], summary: 'Navigate Quiver for analyzing and visualizing data stored in Ontology Objects.', plain: "For analyzing Ontology-based data — great for time-series and object-centric analysis." },
  { title: 'Deep Dive: Data Governance — Security Primitives', slug: 'deep-dive-data-governance-best-practices-security-primitives', duration: '45–60 min', type: 'Deep Dive', level: 'Advanced', foundryRequired: true, roles: ['Data Engineer', 'Platform Administrator'], summary: 'Configure projects, apply markings to sensitive data, and implement restricted views.', plain: 'Security features that matter most in government and enterprise: data markings, access controls, need-to-know restrictions.' },
  { title: 'Deep Dive: Data Protection Tools in Foundry', slug: 'deep-dive-data-protection-tools-in-foundry', duration: '45–60 min', type: 'Deep Dive', level: 'Advanced', foundryRequired: true, roles: ['Data Engineer', 'Platform Administrator'], summary: 'Download controls, automated data scans, and data obfuscation tools.', plain: 'Prevent unauthorized downloads, auto-detect PII, and mask sensitive fields.' },
  { title: 'Foundry & AIP Builder Foundations Quiz', slug: 'foundry-aip-builder-foundations-quiz', duration: '15 min', type: 'Quiz', level: 'Beginner', foundryRequired: false, roles: ['Everyone'], summary: 'Test foundational knowledge and earn the official Foundry & AIP Builder Foundations Badge.', plain: 'A 15-minute quiz that earns you an official Palantir badge — good quick credential.' },
  { title: 'Applied Notional Project', slug: 'applied-notional-project-automobile-inbox', duration: '1–2 days', type: 'Notional Project', level: 'Advanced', foundryRequired: true, roles: ['Data Engineer', 'Application Developer'], summary: 'Build a full operational workflow from a notional Statement of Work — minimal instructions.', plain: 'The capstone project. You get real requirements and build the solution yourself.' },
]

const TRAINING_TRACKS = [
  { role: 'Data Engineer', icon: '🔧', color: 'blue', url: 'https://learn.palantir.com/page/training-track-data-engineer', desc: 'Build data pipelines, connect sources, manage transforms, ensure data quality.', skills: ['Pipeline Builder', 'Code Repos (Python/Spark)', 'Data Connection', 'Security'], start: 'speedrun-your-first-e2e-workflow' },
  { role: 'Application Developer', icon: '🖥️', color: 'violet', url: 'https://learn.palantir.com/page/training-track-application-developer', desc: 'Build operational apps using Workshop and Quiver on top of the Ontology.', skills: ['Workshop', 'Quiver', 'Ontology Design', 'TypeScript Functions'], start: 'speedrun-your-first-e2e-workflow' },
  { role: 'AI Engineer', icon: '✦', color: 'cyan', url: 'https://learn.palantir.com/page/training-track-ai-engineer', desc: 'Design AI workflows using LLMs and AIP connected to real business data.', skills: ['AIP Logic', 'AIP Studio', 'LLM Integration', 'Agentic Workflows'], start: 'speedrun-your-e2e-aip-workflow' },
  { role: 'Data Scientist', icon: '📈', color: 'emerald', url: 'https://learn.palantir.com/page/training-track-data-scientist', desc: 'Create predictive models inside Foundry — ML, statistical analysis, visualization.', skills: ['Foundry ML', 'Model Registry', 'Code Repositories', 'Statistical Analysis'], start: 'speedrun-data-science-fundamentals' },
  { role: 'Frontend / OSDK Developer', icon: '⚡', color: 'amber', url: 'https://learn.palantir.com/page/training-track-frontend-osdk-developer', desc: 'Build external apps using the Ontology SDK — TypeScript or Python.', skills: ['OSDK (TypeScript)', 'OSDK (Python)', 'External Auth', 'Real-time Subscriptions'], start: 'deep-dive-creating-your-first-ontology' },
  { role: 'Data Analyst', icon: '📊', color: 'orange', url: 'https://learn.palantir.com/page/training-track-data-analyst', desc: 'Analyze and visualize data without code using Contour and Quiver.', skills: ['Contour', 'Quiver', 'Data Visualization', 'Dashboards'], start: 'deep-dive-data-analysis-in-contour' },
]

const LEARNING_PILLARS = [
  {
    id: 'cognitive', icon: '🧠', title: 'Cognitive Foundation', color: 'amber',
    tagline: 'Build the mental models first — everything else flows from this',
    steps: [
      { week: 'Week 1', title: 'The Core Mental Shift', url: 'https://learn.palantir.com/introduction-to-foundry-aip-for-enterprise-organizations',
        content: 'Palantir is not a BI tool, not a database, not an ETL pipeline. It is an operating system for decision-making. The most important mental model: data is not just stored — it is connected. Objects represent real-world entities (a contract, a soldier, a shipment) and everything flows from that. Until this clicks, the platform feels arbitrary.',
        action: 'Start with "Introduction to Foundry & AIP for Enterprise Organizations" (15 min). Then do "Scoping Use Cases" — it builds the thinking framework that makes everything else make sense.' },
      { week: 'Week 2', title: 'The Ontology Mindset', url: 'https://learn.palantir.com/deep-dive-creating-your-first-ontology',
        content: 'Stop thinking in tables. Start thinking in objects and relationships. A "Patient" object has properties (age, diagnosis) and relationships (linked to Doctor, to Appointments). When you model your domain this way, AI can reason about it, apps can act on it, and queries become natural language instead of SQL.',
        action: 'Complete "Deep Dive: Creating Your First Ontology." Before you start, sketch your own domain on paper — what objects exist in your world? What connects them? This 10-minute exercise doubles the value of the course.' },
      { week: 'Week 3', title: 'The Data Flow Mental Model', url: 'https://learn.palantir.com/speedrun-your-first-e2e-workflow',
        content: 'Raw Data → Pipelines → Datasets → Ontology → Applications → AI. Every Palantir project follows this chain. The Ontology is not where data is stored — it is where data gets meaning. Applications do not query tables — they interact with objects. Once this chain is internalized, you always know where you are in the system.',
        action: 'Do the full End-to-End Speedrun (60–90 min). It walks you through the entire chain in one session and makes the mental model concrete.' },
    ]
  },
  {
    id: 'technical', icon: '⚙️', title: 'Technical Mastery', color: 'blue',
    tagline: 'Build practical hands-on skills across the full stack',
    steps: [
      { week: 'Month 1', title: 'Core Platform Literacy (Everyone)', url: 'https://learn.palantir.com/foundry-aip-aware',
        content: 'Before specializing, understand all four core areas: data ingestion (Data Connection), transformation (Pipeline Builder), semantic modeling (Ontology Manager), and application building (Workshop). You do not need to master all of these, but you need to understand what each one does and how they connect.',
        action: 'Complete the Foundry & AIP Aware course (8 hours) — the most efficient way to build broad platform literacy. Then choose your role track and go deep.' },
      { week: 'Month 2', title: 'Your Role Track', url: 'https://learn.palantir.com/page/training-tracks',
        content: 'Palantir learning is role-optimized. A data engineer does not need to master Workshop — that is an application developer\'s domain. Pick your primary track and go deep. The six tracks are: Data Engineer, Application Developer, AI Engineer, Data Scientist, Frontend/OSDK Developer, and Data Analyst.',
        action: 'Go to the Training Tracks page, pick your role, and follow the curated sequence. The order matters — each course builds on the previous one.' },
      { week: 'Month 3', title: 'Build a Real Project', url: 'https://learn.palantir.com/applied-notional-project-automobile-inbox',
        content: 'No course substitutes for a real project. The Applied Notional Project gives you a realistic Statement of Work and asks you to build the solution yourself. If you have access to your organization\'s Foundry environment, bring real data — even a small non-sensitive dataset accelerates learning dramatically.',
        action: 'Attempt the Applied Notional Project (1–2 days). Expect to be slow and confused — that discomfort is where learning happens. The struggle is the point.' },
    ]
  },
  {
    id: 'strategic', icon: '🎯', title: 'Strategic & Business Perspective', color: 'violet',
    tagline: 'Understand when and why to deploy Palantir — not just how',
    steps: [
      { week: 'Early', title: 'Use Case Thinking', url: 'https://learn.palantir.com/scoping-use-cases-for-foundry-aip',
        content: 'Palantir excels at: operational decision support with complex multi-source data; AI-augmented workflows where humans stay in the loop; environments requiring strict data governance and audit trails; large-scale integration across siloed systems. It is overkill for simple dashboards, single-source analytics, or small datasets.',
        action: 'Complete "Scoping Use Cases for Foundry & AIP" and internalize the decision framework. This skill — knowing what to build with Palantir — is rarer and more valuable than knowing how to build it.' },
      { week: 'Ongoing', title: 'Government & Defense Context', url: 'https://www.palantir.com/platforms/gotham/',
        content: "If you work in or with the federal government, Palantir's value proposition is specific: classified data environments, multi-agency data sharing, compliance with OMB A-123, FIAR, and FedRAMP requirements. Apollo specifically addresses air-gapped and disconnected environments that civilian deployments never encounter.",
        action: "Study Palantir's government use cases in parallel with technical training. DoD, DHS, and NHS deployments are documented publicly — read about them to understand the scale and operational context." },
      { week: 'Advanced', title: 'The AIP Operator Model', url: 'https://learn.palantir.com/speedrun-your-first-agentic-aip-workflow',
        content: "The most important strategic shift in Palantir (2023–present) is the move to AI operations. AIP does not replace analysts — it makes them 10× faster. The key insight: AI + Ontology = AI that knows the difference between YOUR contracts and generic contracts. This specificity is the business case for every AIP deployment.",
        action: "Read Palantir's AIP product pages and recent earnings call transcripts. Understanding the business model clarifies which features are being actively developed and where the platform is headed." },
    ]
  },
  {
    id: 'community', icon: '🤝', title: 'Community & Credentials', color: 'emerald',
    tagline: 'Learn from practitioners — the community accelerates everything',
    steps: [
      { week: 'Day 1', title: 'Join the Palantir Community', url: 'https://community.palantir.com',
        content: 'community.palantir.com is where practitioners ask questions, share solutions, and get feature announcements. It runs on Discourse and is free to join. Palantir engineers and certified developers answer questions directly. The Foundry and AIP channels are the most active.',
        action: 'Create a free account at community.palantir.com. Browse Announcements and Foundry sections. Before asking a question, search first — most common questions have detailed answers already posted.' },
      { week: 'Month 1', title: 'Get Free Developer Access', url: 'https://signup.palantirfoundry.com/signup?signupPermitCode=BUILD_WITH_AIP',
        content: "Palantir offers free Developer Tier access to Foundry for individuals and eligible organizations. This is how you practice outside a work environment. You cannot learn Palantir by reading alone — you must build. A free developer account gives you a real Foundry environment to experiment in.",
        action: 'Sign up at signup.palantirfoundry.com. Use it to complete hands-on courses and build your own practice projects.' },
      { week: 'Month 2–3', title: 'Earn Your Badge & Certification', url: 'https://learn.palantir.com/foundry-aip-builder-foundations-quiz',
        content: "The Foundry & AIP Builder Foundations Badge is a 15-minute quiz giving you a public, shareable credential. The full Foundry Developer Certification (at certification.palantir.com) is the professional-grade credential used in government contracting and enterprise hiring.",
        action: 'Complete the quiz for the badge first (quick win, 15 minutes). Then plan for the full certification — it requires Foundry access and typically 60–80 hours of preparation.' },
    ]
  },
  {
    id: 'federal', icon: '🏛️', title: 'Federal & DoD Perspective', color: 'slate',
    tagline: 'For government professionals — the specific context that changes everything',
    steps: [
      { week: 'Foundation', title: 'Apollo Is Your First Priority', url: 'https://www.palantir.com/platforms/apollo/',
        content: 'In classified and air-gapped environments, Apollo — not Foundry — is what you encounter first. Apollo manages the deployment, updates, and configuration of the entire Palantir stack. Understanding Apollo is critical for IT administrators, program managers, and contracting officers in DoD environments.',
        action: 'Study Apollo separately from commercial Foundry material. The air-gapped deployment architecture, enrollment process, and configuration policy system are unique to government deployments.' },
      { week: 'Context', title: 'Financial Management Applications', url: 'https://www.palantir.com/platforms/foundry/',
        content: 'For federal financial managers (CFO Act agencies, DoD comptrollers), Foundry\'s value is integrating GFEBS, DEAMS, ADVANA, and other financial systems into a unified analytical layer. The Ontology models budget execution objects — programs, allotments, obligations — and AIP can flag anomalies, forecast execution rates, and support FIAR compliance.',
        action: 'Map your agency\'s financial systems to the Foundry data model mentally before starting technical training. A Contract links to a Vendor, a Program, an Obligation, a Payment — model that chain.' },
      { week: 'Advanced', title: 'Acquisition & Contracting Intelligence', url: 'https://community.palantir.com',
        content: "Palantir is increasingly used in acquisition — tracking contractor performance, monitoring spend against budget, flagging anomalies in contract modifications. The highest-value use case connects contract data (FPDS, PIEE, EDA) to execution data (GFEBS/DEAMS) in a single Ontology. The USAF ADVANA platform is a public example of this at scale.",
        action: 'Review public Palantir case studies for DoD financial management. Then model your own agency\'s acquisition data as an Ontology on paper — objects, relationships, and the AI questions you would want to ask.' },
    ]
  },
]

const TYPE_COLORS: Record<string, string> = {
  'Speedrun': 'bg-green-900/40 text-green-300 border-green-700/50',
  'Deep Dive': 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  'Overview': 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  'Guide': 'bg-night-800 text-night-300 border-night-700',
  'Quiz': 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  'Notional Project': 'bg-red-900/40 text-red-300 border-red-700/50',
}

const LEVEL_COLORS: Record<string, string> = {
  'Beginner': 'text-green-400',
  'Beginner–Intermediate': 'text-teal-400',
  'Intermediate': 'text-blue-400',
  'Advanced': 'text-red-400',
}

const TRACK_COLORS: Record<string, string> = {
  blue: 'border-blue-700/40 bg-blue-900/20 text-blue-300',
  violet: 'border-violet-700/40 bg-violet-900/20 text-violet-300',
  cyan: 'border-cyan-700/40 bg-cyan-900/20 text-cyan-300',
  emerald: 'border-emerald-700/40 bg-emerald-900/20 text-emerald-300',
  amber: 'border-amber-700/40 bg-amber-900/20 text-amber-300',
  orange: 'border-orange-700/40 bg-orange-900/20 text-orange-300',
}

const PILLAR_C: Record<string, { border: string; accent: string; bg: string }> = {
  amber: { border: 'border-amber-700/40', accent: 'text-amber-300', bg: 'bg-amber-900/20' },
  blue: { border: 'border-blue-700/40', accent: 'text-blue-300', bg: 'bg-blue-900/20' },
  violet: { border: 'border-violet-700/40', accent: 'text-violet-300', bg: 'bg-violet-900/20' },
  emerald: { border: 'border-emerald-700/40', accent: 'text-emerald-300', bg: 'bg-emerald-900/20' },
  slate: { border: 'border-slate-700/40', accent: 'text-slate-300', bg: 'bg-slate-900/20' },
}

export default function LearnPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">▶</span>
          <h1 className="text-3xl font-bold text-white">Palantir Learning Hub</h1>
        </div>
        <p className="text-night-300 text-sm max-w-3xl mb-5">
          All {COURSES.length} official courses from{' '}
          <a href="https://learn.palantir.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline">learn.palantir.com</a>
          {' '}with verified direct links — plus an in-depth guide to mastering the Palantir stack from every angle.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '#guide', label: '📖 Learning Guide' },
            { href: '#tracks', label: '🗺️ Role Tracks' },
            { href: '#courses', label: '▶ All Courses' },
          ].map(l => (
            <a key={l.href} href={l.href} className="px-3 py-1.5 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 hover:text-white text-xs rounded-lg transition-all">
              {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* SECTION 1: Learning Guide */}
      <section id="guide" className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-1">📖 How to Master the Palantir Stack</h2>
        <p className="text-night-400 text-sm mb-8 max-w-3xl">
          A practical multi-perspective guide — cognitive foundations, technical skills, strategic thinking, community resources, and federal-specific context.
        </p>
        <div className="space-y-8">
          {LEARNING_PILLARS.map((pillar) => {
            const c = PILLAR_C[pillar.color]
            return (
              <div key={pillar.id} id={pillar.id} className={`rounded-xl border ${c.border} overflow-hidden`}>
                <div className={`px-6 py-4 ${c.bg} border-b ${c.border}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pillar.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{pillar.title}</h3>
                      <p className={`text-sm ${c.accent}`}>{pillar.tagline}</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-night-800">
                  {pillar.steps.map((step, i) => (
                    <div key={i} className="px-6 py-5">
                      <div className="flex items-start gap-4">
                        <div className={`shrink-0 px-2 py-1 rounded text-xs font-mono border ${c.border} ${c.accent} ${c.bg} whitespace-nowrap`}>
                          {step.week}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-2">{step.title}</h4>
                          <p className="text-night-300 text-sm leading-relaxed mb-3">{step.content}</p>
                          <div className="flex items-start gap-2 bg-night-900 border border-night-800 rounded-lg px-4 py-2.5">
                            <span className={`shrink-0 text-xs font-mono ${c.accent} mt-0.5`}>→</span>
                            <p className="text-night-200 text-xs leading-relaxed flex-1">{step.action}</p>
                            <a href={step.url} target="_blank" rel="noopener noreferrer"
                              className={`shrink-0 text-xs ${c.accent} hover:underline ml-2 whitespace-nowrap`}>Open ↗</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 2: Training Tracks */}
      <section id="tracks" className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-1">🗺️ Official Training Tracks by Role</h2>
        <p className="text-night-400 text-sm mb-6">Pick your role. Follow the curated sequence. Each track is maintained by Palantir.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRAINING_TRACKS.map((track) => {
            const c = TRACK_COLORS[track.color] || TRACK_COLORS.blue
            const startCourse = COURSES.find(course => course.slug === track.start)
            return (
              <div key={track.role} className="bg-night-900 border border-night-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{track.icon}</span>
                  <h3 className="text-white font-semibold text-sm">{track.role}</h3>
                </div>
                <p className="text-night-400 text-xs leading-relaxed mb-3 flex-1">{track.desc}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {track.skills.map(s => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 bg-night-800 border border-night-700 text-night-500 rounded font-mono">{s}</span>
                  ))}
                </div>
                {startCourse && (
                  <p className="text-[10px] text-night-600 mb-2">Start: <span className="text-night-400">{startCourse.title}</span></p>
                )}
                <a href={track.url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:opacity-80 ${c}`}>
                  Open {track.role} Track ↗
                </a>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 3: All Courses */}
      <section id="courses">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-white">{COURSES.length} Official Courses</h2>
            <p className="text-night-500 text-xs mt-1">All URLs verified directly from learn.palantir.com — click Open ↗ to go to the real course</p>
          </div>
          <a href="https://learn.palantir.com/page/course-catalog" target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-2 bg-night-800 border border-night-700 text-night-300 hover:text-white rounded-lg transition-all">
            Full catalog ↗
          </a>
        </div>
        <div className="space-y-3">
          {COURSES.map((course) => (
            <div key={course.slug} className="bg-night-900 border border-night-800 hover:border-night-700 rounded-xl p-4 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${TYPE_COLORS[course.type] || 'bg-night-800 text-night-400 border-night-700'}`}>{course.type}</span>
                    <span className={`text-[10px] font-medium ${LEVEL_COLORS[course.level] || 'text-night-400'}`}>{course.level}</span>
                    <span className="text-[10px] text-night-600">⏱ {course.duration}</span>
                    {course.foundryRequired && <span className="text-[10px] px-1.5 py-0.5 bg-night-800 border border-night-700 text-night-600 rounded">Foundry Required</span>}
                  </div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-amber-200 transition-colors mb-1">{course.title}</h3>
                  <p className="text-night-400 text-xs mb-1.5 leading-relaxed">{course.summary}</p>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-500 text-[10px] shrink-0 mt-px">💡</span>
                    <p className="text-night-300 text-xs italic">{course.plain}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {course.roles.map(r => (
                      <span key={r} className="text-[9px] px-1.5 py-0.5 bg-night-800 border border-night-700 text-night-600 rounded">{r}</span>
                    ))}
                  </div>
                </div>
                <a href={`https://learn.palantir.com/${course.slug}`} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 px-3 py-2 bg-amber-900/20 hover:bg-amber-800/30 border border-amber-700/40 text-amber-300 rounded-lg text-xs font-medium transition-all">
                  Open ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-12 p-6 bg-night-900 border border-amber-800/30 rounded-xl text-center">
        <div className="text-2xl mb-2">🎓</div>
        <h3 className="text-white font-bold text-lg mb-2">Ready to Start Building?</h3>
        <p className="text-night-400 text-sm mb-5 max-w-lg mx-auto">
          All hands-on courses require Foundry access. Get a free Developer Tier account to complete the labs without waiting for organizational access.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="https://learn.palantir.com/speedrun-your-first-e2e-workflow" target="_blank" rel="noopener noreferrer"
            className="px-5 py-2.5 bg-amber-700/40 hover:bg-amber-600/40 border border-amber-600/50 text-amber-200 rounded-lg text-sm font-medium transition-all">
            ▶ Start First Course ↗
          </a>
          <a href="https://signup.palantirfoundry.com/signup?signupPermitCode=BUILD_WITH_AIP" target="_blank" rel="noopener noreferrer"
            className="px-5 py-2.5 bg-night-800 hover:bg-night-700 border border-night-700 text-night-200 rounded-lg text-sm font-medium transition-all">
            Get Free Foundry Access ↗
          </a>
          <a href="https://community.palantir.com" target="_blank" rel="noopener noreferrer"
            className="px-5 py-2.5 bg-night-800 hover:bg-night-700 border border-night-700 text-night-200 rounded-lg text-sm font-medium transition-all">
            Join Community ↗
          </a>
        </div>
        <p className="text-night-700 text-xs mt-4">
          Not affiliated with Palantir Technologies Inc. ·{' '}
          <Link href="/resources" className="hover:text-night-500">See all resources →</Link>
        </p>
      </div>
    </div>
  )
}
