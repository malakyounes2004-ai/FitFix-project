import OpenAI from 'openai';
import { db } from '../firebase.js';

// Set OPENAI_API_KEY in your .env file
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

function buildPlanPrompt(userData, planType, notes) {
  const profile = {
    fullName: userData.displayName,
    age: userData.age,
    weightKg: userData.weight,
    heightCm: userData.height,
    gender: userData.gender,
    dietaryPreferences: userData.dietaryPreferences,
    fitnessGoals: userData.fitnessGoals,
    medicalNotes: userData.medicalNotes
  };

  return `
You are an elite fitness & nutrition coach. Create a ${planType} plan tailored to the JSON profile below.

Profile:
${JSON.stringify(profile, null, 2)}

Additional notes from coach: ${notes || 'None'}

Respond ONLY with valid JSON array where each element is:
{
  "title": "Short title",
  "details": "Actionable description"
}

Plan length: 4-6 items. Avoid markdown, explanations, or code fences—just the JSON array.
  `.trim();
}

function safeParsePlanItems(raw) {
  if (!raw) return [];

  const trimmed = raw.trim();

  const jsonBlockMatch = trimmed.match(/```(?:json)?([\s\S]*?)```/i);
  const candidate = jsonBlockMatch ? jsonBlockMatch[1].trim() : trimmed;

  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && Array.isArray(parsed.items)) {
      return parsed.items;
    }
  } catch (_) {
    // ignore and fall back
  }

  // Fallback: split lines into basic items
  return candidate
    .split(/\n+/)
    .map(line => line.replace(/^-+\s*/, '').trim())
    .filter(Boolean)
    .map((line, idx) => ({
      title: `Item ${idx + 1}`,
      details: line
    }));
}

export async function generateUserPlan(req, res) {
  try {
    const { userId, planType = 'meal', notes } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OPENAI_API_KEY is not configured on the server'
      });
    }

    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    const userData = userSnap.data();

    const prompt = buildPlanPrompt(userData, planType, notes);

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content: 'You are a world-class fitness and nutrition AI that outputs strict JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const aiResponse = completion.choices?.[0]?.message?.content?.trim();
    console.log('AI raw response:', aiResponse);

    if (!aiResponse) {
      throw new Error('AI returned an empty response');
    }

    const items = safeParsePlanItems(aiResponse);

    if (!items.length) {
      throw new Error('AI response could not be parsed into plan items');
    }

    const plan = {
      type: planType,
      generatedAt: new Date().toISOString(),
      createdBy: req.user.uid,
      notes: notes || null,
      aiModel: completion.model,
      items: items.map(item => ({
        title: item.title?.trim() || 'Untitled Item',
        details: item.details?.trim() || 'Details not provided'
      }))
    };

    await userRef.collection('plans').add(plan);

    // Store latest plan snapshot on user doc for quick access
    await userRef.set(
      {
        latestPlan: {
          ...plan,
          generatedAt: plan.generatedAt
        },
        updatedAt: new Date()
      },
      { merge: true }
    );

    return res.status(201).json({
      success: true,
      message: 'AI plan generated and saved',
      plan
    });
  } catch (error) {
    console.error('AI plan generation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate plan' });
  }
}