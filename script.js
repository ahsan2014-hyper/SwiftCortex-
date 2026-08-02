const API_KEY = "YOUR_GEMINI_API_KEY";

const sendBtn = document.getElementById("sendBtn");
const prompt = document.getElementById("prompt");
const chatArea = document.getElementById("chatArea");
const typing = document.getElementById("typing");

sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {

    const text = prompt.value.trim();

    if(text==="") return;

    addMessage(text,"user");

    prompt.value="";

    typing.style.display="block";

    try{

        const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="+API_KEY,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                contents:[
                    {
                        parts:[
                            {
                                text:text
                            }
                        ]
                    }
                ]
            })
        });

        const data=await response.json();

        typing.style.display="none";

        const reply=
        data.candidates?.[0]?.content?.parts?.[0]?.text
        || "No response.";

        addMessage(reply,"bot");

    }catch(e){

        typing.style.display="none";

        addMessage("Error : "+e.message,"bot");

    }

}

function addMessage(message,type){

    const div=document.createElement("div");

    div.className=type+" message";

    div.innerHTML=message.replace(/\n/g,"<br>");

    chatArea.appendChild(div);

    chatArea.scrollTop=chatArea.scrollHeight;

          }
