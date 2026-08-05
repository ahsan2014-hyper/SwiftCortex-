const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");
const sendBtn = document.getElementById("sendBtn");
const prompt = document.getElementById("prompt");
const chatArea = document.getElementById("chatArea");
const typing = document.getElementById("typing");

window.selectedImage = null;

// Upload Button
uploadBtn.addEventListener("click", () => {
    imageInput.click();
});

// Image Selected
imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {

        window.selectedImage = reader.result;

        // Show image preview in chat
        const div = document.createElement("div");
        div.className = "user message";

        const img = document.createElement("img");
        img.src = window.selectedImage;
        img.alt = "Selected Image";
        img.style.maxWidth = "260px";
        img.style.width = "100%";
        img.style.borderRadius = "12px";
        img.style.display = "block";

        div.appendChild(img);

        chatArea.appendChild(div);

        chatArea.scrollTop = chatArea.scrollHeight;
    };

    reader.readAsDataURL(file);

});

// Send Button
sendBtn.addEventListener("click", sendMessage);

// Enter Key
prompt.addEventListener("keydown", function (e) {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});

async function sendMessage() {

    const text = prompt.value.trim();

    if (text === "" && !window.selectedImage) return;

    if (text !== "") {
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
                image: window.selectedImage
            })

        });

        const data = await response.json();

        typing.style.display = "none";

        sendBtn.disabled = false;

        sendBtn.innerHTML = "➜ Send";

        addMessage(data.text || "No response.", "bot");

        // Clear selected image
        window.selectedImage = null;

        imageInput.value = "";

    } catch (e) {

        typing.style.display = "none";

        sendBtn.disabled = false;

        sendBtn.innerHTML = "➜ Send";

        addMessage("❌ Error: " + e.message, "bot");

    }

}

// Text Messages
function addMessage(message, type) {

    const div = document.createElement("div");

    div.className = type + " message";

    div.textContent = message;

    chatArea.appendChild(div);

    chatArea.scrollTop = chatArea.scrollHeight;

}
