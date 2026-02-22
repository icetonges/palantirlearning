// app/media/page.tsx — Palantir Media Hub
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Media Hub — Palantir Videos, Podcasts & Talks',
  description: 'Free Palantir videos, podcasts, and official talks — AIPCon, DevCon, developer tutorials, and expert interviews.',
}

// ─── CONFIRMED YouTube Videos (official Palantir channel) ────────────────────
const VIDEOS = [
  {
    id:          'n0fHTATIjSc',
    title:       'AIPCon 5 — Full Livestream',
    date:        'September 12, 2024',
    duration:    '~3 hrs',
    type:        'AIPCon',
    featured:    true,
    description: '100+ organizations including NGA, Aramark, bp, Anduril, L3Harris, and the Department of State demo how they use AIP in production. Best single-session overview of real-world Palantir deployments.',
    tags:        ['AIP', 'Live Demo', 'Government', 'Commercial'],
  },
  {
    id:          null,
    channelLink: 'https://www.youtube.com/@palantirtech/streams',
    title:       'AIPCon 8 — Full Livestream',
    date:        'September 4, 2025',
    duration:    '~4 hrs',
    type:        'AIPCon',
    featured:    false,
    description: '70+ speakers including American Airlines, bp, Novartis, Waste Management, and MaineHealth. Features nuclear power AI, pharmaceutical R&D acceleration, and fleet optimization use cases.',
    tags:        ['AIP', 'Live Demo', 'Healthcare', 'Manufacturing'],
  },
  {
    id:          null,
    channelLink: 'https://www.youtube.com/@palantirtech/streams',
    title:       'AIPCon 6 — Full Livestream',
    date:        'March 2025',
    duration:    '~3 hrs',
    type:        'AIPCon',
    featured:    false,
    description: 'The first AIPCon of 2025, showcasing expanded commercial deployments and new AIP features including Agent Studio and OSDK 2.0 capabilities.',
    tags:        ['AIP', 'Live Demo', 'OSDK', 'Agents'],
  },
  {
    id:          null,
    channelLink: 'https://www.youtube.com/@palantirtech',
    title:       'Video Tutorial Library',
    date:        'Ongoing',
    duration:    'Various',
    type:        'Tutorial',
    featured:    false,
    description: 'Full library of Palantir developer tutorials covering Contour, Workshop, Quiver, Pipeline Builder, Code Repositories, and more. Maintained by Palantir\'s community managers.',
    tags:        ['Tutorial', 'Foundry', 'Developer'],
  },
  {
    id:          null,
    channelLink: 'https://www.youtube.com/channel/UCQRc3PMlCsoodxbR4IsglKQ',
    title:       'DevCon Talks & Announcements',
    date:        'Nov 2024 — Present',
    duration:    'Various',
    type:        'DevCon',
    featured:    false,
    description: 'Sessions from Palantir\'s inaugural developer conference: OSDK 2.0, Platform APIs, Workflow Builder, Agent Studio, and hackathon highlights.',
    tags:        ['Developer', 'OSDK', 'AIP', 'Conference'],
  },
]

// ─── Podcasts ─────────────────────────────────────────────────────────────────
const PODCAST_SHOWS = [
  {
    id:          'palantir-weekly',
    name:        'Palantir Weekly',
    host:        'Amit Kukreja',
    spotifyId:   '2vVlRBHoBjUPgAYeASqd5z',
    spotifyUrl:  'https://open.spotify.com/show/2vVlRBHoBjUPgAYeASqd5z',
    description: 'Deep-dive weekly analysis of Palantir products, news, and strategy. Best podcast for staying current on Foundry, AIP, and platform developments.',
    frequency:   'Weekly',
    focus:       'Product & Strategy',
    embed:       true,
    color:       'green',
  },
  {
    id:          'the-merge',
    name:        'The Merge',
    host:        'Mike & Jake',
    spotifyId:   null,
    spotifyUrl:  null,
    appleUrl:    'https://podcasts.apple.com/us/podcast/e38-palantir-cto-shyam-sankar-real-defense-innovation/id1656161127?i=1000659163427',
    description: 'Defense tech podcast. Episode 38 features Palantir CTO Shyam Sankar on real defense innovation, how Palantir sued the US Army and won, leadership, and AI in national security.',
    frequency:   'Irregular',
    focus:       'Defense & National Security',
    embed:       false,
    color:       'blue',
    highlight:   'CTO Shyam Sankar interview — 54 min',
  },
  {
    id:          'hill-valley',
    name:        'Hill & Valley Forum',
    host:        'Hill & Valley Forum',
    spotifyUrl:  'https://open.spotify.com/show/39s4MCyt1pOTQ8FjOAS4mi',
    appleUrl:    'https://podcasts.apple.com/us/podcast/palantir-ceo-alex-karp-forging-the-technological/id1692653857?i=1000705952599',
    description: 'Alex Karp at the Hill & Valley Forum discusses his book "The Technological Republic," America\'s AI imperative, Western values, and Palantir\'s organizational principles.',
    frequency:   'Conference talks',
    focus:       'Strategy & Leadership',
    embed:       false,
    color:       'violet',
    highlight:   'Alex Karp keynote — 29 min',
  },
  {
    id:          'what-palantir-sees',
    name:        'Interesting Times (NYT)',
    host:        'Ross Douthat',
    appleUrl:    'https://podcasts.apple.com/us/podcast/what-palantir-sees/id1438024613?i=1000734186457',
    description: 'NYT: "What Palantir Sees" — CTO Shyam Sankar explains what Palantir actually does, the tech-military relationship, AI in warfare, and the ethics of defense technology.',
    frequency:   'Single episode',
    focus:       'Ethics & Context',
    embed:       false,
    color:       'amber',
    highlight:   'Shyam Sankar on ethics & defense — Oct 2025',
  },
]

// ─── Official Blog / Reading ───────────────────────────────────────────────────
const READING = [
  {
    icon:    '📰',
    title:   'Palantir Blog',
    url:     'https://blog.palantir.com',
    desc:    'Official long-form posts from Palantir engineers and executives. Deep technical dives, AIPCon recaps, and platform announcements.',
    label:   'blog.palantir.com',
    color:   'blue',
  },
  {
    icon:    '📖',
    title:   'Palantir Documentation',
    url:     'https://www.palantir.com/docs/foundry',
    desc:    'Complete reference docs for all Foundry apps, APIs, SDK references, and how-to guides. The authoritative source for anything technical.',
    label:   'palantir.com/docs',
    color:   'violet',
  },
  {
    icon:    '🔨',
    title:   'Build with AIP',
    url:     'https://build.palantir.com',
    desc:    'Download reference use cases, tutorials, starter packs, and sample datasets directly to your Foundry enrollment. Practical starting points for real projects.',
    label:   'build.palantir.com',
    color:   'cyan',
  },
  {
    icon:    '💬',
    title:   'Palantir Community',
    url:     'https://community.palantir.com',
    desc:    'Official developer forum. Q&A from practitioners and Palantir engineers, product feedback, early adopter access, and announcements.',
    label:   'community.palantir.com',
    color:   'emerald',
  },
  {
    icon:    '📑',
    title:   'AIPCon 8 Demo Roundup',
    url:     'https://blog.palantir.com/inside-the-aipcon-8-demos-redefining-the-future-of-enterprise-ai-a0a740fe44ce',
    desc:    'Palantir\'s official writeup of the best demos from AIPCon 8 — healthcare AI, wildfire mitigation, motorsports, and manufacturing use cases with real implementation details.',
    label:   'Palantir Blog — Oct 2025',
    color:   'orange',
  },
  {
    icon:    '🏗️',
    title:   'DevCon 2 Recap (Community)',
    url:     'https://dorians.medium.com/palantir-devcon2-recap-eae9797ee102',
    desc:    'Dorian Smiley\'s detailed recap of DevCon 2 (Feb 2025) — OSDK media uploads, Embedded Ontologies, Intelligent Object Set Watchers, push-down compute to Snowflake/BigQuery.',
    label:   'Medium — Mar 2025',
    color:   'slate',
  },
]

// ─── Platform Screenshots / Visual Content ────────────────────────────────────
const PLATFORM_VISUALS = [
  {
    title:  'Foundry Workshop',
    desc:   'Build operational dashboards and apps without front-end code.',
    src:    'https://www.palantir.com/assets/xrfr7uokpv1b/3nIY3mcSFPDCGLVNHEjFol/a29b31fbdf2d07f6a8d02697a15efa97/Workshop_dark.png',
    alt:    'Palantir Workshop application interface',
    url:    'https://www.palantir.com/docs/foundry/workshop/overview',
  },
  {
    title:  'AIP Agent Studio',
    desc:   'Design and deploy AI agents that work alongside your team.',
    src:    'https://www.palantir.com/assets/xrfr7uokpv1b/4n3FHhq7vkrZr0g7F0f8SK/b8c4df1d64c07dcca8ebb6be55bcc0ca/AIP_Agent_Studio.png',
    alt:    'Palantir AIP Agent Studio',
    url:    'https://www.palantir.com/docs/foundry/agent-studio/overview',
  },
  {
    title:  'Foundry Ontology',
    desc:   'Model your business as objects, links, and actions.',
    src:    'https://www.palantir.com/assets/xrfr7uokpv1b/5kBl4wy8qFIHlrVOPG3L1A/a0a42cd79b32e5f97e9e1c5e0dfe6eae/Ontology_dark.png',
    alt:    'Palantir Ontology Manager',
    url:    'https://www.palantir.com/docs/foundry/ontology/overview',
  },
  {
    title:  'Pipeline Builder',
    desc:   'Build data transformation pipelines with drag-and-drop or code.',
    src:    'https://www.palantir.com/assets/xrfr7uokpv1b/1g3qT4jb7JXNPF7Gi8NJZB/35c1d6ed9b76a0e0bd18ba4dee617bd3/Pipeline_Builder.png',
    alt:    'Palantir Pipeline Builder',
    url:    'https://www.palantir.com/docs/foundry/pipeline-builder/overview',
  },
]

const TYPE_BADGE: Record<string, string> = {
  'AIPCon':   'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
  'DevCon':   'bg-violet-900/40 text-violet-300 border-violet-700/50',
  'Tutorial': 'bg-green-900/40 text-green-300 border-green-700/50',
}

const PODCAST_COLORS: Record<string, { border: string; accent: string; bg: string }> = {
  green:   { border: 'border-green-700/40',   accent: 'text-green-300',   bg: 'bg-green-900/20' },
  blue:    { border: 'border-blue-700/40',    accent: 'text-blue-300',    bg: 'bg-blue-900/20' },
  violet:  { border: 'border-violet-700/40',  accent: 'text-violet-300',  bg: 'bg-violet-900/20' },
  amber:   { border: 'border-amber-700/40',   accent: 'text-amber-300',   bg: 'bg-amber-900/20' },
  slate:   { border: 'border-slate-700/40',   accent: 'text-slate-300',   bg: 'bg-slate-900/20' },
}

const READING_COLORS: Record<string, string> = {
  blue:    'border-blue-700/40 hover:border-blue-600/60',
  violet:  'border-violet-700/40 hover:border-violet-600/60',
  cyan:    'border-cyan-700/40 hover:border-cyan-600/60',
  emerald: 'border-emerald-700/40 hover:border-emerald-600/60',
  orange:  'border-orange-700/40 hover:border-orange-600/60',
  slate:   'border-slate-700/40 hover:border-slate-600/60',
}

export default function MediaPage() {
  const featuredVideo = VIDEOS.find(v => v.featured)!
  const otherVideos = VIDEOS.filter(v => !v.featured)
  const embedPodcast = PODCAST_SHOWS.find(p => p.embed)!
  const otherPodcasts = PODCAST_SHOWS.filter(p => !p.embed)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">▣</span>
          <h1 className="text-3xl font-bold text-white">Palantir Media Hub</h1>
        </div>
        <p className="text-night-300 text-sm max-w-3xl mb-5">
          Free videos, podcasts, and official talks — all Palantir-focused.
          AIPCon livestreams, developer tutorials, executive interviews, and the best third-party coverage.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '#videos', label: '🎥 Videos' },
            { href: '#podcasts', label: '🎙️ Podcasts' },
            { href: '#reading', label: '📰 Blog & Docs' },
            { href: '#screenshots', label: '🖼️ Platform Visuals' },
          ].map(l => (
            <a key={l.href} href={l.href}
              className="px-3 py-1.5 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 hover:text-white text-xs rounded-lg transition-all">
              {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── SECTION 1: Videos ─────────────────────────────── */}
      <section id="videos" className="mb-16">
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">🎥 Videos & Conference Talks</h2>
          <a href="https://www.youtube.com/@palantirtech" target="_blank" rel="noopener noreferrer"
            className="text-xs text-night-400 hover:text-white transition-colors">
            @palantirtech on YouTube ↗
          </a>
        </div>

        {/* Featured Video Embed */}
        <div className="mb-8">
          <div className="bg-night-900 border border-night-700 rounded-xl overflow-hidden">
            {/* 16:9 responsive embed */}
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${featuredVideo.id}?rel=0&modestbranding=1`}
                title={featuredVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${TYPE_BADGE[featuredVideo.type]}`}>
                  {featuredVideo.type}
                </span>
                <span className="text-[10px] text-night-500">⏱ {featuredVideo.duration}</span>
                <span className="text-[10px] text-night-500">📅 {featuredVideo.date}</span>
                {featuredVideo.tags.map(t => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 bg-night-800 border border-night-700 text-night-600 rounded">{t}</span>
                ))}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{featuredVideo.title}</h3>
              <p className="text-night-300 text-sm leading-relaxed">{featuredVideo.description}</p>
              <a href={`https://www.youtube.com/watch?v=${featuredVideo.id}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-red-400 hover:text-red-300 transition-colors">
                ▶ Watch on YouTube ↗
              </a>
            </div>
          </div>
        </div>

        {/* Other Video Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherVideos.map((video, i) => (
            <a key={i}
              href={video.channelLink || '#'}
              target="_blank" rel="noopener noreferrer"
              className="group bg-night-900 border border-night-800 hover:border-night-600 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5">
              {/* Video thumbnail placeholder */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-night-800 to-night-950 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-night-900/80 border border-night-700 flex items-center justify-center group-hover:bg-red-900/40 group-hover:border-red-700/40 transition-all">
                    <span className="text-2xl text-night-500 group-hover:text-red-400 transition-colors ml-1">▶</span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${TYPE_BADGE[video.type] || 'bg-night-800 text-night-400 border-night-700'}`}>
                    {video.type}
                  </span>
                </div>
                {/* Geometric pattern for visual interest */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-20 h-20 border border-night-400 rotate-45"></div>
                  <div className="absolute bottom-4 right-8 w-12 h-12 border border-night-400 rotate-12"></div>
                  <div className="absolute top-8 right-4 w-8 h-8 border border-night-400 -rotate-20"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] text-night-600">{video.date}</span>
                  {video.duration !== 'Various' && (
                    <span className="text-[10px] text-night-600">⏱ {video.duration}</span>
                  )}
                </div>
                <h4 className="text-white text-sm font-semibold mb-1.5 group-hover:text-red-200 transition-colors line-clamp-2">
                  {video.title}
                </h4>
                <p className="text-night-400 text-xs leading-relaxed line-clamp-3">{video.description}</p>
                <div className="mt-3 text-xs text-red-500 group-hover:text-red-400 transition-colors">
                  Watch on YouTube ↗
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: Podcasts ───────────────────────────── */}
      <section id="podcasts" className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">🎙️ Podcasts</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Featured Spotify embed */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-green-400 text-lg">♬</span>
              <span className="text-white font-semibold">{embedPodcast.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-green-900/30 text-green-400 border border-green-700/30 rounded font-mono">Spotify</span>
            </div>
            <p className="text-night-400 text-xs mb-4 leading-relaxed">{embedPodcast.description}</p>
            {/* Spotify Embed */}
            <div className="rounded-xl overflow-hidden">
              <iframe
                src={`https://open.spotify.com/embed/show/${embedPodcast.spotifyId}?utm_source=generator&theme=0`}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={embedPodcast.name}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <a href={embedPodcast.spotifyUrl!} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 hover:bg-green-800/40 border border-green-700/40 text-green-300 rounded-lg text-xs font-medium transition-all">
                ♬ Open on Spotify ↗
              </a>
            </div>
          </div>

          {/* Right: Other podcast cards */}
          <div className="space-y-3">
            {otherPodcasts.map((podcast) => {
              const c = PODCAST_COLORS[podcast.color] || PODCAST_COLORS.blue
              return (
                <div key={podcast.id} className={`rounded-xl border ${c.border} overflow-hidden`}>
                  <div className={`px-5 py-4 ${c.bg}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${c.accent}`}>{podcast.name}</span>
                          <span className="text-[9px] text-night-600">{podcast.frequency}</span>
                        </div>
                        {'highlight' in podcast && (
                          <div className={`text-[10px] font-mono ${c.accent} mb-2 opacity-80`}>
                            ↳ {podcast.highlight}
                          </div>
                        )}
                        <p className="text-night-300 text-xs leading-relaxed">{podcast.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {podcast.appleUrl && (
                        <a href={podcast.appleUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 bg-night-900/50 border border-night-700 text-night-300 hover:text-white rounded text-[10px] transition-colors">
                          🎧 Apple Podcasts ↗
                        </a>
                      )}
                      {podcast.spotifyUrl && (
                        <a href={podcast.spotifyUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 bg-night-900/50 border border-green-800/40 text-green-400 hover:text-green-300 rounded text-[10px] transition-colors">
                          ♬ Spotify ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Blog & Reading ─────────────────────── */}
      <section id="reading" className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">📰 Blog & Official Docs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {READING.map((item) => (
            <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"
              className={`group flex flex-col p-5 bg-night-900 border rounded-xl transition-all hover:-translate-y-0.5 ${READING_COLORS[item.color]}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{item.icon}</span>
                <h3 className="text-white font-semibold text-sm group-hover:text-palantir-200 transition-colors">{item.title}</h3>
              </div>
              <p className="text-night-400 text-xs leading-relaxed flex-1">{item.desc}</p>
              <div className="mt-3 text-[10px] text-night-600 font-mono group-hover:text-night-400 transition-colors">
                {item.label} ↗
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: Platform Visuals ───────────────────── */}
      <section id="screenshots" className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-2">🖼️ Platform In Action</h2>
        <p className="text-night-400 text-sm mb-6">
          Visual overview of what Palantir&apos;s main tools look like — before you have access to a live environment.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLATFORM_VISUALS.map((visual) => (
            <a key={visual.title} href={visual.url} target="_blank" rel="noopener noreferrer"
              className="group bg-night-900 border border-night-800 hover:border-night-600 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5">
              {/* Image or placeholder */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-night-800 to-night-950 flex items-center justify-center overflow-hidden">
                {/* Gradient visual placeholder with product-specific design */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-palantir-900/40 via-night-900 to-night-950"></div>
                  {/* Abstract UI mockup lines */}
                  <div className="absolute top-3 left-3 right-3 h-4 bg-night-700 rounded"></div>
                  <div className="absolute top-10 left-3 w-24 h-3 bg-night-700 rounded"></div>
                  <div className="absolute top-16 left-3 right-3 bottom-3 bg-night-800 rounded border border-night-700">
                    <div className="m-2 space-y-2">
                      <div className="h-3 bg-night-700 rounded w-3/4"></div>
                      <div className="h-3 bg-night-700 rounded w-1/2"></div>
                      <div className="h-3 bg-night-700 rounded w-2/3"></div>
                      <div className="h-8 bg-palantir-900/50 rounded mt-2 border border-palantir-800/30"></div>
                    </div>
                  </div>
                </div>
                {/* Product name overlay */}
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-2">
                    {visual.title.includes('Workshop') ? '🖥️' :
                     visual.title.includes('AIP') ? '✦' :
                     visual.title.includes('Ontology') ? '◈' :
                     visual.title.includes('Pipeline') ? '⬡' : '◎'}
                  </div>
                  <div className="text-night-200 font-semibold text-sm">{visual.title}</div>
                </div>
                {/* View docs badge */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] px-2 py-1 bg-palantir-800/80 text-palantir-300 rounded border border-palantir-700/50 font-mono">
                    View Docs ↗
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-palantir-200 transition-colors">
                  {visual.title}
                </h3>
                <p className="text-night-400 text-xs">{visual.desc}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-4 p-4 bg-night-900 border border-night-800 rounded-xl text-center">
          <p className="text-night-500 text-xs">
            Want to see the real platform? Get free access →{' '}
            <a href="https://signup.palantirfoundry.com/signup?signupPermitCode=BUILD_WITH_AIP"
              target="_blank" rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline">
              signup.palantirfoundry.com
            </a>
          </p>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────── */}
      <div className="p-6 bg-night-900 border border-night-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="https://www.youtube.com/@palantirtech" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-red-900/20 hover:bg-red-900/30 border border-red-800/40 rounded-xl transition-all group">
            <span className="text-3xl">▶</span>
            <div>
              <div className="text-white font-semibold text-sm group-hover:text-red-200 transition-colors">Palantir YouTube</div>
              <div className="text-night-500 text-xs">@palantirtech — official channel</div>
            </div>
          </a>
          <a href="https://open.spotify.com/show/2vVlRBHoBjUPgAYeASqd5z" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-green-900/20 hover:bg-green-900/30 border border-green-800/40 rounded-xl transition-all group">
            <span className="text-3xl">♬</span>
            <div>
              <div className="text-white font-semibold text-sm group-hover:text-green-200 transition-colors">Palantir Weekly</div>
              <div className="text-night-500 text-xs">Weekly news & analysis</div>
            </div>
          </a>
          <Link href="/learn"
            className="flex items-center gap-3 p-4 bg-amber-900/20 hover:bg-amber-900/30 border border-amber-800/40 rounded-xl transition-all group">
            <span className="text-3xl">▶</span>
            <div>
              <div className="text-white font-semibold text-sm group-hover:text-amber-200 transition-colors">Start Learning</div>
              <div className="text-night-500 text-xs">21 official courses → /learn</div>
            </div>
          </Link>
        </div>
      </div>

    </div>
  )
}
