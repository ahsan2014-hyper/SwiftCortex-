export default async function handler(req,res){

 if(req.method!=="POST")
  return res.status(405).json({error:"Method not allowed"});

 try{

  const {
   message="",
   image=null,
   videoFrames=[],
   thinkHarder=false,
   timezone="UTC"
  }=req.body||{};

  const now=new Date();

  const currentDate=
   new Intl.DateTimeFormat("en-CA",{
    timeZone:timezone,
    year:"numeric",
    month:"2-digit",
    day:"2-digit"
   }).format(now);

  const currentTime=
   new Intl.DateTimeFormat("en-US",{
    timeZone:timezone,
    dateStyle:"full",
    timeStyle:"long"
   }).format(now);


  const lower=message.toLowerCase();

  const newsWords=[
   "latest news",
   "today news",
   "current news",
   "breaking news",
   "আজকের খবর",
   "সর্বশেষ খবর",
   "বর্তমান খবর",
   "নতুন খবর",
   "সাম্প্রতিক খবর",
   "latest",
   "today",
   "breaking",
   "news",
   "أخبار",
   "آخر الأخبار"
  ];

  const wantsNews=
   newsWords.some(x=>lower.includes(x));


  /*
   * REAL-TIME NEWS
   */

  if(wantsNews && !image && !videoFrames.length){

   const r=await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
     method:"POST",

     headers:{
      "Content-Type":"application/json",
      "Authorization":
       `Bearer ${process.env.GROQ_API_KEY}`,
      "Groq-Model-Version":"latest"
     },

     body:JSON.stringify({

      model:"groq/compound",

      messages:[

       {
        role:"system",
        content:
`You are SwiftCortex AI Ultra.

Current date: ${currentDate}
Current date and time: ${currentTime}

IMPORTANT:
For questions about today's news, latest news, breaking news, current events or recent events, ALWAYS use the built-in web search.

Never pretend old information is current.

Always verify the publication date of news.

If the user asks for today's news, prioritize news published today.

Answer in exactly the same language as the user.

If the user asks in Bengali, answer Bengali.
If Arabic, answer Arabic.
If English, answer English.

Do not mention previous answers.

Give concise but useful news summaries.

Clearly distinguish today's news from older background information.

Include source names and links/citations when available.`
       },

       {
        role:"user",
        content:message
       }

      ],

      search_settings:{
       country:"bangladesh"
      }

     })
    }
   );

   const d=await r.json();

   if(!r.ok){

    console.error("News API:",d);

    return res.status(r.status).json({
     error:d.error?.message||
      "Real-time news search failed"
    });
   }

   return res.status(200).json({
    text:
     d.choices?.[0]?.message?.content||
     "No news response."
   });
  }


  /*
   * IMAGE / VIDEO
   */

  const content=[];

  content.push({
   type:"text",
   text:
    message||
    (
     image
      ?"Describe this image."
      :videoFrames.length
       ?"Describe this video."
       :"Answer the user."
    )
  });


  if(image){

   content.push({
    type:"image_url",
    image_url:{url:image}
   });
  }


  if(Array.isArray(videoFrames)){

   for(const frame of videoFrames.slice(0,3)){

    content.push({
     type:"image_url",
     image_url:{url:frame}
    });

   }
  }


  /*
   * NORMAL / VISION MODEL
   */

  const r=await fetch(
   "https://api.groq.com/openai/v1/chat/completions",
   {
    method:"POST",

    headers:{
     "Content-Type":"application/json",
     "Authorization":
      `Bearer ${process.env.GROQ_API_KEY}`
    },

    body:JSON.stringify({

     model:"qwen/qwen3.6-27b",

     temperature:
      thinkHarder ? 0.3 : 0.7,

     reasoning_effort:"none",

     messages:[

      {
       role:"system",

       content:
`You are SwiftCortex AI Ultra.

Current date: ${currentDate}.
Current time: ${currentTime}.

Answer in the same language as the user.

Never mention previous answers such as "as I said before".

Never claim that the current year is 2024.

Never invent current news.

If an image is provided, describe what is actually visible.

If multiple video frames are provided, explain what happens across the frames.

Be natural, helpful and accurate.`
      },

      {
       role:"user",
       content
      }

     ]
    })
   }
  );


  const d=await r.json();

  if(!r.ok){

   console.error("Groq API:",d);

   return res.status(r.status).json({
    error:d.error?.message||
     "Groq API Error"
   });
  }


  let reply=
   d.choices?.[0]?.message?.content||
   "No response from AI.";


  reply=reply
   .replace(/<think>[\s\S]*?<\/think>/gi,"")
   .replace(/<thinking>[\s\S]*?<\/thinking>/gi,"")
   .trim();


  return res.status(200).json({
   text:reply
  });


 }catch(error){

  console.error(error);

  return res.status(500).json({
   error:error.message||
    "Internal server error"
  });
 }
 }
