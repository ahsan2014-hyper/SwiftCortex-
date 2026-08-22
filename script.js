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
/* =========================================================
   PLUS MENU OPTIONS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const plusMenu =
        document.getElementById("plusMenu");

    const cameraBtn =
        document.getElementById("cameraBtn");

    const photoBtn =
        document.getElementById("photoBtn");

    const fileBtn =
        document.getElementById("fileBtn");

    const pluginBtn =
        document.getElementById("pluginBtn");

    const thinkBtn =
        document.getElementById("thinkBtn");

    const imageInput =
        document.getElementById("imageInput");

    const fileInput =
        document.getElementById("fileInput");

    const cameraModal =
        document.getElementById("cameraModal");


    /* Close menu */

    function closeMenu() {

        if (plusMenu) {
            plusMenu.classList.remove("show");
        }

    }


    /* =====================================================
       📷 CAMERA
    ===================================================== */

    if (cameraBtn) {

        cameraBtn.onclick = async function () {

            closeMenu();

            if (!cameraModal) {
                alert("Camera interface not found.");
                return;
            }

            cameraModal.classList.add("show");

            const video =
                document.getElementById("cameraVideo");

            try {

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true
                    });

                window.swiftCameraStream = stream;

                if (video) {
                    video.srcObject = stream;
                    await video.play();
                }

            } catch (error) {

                console.error(
                    "Camera error:",
                    error
                );

                const errorText =
                    document.getElementById(
                        "cameraErrorText"
                    );

                if (errorText) {
                    errorText.textContent =
                        "Camera permission denied or camera unavailable.";
                }

                const errorBox =
                    document.getElementById(
                        "cameraError"
                    );

                if (errorBox) {
                    errorBox.style.display = "flex";
                }

            }

        };

    }


    /* =====================================================
       🖼 PHOTOS
    ===================================================== */

    if (photoBtn && imageInput) {

        photoBtn.onclick = function () {

            closeMenu();

            imageInput.click();

        };

    }


    /* =====================================================
       📄 FILES
    ===================================================== */

    if (fileBtn && fileInput) {

        fileBtn.onclick = function () {

            closeMenu();

            fileInput.click();

        };

    }


    /* =====================================================
       🧩 PLUGINS
    ===================================================== */

    if (pluginBtn) {

        pluginBtn.onclick = function () {

            closeMenu();

            if (pluginBtn) {

    pluginBtn.onclick = function (event) {

        event.preventDefault();

        closeMenu();

        openPluginPanel();

    };

}


/* =====================================================
   PLUGIN PANEL
===================================================== */

function openPluginPanel() {

    let panel =
        document.getElementById("swiftPluginPanel");

    if (!panel) {

        panel =
            document.createElement("div");

        panel.id =
            "swiftPluginPanel";

        panel.innerHTML = `

            <div class="plugin-panel-box">

                <div class="plugin-header">

                    <div>
                        <h2>🧩 Plugins</h2>
                        <p>Choose a tool for SwiftCortex AI</p>
                    </div>

                    <button
                        id="pluginClose"
                        class="plugin-close"
                    >
                        ✕
                    </button>

                </div>


                <div class="plugin-grid">

                    <button
                        class="plugin-card"
                        data-plugin="web"
                    >
                        <span>🌐</span>
                        <strong>Web Search</strong>
                        <small>Search the web</small>
                    </button>


                    <button
                        class="plugin-card"
                        data-plugin="calculator"
                    >
                        <span>🧮</span>
                        <strong>Calculator</strong>
                        <small>Calculate anything</small>
                    </button>


                    <button
                        class="plugin-card"
                        data-plugin="weather"
                    >
                        <span>🌤</span>
                        <strong>Weather</strong>
                        <small>Check weather</small>
                    </button>


                    <button
                        class="plugin-card"
                        data-plugin="image"
                    >
                        <span>🖼</span>
                        <strong>Image Tools</strong>
                        <small>Work with images</small>
                    </button>


                    <button
                        class="plugin-card"
                        data-plugin="files"
                    >
                        <span>📄</span>
                        <strong>File Tools</strong>
                        <small>Work with files</small>
                    </button>


                    <button
                        class="plugin-card"
                        data-plugin="more"
                    >
                        <span>🔌</span>
                        <strong>More Plugins</strong>
                        <small>Coming soon</small>
                    </button>

                </div>

            </div>

        `;

        document.body.appendChild(panel);


        /* Close */

        document
            .getElementById("pluginClose")
            .onclick = function () {

                closePluginPanel();

            };


        /* Plugin buttons */

        panel
            .querySelectorAll(".plugin-card")
            .forEach(function (button) {

                button.onclick =
                    function () {

                        const plugin =
                            button.dataset.plugin;

                        handlePlugin(plugin);

                    };

            });

    }


    panel.classList.add("active");

}


/* =====================================================
   CLOSE PLUGIN PANEL
===================================================== */

function closePluginPanel() {

    const panel =
        document.getElementById(
            "swiftPluginPanel"
        );

    if (panel) {

        panel.classList.remove(
            "active"
        );

    }

}


/* =====================================================
   PLUGIN ACTION
===================================================== */

function handlePlugin(plugin) {

    switch (plugin) {

        case "web":

            closePluginPanel();

            addMessage(
                "🌐 Web Search plugin selected.",
                "ai"
            );

            break;


        case "calculator":

            closePluginPanel();

            addMessage(
                "🧮 Calculator plugin selected.",
                "ai"
            );

            break;


        case "weather":

            closePluginPanel();

            addMessage(
                "🌤 Weather plugin selected.",
                "ai"
            );

            break;


        case "image":

            closePluginPanel();

            addMessage(
                "🖼 Image Tools plugin selected.",
                "ai"
            );

            break;


        case "files":

            closePluginPanel();

            addMessage(
                "📄 File Tools plugin selected.",
                "ai"
            );

            break;


        case "more":

            addMessage(
                "🔌 More plugins are coming soon.",
                "ai"
            );

            break;

    }

}

        };

    }


    /* =====================================================
       🧠 THINK HARDER
    ===================================================== */

    if (thinkBtn) {

        thinkBtn.onclick = function () {

            closeMenu();

            window.swiftCortexThinkHarder =
                !window.swiftCortexThinkHarder;

            if (
                window.swiftCortexThinkHarder
            ) {

                thinkBtn.textContent =
                    "🧠 Think Harder ✓";

            } else {

                thinkBtn.textContent =
                    "🧠 Think Harder";

            }

            console.log(
                "Think Harder:",
                window.swiftCortexThinkHarder
            );

        };

    }


    /* =====================================================
       CAMERA CLOSE
    ===================================================== */

    const cameraClose =
        document.getElementById("cameraClose");


    if (cameraClose) {

        cameraClose.onclick = function () {

            if (
                window.swiftCameraStream
            ) {

                window.swiftCameraStream
                    .getTracks()
                    .forEach(
                        track => track.stop()
                    );

                window.swiftCameraStream =
                    null;

            }

            if (cameraModal) {
                cameraModal.classList.remove(
                    "show"
                );
            }

        };

    }


    /* =====================================================
       PHOTO SELECTED
    ===================================================== */

    if (imageInput) {

        imageInput.onchange =
            function () {

                const file =
                    imageInput.files[0];

                if (!file) return;

                console.log(
                    "🖼 Photo selected:",
                    file.name
                );

                const preview =
                    document.getElementById(
                        "imagePreview"
                    );

                if (preview) {

                    preview.innerHTML = "";

                    const img =
                        document.createElement(
                            "img"
                        );

                    img.src =
                        URL.createObjectURL(
                            file
                        );

                    img.style.maxWidth =
                        "180px";

                    img.style.maxHeight =
                        "130px";

                    img.style.borderRadius =
                        "12px";

                    preview.appendChild(img);

                }

                /*
                 Store image globally.
                 Your existing sendMessage()
                 can use this later.
                */

                window.swiftCortexSelectedImage =
                    file;

            };

    }


    /* =====================================================
       FILE SELECTED
    ===================================================== */

    if (fileInput) {

        fileInput.onchange =
            function () {

                const file =
                    fileInput.files[0];

                if (!file) return;

                console.log(
                    "📄 File selected:",
                    file.name
                );

                window.swiftCortexSelectedFile =
                    file;

                alert(
                    "📄 File selected:\n" +
                    file.name
                );

            };

    }


    console.log(
        "✅ Plus options initialized"
    );

});
