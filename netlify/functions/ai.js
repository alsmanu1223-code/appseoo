export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const question = (body.question || "").trim();

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "السؤال فارغ" })
      };
    }

    const OPENAI_KEY = process.env.OPENAI_KEY;
    if (!OPENAI_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key غير مضبوط في Netlify" })
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "أنت مساعد عربي متخصص في تعليم الهكر الأخلاقي والأمن السيبراني فقط. يمنع شرح أي اختراق غير قانوني أو ضار."
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 600,
        temperature: 0.3
      })
    });

    const data = await response.json();

    const answer =
      data?.choices?.[0]?.message?.content ||
      "لم يتم توليد رد";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
