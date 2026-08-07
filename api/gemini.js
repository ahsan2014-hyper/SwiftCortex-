export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  try {

    const { message, image } = req.body;


    let userContent;


    if (image) {

      userContent = [
        {
          type: "text",
          text: message || "Describe this image clearly."
        },
        {
          type: "image_url",
          image_url: {
            url: image
          }
        }
      ];

    } else {

      userContent = message;

    }



    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization:
            `Bearer ${process.env.GROQ_API_KEY}`

        },


        body: JSON.stringify({

          model: image
            ? "meta-llama/llama-4-scout-17b-16e-instruct"
            : "llama-3.1-8b-instant",


          temperature: 0.3,


          messages: [

            {
              role: "system",

              content:
              "You are SwiftCortex AI Ultra. Answer clearly and helpfully. Never reveal private reasoning or chain of thought. For images, describe visible objects, people, colors, text, actions, and background details."
            },


            {
              role:"user",
              content:userContent
            }

          ]

        })

      }

    );



    const data = await response.json();



    if (!response.ok) {

      return res.status(response.status).json({

        error:
        data.error?.message ||
        "Groq API Error"

      });

    }



    const reply =
      data.choices?.[0]?.message?.content ||
      "No response.";



    return res.status(200).json({

      text: reply

    });



  } catch(error) {


    console.error(error);


    return res.status(500).json({

      error:error.message

    });

  }

}
