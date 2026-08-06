const plusBtn = document.getElementById("plusBtn");
const plusMenu = document.getElementById("plusMenu");

const imageInput = document.getElementById("imageInput");
const sendBtn = document.getElementById("sendBtn");
const promptBox = document.getElementById("prompt");
const chatArea = document.getElementById("chatArea");
const typing = document.getElementById("typing");

let selectedImage = null;


// Open / Close Plus Menu
if (plusBtn && plusMenu) {

    plusBtn.addEventListener("click", () => {

        plusMenu.style.display =
            plusMenu.style.display === "flex"
            ? "none"
            : "flex";

    });

}



// Camera Button
const cameraBtn = document.getElementById("cameraBtn");

if (cameraBtn && imageInput) {

    cameraBtn.addEventListener("click", () => {

        imageInput.click();

    });

}



// Photos Button
const photosBtn = document.getElementById("photosBtn");

if (photosBtn && imageInput) {

    photosBtn.addEventListener("click", () => {

        imageInput.click();

    });

}



// Image Upload
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
if (sendBtn) {

    sendBtn.addEventListener("click", sendMessage);

}



// Enter Send
if (promptBox) {

    promptBox.addEventListener("keydown", (e) => {

        if (e.key === "Enter" && !e.shiftKey) {

            e.preventDefault();

            sendMessage();

        }

    });

}





async function sendMessage() {


    const message = promptBox.value.trim();


    if (!message && !selectedImage) return;



    if (message) {

        addMessage(message, "user");

    }


    promptBox.value = "";


    if (typing) {

        typing.style.display = "block";

    }


    if (sendBtn) {

        sendBtn.disabled = true;

        sendBtn.innerHTML = "⏳ Thinking...";

    }



    try {


        const response = await fetch("/api/gemini", {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },


            body:JSON.stringify({

                message:message,

                image:selectedImage

            })

        });



        const data = await response.json();



        addMessage(

            data.text || "No response from AI.",

            "bot"

        );



    }

    catch(error){


        addMessage(

            "❌ Error: " + error.message,

            "bot"

        );


    }



    finally{


        if (typing) {

            typing.style.display = "none";

        }


        if (sendBtn) {

            sendBtn.disabled = false;

            sendBtn.innerHTML = "➜ Send";

        }



        selectedImage = null;


        if (imageInput) {

            imageInput.value = "";

        }


    }


}





function addMessage(text,type){


    const div = document.createElement("div");


    div.className = type + " message";


    div.textContent = text;


    chatArea.appendChild(div);


    chatArea.scrollTop = chatArea.scrollHeight;


}





function addImage(src){


    const div = document.createElement("div");


    div.className = "user message";



    const img = document.createElement("img");


    img.src = src;


    img.alt = "Uploaded image";


    div.appendChild(img);



    chatArea.appendChild(div);


    chatArea.scrollTop = chatArea.scrollHeight;


                         }
// Extra Plus Menu Buttons

const filesBtn = document.getElementById("filesBtn");
const pluginsBtn = document.getElementById("pluginsBtn");
const thinkBtn = document.getElementById("thinkBtn");
const cameraBtn = document.getElementById("cameraBtn");
const photosBtn = document.getElementById("photosBtn");

if(cameraBtn){
    cameraBtn.onclick = () => {
        imageInput.click();
    };
}

if(photosBtn){
    photosBtn.onclick = () => {
        imageInput.click();
    };
}

if(filesBtn){
    filesBtn.onclick = () => {
        alert("Files upload coming soon");
    };
}

if(pluginsBtn){
    pluginsBtn.onclick = () => {
        alert("Plugins feature coming soon");
    };
}

if(thinkBtn){
    thinkBtn.onclick = () => {
        alert("Think harder mode activated");
    };
}
