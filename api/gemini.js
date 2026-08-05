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
          model: "qwen/qwen3.6-27b",

          temperature: 0.3,

          messages: [
            {
              role: "system",
              content:
                "You are SwiftCortex AI Ultra, an expert AI assistant. Never reveal your internal reasoning, chain of thought, or thinking process. Never output <think> tags. Only provide the final answer. When describing an image, identify all visible objects, people, colors, text, actions, background, layout, and important details in a clear and well-structured way."
            },
            {
              role: "user",
              content: image
                ? [
                    {
                      type: "text",
                      text:
                        message ||
                        "Describe this image in detail."
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

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Groq API Error"
      });
    }

    let reply =
      data.choices?.[0]?.message?.content ||
      "No response.";

    // Remove reasoning tags
    reply = reply
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
      .trim();

    // Remove accidental leading reasoning text
    if (reply.startsWith("<think>")) {
      reply = "I analyzed the image successfully.";
    }

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
