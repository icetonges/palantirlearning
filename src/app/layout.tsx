import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar Placeholder */}
            <aside className="w-64 border-r bg-zinc-950 p-4 hidden md:block">
              <h2 className="text-xl font-bold mb-6 text-blue-400">Palantir Mastery</h2>
              <nav className="space-y-2">
                <div className="p-2 hover:bg-zinc-800 rounded">Dashboard</div>
                <div className="p-2 hover:bg-zinc-800 rounded">Ontology Lab</div>
                <div className="p-2 hover:bg-zinc-800 rounded">AI Agent</div>
              </nav>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}