import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Papa from 'papaparse';

// Initialize Gemini SDK
// Note: Requires EXPORT GEMINI_API_KEY=your_api_key in .env
const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the file as text
    const fileContent = await file.text();

    // Parse the CSV
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json({ error: 'Failed to parse CSV', details: parsed.errors }, { status: 400 });
    }

    const data = parsed.data;

    // Analyze and Generate Strategy & Content using Gemini
    const prompt = `
      You are an expert digital marketing strategist and copywriter for Instagram.
      I am providing you with my recent Instagram performance data in JSON format:
      ${JSON.stringify(data.slice(0, 50))} // Sending up to 50 rows for context
      
      Analyze this data to find patterns in what performs well (high engagement rate, saves, shares, etc.) relative to the format and demographics.
      
      Based on your analysis, generate a concrete strategy and EXACTLY 3 ready-to-post content ideas. 
      
      Output your response STRICTLY as a JSON object with the following structure:
      {
        "insights": "A short, 2-3 sentence paragraph explaining your primary insight derived from the data (e.g., 'Reels perform best for your audience...', or 'Educational carousels get the most saves...')",
        "posts": [
          {
            "format": "Carousel | Reel | Static",
            "concept": "A 1-sentence hook or visual concept for the post.",
            "caption": "The actual full text for the caption, including emojis and proper spacing. Make it engaging.",
            "hashtags": "Space separated list of 5-8 highly relevant hashtags."
          }
        ]
      }
      
      DO NOT INCLUDE markdown formatting like \`\`\`json around the response, ONLY output the valid JSON object.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let aiResponseText = response.text || "{}";

    // Safety check: strip markdown blocks if the model included them despite instructions
    aiResponseText = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let generatedStrategy;
    try {
      generatedStrategy = JSON.parse(aiResponseText);
    } catch (parseError) {
      console.error("Agent JSON Parse Error. Raw response was:", aiResponseText);
      return NextResponse.json({ error: 'Failed to parse AI response as JSON', details: aiResponseText }, { status: 500 });
    }

    return NextResponse.json(generatedStrategy);

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to process and generate content',
      details: error?.message || "Unknown error",
      rawError: String(error)
    }, { status: 500 });
  }
}
