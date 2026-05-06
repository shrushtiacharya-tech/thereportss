import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RephrasedNews {
  title: string;
  summary: string;
  body: string;
  category: string;
  imageKeywords: string;
  galleryQueries: string[];
}

export async function rephraseNewsContent(title: string, summary: string): Promise<RephrasedNews> {
  try {
    const prompt = `
      Rephrase the following news item from a major news agency into our website's editorial style. 
      Our style is: Bold, minimal, highly professional, but "independent" and authoritative. 
      Avoid clickbait. Use strong verbs. 
      The goal is to present the information accurately but in our own distinctive voice.

      Generate a comprehensive body text that is similar in factual depth to a journalism report but completely rephrased in our house style.

      Original Title: ${title}
      Original Summary: ${summary}

      Respond with a JSON object containing:
      1. 'title': A new, punchy, "The Reports" style headline.
      2. 'summary': A 1-2 sentence sophisticated hook.
      3. 'body': A detailed 4-6 paragraph rephrasing of the facts, maintaining a serious, authoritative tone.
      4. 'category': A one-word category for this news (e.g., World, Business, Tech, Politics).
      5. 'imageKeywords': 4-5 very specific, evocative keywords for the main editorial photo that capture the specific actors, location, or core theme (e.g., 'cracked glacier blue arctic cinematic', 'empty oil tanker night ocean').
      6. 'galleryQueries': A list of 4-5 specific search queries that would fetch relevant supporting images from the web to illustrate different parts of the story.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            body: { type: Type.STRING },
            category: { type: Type.STRING },
            imageKeywords: { type: Type.STRING },
            galleryQueries: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "summary", "body", "category", "imageKeywords", "galleryQueries"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini rephrase error:", error);
    // Fallback to original content if AI fails
    return {
      title,
      summary,
      body: summary,
      category: "News",
      imageKeywords: "news",
      galleryQueries: ["news", "press"]
    };
  }
}
