import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult, RelationshipMode, SimulationParams, SimulationResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    intimacyScore: {
      type: Type.INTEGER,
      description: 'A score from 0 to 100 representing the intimacy level. 100 is the highest.',
    },
    balanceRatio: {
      type: Type.OBJECT,
      properties: {
        speaker1: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the first speaker.' },
            percentage: { type: Type.NUMBER, description: 'Percentage of conversation volume for speaker 1.' },
          },
          required: ['name', 'percentage'],
        },
        speaker2: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the second speaker.' },
            percentage: { type: Type.NUMBER, description: 'Percentage of conversation volume for speaker 2.' },
          },
          required: ['name', 'percentage'],
        },
      },
      required: ['speaker1', 'speaker2'],
    },
    sentiment: {
      type: Type.OBJECT,
      properties: {
        positive: { type: Type.NUMBER, description: 'Percentage of positive sentiment.' },
        negative: { type: Type.NUMBER, description: 'Percentage of negative sentiment.' },
        neutral: { type: Type.NUMBER, description: 'Percentage of neutral sentiment.' },
      },
      required: ['positive', 'negative', 'neutral'],
    },
    avgResponseTime: {
        type: Type.OBJECT,
        properties: {
            speaker1: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Name of the first speaker.' },
                    // FIX: Removed `nullable: true` as it is not a valid property in the schema. The model can return null for the 'time' field.
                    time: { type: Type.NUMBER, description: 'Average response time in minutes for speaker 1. Null if cannot be calculated.' },
                },
                required: ['name', 'time']
            },
            speaker2: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: 'Name of the second speaker.' },
                    // FIX: Removed `nullable: true` as it is not a valid property in the schema. The model can return null for the 'time' field.
                    time: { type: Type.NUMBER, description: 'Average response time in minutes for speaker 2. Null if cannot be calculated.' },
                },
                required: ['name', 'time']
            }
        },
        required: ['speaker1', 'speaker2']
    },
    summary: {
      type: Type.STRING,
      description: 'A concise, 2-3 sentence summary of the relationship dynamic based on the chat.',
    },
    recommendation: {
      type: Type.STRING,
      description: 'A single, actionable recommendation to improve the relationship dynamic.',
    },
    sentimentFlow: {
        type: Type.ARRAY,
        description: 'An array of sentiment scores over time. Should contain around 20 data points.',
        items: {
            type: Type.OBJECT,
            properties: {
            time_percentage: { type: Type.NUMBER, description: 'Percentage of conversation progress (0-100).' },
            sentiment_score: { type: Type.NUMBER, description: 'Sentiment score from -1 (very negative) to 1 (very positive).' }
            },
            required: ['time_percentage', 'sentiment_score']
        }
    },
    responseHeatmap: {
        type: Type.ARRAY,
        description: 'An array of 24 numbers representing message counts for each hour of the day (0-23). The array must have exactly 24 elements.',
        items: { type: Type.NUMBER }
    },
    suggestedReplies: {
      type: Type.ARRAY,
      description: 'An array of 2-3 concise, potential replies to the last message in the conversation.',
      items: { type: Type.STRING }
    },
    suggestedTopics: {
      type: Type.ARRAY,
      description: 'An array of 2-3 interesting topics to discuss next, based on the conversation.',
      items: { type: Type.STRING }
    }
  },
  required: ['intimacyScore', 'balanceRatio', 'sentiment', 'avgResponseTime', 'summary', 'recommendation', 'sentimentFlow', 'responseHeatmap', 'suggestedReplies', 'suggestedTopics'],
};


export const analyzeChat = async (chatText: string, mode: RelationshipMode, language: 'ko' | 'en'): Promise<AnalysisResult> => {
  const prompt = `
    You are a world-class relationship analysis AI named 'It-Da'. Your task is to analyze a conversation text and provide a structured JSON output based on the provided schema. The analysis must be objective, data-driven, and insightful.

    **IMPORTANT: The entire JSON output, including all text fields like 'summary', 'recommendation', 'suggestedReplies', and 'suggestedTopics', MUST be in ${language === 'ko' ? 'Korean' : 'English'}.**

    The conversation is between two people. First, identify the two main speakers from the chat log. The format is typically 'Name: Message'.

    Here is the analysis context:
    - Relationship Mode: ${mode}
    - Your analysis should reflect the nuances of this specific relationship type.

    Please perform the following analysis:
    1.  **Intimacy Score (친밀도):** Calculate a score from 0-100.
    2.  **Balance Ratio (균형):** Calculate the percentage of total message volume for each speaker.
    3.  **Sentiment (감정 톤):** Analyze the overall emotional tone and provide percentages for positive, negative, and neutral sentiments.
    4.  **Average Response Time (평균 응답 시간):** Calculate the average time in minutes for each person to respond. If timestamps are not present, return null for time values.
    5.  **Summary (요약):** Provide a short summary of the relationship's state.
    6.  **Recommendation (추천):** Give one concrete, actionable piece of advice.
    7.  **Sentiment Flow (감정 흐름):** Analyze the conversation chronologically and provide an array of sentiment scores over time. Generate exactly 20 data points, evenly spaced from time_percentage 0 to 100. Each data point should have a 'time_percentage' (0-100) and a 'sentiment_score' (-1 to 1).
    8.  **Response Heatmap (응답 패턴 히트맵):** Analyze message timestamps if available. Provide an array of exactly 24 numbers, where each index (0-23) represents an hour of the day and its value is the total message count for that hour. If there are no timestamps, return an array of 24 zeros.
    9.  **Next Conversation Suggestions:** Based on the last few messages, provide an array of 2-3 potential replies to the last message, and an array of 2-3 interesting topics to discuss next. If the conversation seems concluded, focus on new topics.

    Conversation to analyze:
    ---
    ${chatText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing chat:", error);
    throw new Error("Failed to analyze the conversation. The AI model might be experiencing issues.");
  }
};


const simulationSchema = {
    type: Type.OBJECT,
    properties: {
        newIntimacyScore: {
            type: Type.INTEGER,
            description: 'The predicted new intimacy score (0-100) after the behavioral change.'
        },
        newRecommendation: {
            type: Type.STRING,
            description: 'A new, concise recommendation based on the simulated change.'
        }
    },
    required: ['newIntimacyScore', 'newRecommendation']
};

export const simulateChange = async (
  currentAnalysis: AnalysisResult,
  params: SimulationParams,
  mode: RelationshipMode,
  language: 'ko' | 'en'
): Promise<SimulationResult> => {
  const prompt = `
    You are a relationship simulation expert 'It-Da'. Based on an initial analysis, predict the change in the relationship if one person alters their behavior.

    **IMPORTANT: The 'newRecommendation' field in the JSON output MUST be in ${language === 'ko' ? 'Korean' : 'English'}.**

    Initial Analysis Summary:
    - Relationship Mode: ${mode}
    - Current Intimacy Score: ${currentAnalysis.intimacyScore}
    - Summary: ${currentAnalysis.summary}
    - Speaker 1 (${currentAnalysis.balanceRatio.speaker1.name}) talked ${currentAnalysis.balanceRatio.speaker1.percentage}% of the time.
    - Speaker 2 (${currentAnalysis.balanceRatio.speaker2.name}) talked ${currentAnalysis.balanceRatio.speaker2.percentage}% of the time.

    Simulation Request:
    Predict the new intimacy score and provide a new recommendation if the user's average response time changes by ${params.responseTimePercentage}%. A negative percentage means responding faster, a positive percentage means responding slower.

    Based on this change, provide a new predicted intimacy score and a short, encouraging recommendation in ${language === 'ko' ? 'Korean' : 'English'}.
  `;
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: simulationSchema,
        }
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as SimulationResult;
  } catch (error) {
      console.error("Error simulating change:", error);
      throw new Error("Failed to run the simulation. The AI model might be having trouble.");
  }
};

export const extractTextFromImage = async (imageBase64: string, mimeType: string): Promise<string> => {
  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: imageBase64,
    },
  };
  const textPart = {
    text: 'This is a screenshot of a chat conversation. Please accurately extract all the text from the image, maintaining the original structure. Focus only on the speaker and the message content.'
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to read text from the image. The image might be unclear or the model is busy.");
  }
};