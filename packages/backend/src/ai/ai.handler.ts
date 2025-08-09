import { Request, Response } from "express";
import { authenticated } from "../auth/guard.js";
import { insertNotes, updateNotes, deleteNotes } from "../note/note.entity.js";
import {
  insertAppointment,
  updateAppointment,
  deleteAppointment,
} from "../appointment/appointment.entity.js";
import { getEldersDetails } from "../elder/elder.entity.js";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolCallResponse {
  tool_call_id: string;
  role: "tool";
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  tool_calls?: ToolCall[];
  tool_responses?: ToolCallResponse[];
}

// Define available AI tools
const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_note",
      description:
        "Create a new note for an elder. Use this when the user wants to add a note about an elder's care.",
      parameters: {
        type: "object",
        properties: {
          header: {
            type: "string",
            description: "Brief header/title for the note",
          },
          content: {
            type: "string",
            description: "Detailed content of the note",
          },
          assigned_elder_id: {
            type: "number",
            description: "ID of the elder this note is for",
          },
        },
        required: ["header", "content", "assigned_elder_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_note",
      description:
        "Edit an existing note. Use this when the user wants to update a note's content.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "ID of the note to edit",
          },
          header: {
            type: "string",
            description: "Updated header/title for the note",
          },
          content: {
            type: "string",
            description: "Updated content of the note",
          },
          assigned_elder_id: {
            type: "number",
            description: "ID of the elder this note is for",
          },
        },
        required: ["id", "header", "content", "assigned_elder_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_note",
      description:
        "Delete a note. Use this when the user wants to remove a note.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "ID of the note to delete",
          },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_appointment",
      description:
        "Create a new appointment/calendar event for an elder. Use this when the user wants to schedule an appointment.",
      parameters: {
        type: "object",
        properties: {
          elder_id: {
            type: "number",
            description: "ID of the elder this appointment is for",
          },
          name: {
            type: "string",
            description: "Name/title of the appointment",
          },
          startDateTime: {
            type: "string",
            description: "Start date and time in ISO format",
          },
          endDateTime: {
            type: "string",
            description: "End date and time in ISO format",
          },
          details: {
            type: "string",
            description: "Additional details about the appointment",
          },
          loc: {
            type: "string",
            description: "Location of the appointment",
          },
        },
        required: ["elder_id", "name", "startDateTime", "endDateTime"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_appointment",
      description:
        "Edit an existing appointment/calendar event. Use this when the user wants to update an appointment.",
      parameters: {
        type: "object",
        properties: {
          appt_id: {
            type: "number",
            description: "ID of the appointment to edit",
          },
          elder_id: {
            type: "number",
            description: "ID of the elder this appointment is for",
          },
          name: {
            type: "string",
            description: "Updated name/title of the appointment",
          },
          startDateTime: {
            type: "string",
            description: "Updated start date and time in ISO format",
          },
          endDateTime: {
            type: "string",
            description: "Updated end date and time in ISO format",
          },
          details: {
            type: "string",
            description: "Updated details about the appointment",
          },
          loc: {
            type: "string",
            description: "Updated location of the appointment",
          },
        },
        required: [
          "appt_id",
          "elder_id",
          "name",
          "startDateTime",
          "endDateTime",
        ],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_appointment",
      description:
        "Delete an appointment/calendar event. Use this when the user wants to cancel an appointment.",
      parameters: {
        type: "object",
        properties: {
          appt_id: {
            type: "number",
            description: "ID of the appointment to delete",
          },
          elder_id: {
            type: "number",
            description: "ID of the elder this appointment is for",
          },
        },
        required: ["appt_id", "elder_id"],
      },
    },
  },
];

// Execute tool function calls
async function executeToolCall(
  toolCall: ToolCall,
  caregiverId: string
): Promise<string> {
  try {
    const { name, arguments: args } = toolCall.function;
    const parsedArgs = JSON.parse(args);

    switch (name) {
      case "create_note": {
        const now = new Date();
        const noteData = {
          header: parsedArgs.header,
          content: parsedArgs.content,
          assigned_elder_id: parsedArgs.assigned_elder_id,
          caregiver_id: caregiverId,
          created_at: now,
          updated_at: now,
        };
        const result = await insertNotes(noteData);
        return `Successfully created note with ID ${result.id}: "${result.header}"`;
      }

      case "edit_note": {
        const now = new Date();
        const noteData = {
          id: parsedArgs.id,
          header: parsedArgs.header,
          content: parsedArgs.content,
          assigned_elder_id: parsedArgs.assigned_elder_id,
          caregiver_id: caregiverId,
          updated_at: now,
        };
        const result = await updateNotes(noteData);
        return `Successfully updated note with ID ${result.id}: "${result.header}"`;
      }

      case "delete_note": {
        await deleteNotes(parsedArgs.id);
        return `Successfully deleted note with ID ${parsedArgs.id}`;
      }

      case "create_appointment": {
        const appointmentData = {
          elder_id: parsedArgs.elder_id,
          name: parsedArgs.name,
          startDateTime: new Date(parsedArgs.startDateTime),
          endDateTime: new Date(parsedArgs.endDateTime),
          details: parsedArgs.details || null,
          loc: parsedArgs.loc || null,
          created_by: caregiverId,
        };
        const result = await insertAppointment(appointmentData);
        return `Successfully created appointment with ID ${result.appt_id}: "${result.name}" on ${result.startDateTime}`;
      }

      case "edit_appointment": {
        const appointmentData = {
          appt_id: parsedArgs.appt_id,
          elder_id: parsedArgs.elder_id,
          name: parsedArgs.name,
          startDateTime: new Date(parsedArgs.startDateTime),
          endDateTime: new Date(parsedArgs.endDateTime),
          details: parsedArgs.details || null,
          loc: parsedArgs.loc || null,
        };
        const result = await updateAppointment(appointmentData);
        return `Successfully updated appointment with ID ${result.appt_id}: "${result.name}" on ${result.startDateTime}`;
      }

      case "delete_appointment": {
        await deleteAppointment({
          appt_id: parsedArgs.appt_id,
          elder_id: parsedArgs.elder_id,
        });
        return `Successfully deleted appointment with ID ${parsedArgs.appt_id}`;
      }

      default:
        return `Unknown tool function: ${name}`;
    }
  } catch (error) {
    console.error(
      `Error executing tool call ${toolCall.function.name}:`,
      error
    );
    return `Error executing ${toolCall.function.name}: ${error.message}`;
  }
}

export const chatHandler = authenticated(
  async (req: Request, res: Response) => {
    try {
      const { message, history, tool_calls, tool_responses }: ChatRequest =
        req.body;
      const caregiverId = res.locals.user.userId;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get Gemini API key from environment
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.error("Gemini API key not configured");
        return res.status(500).json({ error: "AI service not configured" });
      }

      // If tool calls were made, execute them first
      if (tool_calls && tool_calls.length > 0) {
        const toolResults = [];
        for (const toolCall of tool_calls) {
          const result = await executeToolCall(toolCall, caregiverId);
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool" as const,
            content: result,
          });
        }

        return res.json({
          tool_calls: tool_calls,
          tool_results: toolResults,
        });
      }

      // Get user's elders for context
      const elders = await getEldersDetails(caregiverId);
      const elderContext =
        elders.length > 0
          ? `You are helping a caregiver who takes care of these elders: ${elders
              .map((e) => `${e.name} (ID: ${e.id})`)
              .join(", ")}. `
          : "The caregiver has no elders registered yet. ";

      // Prepare conversation history for Gemini
      const conversationHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // Add tool responses to history if present
      if (tool_responses && tool_responses.length > 0) {
        tool_responses.forEach((toolResponse) => {
          conversationHistory.push({
            role: "model",
            parts: [{ text: `Tool execution result: ${toolResponse.content}` }],
          });
        });
      }

      // Add the current message with context
      const systemContext = `${elderContext}You are a helpful AI assistant for caregivers. You can help with general questions and you have access to tools to manage notes and appointments. When users ask to create, edit, or delete notes or appointments, you should use the appropriate tools. Always ask for clarification if you need more information like elder ID, note ID, or appointment details.

Available tools:
- create_note: Create a new note for an elder
- edit_note: Edit an existing note  
- delete_note: Delete a note
- create_appointment: Create a new appointment for an elder
- edit_appointment: Edit an existing appointment
- delete_appointment: Delete an appointment

When using tools, you need the elder ID. The available elders are: ${elders
        .map((e) => `${e.name} (ID: ${e.id})`)
        .join(", ")}.`;

      conversationHistory.push({
        role: "user",
        parts: [{ text: `${systemContext}\n\nUser message: ${message}` }],
      });

      // Call Gemini API with function calling capabilities
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: conversationHistory,
            tools: [
              {
                function_declarations: AI_TOOLS.map((tool) => tool.function),
              },
            ],
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

      const candidate = data.candidates[0];
      const content = candidate.content;

      // Check if Gemini wants to call a function
      if (content.parts && content.parts.some((part) => part.functionCall)) {
        const functionCalls = content.parts
          .filter((part) => part.functionCall)
          .map((part, index) => ({
            id: `call_${Date.now()}_${index}`,
            type: "function" as const,
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args || {}),
            },
          }));

        return res.json({
          requires_tool_calls: true,
          tool_calls: functionCalls,
          response:
            content.parts.find((part) => part.text)?.text ||
            "I need to perform some actions for you.",
        });
      }

      // Regular text response
      const aiResponse = content.parts[0].text;

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
