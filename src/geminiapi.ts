// src/services/quizService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Generate quiz questions using Google Gemini AI
 * @param {Object} params - Quiz generation parameters
 * @param {string} params.topic - The topic for the quiz
 * @param {number} params.numberOfQuestions - Number of questions to generate (default: 5)
 * @param {string} params.difficulty - Difficulty level: 'easy', 'medium', 'hard' (default: 'medium')
 * @returns {Promise<Array>} Array of quiz questions
 */
export const generateQuizWithGemini = async ({
  topic,
  numberOfQuestions = 5,
  difficulty = "medium",
}) => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  const model = genAI.getGenerativeModel({  model:"gemini-2.0-flash-001"});

  const prompt = `Generate ${numberOfQuestions} multiple-choice quiz questions about "${topic}" with ${difficulty} difficulty level.

Format the response as a JSON array with the following structure:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer"
  }
]

Rules:
1. Each question must have exactly 4 options
2. correctAnswer must be the index (0-3) of the correct option
3. Questions should be clear and unambiguous
4. Explanations should be concise (1-2 sentences)
5. Ensure variety in question types (factual, conceptual, analytical)
6. Return ONLY the JSON array, no additional text

Generate the quiz now:`;

  try {
    const result = await model.generateContent(prompt);
    const generatedText = await result.response.text();

    // Remove markdown code blocks if present
    const cleanedText = generatedText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const questions = JSON.parse(cleanedText);

    // Validate the structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid quiz format generated");
    }

    // Validate each question
    questions.forEach((q, index) => {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3 ||
        !q.explanation
      ) {
        throw new Error(`Invalid question format at index ${index}`);
      }
    });

    return questions;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

/**
 * Generate a unique 6-digit quiz code
 * @returns {string} 6-digit code
 */
export const generateQuizCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate quiz code format
 * @param {string} code - Quiz code to validate
 * @returns {boolean} Whether the code is valid
 */
export const validateQuizCode = (code) => {
  return /^\d{6}$/.test(code);
};

/**
 * Sample quiz generator (fallback when Gemini API is not available)
 * @param {Object} params - Same as generateQuizWithGemini
 * @returns {Array} Sample quiz questions
 */
export const generateSampleQuiz = ({ topic, numberOfQuestions = 5 }) => {
  const sampleQuestions = [
    {
      question: `What is a key concept related to ${topic}?`,
      options: [
        "Option A - Basic concept",
        "Option B - Advanced concept",
        "Option C - Related concept",
        "Option D - Unrelated concept",
      ],
      correctAnswer: 1,
      explanation: "This is the correct answer because it represents the most accurate concept.",
    },
    {
      question: `Which statement about ${topic} is most accurate?`,
      options: [
        "Statement 1",
        "Statement 2",
        "Statement 3",
        "Statement 4",
      ],
      correctAnswer: 2,
      explanation: "This statement is supported by current research and best practices.",
    },
  ];

  return Array.from({ length: numberOfQuestions }, (_, i) => ({
    ...sampleQuestions[i % sampleQuestions.length],
    question: `${i + 1}. ${sampleQuestions[i % sampleQuestions.length].question}`,
  }));
};

export default {
  generateQuizWithGemini,
  generateQuizCode,
  validateQuizCode,
  generateSampleQuiz,
};