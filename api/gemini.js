export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      message,
      image,
      videoFrames
    } = req.body || {};

    const content = [];

    // User text
    content.push({
      type: "text",
      text:
        message ||
        (
          image
            ? "Describe this image in detail."
            : videoFrames?.length
              ? "Describe what is happening in this video based on the provided frames."
              : "Please answer the user."
        )
    });


    // Image
    if (image) {

      content.push({
        type: "image_url",
        image_url: {
          url: image
        }
      });

    }


    // Video frames
    if (
      Array.isArray(videoFrames) &&
      videoFrames.length > 0
    ) {

      for (
        const frame of videoFrames.slice(0, 3)
      ) {

        content.push({
          type: "image_url",
          image_url: {
            url: frame
          }
        });

      }

    }


    // Groq
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "Authorization":
            `Bearer ${process.env.GROQ_API_KEY}`
        },

        body: JSON.stringify({

          // ONLY ONE MODEL
          model: "qwen/qwen3.6-27b",

          temperature: 0.7,

          reasoning_effort: "none",

          messages: [

            {
              role: "system",

              content:
                "You are SwiftCortex AI Ultra, a helpful and intelligent AI assistant. Answer the user clearly and naturally. Never reveal private chain-of-thought or internal reasoning. When an image is provided, carefully describe visible objects, people, colors, text, actions, background and important details. When multiple images are provided as video frames, describe what appears to happen across those frames."
            },

            {
              role: "user",

              content: content
            }

          ]

        })
      }
    );


    const data = await response.json();


    // Groq error
    if (!response.ok) {

      console.error(
        "Groq API Error:",
        data
      );

      return res.status(response.status).json({
        error:
          data.error?.message ||
          "Groq API Error"
      });

    }


    let reply =
      data.choices?.[0]?.message?.content ||
      "No response from AI.";


    // Remove accidental think tags
    reply = reply
      .replace(
        /<think>[\s\S]*?<\/think>/gi,
        ""
      )
      .replace(
        /<thinking>[\s\S]*?<\/thinking>/gi,
        ""
      )
      .trim();


    return res.status(200).json({
      text: reply
    });


  } catch (error) {

    console.error(
      "Server Error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Internal server error"
    });

  }

}
