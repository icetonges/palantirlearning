// components/Footer.tsx
import Link from 'next/link'
import { NAV_ITEMS } from '@/lib/navigation'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-night-800 bg-night-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-palantir-400 text-lg font-mono">◎</span>
              <span className="text-white font-bold">PalantirLearning</span>
            </div>
            <p className="text-night-400 text-sm leading-relaxed">
              A self-evolving knowledge platform for mastering Palantir Foundry, Ontology, AIP, and Apollo.
            </p>
            <p className="text-night-500 text-xs mt-3 font-mono">
              palantirlearning.vercel.app
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-night-200 font-semibold text-sm mb-3">Platform</h4>
            <div className="grid grid-cols-2 gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 text-night-400 hover:text-palantir-300 text-sm transition-colors py-0.5"
                >
                  <span className="text-xs">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div>
            <h4 className="text-night-200 font-semibold text-sm mb-3">Built With</h4>
            <div className="flex flex-wrap gap-2">
              {['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Neon PostgreSQL', 'Prisma', 'Gemini 2.5', 'GitHub Actions', 'Python 3.12', 'Vercel'].map((tech) => (
                <span key={tech} className="text-xs px-2 py-1 bg-night-800 text-night-300 rounded font-mono">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-night-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-night-500 text-xs">© {new Date().getFullYear()} PalantirLearning. Personal knowledge platform.</p>
          <p className="text-night-600 text-xs font-mono">Not affiliated with Palantir Technologies Inc.</p>
        </div>
      </div>
    </footer>
  )
}
