import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    const cleanText = text.replace(/\n/g, " ");

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", 
      input: cleanText,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
};