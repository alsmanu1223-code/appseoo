// netlify/functions/ai.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const question = (body.question || '').toString().substring(0, 4000);
    if(!question) return { statusCode:400, body: JSON.stringify({ error:'سؤال فارغ' }) };

    // system prompt: حافظ على الطابع الأخلاقي
    const messages = [
      { role: "system", content: "أنت مساعد تعليمي لهدف تعليم الأمن الأخلاقي فقط. لا تقدم تعليمات للاختراق غير القانوني أو استغلال الثغرات. إذا طلب المستخدم شيئاً غير أخلاقي، ارفض وأعطه مساراً تعليمياً أخلاقياً بدلاً من ذلك." },
      { role: "user", content: question }
    ];

    const OPENAI_KEY = process.env.OPENAI_KEY;
    if(!OPENAI_KEY) return { statusCode:500, body: JSON.stringify({ error:'OpenAI key not configured' }) };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // أو أي موديل متاح لديك
        messages,
        max_tokens: 800,
        temperature: 0.2
      })
    });

    if(!resp.ok){
      const text = await resp.text();
      return { statusCode: 500, body: JSON.stringify({ error: 'OpenAI error', detail: text }) };
    }

    const data = await resp.json();

    // استخراج نص الرد
    const answer = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content
      : (data.choices && data.choices[0] && data.choices[0].text) || "لم أستطع توليد رد";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer, raw: data })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
