export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, job = '', language = 'en' } = req.body || {};
  if (!text || text.length < 200) {
    return res.status(422).json({ error: 'Text is too short' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(200).json({
      overallScore: 7.4,
      sections: [
        { key: 'summary',    score: 7, feedback: 'Good summary; add measurable outcomes.' },
        { key: 'experience', score: 8, feedback: 'Clear results; standardize action verbs.' },
        { key: 'skills',     score: 6, feedback: 'Highlight skills relevant to the target role.' },
        { key: 'education',  score: 8, feedback: 'Looks good.' }
      ],
      bulletsRewrite: [
        'Led a project that reduced setup time by 35%…',
        'Implemented CI that lowered deployment failures by 22%…'
      ],
      checklist: [
        'Add metrics to each bullet.',
        'Reduce verb repetition.',
        'Order skills by job relevance.'
      ]
    });
  }

  const prompt = `
You are a resume reviewer. Analyze the resume text below and respond with strict JSON using this exact schema:
{overallScore:number, sections:[{key:string,score:number,feedback:string}], bulletsRewrite:string[], checklist:string[]}

Scoring criteria and weights:
- Clarity 25%
- Results (quantified outcomes) 25%
- Relevance to target role 20%
- Structure (sections, bullet style) 15%
- Language (verbs, grammar, tense) 10%
- Skills (tools, balance) 5%

Language: ${language}. Target role: ${job || 'N/A'}.
Text:
"""
${text}
"""
Return only JSON, no prose.`.trim();

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      console.error('Gemini HTTP error', resp.status, errBody);
      return res.status(502).json({ error: 'Upstream error (Gemini)' });
    }

    const data = await resp.json();

    if (data?.error) {
      console.error('Gemini API error', data.error);
      return res.status(502).json({ error: 'Gemini API error' });
    }

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    const slice = jsonStart >= 0 ? raw.slice(jsonStart, jsonEnd + 1) : '';

    let parsed;
    try {
      parsed = JSON.parse(slice);
    } catch (e) {
      console.error('JSON parse failed. raw:', raw);
      return res.status(502).json({ error: 'Model returned non-JSON' });
    }

    const ok =
      typeof parsed?.overallScore === 'number' &&
      Array.isArray(parsed?.sections) &&
      Array.isArray(parsed?.bulletsRewrite) &&
      Array.isArray(parsed?.checklist);

    if (!ok) {
      console.error('Schema invalid', parsed);
      return res.status(502).json({ error: 'Invalid schema from model' });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    console.error('Unhandled', e);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
