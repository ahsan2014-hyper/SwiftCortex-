document.addEventListener("DOMContentLoaded", function () {

    console.log("SwiftCortex JS LOADED");

    const sendBtn = document.getElementById("sendBtn");
    const userInput = document.getElementById("userInput");
    const messages = document.getElementById("messages");

    const plusBtn = document.getElementById("plusBtn");
    const plusMenu = document.getElementById("plusMenu");

    /* =========================
       SEND MESSAGE
    ========================= */

    async function sendMessage() {

        const text = userInput.value.trim();

        if (!text) return;

        addMessage(text, "user");

        userInput.value = "";

        const loading = addMessage(
            "⏳ Thinking...",
            "ai"
        );

        try {

            const response = await fetch("/api/gemini", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: text
                })

            });

            const data = await response.json();

            loading.remove();

            if (response.ok && data.text) {

                addMessage(
                    data.text,
                    "ai"
                );

            } else {

                addMessage(
                    "⚠️ " +
                    (data.error || "No response from AI."),
                    "ai"
                );

            }

        } catch (error) {

            console.error(error);

            loading.remove();

            addMessage(
                "❌ Connection error: " +
                error.message,
                "ai"
            );

        }

    }


    /* =========================
       SEND BUTTON
    ========================= */

    if (sendBtn) {

        sendBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                console.log("SEND BUTTON CLICKED");

                sendMessage();

            }
        );

    }


    /* =========================
       ENTER
    ========================= */

    if (userInput) {

        userInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    /* =========================
       PLUS BUTTON
    ========================= */

    if (plusBtn && plusMenu) {

        plusBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                console.log("PLUS CLICKED");

                plusMenu.classList.toggle("show");

            }
        );


        plusMenu.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            function () {

                plusMenu.classList.remove("show");

            }
        );

    }


    /* =========================
       MESSAGE
    ========================= */

    function addMessage(text, type) {

        if (!messages) return null;

        const message =
            document.createElement("div");


        if (type === "user") {

            message.className =
                "user-message";

        } else {

            message.className =
                "ai-message";

        }


        message.textContent = text;


        messages.appendChild(message);


        messages.scrollTop =
            messages.scrollHeight;


        return message;

    }


    console.log(
        "✅ SwiftCortex JS READY"
    );

});
