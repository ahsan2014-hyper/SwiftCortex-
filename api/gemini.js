export default async function handler(req, res) {
  try {
    const { message, image } = req.body;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: image
            ? "qwen/qwen3.6-27b"
            : "llama-3.1-8b-instant",

          messages: [
            {
              role: "user",
              content: image
                ? [
                    {
                      type: "text",
                      text: message || "Describe this image."
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: image
                      }
                    }
                  ]
                : message
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log(JSON.stringify(data));

    let reply =
  data.choices?.[0]?.message?.content ||
  data.error?.message ||
  "No response from AI";

// Remove <think>...</think>
reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

return res.status(200).json({
  text: reply
});

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
