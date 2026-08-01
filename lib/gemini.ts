// lib/gemini.ts
// Primary: Gemini (Google AI Studio). Fallback: Groq (free, fast).
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

// Updated 2026-08 — gemini-2.0-flash was shut down (Google zeroes its free-tier
// quota rather than erroring outright, which surfaces as a misleading "quota
// exceeded" 429) and gemini-1.5-flash / gemini-1.5-flash-8b have been fully
// retired from the v1beta API ("model not found"). Confirmed current/stable
// models via https://ai.google.dev/gemini-api/docs/models.
const MODEL_CHAIN = [
  'gemini-2.5-flash-lite',  // primary — cheapest/highest free-tier RPD, keep first
  'gemini-2.5-flash',       // standard flash tier
  'gemini-3.5-flash-lite',  // Gemini 3 flash-lite fallback
  'gemini-3.6-flash',       // Gemini 3 flash fallback
  'gemini-2.5-pro',         // pro-tier reasoning, last resort (tightest free-tier RPM)
]

const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
]

// ─── Groq (primary for speed) ─────────────────────────────────────────────────
// Free tier: 14,400 req/day. Sub-2s responses vs Gemini's 10s+
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
]

async function groqCall(prompt: string): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      })
      if (!res.ok) throw new Error(`Groq HTTP ${res.status}`)
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content?.trim() ?? ''
      if (text) {
        console.log(`[Groq] Success: ${model}`)
        return { text, model: `groq/${model}` }
      }
    } catch (err) {
      console.error(`[Groq] ${model} failed:`, err instanceof Error ? err.message : String(err))
      continue
    }
  }
  throw new Error('Groq fallback also failed.')
}

// ─── Core: Gemini first, Groq if all Gemini models fail ───────────────────────
export async function gemini(
  prompt: string,
  systemInstruction?: string,
): Promise<{ text: string; model: string }> {
  // Try all Gemini models first
  for (const modelName of MODEL_CHAIN) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          safetySettings: SAFETY,
          ...(systemInstruction ? { systemInstruction } : {}),
        },
      })
      const text = response.text?.trim() ?? ''
      if (text) {
        console.log(`[Gemini] Success: ${modelName}`)
        return { text, model: modelName }
      }
    } catch (err) {
      console.error(`[Gemini] ${modelName} failed:`, err instanceof Error ? err.message : String(err))
      continue
    }
  }

  // All Gemini models failed — try Groq
  console.warn('[Gemini] All models failed, trying Groq fallback...')
  return groqCall(prompt)
}

// ─── JSON helper ─────────────────────────────────────────────────────────────
export async function geminiJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
  const { text } = await gemini(prompt, systemInstruction)
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  return JSON.parse(cleaned) as T
}

// ─── Prompt templates ────────────────────────────────────────────────────────

export async function summarizeNote(content: string, category: string) {
  return geminiJSON<{ summary: string; tags: string[]; subCategory: string }>(
    `Summarize this Palantir ${category} note. Return ONLY valid JSON, no markdown fences.
{
  "summary": "2-3 sentence technical summary",
  "tags": ["tag1", "tag2", "tag3"],
  "subCategory": "most specific sub-topic"
}
Content:
${content.slice(0, 4000)}`,
    'You are an expert in Palantir Foundry, Ontology, AIP, and Apollo. Return only valid JSON.'
  )
}

export async function generateFlashcards(content: string, category: string, count = 8) {
  return geminiJSON<Array<{ question: string; answer: string; difficulty: string }>>(
    `Generate ${count} flashcards for studying Palantir ${category}. Return ONLY a JSON array, no markdown.
[{ "question": "...", "answer": "...", "difficulty": "EASY|MEDIUM|HARD" }]
Content:
${content.slice(0, 6000)}`,
    'You are an expert Palantir instructor. Return only a JSON array.'
  )
}

export async function generateQuiz(content: string, category: string, count = 10) {
  return geminiJSON<Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>>(
    `Generate ${count} multiple-choice quiz questions about Palantir ${category}. Return ONLY a JSON array, no markdown.
[{ "question": "...", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "..." }]
Content:
${content.slice(0, 6000)}`,
    'You are an expert Palantir instructor. Return only a JSON array.'
  )
}

// Sources excluded from executive briefing — too technical/community-focused
const EXCLUDED_SOURCES = [
  'palantir community',
  'palantir github',
  'github',
  'hacker news',
  'reddit',
  'r/palantir',
  'youtube',
]

function isExecSource(source: string): boolean {
  const s = source.toLowerCase()
  return !EXCLUDED_SOURCES.some(ex => s.includes(ex))
}

export async function generateDailySummary(
  items: Array<{ title: string; summary: string; source: string; tags: string[] }>
) {
  // Filter to executive-relevant sources only
  const execItems = items.filter(i => isExecSource(i.source))

  // Prioritise high-signal tags: contracts, earnings, partnerships, product releases
  const priority = ['CONTRACT', 'EARNINGS', 'PARTNERSHIP', 'RELEASE', 'AIP', 'APOLLO', 'FOUNDRY', 'ONTOLOGY', 'CRITICISM', 'GENERAL']
  const sorted = [...execItems].sort((a, b) => {
    const aScore = Math.min(...a.tags.map(t => priority.indexOf(t)).filter(i => i >= 0))
    const bScore = Math.min(...b.tags.map(t => priority.indexOf(t)).filter(i => i >= 0))
    return (aScore === Infinity ? 99 : aScore) - (bScore === Infinity ? 99 : bScore)
  })

  const itemsText = sorted.slice(0, 30)
    .map(i => `- [${i.tags.join(', ')}] ${i.title} (${i.source}): ${i.summary}`)
    .join('\n')

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const { text } = await gemini(
    `Today is ${todayStr}. Write a sharp executive intelligence briefing on Palantir Technologies.
Title: "Daily Palantir Intelligence Briefing — ${todayStr}"

Structure with these markdown sections (## headers), only include a section if there is relevant news:
## Key Development
The single most significant story — what happened and why it matters strategically.

## Contracts & Government
New contract awards, government partnerships, defense deployments.

## Product & Platform Updates
New features, releases, or technical announcements across Foundry, AIP, Ontology, Apollo.

## Market & Business
Earnings signals, investor news, partnerships, analyst commentary.

## Strategic Implications
2-3 bullet points: what this week's news means for enterprise customers and developers.

Rules:
- Executive tone — concise, analytical, no fluff
- Focus on business impact and strategic significance
- Do NOT reference community forums, GitHub repos, Reddit, or YouTube
- Do NOT fabricate dates — today is ${todayStr}
- If a section has no news, omit it entirely

News items:
${itemsText}`,
    'You are a senior analyst at a Palantir-focused research firm writing a daily C-suite intelligence brief. Be sharp, specific, and analytical.'
  )
  return text
}

export async function summarizeNewsItem(title: string, summary: string) {
  const { text } = await gemini(
    `Write a 1-2 sentence technical summary of this Palantir news item for a developer audience.
Title: ${title}
Summary: ${summary}`,
    'You are a Palantir technical analyst. Be concise and precise.'
  )
  return text
}

export async function classifyNewsTags(title: string, summary: string) {
  return geminiJSON<string[]>(
    `Classify this Palantir news item into 1-3 tags. Return ONLY a JSON array.
Valid tags: FOUNDRY, ONTOLOGY, AIP, APOLLO, CONTRACT, EARNINGS, PARTNERSHIP, CRITICISM, RELEASE, GENERAL
Title: ${title}
Summary: ${summary}
Example return: ["AIP", "RELEASE"]`,
    'Return only a JSON array of tag strings, no markdown.'
  )
}

export async function agentChat(
  userMessage: string,
  context: { recentNews?: string; recentPages?: string }
) {
  const contextBlock = [
    context.recentPages ? `## Knowledge Base:\n${context.recentPages}` : '',
    context.recentNews  ? `## Recent News:\n${context.recentNews}` : '',
  ].filter(Boolean).join('\n\n')

  const { text } = await gemini(
    `${contextBlock ? `Context:\n${contextBlock}\n\n` : ''}User question: ${userMessage}`,
    `You are an expert Palantir platform assistant for PalantirLearning.vercel.app.
You have deep knowledge of Palantir Foundry, Ontology, AIP (AI Platform), and Apollo.
Be concise, technical, and accurate. Use markdown for code and structured answers.`
  )
  return text
}

export async function processDocument(extractedText: string, filename: string) {
  return geminiJSON<{
    title: string
    category: 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL'
    summary: string
    tags: string[]
    subCategory: string
  }>(
    `Analyze this document. Return ONLY valid JSON, no markdown fences.
{
  "title": "descriptive title from content",
  "category": "FOUNDRY|ONTOLOGY|AIP|APOLLO|GENERAL",
  "summary": "2-3 sentence technical summary",
  "tags": ["tag1", "tag2"],
  "subCategory": "specific sub-topic"
}
Filename: ${filename}
Content:
${extractedText.slice(0, 5000)}`,
    'You are an expert in Palantir technology. Return only valid JSON.'
  )
}

// ─── Daily Learning Topic ─────────────────────────────────────────────────────
// The model chooses the day's topic itself (not a fixed lookup table), steered
// away from whatever has run recently so the series keeps expanding across the
// full Palantir surface area instead of looping a short pre-built list.
const TOPIC_DOMAINS = 'FOUNDRY, ONTOLOGY, AIP, APOLLO'
const TOPIC_SURFACE = `FOUNDRY (Pipeline Builder, Code Repositories, Code Workspaces, Contour, Workshop, Slate, Object Explorer, Automate, Data Lineage, Data Health, Magritte connectors, Foundry ML, branching/versioning, access control & markings), ONTOLOGY (Object Types, Link Types, Actions, Functions, Time Series & Media Sets, Object Set aggregations, the Ontology SDK), AIP (AIP Logic, AIP Agent Studio, AIP Assist, evaluations/guardrails, prompt & context design, model configuration), APOLLO (release orchestration, fleet management, multi-environment/air-gapped deployments, managed upgrades)`

async function pickDailyTopic(history: string[]): Promise<{ domain: string; subject: string; topic: string }> {
  const prompt = `You curate a daily technical learning series on the Palantir platform, covering: ${TOPIC_SURFACE}.

Topics already covered recently — do NOT repeat these or anything nearly identical:
${history.length ? history.map(h => `- ${h}`).join('\n') : '(none yet — this is the first entry)'}

Choose ONE new, specific, technically substantive topic not covered above. Vary which of ${TOPIC_DOMAINS} you pick day to day rather than always the same one. Favor concrete features, APIs, or workflows over generic overviews.

Return ONLY valid JSON, no markdown fences:
{"domain": "FOUNDRY|ONTOLOGY|AIP|APOLLO", "subject": "short subject label, 2-4 words", "topic": "specific topic title, under 8 words"}`

  return geminiJSON<{ domain: string; subject: string; topic: string }>(
    prompt,
    'You are an expert Palantir curriculum designer. Return only valid JSON.'
  )
}

export async function generateDailyTopic(history: string[] = []): Promise<{
  title: string; domain: string; subject: string; body: string
}> {
  const { domain, subject, topic } = await pickDailyTopic(history)

  const prompt = `You are a senior Palantir engineer writing a focused daily learning brief.

Topic: ${topic} (${domain} → ${subject})

Write ~400 words with these exact markdown headers:

## Subject: ${domain} — ${subject}

One sentence: what ${subject} is in the Palantir stack and why it matters.

## How It Connects

2–3 sentences on how ${subject} relates to 2 other Palantir products.

## Today's Focus: ${topic}

3–4 paragraphs:
1. The core mental model
2. A practical pattern or real API detail
3. The most common mistake and how to avoid it
4. What mastering this unlocks

Be technical, specific, direct. Real product names and API patterns only.`

  const { text } = await gemini(prompt)
  return { title: topic, domain, subject, body: text }
}

// ─── Palantir 101 Daily Rotation ──────────────────────────────────────────────
// Same idea: the model invents today's framing/angle itself, informed by what
// it's already written recently, instead of cycling a fixed list of angles.
async function pickPalantir101Angle(history: string[]): Promise<string> {
  const prompt = `You write a daily "Palantir 101" overview for developers learning the Palantir stack (Foundry, Ontology, AIP, Apollo).

Opening angles/framings already used recently — do NOT repeat these or anything nearly identical:
${history.length ? history.map((h, i) => `${i + 1}. ${h}`).join('\n') : '(none yet — this is the first entry)'}

Write ONE new, specific framing (a single sentence, no preamble) for today's overview — a fresh way to explain how the Palantir stack fits together or how to learn it, distinct from everything above. Return only that sentence, no quotes, no markdown.`

  const { text } = await gemini(prompt)
  return text.trim().replace(/^["']|["']$/g, '')
}

export async function generatePalantir101(history: string[] = []): Promise<string> {
  const angle = await pickPalantir101Angle(history)

  const prompt = `You are a Palantir expert writing a daily overview for developers learning the stack.

Today's angle: ${angle}

Write ~400 words with these exact markdown headers:

## The Palantir Stack

2 paragraphs: crisp overview of Foundry, Ontology, AIP, and Apollo and how they connect. Frame it around: ${angle}.

## The Best Way to Learn

2–3 paragraphs:
- What to start with and exactly why (not generic advice)
- Which resources to use (learn.palantir.com, build.palantir.com, palantir.com/docs)
- A concrete weekly study plan a developer could actually follow
- The single insight that separates people who truly get Palantir from those who just read docs

Be opinionated, specific, direct. Real resource URLs only.`

  const { text } = await gemini(prompt)
  return text
}
