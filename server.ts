import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { apiKey, messages, contextState } = req.body;
      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are an AI assistant for a visual website builder. 
You can help the user by chatting and optionally generating JSON commands to modify the website state.
The user is working on an app using React, and their current app state elements and pages will be provided for context.

You can respond with a mixture of plain conversational text AND special JSON action blocks.
If you want to modify elements on the current page, add new elements, create pages, or generate a sitemap, respond with a markdown JSON block tagged with "actions":

\`\`\`json
[
  { "type": "ADD_ELEMENT", "payload": { "elementType": "button", "props": { "text": "New Button" } } },
  { "type": "ADD_ELEMENT", "payload": { "elementType": "customCode", "props": { "code": "<iframe src='...' allow='autoplay'></iframe>" } } },
  { "type": "REMOVE_ELEMENT", "payload": { "id": "element-id-from-state" } },
  { "type": "UPDATE_ELEMENT", "payload": { "id": "element-id-from-state", "props": { "text": "Updated text" } } },
  { "type": "UPDATE_STYLE", "payload": { "id": "element-id-from-state", "style": { "backgroundColor": "blue" } } },
  { "type": "CREATE_PAGE", "payload": { "name": "About Us", "path": "/about" } }
]
\`\`\`

IMPORTANT: Ensure all JSON is strictly valid. For customCode, ALWAYS use single quotes inside the HTML string for attributes to avoid breaking JSON strings, e.g. <iframe src='...'> instead of src=\"...\". NEVER put unescaped double quotes inside the 'code' property.

Available element types: container, text, button, image, heading, video, divider, input, slider, icon, spacer, textarea, checkbox, audio, map, badge, progress, slideshow, customCode.
Available styles: backgroundColor, color, padding, margin, width, height, borderRadius, fontSize, textAlign, etc.

Current Builder State:
${JSON.stringify(contextState, null, 2).substring(0, 5000)} /* Truncated to save tokens */
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages.map((m: any) => ({
          role: m.role || "user",
          parts: m.parts || [{ text: m.text }],
        })),
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to generate content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
