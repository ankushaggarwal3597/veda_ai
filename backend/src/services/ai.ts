import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'placeholder'
});

export const generateQuestions = async (config: any, title: string) => {
  const prompt = `
You are an AI Assessment Creator. Create a structured exam paper based on the following config:
Title: ${title}
Total Marks: ${config.totalMarks}
Total Questions: ${config.totalQuestions}
Question Types Setup: ${JSON.stringify(config.questionTypes, null, 2)}
Additional Instructions: ${config.additionalInfo || 'None'}

You must strictly output ONLY valid JSON representing the paper structure matching this schema:
{
  "sections": [
    {
      "title": "Section Title (e.g. Section A: Multiple Choice)",
      "instruction": "Optional instruction (e.g. Attempt all questions. Each question is 1 mark.)",
      "questions": [
        {
          "text": "The actual question text...",
          "difficulty": "Easy" | "Moderate" | "Hard" | "Challenging",
          "marks": number
        }
      ]
    }
  ]
}

Ensure the sum of marks and number of questions match the config request perfectly. Return ONLY the JSON object, do not use markdown code blocks \`\`\`json. Output raw JSON.
`;

  console.log('Calling Groq AI Service...');
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'placeholder') {
      console.warn('No Groq API key found. Using mocked question set for development testing.');
      return generateMockQuestions(config, title);
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);

  } catch (error) {
    console.error('Error with Groq AI:', error);
    throw new Error('Failed to generate questions. ' + (error as Error).message);
  }
};

const generateMockQuestions = (config: any, title: string) => {
  return {
    sections: [
      {
        title: "Section A: Auto-Generated Mock",
        instruction: "This is a fallback section since no API key was provided.",
        questions: Array.from({ length: Math.min(config.totalQuestions, 5) }).map((_, i) => ({
          text: `Mock Question ${i + 1} for ${title}`,
          difficulty: i % 2 === 0 ? "Easy" : "Moderate",
          marks: 2
        }))
      }
    ]
  };
};
