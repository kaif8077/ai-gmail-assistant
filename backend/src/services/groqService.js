const Groq = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAIResponse = async (prompt) => {
  try {
    console.log('Calling Groq API...');
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful email assistant. Generate clear, concise, and professional responses. Keep replies under 500 words."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant", // Free model - 14,400 requests/day
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('Groq response received!');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to get AI response: ' + error.message);
  }
};

const getStructuredResponse = async (prompt) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Return ONLY valid JSON, no other text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 200,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Groq structured response error:', error);
    throw error;
  }
};

module.exports = { getAIResponse, getStructuredResponse };