// lib/gemini.ts
// Uses @google/genai SDK with gemini-2.5-flash (confirmed working)
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
]

// ─── Core: run with model fallback ───────────────────────────────────────────
export async function gemini(
  prompt: string,
  systemInstruction?: string,
): Promise<{ text: string; model: string }> {
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
  throw new Error('Gemini API unavailable after all fallbacks.')
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

export async function generateDailySummary(
  items: Array<{ title: string; summary: string; source: string; tags: string[] }>
) {
  const itemsText = items
    .map((i) => `- [${i.tags.join(', ')}] ${i.title} (${i.source}): ${i.summary}`)
    .join('\n')
  const { text } = await gemini(
    `Create a concise executive intelligence briefing from these Palantir news items.
Use markdown headers. Lead with the most significant developments.
Be analytical — note implications for developers and enterprise users.

News items:
${itemsText}`,
    'You are a senior Palantir market analyst writing a daily technical intelligence briefing.'
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
const TOPIC_POOL = [
  { domain: 'FOUNDRY',  subject: 'Transforms',                 topic: 'Incremental Transforms in PySpark' },
  { domain: 'FOUNDRY',  subject: 'Data Connection & Ingestion', topic: 'Raw Data Sources and Magritte connectors' },
  { domain: 'FOUNDRY',  subject: 'Workshop Apps',              topic: 'Building operational apps in Workshop' },
  { domain: 'FOUNDRY',  subject: 'Contour Analytics',          topic: 'Cohort analysis and aggregations in Contour' },
  { domain: 'FOUNDRY',  subject: 'Foundry ML',                 topic: 'Model training and deployment in Foundry ML' },
  { domain: 'FOUNDRY',  subject: 'Security & Markings',        topic: 'Data markings, labels, and access control' },
  { domain: 'FOUNDRY',  subject: 'Datasets & Branches',        topic: 'Branch-based data lineage and versioning' },
  { domain: 'FOUNDRY',  subject: 'OSDK in Foundry',            topic: 'Ontology SDK — TypeScript and Python clients' },
  { domain: 'ONTOLOGY', subject: 'Object Types',               topic: 'Designing Object Types and property schemas' },
  { domain: 'ONTOLOGY', subject: 'Link Types',                 topic: 'Many-to-many link types and relationship modeling' },
  { domain: 'ONTOLOGY', subject: 'Actions & Rules',            topic: 'Writing Actions to mutate ontology state' },
  { domain: 'ONTOLOGY', subject: 'Time Series',                topic: 'Time series properties and temporal queries' },
  { domain: 'ONTOLOGY', subject: 'Aggregations',               topic: 'Object Set aggregations and rollups' },
  { domain: 'AIP',      subject: 'AIP Logic',                  topic: 'Building deterministic AIP Logic pipelines' },
  { domain: 'AIP',      subject: 'AIP Studio',                 topic: 'Designing agents in AIP Agent Studio' },
  { domain: 'AIP',      subject: 'Prompt Engineering',         topic: 'Prompt patterns for reliable LLM outputs' },
  { domain: 'AIP',      subject: 'LLM Configuration',          topic: 'Model selection, temperature, and context length' },
  { domain: 'AIP',      subject: 'Security & Governance',      topic: 'AIP guardrails, audit logs, and data classification' },
  { domain: 'APOLLO',   subject: 'Software Distribution',      topic: 'Continuous delivery of services via Apollo' },
  { domain: 'APOLLO',   subject: 'Fleet Management',           topic: 'Multi-environment fleet topology in Apollo' },
  { domain: 'APOLLO',   subject: 'Air-Gapped Deployments',     topic: 'Offline and classified network deployments' },
]

export interface TopicVisuals {
  processSteps: Array<{ step: number; title: string; desc: string }>
  connections:  Array<{ from: string; to: string; label: string }>
  codeSnippet:  string
  keyTags:      string[]
}

export interface P101Visuals {
  dataFlow:     Array<{ stage: string; detail: string }>
  learningPath: Array<{ week: string; focus: string; action: string }>
  insight:      string
  stackSummary: Array<{ name: string; icon: string; color: string; role: string }>
}

// Step 1: generate prose (reliable)
async function generateTopicProse(domain: string, subject: string, topic: string): Promise<string> {
  const prompt = `You are a senior Palantir engineer writing a daily learning brief.

Topic: ${topic} (${domain} → ${subject})

Write ~350 words with these exact headers:

## What is ${subject}?
One clear sentence defining ${subject} in the Palantir stack and why it matters.

## How It Connects
2–3 sentences: how ${subject} flows into or depends on 2 other Palantir products.

## Today's Focus: ${topic}
3 focused paragraphs:
1. The core mental model — what is the key concept?
2. A practical pattern or real API detail engineers use
3. The most common mistake and how to avoid it

Be technical, specific, direct. Real product names and API patterns only.`
  const { text } = await gemini(prompt)
  return text
}

// Step 2: generate visual metadata separately (small, fast, optional)
async function generateTopicVisuals(domain: string, subject: string, topic: string, prose: string): Promise<TopicVisuals | null> {
  const prompt = `Based on this Palantir topic: "${topic}" (${domain}/${subject})

Return ONLY valid JSON, no markdown fences, no explanation:
{"processSteps":[{"step":1,"title":"2-3 word name","desc":"max 10 words"},{"step":2,"title":"2-3 word name","desc":"max 10 words"},{"step":3,"title":"2-3 word name","desc":"max 10 words"},{"step":4,"title":"2-3 word name","desc":"max 10 words"}],"connections":[{"from":"ComponentA","to":"ComponentB","label":"feeds"},{"from":"ComponentB","to":"ComponentC","label":"exposes"},{"from":"ComponentC","to":"ComponentD","label":"triggers"}],"codeSnippet":"5-7 line Python or TypeScript example using real Palantir APIs for ${topic}","keyTags":["tag1","tag2","tag3","tag4"]}`
  try {
    return await geminiJSON<TopicVisuals>(prompt)
  } catch {
    return null
  }
}

export async function generateDailyTopic(seed: number): Promise<{
  title: string; domain: string; subject: string; body: string
}> {
  const entry  = TOPIC_POOL[seed % TOPIC_POOL.length]
  const { domain, subject, topic } = entry

  // Prose always generated first — it's the primary content
  const prose  = await generateTopicProse(domain, subject, topic)
  // Visuals generated separately — if this fails, prose still shows
  const visuals = await generateTopicVisuals(domain, subject, topic, prose)

  return {
    title:   topic,
    domain,
    subject,
    body:    JSON.stringify({ prose, visuals }),
  }
}

// ─── Palantir 101 Daily Rotation ──────────────────────────────────────────────
const PALANTIR_101_ANGLES = [
  'the Ontology as the semantic layer that unifies all Palantir products',
  'how Foundry Transforms create a governed, versioned data pipeline',
  'AIP and how it wraps LLMs inside Palantir's governance model',
  'Apollo as the DevOps backbone for multi-cloud and air-gapped deployments',
  'the OSDK and how it lets external apps consume Ontology objects',
  'the data flow: Raw → Bronze → Silver → Gold layers in Foundry',
  'how Workshop and Slate turn Ontology data into operational applications',
  'the role of markings and data classification across the Palantir stack',
  'how AIPCon and DevCon demonstrate real-world enterprise deployments',
  'the learning path: Foundry first, then Ontology, then AIP, then Apollo',
]

async function generateP101Prose(angle: string): Promise<string> {
  const prompt = `You are a Palantir expert writing a daily overview for developers learning the stack.

Today's angle: ${angle}

Write ~350 words with these exact headers:

## The Palantir Stack
2 paragraphs: crisp overview of Foundry, Ontology, AIP, Apollo and how they connect. Frame it around: ${angle}.

## The Best Way to Learn
2–3 paragraphs: the most effective learning strategy.
- What to start with and exactly why
- Which resources to use (learn.palantir.com, build.palantir.com, palantir.com/docs)
- One weekly study plan a developer could actually follow
- The single insight that separates people who "get" Palantir from those who just read docs

Be opinionated, specific, direct.`
  const { text } = await gemini(prompt)
  return text
}

async function generateP101Visuals(angle: string): Promise<P101Visuals | null> {
  const prompt = `For a Palantir 101 overview about "${angle}":

Return ONLY valid JSON, no markdown fences:
{"dataFlow":[{"stage":"Raw","detail":"S3, DBs, APIs"},{"stage":"Bronze","detail":"Cleaned, typed"},{"stage":"Silver","detail":"Joined, enriched"},{"stage":"Gold","detail":"Ontology objects"}],"learningPath":[{"week":"Wk 1-2","focus":"Foundry Core","action":"Build 2 transforms on Learn.Palantir"},{"week":"Wk 3-4","focus":"Ontology","action":"Model 3 object types with link types"},{"week":"Wk 5-6","focus":"AIP + OSDK","action":"Wire one AIP Logic pipeline to Ontology"}],"insight":"One sharp sentence: the insight that separates engineers who get Palantir from those who just memorize docs. Max 20 words.","stackSummary":[{"name":"Foundry","icon":"⬡","color":"blue","role":"Data pipeline + app platform"},{"name":"Ontology","icon":"◈","color":"violet","role":"Semantic object layer"},{"name":"AIP","icon":"✦","color":"cyan","role":"Governed AI on your data"},{"name":"Apollo","icon":"◎","color":"emerald","role":"Deployment + fleet management"}]}`
  try {
    return await geminiJSON<P101Visuals>(prompt)
  } catch {
    return null
  }
}

export async function generatePalantir101(seed: number): Promise<string> {
  const angle  = PALANTIR_101_ANGLES[seed % PALANTIR_101_ANGLES.length]
  const prose  = await generateP101Prose(angle)
  const visuals = await generateP101Visuals(angle)
  return JSON.stringify({ prose, visuals })
}
