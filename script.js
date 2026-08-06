const plusBtn = document.getElementById("plusBtn");
const plusMenu = document.getElementById("plusMenu");

const imageInput = document.getElementById("imageInput");
const sendBtn = document.getElementById("sendBtn");
const prompt = document.getElementById("prompt");
const chatArea = document.getElementById("chatArea");
const typing = document.getElementById("typing");

let selectedImage = null;


// Plus Menu Open / Close
if (plusBtn) {
    plusBtn.addEventListener("click", () => {

        if (plusMenu.style.display === "block") {
            plusMenu.style.display = "none";
        } else {
            plusMenu.style.display = "block";
        }

    });
}


// Camera / Photos Button
const cameraBtn = document.getElementById("cameraBtn");
const photosBtn = document.getElementById("photosBtn");

if (cameraBtn) {
    cameraBtn.addEventListener("click", () => {
        imageInput.click();
    });
}

if (photosBtn) {
    photosBtn.addEventListener("click", () => {
        imageInput.click();
    });
}


// Image Selected
if (imageInput) {

    imageInput.addEventListener("change", () => {

        const file = imageInput.files[0];

        if (!file) return;


        const reader = new FileReader();


        reader.onload = () => {

            selectedImage = reader.result;


            addImage(selectedImage);

        };


        reader.readAsDataURL(file);

    });

}



// Send Button
sendBtn.addEventListener("click", sendMessage);


// Enter Send
prompt.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});




// Main AI Function
async function sendMessage() {


    const text = prompt.value.trim();


    if (!text && !selectedImage) return;



    if (text) {

        addMessage(text, "user");

    }



    prompt.value = "";


    typing.style.display = "block";


    sendBtn.disabled = true;

    sendBtn.innerHTML = "⏳ Thinking...";



    try {


        const response = await fetch("/api/gemini", {


            method: "POST",


            headers: {

                "Content-Type": "application/json"

            },


            body: JSON.stringify({

                message: text,

                image: selectedImage

            })


        });



        const data = await response.json();



        typing.style.display = "none";


        addMessage(
            data.text || "No response from AI.",
            "bot"
        );



        selectedImage = null;

        imageInput.value = "";



    } catch (error) {


        typing.style.display = "none";


        addMessage(
            "❌ Error: " + error.message,
            "bot"
        );


    }



    sendBtn.disabled = false;

    sendBtn.innerHTML = "➜ Send";


}





// Add Text Message
function addMessage(message, type) {


    const div = document.createElement("div");


    div.className = type + " message";


    div.textContent = message;


    chatArea.appendChild(div);


    chatArea.scrollTop = chatArea.scrollHeight;


}




// Add Image Preview
function addImage(src) {


    const div = document.createElement("div");


    div.className = "user message";



    const img = document.createElement("img");


    img.src = src;


    img.style.maxWidth = "260px";

    img.style.borderRadius = "12px";



    div.appendChild(img);


    chatArea.appendChild(div);


    chatArea.scrollTop = chatArea.scrollHeight;


}
