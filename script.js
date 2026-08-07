const messages = document.getElementById("messages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const plusBtn = document.getElementById("plusBtn");
const plusMenu = document.getElementById("plusMenu");

const imageInput = document.getElementById("imageInput");
const fileInput = document.getElementById("fileInput");

const imagePreview = document.getElementById("imagePreview");

let selectedImage = null;


// Plus Menu Toggle
plusBtn.onclick = () => {
    plusMenu.classList.toggle("show");
};


// Close menu when clicking outside
document.addEventListener("click", (e)=>{

    if(!plusBtn.contains(e.target) && !plusMenu.contains(e.target)){
        plusMenu.classList.remove("show");
    }

});


// Photos button
document.getElementById("photoBtn").onclick = () => {
    imageInput.click();
};


// Camera button
document.getElementById("cameraBtn").onclick = () => {
    imageInput.click();
};


// Files button
document.getElementById("fileBtn").onclick = () => {
    fileInput.click();
};


// Plugins
document.getElementById("pluginBtn").onclick = () => {

    addMessage(
        "🧩 Plugins feature coming soon...",
        "ai"
    );

};


// Think Harder
document.getElementById("thinkBtn").onclick = () => {

    userInput.value += " Think deeply and provide a detailed answer.";

};



// Image Select

imageInput.onchange = () => {

    const file = imageInput.files[0];

    if(!file) return;


    const reader = new FileReader();


    reader.onload = () => {

        selectedImage = reader.result;


        imagePreview.innerHTML = `
        <div class="image-box">
        🖼 ${file.name}
        </div>
        `;

    };


    reader.readAsDataURL(file);

};




// Send Message

sendBtn.onclick = sendMessage;


userInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();
        sendMessage();

    }

});





async function sendMessage(){

    const text = userInput.value.trim();


    if(!text && !selectedImage) return;



    addMessage(text,"user");


    userInput.value="";



    const loading = addMessage(
        "⏳ Thinking...",
        "ai"
    );



    try{


        const response = await fetch(
            "/.netlify/functions/gemini",
            {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },


            body:JSON.stringify({

                message:text,

                image:selectedImage

            })


        });



        const data = await response.json();



        loading.remove();



        if(data.reply){

            addMessage(
                data.reply,
                "ai"
            );

        }

        else{

            addMessage(
                "⚠ No response from AI",
                "ai"
            );

        }



    }

    catch(error){

        loading.remove();


        addMessage(
            "❌ Connection error",
            "ai"
        );


        console.error(error);

    }



    selectedImage=null;

    imagePreview.innerHTML="";

}




// Add Message Function

function addMessage(text,type){


    const div=document.createElement("div");


    div.className =
    type==="user"
    ? "user-message"
    : "ai-message";


    div.innerText=text;



    messages.appendChild(div);



    messages.scrollTop =
    messages.scrollHeight;



    return div;

}




// New Chat

document.getElementById("newChat").onclick=()=>{

    messages.innerHTML=
    `
    <div class="ai-message">
    👋 New chat started. How can I help?
    </div>
    `;

};
