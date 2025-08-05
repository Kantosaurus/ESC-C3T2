import { Request, Response } from "express";
import { authenticated } from "../auth/guard.js";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

export const chatHandler = authenticated(
  async (req: Request, res: Response) => {
    try {
      const { message, history }: ChatRequest = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get Gemini API key from environment
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.error("Gemini API key not configured");
        return res.status(500).json({ error: "AI service not configured" });
      }

      // Prepare conversation history for Gemini
      const conversationHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // Add the current message
      conversationHistory.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: conversationHistory,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Gemini API Error:", errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error("Invalid response from Gemini API");
      }

      const aiResponse = data.candidates[0].content.parts[0].text;

      res.json({
        response: aiResponse,
        usage: data.usageMetadata || null,
      });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({
        error: "Failed to get AI response. Please try again.",
        // Do not expose internal error details to prevent information leakage
      });
    }
  }
);
