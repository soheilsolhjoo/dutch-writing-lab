export interface GenerationResult {
  text: string; // The tagged text
  rawText: string; // Clean text for download
  farsiTranslation: string[]; // Array of paragraph translations
  vocabulary: { word: string; farsi: string; context: string }[];
  dismantledText: string;
}

export interface AuditResult {
  sentences: { original: string; corrected: string; explanation: string; isModified: boolean }[];
  cleanText: string;
}

const buildPhase1Prompt = (
  level: string,
  topic: string,
  instructions: string,
  paragraphCount: string = "5",
  wordCount: string = "100-250"
) => `You are an expert Dutch language instructor.
Generate a Dutch text suitable for a CEFR ${level} learner.

Topic: ${topic}
Additional Instructions: ${instructions}

Constraints:
- You MUST write exactly ${paragraphCount} paragraphs, unless the specific instructions strongly dictate a shorter format. Do not default to 3 paragraphs.
- Strictly between ${wordCount} words total.
- Format like a standard essay (e.g., TOEFL-style).
- Use natural phrasing, appropriate connectors, and idioms for a ${level} level.

TAGGING REQUIREMENT:
In the "text" field, you must wrap specific parts of speech with XML-like tags to allow for UI highlighting:
1. Wrap all conjunctions and transition words in <c>...</c> tags.
2. Wrap all finite verbs, infinitives, and participles in <v>...</v> tags.
3. Wrap CEFR-appropriate idioms or fixed expressions in <i>...</i> tags.
Example: "Dit <v>is</v> een test, <c>hoewel</c> het <i>niet veel voorstelt</i>."

You must output a JSON object with EXACTLY the following structure. No markdown formatting outside the JSON, just the raw JSON object:
{
  "text": "The full Dutch essay WITH the <c>, <v>, and <i> tags included. Use double newlines for paragraphs.",
  "rawText": "The exact same full Dutch essay, but WITHOUT any of the tags (clean text).",
  "farsiTranslation": [
    "Translation of paragraph 1 in Farsi.",
    "Translation of paragraph 2 in Farsi.",
    "..."
  ],
  "vocabulary": [
    {
      "word": "Dutch word/idiom",
      "farsi": "Farsi translation",
      "context": "The sentence from the essay where this word is used"
    }
  ],
  "dismantledText": "A version of the essay where key nouns, verbs, and connectors are replaced by their Farsi translations enclosed in brackets, e.g., 'De [دولت] heeft besloten om...'. Keep the exact same paragraph formatting (double newlines)."
}
Make sure to extract 10-15 relevant vocabulary items.`;

const buildPhase2Prompt = (
  text: string,
  targetLevel: string
) => `You are a strict Dutch grammar and style auditor.
Review the following Dutch text submitted by a student aiming for CEFR ${targetLevel} level.

Student Text:
${text}

Audit the text sentence by sentence for grammatical correctness, natural word order (woordvolgorde), vocabulary usage, and style.

CRITICAL INSTRUCTIONS:
1. DO NOT penalize or simplify language that exceeds the target CEFR level. If the student uses advanced vocabulary or complex grammar correctly, leave it unchanged.
2. Only correct objective grammatical errors, highly unnatural phrasing (e.g., literal translations from another language), or incorrect word order.
3. If a sentence is grammatically correct and sounds natural, DO NOT change it.

You must output a JSON object with EXACTLY the following structure. No markdown formatting outside the JSON, just the raw JSON object:
{
  "sentences": [
    {
      "original": "The student's original sentence",
      "corrected": "The grammatically correct and natural sentence (identical to original if no changes were needed)",
      "isModified": true or false, // Set to true ONLY if you actually changed the sentence. False if it was already correct.
      "explanation": "A concise, plain-text explanation of the grammar/syntax rule applied. If isModified is false, provide brief praise or state it is correct."
    }
  ],
  "cleanText": "The full corrected essay in a single block."
}
`;

const buildTopicGenerationPrompt = (level: string) => `You are an expert Dutch language instructor.
Generate 3 distinct, creative, and challenging essay topics suitable for a CEFR ${level} language learner.
The topics should be appropriate for an essay format (e.g., opinion, discussion, advantages/disadvantages).
Do not repeat common topics like "small town vs big city" or "free education".

You must output a JSON object with EXACTLY the following structure. No markdown formatting outside the JSON, just the raw JSON object:
{
  "topics": [
    "First topic string",
    "Second topic string",
    "Third topic string"
  ]
}
`;

export const callGeminiAPI = async (
  prompt: string,
  model: string,
  apiMode: 'free' | 'gcp',
  credentials: { apiKey?: string; gcpProjectId?: string }
): Promise<string> => {
  // For the browser, we use the REST API. 
  // Note: GCP Vertex AI direct browser access is blocked by CORS typically without a proxy,
  // but we provide the stub here as requested by the architecture. We will default to the free API structure.
  
  if (apiMode === 'gcp') {
      throw new Error("GCP Vertex AI requires an OAuth token and typically a backend proxy to avoid CORS issues. Please use Free API mode for this client-side app for now.");
  }

  if (!credentials.apiKey) {
      throw new Error("API Key is missing.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${credentials.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'API request failed');
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
      throw new Error("Invalid response format from Gemini");
  }

  return content;
};

export interface GeminiModel {
  name: string;
  displayName: string;
}

export const fetchAvailableModels = async (apiKey: string): Promise<GeminiModel[]> => {
  if (!apiKey) return [];
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.models
      .filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
      .filter((model: any) => {
        const name = model.name.toLowerCase();
        return name.includes('flash') && 
               !name.includes('vision') && 
               !name.includes('image') && 
               !name.includes('tts') && 
               !name.includes('audio');
      })
      .map((model: any) => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName || model.name.replace('models/', '')
      }));
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return [];
  }
};

export const generateMasterText = async (
  level: string,
  topic: string,
  instructions: string,
  model: string,
  apiMode: 'free' | 'gcp',
  credentials: { apiKey?: string; gcpProjectId?: string },
  paragraphCount: string = "5",
  wordCount: string = "100-250"
): Promise<GenerationResult> => {
  const prompt = buildPhase1Prompt(level, topic, instructions, paragraphCount, wordCount);
  const rawResponse = await callGeminiAPI(prompt, model, apiMode, credentials);
  return JSON.parse(rawResponse) as GenerationResult;
};

export const auditUserText = async (
  text: string,
  targetLevel: string,
  model: string,
  apiMode: 'free' | 'gcp',
  credentials: { apiKey?: string; gcpProjectId?: string }
): Promise<AuditResult> => {
  const prompt = buildPhase2Prompt(text, targetLevel);
  const rawResponse = await callGeminiAPI(prompt, model, apiMode, credentials);
  return JSON.parse(rawResponse) as AuditResult;
};

export const generateTopics = async (
  level: string,
  model: string,
  apiMode: 'free' | 'gcp',
  credentials: { apiKey?: string; gcpProjectId?: string }
): Promise<string[]> => {
  const prompt = buildTopicGenerationPrompt(level);
  const rawResponse = await callGeminiAPI(prompt, model, apiMode, credentials);
  const data = JSON.parse(rawResponse);
  return data.topics || [];
};