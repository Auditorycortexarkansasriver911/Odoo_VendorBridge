import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import redis from '../config/redis.js';
import config from '../config/index.js';

const model = new ChatGoogleGenerativeAI({
  apiKey: config.gemini.apiKey,
  model: 'gemini-1.5-flash',
  streaming: true,
});

const SYSTEM_PROMPT = `You are a procurement assistant for VendorBridge ERP. Help users with:
- Vendor management and evaluation
- RFQ creation best practices
- Quotation analysis and comparison
- Approval workflow guidance
- Purchase order and invoice queries
- Procurement analytics interpretation
Be concise, professional, and specific to procurement workflows.`;

export async function streamChat(sessionId, userMessage, res) {
  let history = [];
  try {
    const raw = (redis && redis.status === 'ready') ? await redis.get(`chat:${sessionId}`) : null;
    history = raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error loading chat history from Redis:', error.message);
  }

  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    ...history.map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)),
    new HumanMessage(userMessage),
  ];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let fullResponse = '';
  try {
    const stream = await model.stream(messages);

    for await (const chunk of stream) {
      const text = chunk.content;
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (streamError) {
    console.error('Gemini streaming error:', streamError.message);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  // Save updated history to Redis
  history.push({ role: 'user', content: userMessage });
  history.push({ role: 'assistant', content: fullResponse });
  
  try {
    if (redis && redis.status === 'ready') {
      await redis.set(`chat:${sessionId}`, JSON.stringify(history.slice(-20)), 'EX', 86400);
    }
  } catch (redisError) {
    console.error('Error saving chat history to Redis:', redisError.message);
  }
}
