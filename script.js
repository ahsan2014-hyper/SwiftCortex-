console.log("🔥 SCRIPT.JS IS LOADED");

window.addEventListener("load", function () {

    console.log("🔥 PAGE LOADED");

    const sendBtn = document.getElementById("sendBtn");
    const userInput = document.getElementById("userInput");
    const messages = document.getElementById("messages");

    console.log("sendBtn =", sendBtn);
    console.log("userInput =", userInput);
    console.log("messages =", messages);


    if (!sendBtn) {
        alert("❌ sendBtn পাওয়া যায়নি");
        return;
    }

    if (!userInput) {
        alert("❌ userInput পাওয়া যায়নি");
        return;
    }

    if (!messages) {
        alert("❌ messages পাওয়া যায়নি");
        return;
    }


    sendBtn.onclick = async function () {

        console.log("🟢 SEND BUTTON CLICKED");

        const text = userInput.value.trim();

        console.log("MESSAGE =", text);

        if (!text) {
            alert("আগে Hi লিখুন");
            return;
        }


        /* Show user message */

        const userMessage =
            document.createElement("div");

        userMessage.className =
            "user-message";

        userMessage.textContent =
            text;

        messages.appendChild(
            userMessage
        );


        userInput.value = "";


        /* Loading */

        const loading =
            document.createElement("div");

        loading.className =
            "ai-message";

        loading.textContent =
            "⏳ Thinking...";

        messages.appendChild(
            loading
        );


        try {

            console.log(
                "📡 Sending to /api/gemini"
            );


            const response =
                await fetch(
                    "/api/gemini",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                message: text
                            })
                    }
                );


            console.log(
                "STATUS =",
                response.status
            );


            const raw =
                await response.text();


            console.log(
                "SERVER RAW =",
                raw
            );


            loading.remove();


            let data;

            try {

                data =
                    JSON.parse(raw);

            } catch {

                const errorMessage =
                    document.createElement(
                        "div"
                    );

                errorMessage.className =
                    "ai-message";

                errorMessage.textContent =
                    "❌ Server response: " +
                    raw;

                messages.appendChild(
                    errorMessage
                );

                return;
            }


            console.log(
                "DATA =",
                data
            );


            const aiMessage =
                document.createElement(
                    "div"
                );

            aiMessage.className =
                "ai-message";


            if (
                response.ok &&
                data.text
            ) {

                aiMessage.textContent =
                    data.text;

            } else {

                aiMessage.textContent =
                    "⚠️ " +
                    (
                        data.error ||
                        "AI returned no text."
                    );

            }


            messages.appendChild(
                aiMessage
            );


            messages.scrollTop =
                messages.scrollHeight;


        } catch (error) {

            console.error(
                "❌ ERROR =",
                error
            );


            loading.remove();


            const errorMessage =
                document.createElement(
                    "div"
                );

            errorMessage.className =
                "ai-message";


            errorMessage.textContent =
                "❌ " +
                error.message;


            messages.appendChild(
                errorMessage
            );

        }

    };


    console.log(
        "✅ SEND BUTTON READY"
    );

});
