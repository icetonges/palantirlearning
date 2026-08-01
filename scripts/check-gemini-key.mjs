#!/usr/bin/env node
// scripts/check-gemini-key.mjs
// Standalone Gemini API key health check — no npm install required (uses
// built-in fetch), and no dependency on the currently-installed SDK version.
//
// Run from the project root:
//   node scripts/check-gemini-key.mjs
//
// It will:
//   1. Load GEMINI_API_KEY from your environment, or from .env.local / .env
//      in this folder if it isn't already set.
//   2. Call the Gemini REST API's ListModels endpoint — a lightweight,
//      read-only call that's enough to confirm the key itself is valid
//      and the Generative Language API is enabled for it.
//   3. Try a tiny "say OK" generation on each model in this project's actual
//      fallback chain (see lib/gemini.ts) so you can see exactly which
//      models you currently have access to and which are failing/quota'd.

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// ── Load .env.local / .env if GEMINI_API_KEY isn't already in the environment ──
function loadEnvFile(filename) {
  const path = join(projectRoot, filename)
  if (!existsSync(path)) return
  const lines = readFileSync(path, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

if (!process.env.GEMINI_API_KEY) {
  loadEnvFile('.env.local')
  loadEnvFile('.env')
}

const apiKey = process.env.GEMINI_API_KEY

// This mirrors lib/gemini.ts's MODEL_CHAIN so the check reflects what the app actually uses.
const MODEL_CHAIN = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-2.5-pro',
]

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

function fail(msg) {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

if (!apiKey) {
  fail('GEMINI_API_KEY not found. Set it in your shell, or in .env.local / .env in the project root.')
}

console.log('Gemini API key check')
console.log('─'.repeat(50))
console.log(`Key: ${apiKey.slice(0, 6)}...${apiKey.slice(-4)} (${apiKey.length} chars)\n`)

// ── Step 1: ListModels — cheapest possible call to validate the key ────────────
console.log('Step 1: Validating key against ListModels…')
try {
  const res = await fetch(`${BASE_URL}/models?key=${apiKey}`)
  const data = await res.json()

  if (!res.ok) {
    const message = data?.error?.message || `HTTP ${res.status}`
    const status  = data?.error?.status || ''
    console.error(`  ✗ Key check failed: ${message}${status ? ` (${status})` : ''}`)
    if (res.status === 400) console.error('    → The key looks malformed or is not a valid Gemini API key.')
    if (res.status === 403) console.error('    → The key is valid but lacks permission — check that the Generative Language API is enabled for this key\'s project.')
    process.exit(1)
  }

  const modelCount = data.models?.length ?? 0
  console.log(`  ✓ Key is valid — ${modelCount} models visible to this key.\n`)
} catch (err) {
  fail(`Network error calling Gemini API: ${err instanceof Error ? err.message : String(err)}`)
}

// ── Step 2: try each model in the app's actual fallback chain ──────────────────
console.log('Step 2: Testing generation on each model in the app\'s fallback chain…')
let anySucceeded = false

for (const model of MODEL_CHAIN) {
  process.stdout.write(`  ${model.padEnd(24)} `)
  try {
    const res = await fetch(`${BASE_URL}/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Reply with just the word OK.' }] }],
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      const message = data?.error?.message || `HTTP ${res.status}`
      console.log(`✗ ${message}`)
      continue
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (text) {
      console.log(`✓ responded: "${text}"`)
      anySucceeded = true
    } else {
      console.log(`✗ no text returned (possibly blocked) — ${JSON.stringify(data).slice(0, 150)}`)
    }
  } catch (err) {
    console.log(`✗ ${err instanceof Error ? err.message : String(err)}`)
  }
}

console.log('\n' + '─'.repeat(50))
if (anySucceeded) {
  console.log('✓ Key is working — at least one model in the fallback chain responded successfully.')
} else {
  console.log('✗ Key validated via ListModels, but every model in the fallback chain failed.')
  console.log('  This usually means: free-tier quota exhausted, billing not enabled, or these')
  console.log('  specific model names are unavailable for this key\'s project/region.')
  process.exit(1)
}
