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
