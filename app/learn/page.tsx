// app/learn/page.tsx — Official Palantir Learning Courses from learn.palantir.com
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Learn — Official Palantir Courses',
  description: 'Browse all official Palantir courses from learn.palantir.com. Structured learning paths for every role — no technical background required to get started.',
}

// ─── Course Data (from learn.palantir.com) ───────────────────────────────────

const LEARNING_PATHS = [
  {
    id:          'getting-started',
    title:       'Start Here — Zero to Palantir',
    icon:        '🚀',
    color:       'amber',
    tagline:     'Never used Palantir before? Begin here. No technical background needed.',
    description: 'These courses explain what Palantir actually does in plain English — what problems it solves, how businesses use it, and what the key concepts mean. Perfect for managers, analysts, and anyone curious.',
    courses: [
      {
        title:       'Introduction to Palantir Foundry',
        url:         'https://learn.palantir.com/introduction-to-palantir-foundry',
        duration:    '~2 hours',
        level:       'Beginner',
        format:      'Self-paced',
        whatYouLearn: [
          'What Palantir Foundry is and why organizations use it',
          'How data flows from raw sources into usable business insights',
          'Key concepts: datasets, pipelines, and applications — explained simply',
          'How analysts, engineers, and business users each interact with Foundry',
        ],
        plainEnglish: 'Think of Foundry as a central nervous system for your organization\'s data. This course explains what that means without any jargon.',
      },
      {
        title:       'Palantir Platform Overview',
        url:         'https://learn.palantir.com/palantir-platform-overview',
        duration:    '~1 hour',
        level:       'Beginner',
        format:      'Self-paced',
        whatYouLearn: [
          'How Foundry, Ontology, AIP, and Apollo fit together',
          'What each product is designed for',
          'Common deployment scenarios in government and commercial settings',
          'The difference between the Palantir stack and traditional software',
        ],
        plainEnglish: 'Palantir has multiple products. This overview shows how they connect and which one matters for your role.',
      },
      {
        title:       'Introduction to the Palantir Ontology',
        url:         'https://learn.palantir.com/introduction-to-the-palantir-ontology',
        duration:    '~1.5 hours',
        level:       'Beginner',
        format:      'Self-paced',
        whatYouLearn: [
          'What an "Ontology" is in plain language (it\'s just a smart data model)',
          'How objects like "Patient", "Contract", or "Aircraft" are defined',
          'Why linking data objects together unlocks new insights',
          'How business users interact with the Ontology every day',
        ],
        plainEnglish: 'The Ontology is Palantir\'s way of organizing data so it mirrors the real world. A "patient" in the system behaves like an actual patient — with all their records, appointments, and relationships attached.',
      },
    ],
  },
  {
    id:          'analyst-track',
    title:       'Analyst Track — Working with Data',
    icon:        '📊',
    color:       'blue',
    tagline:     'For analysts, operations staff, and business users who work with Palantir daily.',
    description: 'Learn how to find data, build analyses, create visualizations, and generate reports — using Palantir\'s tools for non-technical users.',
    courses: [
      {
        title:       'Contour: Data Analysis Without Code',
        url:         'https://learn.palantir.com/contour',
        duration:    '~3 hours',
        level:       'Beginner–Intermediate',
        format:      'Self-paced + exercises',
        whatYouLearn: [
          'How to explore large datasets using Contour\'s visual interface',
          'Filtering, grouping, and aggregating data with clicks (no SQL needed)',
          'Building charts, tables, and dashboards for your team',
          'Saving and sharing your analyses as reusable views',
        ],
        plainEnglish: 'Contour is like Excel\'s powerful cousin — it handles millions of rows and lets you build analyses visually, without writing a single line of code.',
      },
      {
        title:       'Workshop: Building Operational Applications',
        url:         'https://learn.palantir.com/workshop',
        duration:    '~4 hours',
        level:       'Intermediate',
        format:      'Self-paced + project',
        whatYouLearn: [
          'How to build custom dashboards and operational interfaces in Workshop',
          'Connecting live data to interactive maps, tables, and charts',
          'Using "Actions" to let users update data directly from an app',
          'Deploying apps to your team without any coding',
        ],
        plainEnglish: 'Workshop is Palantir\'s no-code app builder. Operations teams use it to build situational awareness dashboards — think a live map of field assets or a real-time logistics tracker.',
      },
      {
        title:       'Quiver: Time-Series Analysis',
        url:         'https://learn.palantir.com/quiver',
        duration:    '~2 hours',
        level:       'Intermediate',
        format:      'Self-paced',
        whatYouLearn: [
          'How to analyze data that changes over time (sensor readings, financial data, events)',
          'Visualizing time-series data with Quiver\'s specialized charts',
          'Detecting patterns, anomalies, and trends visually',
          'Connecting time-series to your broader Foundry datasets',
        ],
        plainEnglish: 'Quiver is the go-to tool when your data has timestamps — stock prices, equipment sensor readings, patient vitals, traffic counts. It makes spotting trends effortless.',
      },
      {
        title:       'Slate: Building Custom Web Applications',
        url:         'https://learn.palantir.com/slate',
        duration:    '~3 hours',
        level:       'Intermediate',
        format:      'Self-paced',
        whatYouLearn: [
          'How to build custom web interfaces on top of Foundry data',
          'Creating forms, search interfaces, and decision-support tools',
          'Using Slate\'s visual builder vs. advanced HTML/JS customization',
          'Real-world examples: procurement portals, intake forms, approval workflows',
        ],
        plainEnglish: 'Slate is for when Workshop isn\'t quite flexible enough. It lets you build fully custom web apps — think an intake form or approval workflow — that sit on top of your Foundry data.',
      },
    ],
  },
  {
    id:          'developer-track',
    title:       'Developer Track — Building & Engineering',
    icon:        '⚙️',
    color:       'violet',
    tagline:     'For software engineers, data engineers, and technical developers.',
    description: 'Learn how to build data pipelines, create Transforms, use the OSDK, and develop production-grade applications on the Palantir stack.',
    courses: [
      {
        title:       'Data Engineering in Foundry',
        url:         'https://learn.palantir.com/data-engineering-in-foundry',
        duration:    '~6 hours',
        level:       'Intermediate',
        format:      'Self-paced + hands-on labs',
        whatYouLearn: [
          'Building data pipelines that automatically process and clean raw data',
          'Writing Python (PySpark) and SQL Transforms',
          'Working with Foundry datasets, branches, and version history',
          'Incremental processing — only computing what has changed',
          'Debugging pipelines and handling data quality issues',
        ],
        plainEnglish: 'This is the core engineering course. It covers how to take raw messy data and turn it into clean, reliable datasets that analysts and applications can use.',
      },
      {
        title:       'Foundry ML: Machine Learning in Production',
        url:         'https://learn.palantir.com/foundry-ml',
        duration:    '~5 hours',
        level:       'Advanced',
        format:      'Self-paced + labs',
        whatYouLearn: [
          'Training and deploying ML models directly inside Foundry',
          'Using Foundry ML\'s model registry and versioning',
          'Connecting model outputs to Workshop apps and Ontology actions',
          'Monitoring model performance over time',
        ],
        plainEnglish: 'Foundry ML lets data scientists train models inside the same platform where the data lives — no exporting, no separate MLOps stack.',
      },
      {
        title:       'OSDK: Ontology Software Development Kit',
        url:         'https://learn.palantir.com/osdk',
        duration:    '~4 hours',
        level:       'Advanced',
        format:      'Self-paced + code labs',
        whatYouLearn: [
          'How to query and manipulate Ontology objects from TypeScript or Python',
          'Building external applications that connect to Foundry via OSDK',
          'Subscribing to real-time object changes',
          'Authentication, permissions, and API best practices',
        ],
        plainEnglish: 'The OSDK lets external developers build apps on top of the Ontology — like building a mobile app that pulls live data from Foundry without needing to know Foundry internals.',
      },
      {
        title:       'AIP Logic: Building AI Functions',
        url:         'https://learn.palantir.com/aip-logic',
        duration:    '~3 hours',
        level:       'Intermediate–Advanced',
        format:      'Self-paced',
        whatYouLearn: [
          'How to build reusable AI functions that work on your Ontology data',
          'Prompting LLMs to analyze, summarize, and classify your data objects',
          'Chaining AI functions into multi-step workflows',
          'Governance: controlling what data the AI can access',
        ],
        plainEnglish: 'AIP Logic lets you wire GPT-style AI directly to your business data. Instead of asking AI a generic question, you ask it about your actual contracts, incidents, or shipments.',
      },
    ],
  },
  {
    id:          'aip-track',
    title:       'AIP & AI Agent Track',
    icon:        '✦',
    color:       'cyan',
    tagline:     'For teams building AI-powered workflows, automation, and agentic systems.',
    description: 'Learn to build AI copilots, automated agents, and LLM-powered decision tools on top of your real business data using Palantir AIP.',
    courses: [
      {
        title:       'Introduction to AIP',
        url:         'https://learn.palantir.com/introduction-to-aip',
        duration:    '~2 hours',
        level:       'Beginner',
        format:      'Self-paced',
        whatYouLearn: [
          'What Palantir AIP is and how it differs from generic AI tools like ChatGPT',
          'How AIP connects AI to your organization\'s actual data',
          'Key concepts: Copilot, Logic functions, Studio agents',
          'Real-world examples: supply chain AI, defense decision support, healthcare triage',
        ],
        plainEnglish: 'ChatGPT knows about the world. AIP knows about YOUR organization. This course explains the difference and why it matters for operational AI.',
      },
      {
        title:       'AIP Copilot: AI-Assisted Analysis',
        url:         'https://learn.palantir.com/aip-copilot',
        duration:    '~2.5 hours',
        level:       'Beginner–Intermediate',
        format:      'Self-paced',
        whatYouLearn: [
          'Using natural language to query and analyze Foundry data',
          'How Copilot understands your Ontology to give contextual answers',
          'Best practices for writing prompts that get precise results',
          'Using Copilot inside Workshop apps for end-user AI assistance',
        ],
        plainEnglish: 'AIP Copilot is like having a data analyst on call who already knows all your systems. You type a question in plain English and it gives you an answer based on your actual data.',
      },
      {
        title:       'AIP Studio: Building AI Agents',
        url:         'https://learn.palantir.com/aip-studio',
        duration:    '~4 hours',
        level:       'Intermediate–Advanced',
        format:      'Self-paced + project',
        whatYouLearn: [
          'How to build multi-step AI agents that complete complex workflows',
          'Designing agent tools: what each agent can query, read, and modify',
          'Human-in-the-loop: when agents ask for approval before taking action',
          'Testing, monitoring, and improving agent behavior',
        ],
        plainEnglish: 'AIP Studio is where you build AI agents — software that can reason, plan, and take actions on your behalf. Think of an agent that reviews incoming contracts and flags anomalies for a human to approve.',
      },
    ],
  },
  {
    id:          'apollo-track',
    title:       'Apollo & Deployment Track',
    icon:        '⊙',
    color:       'emerald',
    tagline:     'For IT operations, DevOps, and teams managing Palantir in production.',
    description: 'Learn how to deploy, manage, and maintain the Palantir platform — including air-gapped government environments.',
    courses: [
      {
        title:       'Introduction to Apollo',
        url:         'https://learn.palantir.com/introduction-to-apollo',
        duration:    '~2 hours',
        level:       'Beginner',
        format:      'Self-paced',
        whatYouLearn: [
          'What Apollo does: software distribution and configuration management at scale',
          'How Apollo manages fleets of servers and environments from a single control plane',
          'Key concepts: enrollments, products, configuration policies',
          'How Apollo handles air-gapped, classified, and disconnected environments',
        ],
        plainEnglish: 'Apollo is Palantir\'s answer to "how do you update software on 500 servers in a classified facility with no internet?" It manages the entire deployment lifecycle automatically.',
      },
      {
        title:       'Apollo Fleet Management',
        url:         'https://learn.palantir.com/apollo-fleet-management',
        duration:    '~3 hours',
        level:       'Intermediate',
        format:      'Self-paced + labs',
        whatYouLearn: [
          'Enrolling new environments and managing their lifecycle',
          'Deploying software updates across a fleet with rollback capability',
          'Monitoring health, compliance, and configuration drift',
          'Apollo CLI: managing environments from the command line',
        ],
        plainEnglish: 'This is the hands-on operational course. If you\'re running Palantir in a government data center or multi-cloud environment, this is required reading.',
      },
    ],
  },
  {
    id:          'certification',
    title:       'Palantir Certification',
    icon:        '🏆',
    color:       'yellow',
    tagline:     'Validate your skills with an official Palantir developer certification.',
    description: 'Palantir offers certification exams for developers who want to demonstrate professional-level competency with the platform.',
    courses: [
      {
        title:       'Palantir Foundry Developer Certification',
        url:         'https://learn.palantir.com/palantir-foundry-developer-certification',
        duration:    'Exam: ~2 hours',
        level:       'Advanced',
        format:      'Proctored exam',
        whatYouLearn: [
          'Covers all core Foundry concepts: data engineering, Ontology, transforms, ML',
          'Tests both theoretical understanding and practical problem-solving',
          'Recognised by Palantir customers globally for hiring and project staffing',
          'Study guide and practice questions provided via learn.palantir.com',
        ],
        plainEnglish: 'The gold standard certification for anyone who works with Foundry professionally. Increasingly requested by government contractors and enterprise teams when staffing Palantir projects.',
      },
      {
        title:       'Certification Prep: Practice Labs',
        url:         'https://learn.palantir.com/certification-prep',
        duration:    '~8 hours',
        level:       'Advanced',
        format:      'Hands-on labs',
        whatYouLearn: [
          'Practice exercises covering every exam domain',
          'Real Foundry environment to complete lab challenges',
          'Worked examples with explanations for each topic area',
          'Timed practice assessments to simulate exam conditions',
        ],
        plainEnglish: 'The official practice environment for the certification exam. Work through real scenarios in a sandboxed Foundry instance before your exam day.',
      },
    ],
  },
]

const LEVEL_COLORS: Record<string, string> = {
  'Beginner':                'bg-green-900/40 text-green-300 border-green-700/40',
  'Beginner–Intermediate':   'bg-teal-900/40 text-teal-300 border-teal-700/40',
  'Intermediate':            'bg-blue-900/40 text-blue-300 border-blue-700/40',
  'Intermediate–Advanced':   'bg-violet-900/40 text-violet-300 border-violet-700/40',
  'Advanced':                'bg-red-900/40 text-red-300 border-red-700/40',
  'Exam: ~2 hours':          'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
}

const TRACK_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  amber:  { border: 'border-amber-700/40',  bg: 'bg-amber-900/20',  text: 'text-amber-300',  badge: 'bg-amber-900/40 text-amber-300 border-amber-700/40' },
  blue:   { border: 'border-blue-700/40',   bg: 'bg-blue-900/20',   text: 'text-blue-300',   badge: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  violet: { border: 'border-violet-700/40', bg: 'bg-violet-900/20', text: 'text-violet-300', badge: 'bg-violet-900/40 text-violet-300 border-violet-700/40' },
  cyan:   { border: 'border-cyan-700/40',   bg: 'bg-cyan-900/20',   text: 'text-cyan-300',   badge: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40' },
  emerald:{ border: 'border-emerald-700/40',bg: 'bg-emerald-900/20',text: 'text-emerald-300',badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40' },
  yellow: { border: 'border-yellow-700/40', bg: 'bg-yellow-900/20', text: 'text-yellow-300', badge: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40' },
}

const TOTAL_COURSES = LEARNING_PATHS.reduce((sum, p) => sum + p.courses.length, 0)

export default function LearnPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">▶</span>
          <h1 className="text-3xl font-bold text-white">Official Palantir Courses</h1>
          <span className="px-2 py-0.5 bg-amber-900/40 text-amber-300 border border-amber-700/40 rounded text-xs font-mono">
            {TOTAL_COURSES} courses
          </span>
        </div>
        <p className="text-night-300 text-sm max-w-3xl leading-relaxed">
          All courses sourced from{' '}
          <a href="https://learn.palantir.com" target="_blank" rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
            learn.palantir.com
          </a>
          {' '}— Palantir&apos;s official learning platform. Free to access with a Palantir or AIP account.
          Content is written here in plain English so anyone can decide where to start — then links you directly to the original course.
        </p>

        {/* Quick jump */}
        <div className="flex flex-wrap gap-2 mt-5">
          {LEARNING_PATHS.map((path) => {
            const c = TRACK_COLORS[path.color]
            return (
              <a key={path.id} href={`#${path.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${c.border} ${c.bg} ${c.text} hover:opacity-80`}>
                <span>{path.icon}</span> {path.title.split('—')[0].trim()}
              </a>
            )
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-8 p-4 bg-night-900 border border-night-700 rounded-xl flex gap-3">
        <span className="text-amber-400 text-lg shrink-0">ℹ</span>
        <p className="text-night-400 text-sm leading-relaxed">
          <strong className="text-night-200">How this page works:</strong> Each course below links directly to the official Palantir lesson on learn.palantir.com.
          The descriptions here are written in plain language to help you quickly understand what each course covers and whether it&apos;s right for your role —
          even if you have no technical background. Some courses require a free Palantir Community or AIP account.
        </p>
      </div>

      {/* Learning Paths */}
      <div className="space-y-14">
        {LEARNING_PATHS.map((path) => {
          const c = TRACK_COLORS[path.color]
          return (
            <section key={path.id} id={path.id}>
              {/* Path header */}
              <div className={`flex items-start gap-4 p-5 rounded-xl border ${c.border} ${c.bg} mb-5`}>
                <span className="text-4xl shrink-0">{path.icon}</span>
                <div className="flex-1">
                  <h2 className={`text-xl font-bold text-white mb-1`}>{path.title}</h2>
                  <p className={`text-sm font-medium mb-2 ${c.text}`}>{path.tagline}</p>
                  <p className="text-night-300 text-sm leading-relaxed">{path.description}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-1 rounded border font-mono ${c.badge}`}>
                  {path.courses.length} courses
                </span>
              </div>

              {/* Courses */}
              <div className="space-y-4">
                {path.courses.map((course, i) => {
                  const levelColor = LEVEL_COLORS[course.level] || 'bg-night-800 text-night-300 border-night-700'
                  return (
                    <div key={i} className="bg-night-900 border border-night-800 hover:border-night-700 rounded-xl overflow-hidden transition-all group">
                      {/* Course header */}
                      <div className="p-5 pb-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded border font-mono ${levelColor}`}>
                                {course.level}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded border bg-night-800 text-night-400 border-night-700">
                                ⏱ {course.duration}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded border bg-night-800 text-night-400 border-night-700">
                                {course.format}
                              </span>
                            </div>
                            <h3 className="text-white font-semibold text-base group-hover:text-amber-200 transition-colors">
                              {course.title}
                            </h3>
                          </div>
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${c.border} ${c.bg} ${c.text} hover:opacity-80`}
                          >
                            Open Course ↗
                          </a>
                        </div>

                        {/* Plain English summary */}
                        <div className="bg-night-800/60 border border-night-700/60 rounded-lg px-4 py-3 mb-4">
                          <span className={`text-xs font-mono ${c.text} mr-2`}>💡 Plain English:</span>
                          <span className="text-night-200 text-sm">{course.plainEnglish}</span>
                        </div>

                        {/* What you&apos;ll learn */}
                        <div>
                          <h4 className="text-night-400 text-xs font-mono uppercase tracking-wider mb-2">What you&apos;ll learn</h4>
                          <ul className="space-y-1.5">
                            {course.whatYouLearn.map((item, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-night-300">
                                <span className={`shrink-0 mt-0.5 ${c.text}`}>▸</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className={`px-5 py-3 border-t border-night-800 flex items-center justify-between`}>
                        <span className="text-night-600 text-xs">learn.palantir.com</span>
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs font-mono ${c.text} hover:underline flex items-center gap-1`}
                        >
                          Go to official course →
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-14 p-6 bg-night-900 border border-amber-800/30 rounded-xl text-center">
        <div className="text-2xl mb-2">🎓</div>
        <h3 className="text-white font-bold text-lg mb-2">Browse All Courses on learn.palantir.com</h3>
        <p className="text-night-400 text-sm mb-4 max-w-lg mx-auto">
          Palantir regularly adds new courses and learning paths. Visit the official platform for the full catalog, including role-based tracks, live instructor sessions, and certification prep.
        </p>
        <a
          href="https://learn.palantir.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700/40 hover:bg-amber-600/40 border border-amber-600/50 text-amber-200 rounded-lg font-medium transition-all"
        >
          ▶ Open learn.palantir.com ↗
        </a>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-night-600">
          <span>Not affiliated with Palantir Technologies Inc.</span>
          <span>·</span>
          <Link href="/resources" className="text-night-500 hover:text-night-300 transition-colors">
            See all resources →
          </Link>
        </div>
      </div>
    </div>
  )
}
