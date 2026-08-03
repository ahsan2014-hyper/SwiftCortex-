

const sendBtn = document.getElementById("sendBtn");
const prompt = document.getElementById("prompt");
const chatArea = document.getElementById("chatArea");
const typing = document.getElementById("typing");

sendBtn.addEventListener("click", sendMessage);
prompt.addEventListener("keydown", function(e){

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();

        sendMessage();

    }

});
async function sendMessage() {

    const text = prompt.value.trim();

if(text==="") return;

sendBtn.disabled = true;
sendBtn.innerHTML = "⏳ Thinking...";

    addMessage(text,"user");

    prompt.value="";

    typing.style.display="block";

    try{

        const response = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        message: text
    })
});

        const data=await response.json();

        typing.style.display = "none";
sendBtn.disabled = false;
sendBtn.innerHTML = "➜ Send";

        const reply = data.text || "No response.";

        addMessage(reply,"bot");

}catch(e){

    typing.style.display = "none";
sendBtn.disabled = false;
sendBtn.innerHTML = "➜ Send";
    addMessage("Error : " + e.message, "bot");

    }

}

function addMessage(message,type){

    const div=document.createElement("div");

    div.className=type+" message";

    div.textContent = message;

    chatArea.appendChild(div);

    chatArea.scrollTop = chatArea.scrollHeight;

}

