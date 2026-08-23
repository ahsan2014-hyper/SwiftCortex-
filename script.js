"use strict";

const $ = id => document.getElementById(id);

const plusBtn = $("plusBtn");
const plusMenu = $("plusMenu");
const userInput = $("userInput");
const sendBtn = $("sendBtn");
const messages = $("messages");
const imagePreview = $("imagePreview");

const imageInput = $("imageInput");
const fileInput = $("fileInput");

const cameraModal = $("cameraModal");
const cameraVideo = $("cameraVideo");
const cameraClose = $("cameraClose");
const cameraError = $("cameraError");
const cameraErrorText = $("cameraErrorText");

const photoMode = $("photoMode");
const videoMode = $("videoMode");
const takePhoto = $("takePhoto");
const startRecord = $("startRecord");
const stopRecord = $("stopRecord");
const switchCamera = $("switchCamera");
const recordTime = $("recordTime");

let selectedImage = null;
let selectedVideo = null;
let selectedFile = null;

let cameraStream = null;
let cameraFacing = "user";

let recorder = null;
let chunks = [];
let recordingTimer = null;
let recordingSeconds = 0;

let sending = false;
let thinkHarder = false;

let conversation = [];

const API_URL = "/api/gemini";


/* =========================
   MESSAGE
========================= */

function addMessage(text, type = "ai", attachment = null) {

    if (!messages) return null;

    const box = document.createElement("div");

    box.className =
        type === "user"
            ? "user-message"
            : "ai-message";

    if (text) {
        const t = document.createElement("div");
        t.textContent = text;
        box.appendChild(t);
    }

    if (attachment?.type === "image") {

        const img = document.createElement("img");

        img.src = attachment.url;
        img.alt = "";

        img.style.maxWidth = "280px";
        img.style.maxHeight = "280px";
        img.style.borderRadius = "14px";
        img.style.display = "block";
        img.style.marginTop = "8px";

        box.appendChild(img);
    }

    if (attachment?.type === "video") {

        const video = document.createElement("video");

        video.src = attachment.url;
        video.controls = true;
        video.playsInline = true;

        video.style.maxWidth = "300px";
        video.style.maxHeight = "280px";
        video.style.borderRadius = "14px";
        video.style.display = "block";
        video.style.marginTop = "8px";

        box.appendChild(video);
    }

    if (attachment?.type === "file") {

        const fileBox = document.createElement("div");

        fileBox.textContent =
            "📄 " + (attachment.name || "File");

        fileBox.style.marginTop = "8px";

        box.appendChild(fileBox);
    }

    messages.appendChild(box);

    messages.scrollTop = messages.scrollHeight;

    return box;
}


/* =========================
   PLUS MENU
========================= */

plusBtn?.addEventListener("click", e => {

    e.stopPropagation();

    plusMenu?.classList.toggle("show");
});


document.addEventListener("click", e => {

    if (
        plusMenu &&
        !plusMenu.contains(e.target) &&
        e.target !== plusBtn
    ) {
        plusMenu.classList.remove("show");
    }
});


function closePlus() {
    plusMenu?.classList.remove("show");
}


/* =========================
   PHOTO
========================= */

$("photoBtn")?.addEventListener("click", () => {

    closePlus();

    if (imageInput) {

        imageInput.value = "";

        imageInput.click();
    }
});


imageInput?.addEventListener("change", () => {

    const file = imageInput.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        addMessage(
            "⚠️ Please select an image.",
            "ai"
        );

        return;
    }

    selectedImage = file;
    selectedVideo = null;
    selectedFile = null;

    showPreview(file, "image");
});


/* =========================
   FILE
========================= */

$("fileBtn")?.addEventListener("click", () => {

    closePlus();

    if (fileInput) {

        fileInput.value = "";

        fileInput.click();
    }
});


fileInput?.addEventListener("change", () => {

    const file = fileInput.files?.[0];

    if (!file) return;

    selectedImage = null;
    selectedVideo = null;
    selectedFile = null;

    if (file.type.startsWith("image/")) {

        selectedImage = file;

        showPreview(file, "image");

        return;
    }

    if (file.type.startsWith("video/")) {

        selectedVideo = file;

        showPreview(file, "video");

        return;
    }

    selectedFile = file;

    showPreview(file, "file");
});


/* =========================
   PREVIEW
========================= */

function showPreview(file, type) {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    const box = document.createElement("div");

    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.gap = "10px";
    box.style.padding = "8px";
    box.style.borderRadius = "12px";
    box.style.background = "#111827";


    if (type === "image") {

        const img = document.createElement("img");

        img.src = URL.createObjectURL(file);

        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "10px";

        box.appendChild(img);
    }


    if (type === "video") {

        const video = document.createElement("video");

        video.src = URL.createObjectURL(file);

        video.muted = true;
        video.controls = true;

        video.style.width = "90px";
        video.style.height = "60px";
        video.style.objectFit = "cover";
        video.style.borderRadius = "10px";

        box.appendChild(video);
    }


    const name = document.createElement("span");

    /*
      এখানে শুধু preview-তে generic নাম দেখানো হচ্ছে।
      camera.photo.jpg / আসল filename AI message-এ
      আর দেখানো হবে না।
    */

    name.textContent =
        type === "image"
            ? "🖼 Image attached"
            : type === "video"
                ? "🎥 Video attached"
                : "📄 File attached";

    name.style.color = "white";
    name.style.flex = "1";

    box.appendChild(name);


    const remove = document.createElement("button");

    remove.textContent = "✕";
    remove.type = "button";

    remove.style.border = "0";
    remove.style.background = "#374151";
    remove.style.color = "white";
    remove.style.borderRadius = "8px";
    remove.style.padding = "6px 9px";

    remove.onclick = clearAttachment;

    box.appendChild(remove);

    imagePreview.appendChild(box);
}


/* =========================
   CLEAR ATTACHMENT
========================= */

function clearAttachment() {

    selectedImage = null;
    selectedVideo = null;
    selectedFile = null;

    if (imageInput) imageInput.value = "";
    if (fileInput) fileInput.value = "";

    if (imagePreview) {
        imagePreview.innerHTML = "";
    }
}


/* =========================
   CAMERA
========================= */

$("cameraBtn")?.addEventListener("click", async () => {

    closePlus();

    cameraModal?.classList.add("show");

    await startCamera();
});


async function startCamera() {

    stopCamera();

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        showCameraError(
            "Camera is not supported by this browser."
        );

        return;
    }


    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: cameraFacing,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },

                audio: true
            });


        if (cameraVideo) {

            cameraVideo.srcObject =
                cameraStream;

            cameraVideo.muted = true;

            await cameraVideo.play();
        }


        cameraError?.classList.remove("show");

    } catch (error) {

        console.error("Camera error:", error);

        showCameraError(
            getCameraError(error)
        );
    }
}


function showCameraError(message) {

    cameraError?.classList.add("show");

    if (cameraErrorText) {
        cameraErrorText.textContent = message;
    }
}


function getCameraError(error) {

    if (error?.name === "NotAllowedError") {
        return "Camera permission was denied. Please allow camera access.";
    }

    if (error?.name === "NotFoundError") {
        return "No camera was found on this device.";
    }

    if (error?.name === "NotReadableError") {
        return "Camera is being used by another app.";
    }

    return "Camera permission or device error.";
}


/* =========================
   CLOSE CAMERA
========================= */

cameraClose?.addEventListener("click", closeCamera);


function closeCamera() {

    stopRecording();
    stopCamera();

    cameraModal?.classList.remove("show");
}


function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => track.stop());

        cameraStream = null;
    }

    if (cameraVideo) {
        cameraVideo.srcObject = null;
    }
}


/* =========================
   SWITCH CAMERA
========================= */

switchCamera?.addEventListener("click", async () => {

    cameraFacing =
        cameraFacing === "user"
            ? "environment"
            : "user";

    await startCamera();
});


/* =========================
   PHOTO MODE
========================= */

photoMode?.addEventListener("click", async () => {

    photoMode.classList.add("active");
    videoMode?.classList.remove("active");

    if (takePhoto)
        takePhoto.style.display = "inline-flex";

    if (startRecord)
        startRecord.style.display = "none";

    if (stopRecord)
        stopRecord.style.display = "none";

    await startCamera();
});


/* =========================
   VIDEO MODE
========================= */

videoMode?.addEventListener("click", async () => {

    videoMode.classList.add("active");
    photoMode?.classList.remove("active");

    if (takePhoto)
        takePhoto.style.display = "none";

    if (startRecord)
        startRecord.style.display = "inline-flex";

    if (stopRecord)
        stopRecord.style.display = "none";

    await startCamera();
});


/* =========================
   TAKE PHOTO
========================= */

takePhoto?.addEventListener("click", capturePhoto);


function capturePhoto() {

    if (!cameraStream || !cameraVideo) {

        addMessage(
            "⚠️ Camera is not ready.",
            "ai"
        );

        return;
    }


    const canvas =
        document.createElement("canvas");

    canvas.width =
        cameraVideo.videoWidth || 1280;

    canvas.height =
        cameraVideo.videoHeight || 720;


    const ctx =
        canvas.getContext("2d");

    if (!ctx) return;


    ctx.drawImage(
        cameraVideo,
        0,
        0,
        canvas.width,
        canvas.height
    );


    canvas.toBlob(blob => {

        if (!blob) return;


        const file =
            new File(
                [blob],
                "photo.jpg",
                {
                    type: "image/jpeg"
                }
            );


        selectedImage = file;
        selectedVideo = null;
        selectedFile = null;

        showPreview(file, "image");

        closeCamera();

    }, "image/jpeg", 0.82);
}


/* =========================
   VIDEO MIME
========================= */

function getVideoMime() {

    if (!window.MediaRecorder) return "";

    const types = [
        "video/webm;codecs=vp8,opus",
        "video/webm"
    ];

    for (const type of types) {

        if (
            MediaRecorder.isTypeSupported(type)
        ) {
            return type;
        }
    }

    return "";
}


/* =========================
   START RECORDING
========================= */

startRecord?.addEventListener(
    "click",
    startRecording
);


function startRecording() {

    if (!cameraStream) {

        addMessage(
            "⚠️ Camera is not ready.",
            "ai"
        );

        return;
    }


    if (!window.MediaRecorder) {

        addMessage(
            "❌ Video recording is not supported by this browser.",
            "ai"
        );

        return;
    }


    chunks = [];


    const mime =
        getVideoMime();


    try {

        recorder =
            mime
                ? new MediaRecorder(
                    cameraStream,
                    { mimeType: mime }
                )
                : new MediaRecorder(
                    cameraStream
                );

    } catch (error) {

        console.error(error);

        addMessage(
            "❌ Unable to start video recording.",
            "ai"
        );

        return;
    }


    recorder.ondataavailable = event => {

        if (
            event.data &&
            event.data.size > 0
        ) {
            chunks.push(event.data);
        }
    };


    recorder.onstop = finishRecording;


    recorder.start(1000);

    recordingSeconds = 0;

    updateRecordTime();


    recordingTimer =
        setInterval(() => {

            recordingSeconds++;

            updateRecordTime();

        }, 1000);


    recordTime?.classList.add("show");

    startRecord.style.display = "none";
    stopRecord.style.display = "inline-flex";

    if (switchCamera)
        switchCamera.disabled = true;
}


/* =========================
   RECORD TIME
========================= */

function updateRecordTime() {

    if (!recordTime) return;

    const min =
        Math.floor(recordingSeconds / 60)
        .toString()
        .padStart(2, "0");

    const sec =
        (recordingSeconds % 60)
        .toString()
        .padStart(2, "0");

    recordTime.textContent =
        `🔴 ${min}:${sec}`;
}


/* =========================
   STOP RECORDING
========================= */

stopRecord?.addEventListener(
    "click",
    stopRecording
);


function stopRecording() {

    if (recordingTimer) {

        clearInterval(recordingTimer);

        recordingTimer = null;
    }


    if (
        recorder &&
        recorder.state !== "inactive"
    ) {

        recorder.stop();
    }


    recordTime?.classList.remove("show");

    if (stopRecord)
        stopRecord.style.display = "none";

    if (
        videoMode?.classList.contains("active")
    ) {

        if (startRecord)
            startRecord.style.display =
                "inline-flex";
    }

    if (switchCamera)
        switchCamera.disabled = false;
}


/* =========================
   FINISH RECORDING
========================= */

function finishRecording() {

    if (!chunks.length) {

        addMessage(
            "❌ Video recording was empty.",
            "ai"
        );

        return;
    }


    const mime =
        recorder?.mimeType ||
        "video/webm";


    const blob =
        new Blob(
            chunks,
            { type: mime }
        );


    /*
      Size limit check.
      খুব বড় ভিডিও সরাসরি API-তে পাঠানো হবে না।
    */

    const maxVideoSize =
        18 * 1024 * 1024;


    if (blob.size > maxVideoSize) {

        addMessage(
            "⚠️ Video is too large. Please record a shorter video.",
            "ai"
        );

        chunks = [];

        return;
    }


    const file =
        new File(
            [blob],
            "video.webm",
            {
                type: mime
            }
        );


    selectedVideo = file;
    selectedImage = null;
    selectedFile = null;


    showPreview(file, "video");


    chunks = [];
}
Part 2
/* =========================
   THINK HARDER
========================= */

$("thinkBtn")?.addEventListener("click", () => {

    thinkHarder = !thinkHarder;

    const btn = $("thinkBtn");

    if (thinkHarder) {

        btn.textContent =
            "🧠 Think Harder ✓";

        btn.style.background =
            "#00e5ff";

        btn.style.color =
            "#001018";

    } else {

        btn.textContent =
            "🧠 Think Harder";

        btn.style.background = "";
        btn.style.color = "";
    }

    closePlus();
});


/* =========================
   PLUGINS
========================= */

$("pluginBtn")?.addEventListener("click", () => {

    closePlus();

    const modal = $("pluginsModal");

    if (modal) {

        modal.classList.add("show");

    } else {

        addMessage(
            "🧩 Plugins panel is not available.",
            "ai"
        );
    }
});


$("pluginsClose")?.addEventListener("click", () => {

    $("pluginsModal")?.classList.remove("show");

});


document.querySelectorAll(".plugin-option")
.forEach(button => {

    button.addEventListener("click", () => {

        addMessage(
            "🧩 " +
            button.textContent.trim() +
            " selected.",
            "ai"
        );

        $("pluginsModal")?.classList.remove("show");
    });
});


/* =========================
   TEXT AREA
========================= */

function resizeInput() {

    if (!userInput) return;

    userInput.style.height = "auto";

    userInput.style.height =
        Math.min(
            userInput.scrollHeight,
            150
        ) + "px";
}


userInput?.addEventListener(
    "input",
    resizeInput
);


/* =========================
   QUICK ASK
========================= */

window.quickAsk = function(text) {

    if (!userInput) return;

    userInput.value = text;

    resizeInput();

    sendMessage();
};


/* =========================
   ENTER SEND
========================= */

userInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


/* =========================
   SEND BUTTON
========================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);


/* =========================
   FILE TO BASE64
========================= */

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();

        reader.onload = () => {

            const result =
                String(reader.result || "");

            const comma =
                result.indexOf(",");

            resolve(
                comma >= 0
                    ? result.slice(comma + 1)
                    : result
            );
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    if (sending) return;


    const text =
        userInput?.value.trim() || "";


    if (
        !text &&
        !selectedImage &&
        !selectedVideo &&
        !selectedFile
    ) {
        return;
    }


    sending = true;

    if (sendBtn)
        sendBtn.disabled = true;


    let attachment = null;


    if (selectedImage) {

        attachment = {

            type: "image",

            url:
                URL.createObjectURL(
                    selectedImage
                )
        };

    } else if (selectedVideo) {

        attachment = {

            type: "video",

            url:
                URL.createObjectURL(
                    selectedVideo
                )
        };

    } else if (selectedFile) {

        attachment = {

            type: "file",

            name: "File attached"
        };
    }


    /*
      User message immediately appears.
    */

    addMessage(
        text || "",
        "user",
        attachment
    );


    if (userInput) {

        userInput.value = "";

        userInput.style.height = "auto";
    }


    const oldImage = selectedImage;
    const oldVideo = selectedVideo;
    const oldFile = selectedFile;


    /*
      Clear UI immediately.
    */

    clearAttachment();


    let typingBox =
        addMessage(
            "Thinking…",
            "ai"
        );


    try {

        const body = {

            message: text,

            thinkHarder,

            language:
                detectLanguage(text),

            history:
                conversation.slice(-8)
        };


        /*
          Image
        */

        if (oldImage) {

            body.image = {
                data:
                    await fileToBase64(
                        oldImage
                    ),
                mimeType:
                    oldImage.type
            };
        }


        /*
          Video
          Do NOT send giant files blindly.
        */

        if (oldVideo) {

            if (
                oldVideo.size >
                18 * 1024 * 1024
            ) {

                throw new Error(
                    "Video is too large. Please record a shorter video."
                );
            }


            body.video = {

                data:
                    await fileToBase64(
                        oldVideo
                    ),

                mimeType:
                    oldVideo.type
            };
        }


        /*
          File
        */

        if (oldFile) {

            if (
                oldFile.size >
                10 * 1024 * 1024
            ) {

                throw new Error(
                    "File is too large. Please upload a smaller file."
                );
            }


            body.file = {

                name:
                    oldFile.name,

                mimeType:
                    oldFile.type ||
                    "application/octet-stream",

                data:
                    await fileToBase64(
                        oldFile
                    )
            };
        }


        /*
          Abort timeout.
          Prevents "Thinking…" forever.
        */

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                60000
            );


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(body),

                    signal:
                        controller.signal
                }
            );


        clearTimeout(timeout);


        const raw =
            await response.text();


        let data = null;


        try {

            data =
                raw
                    ? JSON.parse(raw)
                    : null;

        } catch {

            data = null;
        }


        if (!response.ok) {

            let message =
                data?.error ||
                data?.message ||
                `Server error: ${response.status}`;


            if (response.status === 413) {

                message =
                    "The upload is too large. Please send a shorter video or smaller file.";
            }


            throw new Error(message);
        }


        const answer =
            data?.reply ||
            data?.response ||
            data?.text ||
            data?.message ||
            data?.content ||
            "I couldn't generate a response.";


        /*
          Remove Thinking…
        */

        if (typingBox) {

            typingBox.remove();
        }


        addMessage(
            answer,
            "ai"
        );


        /*
          Save conversation.
        */

        conversation.push({
            role: "user",
            content: text
        });

        conversation.push({
            role: "assistant",
            content: answer
        });


        saveHistory(text);


    } catch (error) {

        console.error(
            "SwiftCortex:",
            error
        );


        if (typingBox) {
            typingBox.remove();
        }


        let message =
            error?.message ||
            "Connection error.";


        if (
            error?.name ===
            "AbortError"
        ) {

            message =
                "⏳ The request took too long. Please try again.";
        }


        addMessage(
            "❌ Connection error: " +
            message,
            "ai"
        );


    } finally {

        sending = false;

        if (sendBtn)
            sendBtn.disabled = false;
    }
}


/* =========================
   LANGUAGE DETECTION
========================= */

function detectLanguage(text) {

    if (!text) return "auto";


    if (/[\u0980-\u09FF]/.test(text))
        return "bn";


    if (/[\u0600-\u06FF]/.test(text))
        return "ar";


    if (/[\u0900-\u097F]/.test(text))
        return "hi";


    if (/[\u4E00-\u9FFF]/.test(text))
        return "zh";


    if (/[\u3040-\u30FF]/.test(text))
        return "ja";


    if (/[\uAC00-\uD7AF]/.test(text))
        return "ko";


    return "en";
}


/* =========================
   HISTORY
========================= */

function saveHistory(text) {

    if (!text) return;


    let history =
        JSON.parse(
            localStorage.getItem(
                "swiftcortex_history"
            ) || "[]"
        );


    history.unshift({
        text,
        time: Date.now()
    });


    history =
        history.slice(0, 30);


    localStorage.setItem(
        "swiftcortex_history",
        JSON.stringify(history)
    );


    renderHistory();
}


function renderHistory() {

    const list =
        $("historyList");

    if (!list) return;


    list.innerHTML = "";


    const history =
        JSON.parse(
            localStorage.getItem(
                "swiftcortex_history"
            ) || "[]"
        );


    history.forEach(item => {

        const button =
            document.createElement("button");

        button.textContent =
            item.text.slice(0, 35);

        button.style.display =
            "block";

        button.style.width =
            "100%";

        button.style.marginBottom =
            "6px";

        button.style.textAlign =
            "left";

        button.style.background =
            "transparent";

        button.style.color =
            "inherit";

        button.style.border =
            "0";

        button.style.cursor =
            "pointer";


        button.onclick = () => {

            if (userInput) {

                userInput.value =
                    item.text;

                resizeInput();
            }
        };


        list.appendChild(button);
    });
}


renderHistory();


/* =========================
   NEW CHAT
========================= */

$("newChat")?.addEventListener(
    "click",
    () => {

        conversation = [];

        if (messages)
            messages.innerHTML = "";

        addMessage(
            "👋 New chat started. How can I help you?",
            "ai"
        );
    }
);


/* =========================
   DARK MODE
========================= */

function toggleDarkMode() {

    document.body.classList.toggle("light-mode");

    const light =
        document.body.classList.contains(
            "light-mode"
        );


    localStorage.setItem(
        "swiftcortex_theme",
        light
            ? "light"
            : "dark"
    );


    updateThemeButtons();
}


function updateThemeButtons() {

    const light =
        document.body.classList.contains(
            "light-mode"
        );


    const text =
        light
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";


    if ($("themeBtn"))
        $("themeBtn").textContent = text;

    if ($("settingsThemeBtn"))
        $("settingsThemeBtn").textContent =
            light ? "Light" : "Dark";
}


$("themeBtn")?.addEventListener(
    "click",
    toggleDarkMode
);


$("settingsThemeBtn")?.addEventListener(
    "click",
    toggleDarkMode
);


if (
    localStorage.getItem(
        "swiftcortex_theme"
    ) === "light"
) {

    document.body.classList.add(
        "light-mode"
    );
}


updateThemeButtons();


/* =========================
   SETTINGS
========================= */

function openSettings() {

    $("settingsModal")?.classList.add(
        "show"
    );
}


function closeSettings() {

    $("settingsModal")?.classList.remove(
        "show"
    );
}


$("settingsBtn")?.addEventListener(
    "click",
    openSettings
);


$("topSettingsBtn")?.addEventListener(
    "click",
    openSettings
);


$("settingsClose")?.addEventListener(
    "click",
    closeSettings
);


/* =========================
   MOBILE MENU
========================= */

$("menuBtn")?.addEventListener(
    "click",
    () => {

        $("sidebar")?.classList.toggle(
            "show"
        );
    }
);


/* =========================
   MEMORY
========================= */

let memoryEnabled =
    localStorage.getItem(
        "swiftcortex_memory"
    ) !== "off";


function updateMemoryButton() {

    const btn =
        $("memoryToggle");

    if (!btn) return;

    btn.textContent =
        memoryEnabled
            ? "ON"
            : "OFF";
}


$("memoryToggle")?.addEventListener(
    "click",
    () => {

        memoryEnabled =
            !memoryEnabled;

        localStorage.setItem(
            "swiftcortex_memory",
            memoryEnabled
                ? "on"
                : "off"
        );

        updateMemoryButton();
    }
);


updateMemoryButton();


/* =========================
   VOICE
========================= */

let voiceEnabled = false;


$("voiceToggle")?.addEventListener(
    "click",
    () => {

        voiceEnabled =
            !voiceEnabled;

        $("voiceToggle").textContent =
            voiceEnabled
                ? "ON"
                : "OFF";
    }
);


/* =========================
   CLEAR HISTORY
========================= */

$("clearHistoryBtn")?.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "swiftcortex_history"
        );

        renderHistory();
    }
);


/* =========================
   LOGIN
========================= */

function openLogin() {

    $("loginModal")?.classList.add(
        "show"
    );
}


function closeLogin() {

    $("loginModal")?.classList.remove(
        "show"
    );
}


$("loginBtn")?.addEventListener(
    "click",
    openLogin
);


$("settingsLoginBtn")?.addEventListener(
    "click",
    openLogin
);


$("loginClose")?.addEventListener(
    "click",
    closeLogin
);


$("guestBtn")?.addEventListener(
    "click",
    () => {

        closeLogin();

        addMessage(
            "👤 Guest mode activated.",
            "ai"
        );
    }
);


/* =========================
   SUBSCRIPTION
========================= */

function openSubscription() {

    $("subscriptionModal")?.classList.add(
        "show"
    );
}


$("subscriptionBtn")?.addEventListener(
    "click",
    openSubscription
);


$("subscriptionClose")?.addEventListener(
    "click",
    () => {

        $("subscriptionModal")
            ?.classList.remove("show");
    }
);


$("upgradeBtn")?.addEventListener(
    "click",
    () => {

        addMessage(
            "⭐ Pro subscription is ready to be connected to your payment system.",
            "ai"
        );

        $("subscriptionModal")
            ?.classList.remove("show");
    }
);


/* =========================
   AI IMAGE
========================= */

function imageGeneration() {

    closePlus();

    if (userInput) {

        userInput.value =
            "Create an image of ";

        userInput.focus();

        resizeInput();
    }
}


$("imageGenBtn")?.addEventListener(
    "click",
    imageGeneration
);


$("imageGenMenuBtn")?.addEventListener(
    "click",
    imageGeneration
);


/* =========================
   AI VIDEO
========================= */

function videoGeneration() {

    closePlus();

    if (userInput) {

        userInput.value =
            "Create a video of ";

        userInput.focus();

        resizeInput();
    }
}


$("videoGenBtn")?.addEventListener(
    "click",
    videoGeneration
);


$("videoGenMenuBtn")?.addEventListener(
    "click",
    videoGeneration
);


/* =========================
   RECENT
========================= */

$("recentBtn")?.addEventListener(
    "click",
    () => {

        openSettings();

        renderHistory();
    }
);


/* =========================
   MEMORY SIDE BUTTON
========================= */

$("memoryBtn")?.addEventListener(
    "click",
    () => {

        openSettings();

        $("memoryToggle")?.click();
    }
);


/* =========================
   LOGIN SUBMIT
========================= */

$("signInSubmit")?.addEventListener(
    "click",
    () => {

        const email =
            $("emailInput")?.value.trim();

        if (!email) {

            addMessage(
                "Please enter your email.",
                "ai"
            );

            return;
        }


        closeLogin();

        addMessage(
            "👤 Sign-in interface is ready. Connect your authentication provider to enable real accounts.",
            "ai"
        );
    }
);


/* =========================
   CLOSE MODALS ON BACKDROP
========================= */

[
    "settingsModal",
    "loginModal",
    "subscriptionModal",
    "pluginsModal"
].forEach(id => {

    const modal = $(id);

    modal?.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                modal.classList.remove(
                    "show"
                );
            }
        }
    );
});


/* =========================
   INITIAL WELCOME
========================= */

if (
    messages &&
    messages.children.length === 0
) {

    addMessage(
        "👋 Hello! I am SwiftCortex AI. How can I help you?",
        "ai"
    );
}


/* =========================
   READY
========================= */

console.log(
    "⚡ SwiftCortex AI Ultra loaded successfully."
);
