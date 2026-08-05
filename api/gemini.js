exports.handler = async (event) => {
  try {

    const { message, image } = JSON.parse(event.body);

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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text:
  data.choices?.[0]?.message?.content ||
  data.error?.message ||
  "No response from AI"
      })
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };

  }
};
