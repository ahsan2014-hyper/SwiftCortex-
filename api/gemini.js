export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, image } = req.body;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: image
            ? "qwen/qwen3.6-27b"
            : "llama-3.1-8b-instant",

          messages: [
            {
              role: "system",
              content:
                "You are SwiftCortex AI Ultra. You are an expert image analysis assistant. Never reveal your reasoning or internal thinking. Never output <think> tags. Only provide the final answer. When describing an image, be accurate, detailed, and well-structured."
            },
            {
              role: "user",
              content: image
                ? [
                    {
                      type: "text",
                      text: message || "Describe this image in detail."
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
      "No response from AI.";

    // Remove reasoning
    reply = reply
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
      .trim();

    return res.status(200).json({
      text: reply
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
} 
