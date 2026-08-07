const messages = document.getElementById("messages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const plusBtn = document.getElementById("plusBtn");
const plusMenu = document.getElementById("plusMenu");

const imageInput = document.getElementById("imageInput");
const fileInput = document.getElementById("fileInput");

const imagePreview = document.getElementById("imagePreview");

let selectedImage = null;


// Plus Menu

plusBtn.onclick = (e) => {
    e.stopPropagation();
    plusMenu.classList.toggle("show");
};


document.addEventListener("click", () => {
    plusMenu.classList.remove("show");
});



// Gallery

document.getElementById("photoBtn").onclick = () => {
    imageInput.click();
};



// Real Camera

document.getElementById("cameraBtn").onclick = async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });


        const video = document.createElement("video");

        video.srcObject = stream;
        video.autoplay = true;
        video.style.width = "250px";
        video.style.borderRadius = "15px";


        imagePreview.innerHTML = "";
        imagePreview.appendChild(video);



        const capture = document.createElement("button");

        capture.innerText = "📸 Capture";


        capture.onclick = () => {

            const canvas = document.createElement("canvas");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;


            canvas
            .getContext("2d")
            .drawImage(video,0,0);


            selectedImage = canvas.toDataURL("image/jpeg");


            stream.getTracks().forEach(track=>{
                track.stop();
            });


            imagePreview.innerHTML =
            "📷 Camera image ready";

        };


        imagePreview.appendChild(capture);



    } catch(error){

        alert("Camera permission denied");

        console.log(error);

    }

};




// Files

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

    userInput.value +=
    " Give a detailed and thoughtful answer.";

};




// Image Upload

imageInput.onchange = () => {

    const file = imageInput.files[0];

    if(!file) return;


    const reader = new FileReader();


    reader.onload = () => {

        selectedImage = reader.result;


        imagePreview.innerHTML =
        `
        <div class="image-box">
        🖼 ${file.name}
        </div>
        `;

    };


    reader.readAsDataURL(file);

};




// Send

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


    userInput.value = "";



    const loading = addMessage(
        "⏳ Thinking...",
        "ai"
    );



    try {


        const response = await fetch(
            "/api/gemini",
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



        if(data.text){

            addMessage(
                data.text,
                "ai"
            );

        }

        else{

            addMessage(
                "⚠ "+(data.error || "No response"),
                "ai"
            );

        }



    } catch(error){


        loading.remove();


        addMessage(
            "❌ Connection error",
            "ai"
        );


        console.error(error);

    }



    selectedImage = null;

    imagePreview.innerHTML = "";

}




// Add Message

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

document.getElementById("newChat").onclick = () => {


    messages.innerHTML =
    `
    <div class="ai-message">
    👋 New chat started. How can I help?
    </div>
    `;


};
