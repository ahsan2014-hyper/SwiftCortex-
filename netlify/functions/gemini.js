exports.handler = async (event) => {
  try {

    const { message, image } = JSON.parse(event.body);

    const content = [];

    if (message) {
      content.push({
        type: "text",
        text: message
      });
    }

    if (image) {
      content.push({
        type: "image_url",
        image_url: {
          url: image
        }
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "user",
              content: content
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
        text: data.choices?.[0]?.message?.content || "No response from AI"
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
