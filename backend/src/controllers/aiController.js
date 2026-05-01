const { getAIResponse } = require('../services/groqService');

const generateReply = async (req, res, next) => {
  try {
    const { email, tone, language, customInstructions } = req.body;
    
    if (!email || !email.body) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email content is required'
      });
    }

    console.log(`Generating ${tone} reply in ${language} with Groq AI`);

    // Build prompt for Groq
    let prompt = `You are an AI email assistant. Generate a ${tone} reply to this email in ${language} language.
    
Email Details:
- Subject: ${email.subject || 'No Subject'}
- From: ${email.sender || 'Unknown Sender'}
- Content: ${email.body.substring(0, 3000)}

Requirements:
1. Be ${tone === 'professional' ? 'formal and business-appropriate' : tone === 'friendly' ? 'warm and conversational' : 'brief and concise'}
2. Address all key points from the original email
3. Keep response under 500 words
4. Use ${language} language${customInstructions ? `\n5. Additional instructions: ${customInstructions}` : ''}

Generate the reply:`;

    const reply = await getAIResponse(prompt);
    
    res.status(200).json({
      success: true,
      reply: reply,
      metadata: {
        tone,
        language,
        provider: 'Groq AI',
        model: 'llama-3.1-8b-instant',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Generate reply error:', error);
    res.status(500).json({
      error: 'AI Service Error',
      message: error.message
    });
  }
};

const summarizeEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.body) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email content is required'
      });
    }

    console.log('Summarizing with Groq AI');

    const prompt = `Summarize the following email in 3-4 bullet points. Focus on:
1. Main purpose of the email
2. Key action items required
3. Important dates or deadlines
4. Any urgent matters

Email Subject: ${email.subject || 'No Subject'}
From: ${email.sender || 'Unknown Sender'}
Content: ${email.body.substring(0, 3000)}

Provide summary in bullet points (each starting with •):`;

    const summary = await getAIResponse(prompt);
    
    res.status(200).json({
      success: true,
      summary: summary,
      metadata: {
        provider: 'Groq AI',
        model: 'llama-3.1-8b-instant',
        originalLength: email.body.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({
      error: 'AI Service Error',
      message: error.message
    });
  }
};

const detectTone = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const prompt = `Analyze the tone of this email and return ONLY a JSON object with:
{
  "primaryTone": "professional/friendly/urgent/angry/happy/neutral",
  "confidence": 0-100,
  "suggestedResponseStyle": "professional/friendly/short"
}

Email content: ${email.body.substring(0, 1000)}`;

    const toneAnalysis = await getAIResponse(prompt);
    
    res.status(200).json({
      success: true,
      toneAnalysis: JSON.parse(toneAnalysis),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateReply, summarizeEmail, detectTone };