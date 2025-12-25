// src/controllers/aiChatController.js
// AI Chat endpoint using Google Gemini API

import { db } from '../firebase.js';

/**
 * AI Chat endpoint
 * POST /api/ai/chat
 */
export async function aiChat(req, res) {
  try {
    const { message, language } = req.body;
    const userId = req.user.uid;

    // Validate inputs
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      });
    }

    if (!language || !['en', 'ar'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Language must be either "en" or "ar"'
      });
    }

    // Check if Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY is not configured');
      return res.status(500).json({
        success: false,
        message: 'Something went wrong, please try again.'
      });
    }

    console.log(`🤖 AI Chat request from user ${userId}, language: ${language}`);

    // Fetch user document
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const goal = userData.goal || 'Not set';
    const experience = userData.experience || 'Not set';

    // Fetch workout plan summary
    let workoutSummary = 'No workout plan assigned.';
    try {
      const workoutPlanDoc = await db.collection('workoutPlans').doc(userId).get();
      if (workoutPlanDoc.exists) {
        const workoutData = workoutPlanDoc.data();
        const daysPerWeek = workoutData.daysPerWeek || 0;
        const days = workoutData.days || [];
        
        if (days.length > 0) {
          const daySummaries = days.map((day, index) => {
            const exerciseCount = (day.exercises || []).length;
            return `Day ${index + 1}: ${day.title || 'Untitled'} (${exerciseCount} exercises)`;
          }).join(', ');
          workoutSummary = `${daysPerWeek} days per week. ${daySummaries}`;
        } else {
          workoutSummary = `${daysPerWeek} days per week, but no days configured.`;
        }
      }
    } catch (error) {
      console.warn('⚠️ Error fetching workout plan:', error.message);
      // Keep default "No workout plan assigned."
    }

    // Fetch meal plan summary
    let mealSummary = 'No meal plan assigned.';
    try {
      const mealPlan = userData.mealPlan;
      if (mealPlan) {
        const breakfasts = mealPlan.breakfasts || [];
        const lunches = mealPlan.lunches || [];
        const dinners = mealPlan.dinners || [];
        const snacks = mealPlan.snacks || [];
        
        const totalMeals = breakfasts.length + lunches.length + dinners.length + snacks.length;
        if (totalMeals > 0) {
          mealSummary = `Active meal plan with ${breakfasts.length} breakfasts, ${lunches.length} lunches, ${dinners.length} dinners, and ${snacks.length} snacks.`;
        }
      }
    } catch (error) {
      console.warn('⚠️ Error fetching meal plan:', error.message);
      // Keep default "No meal plan assigned."
    }

    // Build system prompt
    const systemPrompt = `You are FitFix AI Coach 💪🔥

User goal: ${goal}
Experience level: ${experience}
Workout plan summary: ${workoutSummary}
Meal plan summary: ${mealSummary}
Language: ${language}

PERSONALITY & TONE:
- Friendly, motivating, and supportive like a real coach.
- Use emojis naturally (💪🔥🥗⚡😊) but do NOT overuse them.
- Be positive and encouraging, never robotic.

LANGUAGE RULES:
- If language is "ar" → respond fully in Arabic.
- If language is "en" → respond fully in English.
- Use casual, easy-to-understand language.

ANSWER STYLE:
- Answer ONLY what the user asks.
- Keep replies SHORT and clear.
- Max length: 2–4 short paragraphs.
- No long explanations unless the user asks for details.

FORMATTING RULES:
- DO NOT use markdown.
- DO NOT use **bold**, *italics*, bullet symbols (*, -, •).
- Use plain text only.
- Use emojis instead of formatting.
- Use line breaks for clarity.

TOPIC RULES:
- Answer ONLY fitness-related topics:
  workouts, exercises, meal plans, nutrition, recovery, motivation.
- If the question is unrelated, gently redirect back to fitness.

SAFETY:
- Never give medical diagnosis.
- For injuries or medical issues, advise consulting a professional.

Act like a real fitness coach chatting with the user, not like an article or textbook.`;

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    // Use node-fetch for Node.js compatibility
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: systemPrompt
            }
          ]
        },
        contents: [
          {
            parts: [
              {
                text: message.trim()
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Gemini API error:', errorData);
      return res.status(500).json({
        success: false,
        message: 'Something went wrong, please try again.'
      });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!reply) {
      console.error('❌ Gemini API returned empty response');
      return res.status(500).json({
        success: false,
        message: 'Something went wrong, please try again.'
      });
    }

    console.log(`✅ AI Chat response generated successfully for user ${userId}`);

    return res.status(200).json({
      success: true,
      reply: reply.trim()
    });

  } catch (error) {
    console.error('❌ AI Chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong, please try again.'
    });
  }
}

