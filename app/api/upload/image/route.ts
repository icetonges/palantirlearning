// app/api/upload/image/route.ts — Handles inline image uploads from the note editor
// The 🖼 toolbar button in app/notes/page.tsx POSTs a FormData `image` field here
// and expects back { url }, which it inserts into the note as ![alt](url).
//
// Images are stored in Vercel Blob (already provisioned via BLOB_READ_WRITE_TOKEN —
// see .env.example) rather than embedded as base64 in the note content. Storing
// full-size images as base64 inside the Postgres `content` column would bloat every
// page load and could exceed sane row sizes; Blob gives each image a small, stable,
// publicly-cacheable URL instead.
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

const MAX_SIZE = 8 * 1024 * 1024 // 8MB
const ALLOWED_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml',
])

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[upload/image] BLOB_READ_WRITE_TOKEN is not set')
    return NextResponse.json({ error: 'Image storage is not configured on the server' }, { status: 500 })
  }

  const formData = await req.formData()
  const image = formData.get('image') as File | null
  if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  if (!ALLOWED_TYPES.has(image.type)) {
    return NextResponse.json({ error: 'Unsupported image type. Use PNG, JPEG, GIF, WEBP, or SVG.' }, { status: 400 })
  }
  if (image.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image too large (max 8MB)' }, { status: 400 })
  }

  try {
    const ext = (image.name.split('.').pop() || image.type.split('/').pop() || 'png').toLowerCase()
    const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'png'
    const pathname = `notes/${crypto.randomUUID()}.${safeExt}`

    const blob = await put(pathname, image, {
      access: 'public',
      contentType: image.type,
      addRandomSuffix: false,
    })

    return NextResponse.json({ url: blob.url }, { status: 201 })
  } catch (e) {
    console.error('[upload/image] Blob upload failed:', e)
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
  }
}
