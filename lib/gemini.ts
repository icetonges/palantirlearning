// lib/gemini.ts
// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI client with 4-model fallback chain (same pattern as mything)
// Includes all prompt templates for the platform's AI features.
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// 4-model fallback chain — most capable first
const MODEL_CHAIN = [
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
]

interface GeminiResponse {
  text: string
  model: string
}

// ─── Core: run with fallback ──────────────────────────────────────────────────
export async function gemini(
  prompt: string,
  systemInstruction?: string,
  retries = 2
): Promise<GeminiResponse> {
  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const model: GenerativeModel = genAI.getGenerativeModel({
          model: modelName,
          ...(systemInstruction ? { systemInstruction } : {}),
        })

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        if (!text) continue

        return { text, model: modelName }
      } catch (err: unknown) {
        const isLastModel = modelName === MODEL_CHAIN[MODEL_CHAIN.length - 1]
        const isLastAttempt = attempt === retries
        if (isLastAttempt && isLastModel) {
          console.error(`[Gemini] All models failed. Last error:`, err)
          throw new Error('Gemini API unavailable after all fallbacks')
        }
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }
  throw new Error('Gemini fallback chain exhausted')
}

// ─── JSON helper (strips markdown fences, parses safely) ─────────────────────
export async function geminiJSON<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const { text } = await gemini(prompt, systemInstruction)
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim()
  return JSON.parse(cleaned) as T
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

/** Summarize a knowledge note/page into a 2–3 sentence excerpt + 5 tags */
export async function summarizeNote(content: string, category: string) {
  const system = `You are a Palantir platform expert and technical writer.
Your job is to analyze Palantir-related documentation, notes, and technical content.
Always respond with valid JSON only — no markdown, no preamble.`

  const prompt = `Analyze this ${category} knowledge content and return JSON with:
- "summary": A concise 2-3 sentence technical summary (max 300 chars)
- "tags": Array of exactly 5 specific technical tags (lowercase, hyphen-separated)
- "subCategory": The most specific sub-topic from the content (e.g., "PySpark Transforms", "AIP Logic", "Object Types")

Content:
${content.slice(0, 4000)}`

  return geminiJSON<{ summary: string; tags: string[]; subCategory: string }>(prompt, system)
}

/** Generate flashcards from a knowledge page */
export async function generateFlashcards(
  content: string,
  category: string,
  count: number = 8
): Promise<{ question: string; answer: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD' }[]> {
  const system = `You are a Palantir expert and educator specializing in creating study materials.
Generate high-quality technical flashcards for ${category}.
Respond with valid JSON array only. No markdown. No preamble.`

  const prompt = `Generate exactly ${count} flashcards from this ${category} content.
Return a JSON array of objects with:
- "question": Clear, specific question about Palantir ${category} concepts
- "answer": Comprehensive answer with specific technical details, code snippets if relevant
- "difficulty": One of "EASY", "MEDIUM", or "HARD"

Make questions specific to Palantir — not generic programming questions.
Mix conceptual, procedural, and applied questions.

Content:
${content.slice(0, 6000)}`

  return geminiJSON(prompt, system)
}

/** Generate quiz questions from category pages */
export async function generateQuiz(
  contextPages: string,
  category: string,
  count: number = 10
): Promise<{
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}[]> {
  const system = `You are a Palantir certification exam writer.
Create rigorous multiple-choice questions specific to Palantir technology.
Respond with valid JSON array only.`

  const prompt = `Generate ${count} multiple-choice quiz questions about Palantir ${category}.
Return JSON array where each item has:
- "question": The question text
- "options": Array of exactly 4 answer choices (A, B, C, D content only)
- "correctIndex": 0-based index of the correct answer (0=A, 1=B, 2=C, 3=D)
- "explanation": Why the correct answer is right (1-2 sentences)

Questions should be practical and based on the actual documentation below.
Avoid trick questions. Test real understanding.

Reference documentation:
${contextPages.slice(0, 8000)}`

  return geminiJSON(prompt, system)
}

/** Generate daily executive summary from scraped news items */
export async function generateDailySummary(
  newsItems: { title: string; summary: string; source: string; tags: string[] }[]
): Promise<string> {
  const system = `You are a senior Palantir technology analyst producing executive intelligence briefings.
Your audience: Palantir platform engineers and decision-makers who need concise, actionable intelligence.
Write in a professional analyst tone. Use markdown formatting.`

  const newsText = newsItems
    .map((n) => `[${n.source}] ${n.title}: ${n.summary}`)
    .join('\n\n')

  const prompt = `Produce a comprehensive executive intelligence briefing from today's ${newsItems.length} Palantir news items.

Structure your response in markdown with these sections:
# Daily Palantir Intelligence Briefing — ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## 🔑 Key Development
(Most significant single development today — 2-3 sentences)

## 📦 Product & Platform Updates
(Foundry, Ontology, AIP, Apollo updates — bullet points)

## 💼 Business & Contracts
(Contract awards, partnerships, financial news — bullet points)

## ⚠️ Technical Criticism & User Feedback
(Honest coverage of technical challenges, user complaints, competitive weaknesses — important for learning)

## 📈 Market & Competitive Intelligence
(PLTR stock, analyst commentary, competitive landscape)

## 🧠 Analyst Takeaway
(Your 2-3 sentence synthesis: what matters most for a Palantir practitioner today)

News items:
${newsText}`

  const { text } = await gemini(prompt, system)
  return text
}

/** Summarize a single news item in 2 sentences */
export async function summarizeNewsItem(
  title: string,
  content: string
): Promise<string> {
  const { text } = await gemini(
    `Summarize this Palantir-related news in exactly 2 concise sentences for a technical practitioner:

Title: ${title}
Content: ${content.slice(0, 2000)}

Return only the 2-sentence summary. No preamble.`
  )
  return text
}

/** Classify news item tags */
export async function classifyNewsTags(
  title: string,
  summary: string
): Promise<string[]> {
  const validTags = ['FOUNDRY', 'ONTOLOGY', 'AIP', 'APOLLO', 'CONTRACT', 'EARNINGS', 'PARTNERSHIP', 'CRITICISM', 'RELEASE', 'GENERAL']

  const tags = await geminiJSON<string[]>(
    `Classify this Palantir news item with 1-3 tags from: ${validTags.join(', ')}

Title: ${title}
Summary: ${summary}

Return a JSON array of applicable tags only. Example: ["AIP", "RELEASE"]`
  )

  return tags.filter((t) => validTags.includes(t))
}

/** AI chat for the home page agentic assistant */
export async function agentChat(
  userMessage: string,
  context: { recentNews?: string; recentPages?: string }
): Promise<string> {
  const system = `You are an expert Palantir platform assistant for PalantirLearning.vercel.app.
You have deep knowledge of Palantir Foundry, Ontology, AIP (AI Platform), and Apollo.
You help the user learn, study, and stay current on Palantir technology.
You have access to recent news and the user's knowledge base.
Be concise, technical, and accurate. Use markdown for code and structured answers.`

  const contextBlock = [
    context.recentPages ? `## User's Recent Knowledge Pages:\n${context.recentPages}` : '',
    context.recentNews ? `## Recent Palantir News:\n${context.recentNews}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const { text } = await gemini(
    `${contextBlock ? `Context:\n${contextBlock}\n\n` : ''}User question: ${userMessage}`,
    system
  )
  return text
}

/** Process an uploaded document — infer title, category, summary, tags */
export async function processDocument(
  extractedText: string,
  filename: string
): Promise<{
  title: string
  category: 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL'
  summary: string
  tags: string[]
  subCategory: string
}> {
  const system = `You are a Palantir documentation specialist.
Analyze documents and classify them into Palantir knowledge categories.
Respond with valid JSON only.`

  return geminiJSON(
    `Analyze this document and return JSON with:
- "title": A clear, specific title for this knowledge page (max 80 chars)
- "category": One of: FOUNDRY, ONTOLOGY, AIP, APOLLO, GENERAL
- "summary": 2-3 sentence technical summary
- "tags": Array of 5 specific technical tags
- "subCategory": Most specific sub-topic (e.g., "PySpark Transforms", "AIP Logic Functions")

Filename: ${filename}
Content (first 5000 chars):
${extractedText.slice(0, 5000)}`,
    system
  )
}
