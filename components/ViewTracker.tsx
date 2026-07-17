'use client'
// components/ViewTracker.tsx — Records a page view without touching SSR/ISR.
//
// Fires once on mount via a keepalive fetch so it survives immediate
// navigation away. Deliberately decoupled from page rendering — see
// app/api/pages/view/route.ts for why.
import { useEffect } from 'react'

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch('/api/pages/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {})
  }, [slug])

  return null
}
