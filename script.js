/* =========================================================
   ⚡ SwiftCortex AI Ultra
   Stable Script
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("⚡ SwiftCortex script started");

    const sendBtn = document.getElementById("sendBtn");
    const userInput = document.getElementById("userInput");
    const messages = document.getElementById("messages");

    const plusBtn = document.getElementById("plusBtn");
    const plusMenu = document.getElementById("plusMenu");

    const cameraBtn = document.getElementById("cameraBtn");
    const photoBtn = document.getElementById("photoBtn");
    const fileBtn = document.getElementById("fileBtn");
    const pluginBtn = document.getElementById("pluginBtn");
    const thinkBtn = document.getElementById("thinkBtn");

    const imageInput = document.getElementById("imageInput");
    const fileInput = document.getElementById("fileInput");

    const imagePreview = document.getElementById("imagePreview");

    let selectedImage = null;
    let selectedVideo = null;
    let isSending = false;
    let thinkHarder = false;

    let cameraStream = null;
    let mediaRecorder = null;
    let recordedChunks = [];

    /* =====================================================
       BASIC CHECK
    ===================================================== */

    console.log("Send:", !!sendBtn);
    console.log("Input:", !!userInput);
    console.log("Messages:", !!messages);
    console.log("Plus:", !!plusBtn);


    /* =====================================================
       MESSAGE DISPLAY
    ===================================================== */

    function addMessage(text, type = "ai", image = null, video = null) {

        if (!messages) {
            console.error("❌ #messages not found");
            return null;
        }

        const box = document.createElement("div");

        box.className =
            type === "user"
                ? "user-message"
                : "ai-message";

        if (text) {

            const textDiv =
                document.createElement("div");

            textDiv.textContent = text;

            box.appendChild(textDiv);
        }


        if (image) {

            const img =
                document.createElement("img");

            img.src =
                URL.createObjectURL(image);

            img.style.maxWidth = "280px";
            img.style.maxHeight = "300px";
            img.style.marginTop = "8px";
            img.style.borderRadius = "14px";
            img.style.display = "block";

            box.appendChild(img);
        }


        if (video) {

            const videoElement =
                document.createElement("video");

            videoElement.src = video;
            videoElement.controls = true;
            videoElement.playsInline = true;

            videoElement.style.maxWidth = "320px";
            videoElement.style.maxHeight = "300px";
            videoElement.style.marginTop = "8px";
            videoElement.style.borderRadius = "14px";

            box.appendChild(videoElement);
        }


        messages.appendChild(box);

        messages.scrollTop =
            messages.scrollHeight;

        return box;
    }


    /* =====================================================
       🚀 SEND MESSAGE
       THIS IS KEPT SIMPLE AND STABLE
    ===================================================== */

    async function sendMessage() {

        if (isSending) return;

        const text =
            userInput.value.trim();

        console.log("📤 Sending:", text);


        if (
            !text &&
            !selectedImage &&
            !selectedVideo
        ) {

            return;
        }


        isSending = true;


        const imageFile =
            selectedImage;

        const videoFile =
            selectedVideo;


        let videoURL = null;

        if (videoFile) {

            videoURL =
                URL.createObjectURL(videoFile);

        }


        /* Show user message */

        addMessage(
            text,
            "user",
            imageFile,
            videoURL
        );


        userInput.value = "";


        /* Loading */

        const loading =
            addMessage(
                "⏳ Thinking...",
                "ai"
            );


        try {

            let imageBase64 = null;


            /* Image → Base64 */

            if (imageFile) {

                imageBase64 =
                    await fileToBase64(
                        imageFile
                    );

            }


            /* Video frames */

            let videoFrames = [];

            if (videoFile) {

                try {

                    videoFrames =
                        await extractVideoFrames(
                            videoFile
                        );

                } catch (videoError) {

                    console.warn(
                        "Video frame error:",
                        videoError
                    );

                    videoFrames = [];
                }
            }


            /* Think Harder */

            let finalMessage =
                text;

            if (thinkHarder) {

                finalMessage =
                    `Please analyze this request carefully and provide an accurate, useful answer.

User request:
${text}`;

            }


            console.log(
                "📡 Calling /api/gemini"
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

                                message:
                                    finalMessage,

                                image:
                                    imageBase64,

                                videoFrames:
                                    videoFrames

                            })
                    }
                );


            console.log(
                "📡 API status:",
                response.status
            );


            const raw =
                await response.text();


            console.log(
                "📡 API response:",
                raw
            );


            if (loading) {
                loading.remove();
            }


            let data;

            try {

                data =
                    JSON.parse(raw);

            } catch {

                addMessage(
                    "❌ Server returned an invalid response.",
                    "ai"
                );

                return;
            }


            if (
                response.ok &&
                data &&
                data.text
            ) {

                addMessage(
                    data.text,
                    "ai"
                );

            } else {

                addMessage(
                    "⚠️ " +
                    (
                        data?.error ||
                        "No response from AI."
                    ),
                    "ai"
                );

            }


        } catch (error) {

            console.error(
                "❌ Send error:",
                error
            );


            if (loading) {
                loading.remove();
            }


            addMessage(
                "❌ " +
                (
                    error.message ||
                    "Connection error."
                ),
                "ai"
            );

        } finally {

            isSending = false;

            selectedImage = null;
            selectedVideo = null;

            if (imageInput) {
                imageInput.value = "";
            }

            if (fileInput) {
                fileInput.value = "";
            }

            if (imagePreview) {
                imagePreview.innerHTML = "";
            }

        }
    }


    /* =====================================================
       SEND BUTTON
    ===================================================== */

    if (sendBtn) {

        sendBtn.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                console.log(
                    "🟢 SEND CLICKED"
                );

                sendMessage();

            }
        );

    } else {

        console.error(
            "❌ sendBtn not found"
        );

    }


    /* =====================================================
       ENTER TO SEND
    ===================================================== */

    if (userInput) {

        userInput.addEventListener(
            "keydown",
            function(event) {

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


    /* =====================================================
       ➕ PLUS MENU
    ===================================================== */

    if (plusBtn && plusMenu) {

        plusBtn.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                plusMenu.classList.toggle(
                    "show"
                );

            }
        );


        plusMenu.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            function() {

                plusMenu.classList.remove(
                    "show"
                );

            }
        );

    }


    function closePlusMenu() {

        if (plusMenu) {

            plusMenu.classList.remove(
                "show"
            );

        }

    }


    /* =====================================================
       🖼 PHOTOS
    ===================================================== */

    if (photoBtn && imageInput) {

        photoBtn.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                closePlusMenu();

                imageInput.click();

            }
        );


        imageInput.addEventListener(
            "change",
            function() {

                const file =
                    imageInput.files?.[0];

                if (!file) return;


                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    addMessage(
                        "⚠️ Please select an image.",
                        "ai"
                    );

                    return;
                }


                selectedImage = file;
                selectedVideo = null;


                showPreview(
                    file,
                    "image"
                );

            }
        );

    }


    /* =====================================================
       📄 FILES
    ===================================================== */

    if (fileBtn && fileInput) {

        fileBtn.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                closePlusMenu();

                fileInput.click();

            }
        );


        fileInput.addEventListener(
            "change",
            async function() {

                const file =
                    fileInput.files?.[0];

                if (!file) return;


                /* Image */

                if (
                    file.type.startsWith(
                        "image/"
                    )
                ) {

                    selectedImage = file;
                    selectedVideo = null;

                    showPreview(
                        file,
                        "image"
                    );

                    return;
                }


                /* Video */

                if (
                    file.type.startsWith(
                        "video/"
                    )
                ) {

                    selectedVideo = file;
                    selectedImage = null;

                    showPreview(
                        file,
                        "video"
                    );

                    return;
                }


                /* TXT */

                if (
                    file.type ===
                        "text/plain" ||
                    file.name
                        .toLowerCase()
                        .endsWith(".txt")
                ) {

                    try {

                        const text =
                            await file.text();

                        userInput.value =
                            text;

                        userInput.focus();

                    } catch {

                        addMessage(
                            "⚠️ Could not read this file.",
                            "ai"
                        );

                    }

                    return;
                }


                addMessage(
                    "📄 " +
                    file.name +
                    " selected. This file type is not supported yet.",
                    "ai"
                );

            }
        );

    }


    /* =====================================================
       ATTACHMENT PREVIEW
    ===================================================== */

    function showPreview(file, type) {

        if (!imagePreview) return;


        imagePreview.innerHTML = "";


        const wrapper =
            document.createElement("div");


        wrapper.style.padding = "8px";
        wrapper.style.position = "relative";


        let media;


        if (type === "image") {

            media =
                document.createElement(
                    "img"
                );

        } else {

            media =
                document.createElement(
                    "video"
                );

            media.controls = true;
        }


        media.src =
            URL.createObjectURL(file);

        media.style.maxWidth = "220px";
        media.style.maxHeight = "140px";
        media.style.borderRadius = "12px";


        wrapper.appendChild(media);


        const name =
            document.createElement("div");

        name.textContent =
            "📎 " + file.name;

        name.style.fontSize = "12px";
        name.style.color = "#9ca3af";

        wrapper.appendChild(name);


        const remove =
            document.createElement("button");

        remove.textContent = "✕";

        remove.type = "button";

        remove.style.marginLeft = "8px";
        remove.style.border = "0";
        remove.style.borderRadius = "50%";
        remove.style.background = "#ef4444";
        remove.style.color = "white";
        remove.style.cursor = "pointer";


        remove.onclick =
            function() {

                selectedImage = null;
                selectedVideo = null;

                imagePreview.innerHTML = "";

                if (imageInput)
                    imageInput.value = "";

                if (fileInput)
                    fileInput.value = "";

            };


        wrapper.appendChild(remove);

        imagePreview.appendChild(wrapper);

    }


    /* =====================================================
       📷 CAMERA
    ===================================================== */

    if (cameraBtn) {

        cameraBtn.addEventListener(
            "click",
            async function(event) {

                event.preventDefault();

                closePlusMenu();

                await openCamera();

            }
        );

    }


    async function openCamera() {

        const modal =
            document.getElementById(
                "cameraModal"
            );

        const video =
            document.getElementById(
                "cameraVideo"
            );


        if (!modal || !video) {

            addMessage(
                "❌ Camera interface not found.",
                "ai"
            );

            return;
        }


        modal.classList.add("show");


        try {

            cameraStream =
                await navigator
                    .mediaDevices
                    .getUserMedia({

                        video: {
                            facingMode: "user"
                        },

                        audio: true

                    });


            video.srcObject =
                cameraStream;


            await video.play();


        } catch (error) {

            console.error(
                "Camera error:",
                error
            );


            const errorBox =
                document.getElementById(
                    "cameraError"
                );

            const errorText =
                document.getElementById(
                    "cameraErrorText"
                );


            if (errorBox) {

                errorBox.classList.add(
                    "show"
                );

                errorBox.style.display =
                    "flex";

            }


            if (errorText) {

                errorText.textContent =
                    "Please allow camera permission in your browser.";

            }

        }

    }


    /* =====================================================
       CAMERA CLOSE
    ===================================================== */

    const cameraClose =
        document.getElementById(
            "cameraClose"
        );


    if (cameraClose) {

        cameraClose.addEventListener(
            "click",
            closeCamera
        );

    }


    function closeCamera() {

        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

            cameraStream = null;

        }


        const modal =
            document.getElementById(
                "cameraModal"
            );


        const video =
            document.getElementById(
                "cameraVideo"
            );


        if (video) {
            video.srcObject = null;
        }


        if (modal) {

            modal.classList.remove(
                "show"
            );

        }

    }


    /* =====================================================
       📸 TAKE PHOTO
    ===================================================== */

    const takePhoto =
        document.getElementById(
            "takePhoto"
        );


    if (takePhoto) {

        takePhoto.addEventListener(
            "click",
            function() {

                const video =
                    document.getElementById(
                        "cameraVideo"
                    );


                if (
                    !video ||
                    !cameraStream
                ) {

                    return;
                }


                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.width =
                    video.videoWidth;

                canvas.height =
                    video.videoHeight;


                const ctx =
                    canvas.getContext(
                        "2d"
                    );


                ctx.drawImage(
                    video,
                    0,
                    0,
                    c
