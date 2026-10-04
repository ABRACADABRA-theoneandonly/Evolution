import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Gemini AI Chatbot proxy route
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentEraTitle, currentEraTimeframe } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in server environment secrets.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format chat conversation with system instruction
    const systemInstruction = `You are "Chronos", an enthusiastic, deeply knowledgeable cosmic geobiologist and time-traveling science guide for ChronosEarth.
Your mission is to guide learners through the 13.8-billion-year history of Earth and the evolution of life—from the Big Bang, solar accretion, prebiotic chemistry, and dinosaurs, all the way to hominin bipedalism and modern human civilization.

Key Persona & Style:
- Energetic, scientifically accurate, and captivating like Carl Sagan, David Attenborough, and Neil deGrasse Tyson combined.
- Use vivid descriptions of prehistoric environments (e.g. molten Hadean magma oceans, the Great Oxidation crisis, Permian Siberian Traps, Chicxulub asteroid impact winter, African Rift Valley savanna).
- Emphasize peer-reviewed astrophysics, geobiology, paleontology, and physical anthropology.
- Keep answers engaging and concise (typically 2-4 short, impactful paragraphs or bullet points).
- When relevant, encourage users to test the app's interactive simulations (Theia Accretion, Prebiotic Reactor, Chicxulub Impact, Hominin Skull Morphing) or take the era quiz.
- The user is currently viewing the era: "${currentEraTitle || 'Earth History'}" (${currentEraTimeframe || '13.8 Ga - Present'}). If relevant, relate their question to this geological time period!`;

    // Map message history
    const contents = (messages || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // If no contents provided, create initial prompt
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Introduce yourself and give me a fascinating hook about the current era.' }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.75,
        maxOutputTokens: 800,
      },
    });

    const replyText = response.text || 'I could not synthesize a cosmic response at this moment.';
    return res.json({ reply: replyText });
  } catch (err: unknown) {
    console.error('Error in /api/chat:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown server error';
    return res.status(500).json({ error: errorMessage });
  }
});

// Gemini TTS speech synthesis route for era narration
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Fenrir' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required for speech synthesis.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in server environment secrets.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Deep, engaging, documentary science narrator',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini speech synthesizer.' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (err: unknown) {
    console.error('Error in /api/tts:', err);
    const errorMessage = err instanceof Error ? err.message : 'Speech synthesis failed';
    return res.status(500).json({ error: errorMessage });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ChronosEarth Full-Stack' });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChronosEarth server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
