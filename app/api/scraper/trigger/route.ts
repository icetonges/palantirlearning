// app/api/scraper/trigger/route.ts — Manually trigger the Python scraper via GitHub Actions API
import { NextRequest, NextResponse } from 'next/server'
import { validateScraperToken } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!validateScraperToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const githubToken = process.env.GITHUB_TOKEN
  const repo        = process.env.GITHUB_REPO || 'icetonges/palantirlearning'

  if (!githubToken) {
    return NextResponse.json({ error: 'GITHUB_TOKEN not set' }, { status: 500 })
  }

  const res = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/scrape.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${githubToken}`,
        Accept:         'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  )

  if (res.status === 204) {
    return NextResponse.json({ ok: true, message: 'Scraper triggered — check GitHub Actions in ~2 min' })
  }
  const body = await res.text()
  return NextResponse.json({ error: 'GitHub API error', detail: body, status: res.status }, { status: 500 })
}
