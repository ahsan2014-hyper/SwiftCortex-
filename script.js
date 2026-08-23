"use strict";

const $ = id => document.getElementById(id);

/* =========================
   ELEMENTS
========================= */

const sidebar = $("sidebar");
const menuBtn = $("menuBtn");
const plusBtn = $("plusBtn");
const plusMenu = $("plusMenu");

const newChat = $("newChat");
const newTopChat = $("newTopChat");

const messages = $("messages");
const userInput = $("userInput");
const sendBtn = $("sendBtn");

const imageInput = $("imageInput");
const fileInput = $("fileInput");
const imagePreview = $("imagePreview");

const cameraBtn = $("cameraBtn");
const photoBtn = $("photoBtn");
const fileBtn = $("fileBtn");
const pluginBtn = $("pluginBtn");
const thinkBtn = $("thinkBtn");

const cameraModal = $("cameraModal");
const cameraClose = $("cameraClose");
const cameraVideo = $("cameraVideo");
const cameraError = $("cameraError");
const cameraErrorText = $("cameraErrorText");

const photoMode = $("photoMode");
const videoMode = $("videoMode");
const takePhoto = $("takePhoto");
const startRecord = $("startRecord");
const stopRecord = $("stopRecord");
const switchCamera = $("switchCamera");

const recordTime = $("recordTime");
const mediaResult = $("mediaResult");

const settingsBtn = $("settingsBtn");
const settingsModal = $("settingsModal");
const settingsClose = $("settingsClose");

const pluginModal = $("pluginModal");
const pluginClose = $("pluginClose");

const profileBtn = $("profileBtn");
const profileModal = $("profileModal");
const profileClose = $("profileClose");

const themeBtn = $("themeBtn");
const memoryBtn = $("memoryBtn");
const memoryStatus = $("memoryStatus");
const settingsMemory = $("settingsMemory");

const historyList = $("historyList");


/* =========================
   STATE
========================= */

let selectedImage = null;
let selectedVideo = null;
let selectedFile = null;

let cameraStream = null;
let cameraFacing = "user";

let recorder = null;
let chunks = [];

let recordingSeconds = 0;
let recordingTimer = null;

let thinkHarder = false;
let memoryEnabled = true;
let sending = false;


/* =========================
   MENU
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
   MOBILE SIDEBAR
========================= */

menuBtn?.addEventListener("click", e => {

    e.stopPropagation();

    sidebar?.classList.toggle("open");

});


document.addEventListener("click", e => {

    if (
        window.innerWidth <= 800 &&
        sidebar?.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        e.target !== menuBtn
    ) {

        sidebar.classList.remove("open");

    }

});


/* =========================
   MESSAGE
========================= */

function addMessage(text, type = "ai", attachment = null) {

    const box = document.createElement("div");

    box.className =
        type === "user"
            ? "user-message"
            : "ai-message";


    if (text) {

        const textBox =
            document.createElement("div");

        textBox.textContent = text;

        box.appendChild(textBox);

    }


    if (attachment?.type === "image") {

        const img =
            document.createElement("img");

        img.src = attachment.url;

        img.alt = "Uploaded image";

        box.appendChild(img);

    }


    if (attachment?.type === "video") {

        const video =
            document.createElement("video");

        video.src = attachment.url;

        video.controls = true;

        video.playsInline = true;

        box.appendChild(video);

    }


    if (attachment?.type === "file") {

        const fileBox =
            document.createElement("div");

        fileBox.textContent =
            "📄 " + attachment.name;

        box.appendChild(fileBox);

    }


    messages?.appendChild(box);

    scrollChat();

    return box;

}


function scrollChat() {

    if (!messages) return;

    requestAnimationFrame(() => {

        messages.scrollTop =
            messages.scrollHeight;

    });

}


/* =========================
   ATTACHMENT PREVIEW
========================= */

function showAttachment(file, type) {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";


    const box =
        document.createElement("div");

    box.className = "attachment-box";


    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.alt = file.name;

        box.appendChild(img);

    }


    if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(file);

        video.controls = true;

        video.muted = true;

        video.playsInline = true;

        box.appendChild(video);

    }


    const name =
        document.createElement("div");

    name.className =
        "attachment-name";

    name.textContent =
        type === "image"
            ? "🖼️ Image attached"
            : type === "video"
                ? "🎥 Video attached"
                : "📄 " + file.name;

    box.appendChild(name);


    const remove =
        document.createElement("button");

    remove.className =
        "attachment-remove";

    remove.textContent = "✕";

    remove.onclick =
        clearAttachment;

    box.appendChild(remove);


    imagePreview.appendChild(box);

}


function clearAttachment() {

    selectedImage = null;

    selectedVideo = null;

    selectedFile = null;


    if (imageInput)
        imageInput.value = "";

    if (fileInput)
        fileInput.value = "";

    if (imagePreview)
        imagePreview.innerHTML = "";

}


/* =========================
   PHOTOS
========================= */

photoBtn?.addEventListener("click", () => {

    closePlus();

    imageInput.value = "";

    imageInput.click();

});


imageInput?.addEventListener("change", () => {

    const file =
        imageInput.files?.[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {

        addMessage(
            "⚠️ Please select an image."
        );

        return;

    }


    selectedImage = file;

    selectedVideo = null;

    selectedFile = null;


    showAttachment(
        file,
        "image"
    );

});


/* =========================
   FILES
========================= */

fileBtn?.addEventListener("click", () => {

    closePlus();

    fileInput.value = "";

    fileInput.click();

});


fileInput?.addEventListener("change", () => {

    const file =
        fileInput.files?.[0];

    if (!file) return;


    if (file.type.startsWith("image/")) {

        selectedImage = file;

        selectedVideo = null;

        selectedFile = null;

        showAttachment(
            file,
            "image"
        );

        return;

    }


    if (file.type.startsWith("video/")) {

        selectedVideo = file;

        selectedImage = null;

        selectedFile = null;

        showAttachment(
            file,
            "video"
        );

        return;

    }


    selectedFile = file;

    selectedImage = null;

    selectedVideo = null;


    showAttachment(
        file,
        "file"
    );

});


/* =========================
   CAMERA
========================= */

cameraBtn?.addEventListener("click", async () => {

    closePlus();

    cameraModal?.classList.add("show");

    await startCamera();

});


cameraClose?.addEventListener(
    "click",
    closeCamera
);


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
                    width: {
                        ideal: 1280
                    },
                    height: {
                        ideal: 720
                    }
                },

                audio: true

            });


        if (cameraVideo) {

            cameraVideo.srcObject =
                cameraStream;

            await cameraVideo.play();

        }


        cameraError?.classList.remove(
            "show"
        );

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        showCameraError(
            cameraErrorMessage(error)
        );

    }

}


function showCameraError(message) {

    cameraError?.classList.add("show");

    if (cameraErrorText) {

        cameraErrorText.textContent =
            message;

    }

}


function cameraErrorMessage(error) {

    if (
        error?.name ===
        "NotAllowedError"
    ) {

        return "Camera permission was denied. Allow camera access in your browser settings.";

    }


    if (
        error?.name ===
        "NotFoundError"
    ) {

        return "No camera was found on this device.";

    }


    if (
        error?.name ===
        "NotReadableError"
    ) {

        return "The camera is being used by another application.";

    }


    if (
        error?.name ===
        "SecurityError"
    ) {

        return "Camera access is blocked by browser security.";

    }


    return "Camera permission or device error.";

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


function closeCamera() {

    stopRecording();

    stopCamera();

    cameraModal?.classList.remove("show");

}


/* =========================
   SWITCH CAMERA
========================= */

switchCamera?.addEventListener(
    "click",
    async () => {

        cameraFacing =
            cameraFacing === "user"
                ? "environment"
                : "user";

        await startCamera();

    }
);


/* =========================
   PHOTO MODE
========================= */

photoMode?.addEventListener(
    "click",
    async () => {

        photoMode.classList.add("active");

        videoMode.classList.remove("active");

        takePhoto.style.display =
            "inline-block";

        startRecord.style.display =
            "none";

        stopRecord.style.display =
            "none";

        await startCamera();

    }
);


/* =========================
   VIDEO MODE
========================= */

videoMode?.addEventListener(
    "click",
    async () => {

        videoMode.classList.add("active");

        photoMode.classList.remove("active");

        takePhoto.style.display =
            "none";

        startRecord.style.display =
            "inline-block";

        stopRecord.style.display =
            "none";

        await startCamera();

    }
);


/* =========================
   TAKE PHOTO
========================= */

takePhoto?.addEventListener(
    "click",
    capturePhoto
);


function capturePhoto() {

    if (!cameraStream) {

        showCameraError(
            "Camera is not ready."
        );

        return;

    }


    const canvas =
        document.createElement("canvas");


    canvas.width =
        cameraVideo.videoWidth ||
        1280;

    canvas.height =
        cameraVideo.videoHeight ||
        720;


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


    canvas.toBlob(
        blob => {

            if (!blob) return;


            const file =
                new File(
                    [blob],
                    "camera-photo.jpg",
                    {
                        type:
                            "image/jpeg"
                    }
                );


            selectedImage = file;

            selectedVideo = null;

            selectedFile = null;


            showAttachment(
                file,
                "image"
            );


            closeCamera();

        },
        "image/jpeg",
        0.9
    );

}


/* =========================
   VIDEO RECORDING
========================= */

function supportedMime() {

    if (!window.MediaRecorder)
        return "";


    const types = [

        "video/webm;codecs=vp9,opus",

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


startRecord?.addEventListener(
    "click",
    startRecording
);


function startRecording() {

    if (!cameraStream) {

        showCameraError(
            "Camera is not ready."
        );

        return;

    }


    if (!window.MediaRecorder) {

        addMessage(
            "❌ Video recording is not supported by this browser."
        );

        return;

    }


    chunks = [];


    const mime =
        supportedMime();


    try {

        recorder =
            mime
                ? new MediaRecorder(
                    cameraStream,
                    {
                        mimeType: mime
                    }
                )
                : new MediaRecorder(
                    cameraStream
                );

    } catch (error) {

        console.error(error);

        addMessage(
            "❌ Could not start video recording."
        );

        return;

    }


    recorder.ondataavailable =
        event => {

            if (
                event.data &&
                event.data.size
            ) {

                chunks.push(
                    event.data
                );

            }

        };


    recorder.onstop =
        finishRecording;


    recorder.start();


    recordingSeconds = 0;

    updateRecordTime();


    recordingTimer =
        setInterval(() => {

            recordingSeconds++;

            updateRecordTime();

        }, 1000);


    recordTime?.classList.add("show");


    startRecord.style.display =
        "none";

    stopRecord.style.display =
        "inline-block";

    switchCamera.disabled =
        true;

}


function updateRecordTime() {

    if (!recordTime) return;


    const m =
        Math.floor(
            recordingSeconds / 60
        )
        .toString()
        .padStart(2, "0");


    const s =
        (recordingSeconds % 60)
        .toString()
        .padStart(2, "0");


    recordTime.textContent =
        `🔴 ${m}:${s}`;

}


stopRecord?.addEventListener(
    "click",
    stopRecording
);


function stopRecording() {

    if (recordingTimer) {

        clearInterval(
            recordingTimer
        );

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
        stopRecord.style.display =
            "none";


    if (
        videoMode?.classList.contains("active")
    ) {

        if (startRecord)
            startRecord.style.display =
                "inline-block";

    }


    if (switchCamera)
        switchCamera.disabled =
            false;

}


function finishRecording() {

    if (!chunks.length) return;


    const mime =
        recorder?.mimeType ||
        "video/webm";


    const blob =
        new Blob(
            chunks,
            {
                type: mime
            }
        );


    const file =
        new File(
            [blob],
            "camera-video.webm",
            {
                type: mime
            }
        );


    selectedVideo = file;

    selectedImage = null;

    selectedFile = null;


    showAttachment(
        file,
        "video"
    );


    if (mediaResult) {

        mediaResult.innerHTML = "";

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(file);

        video.controls = true;

        video.playsInline = true;

        mediaResult.appendChild(video);

    }


    chunks = [];

}


/* =========================
   THINK HARDER
========================= */

thinkBtn?.addEventListener(
    "click",
    () => {

        thinkHarder =
            !thinkHarder;


        thinkBtn.style.background =
            thinkHarder
                ? "#00e5ff"
                : "";


        thinkBtn.style.color =
            thinkHarder
                ? "#001018"
                : "";


        closePlus();

    }
);


/* =========================
   PLUGINS
========================= */

pluginBtn?.addEventListener(
    "click",
    () => {

        closePlus();

        pluginModal?.classList.add("show");

    }
);


pluginClose?.addEventListener(
    "click",
    () => {

        pluginModal?.classList.remove("show");

    }
);


/* =========================
   SETTINGS
========================= */

settingsBtn?.addEventListener(
    "click",
    () => {

        sidebar?.classList.remove("open");

        settingsModal?.classList.add("show");

    }
);


settingsClose?.addEventListener(
    "click",
    () => {

        settingsModal?.classList.remove("show");

    }
);


/* =========================
   PROFILE
========================= */

profileBtn?.addEventListener(
    "click",
    () => {

        profileModal?.classList.add("show");

    }
);


profileClose?.addEventListener(
    "click",
    () => {

        profileModal?.classList.remove("show");

    }
);


/* =========================
   MEMORY
========================= */

memoryBtn?.addEventListener(
    "click",
    toggleMemory
);


function toggleMemory() {

    memoryEnabled =
        !memoryEnabled;


    const state =
        memoryEnabled
            ? "ON"
            : "OFF";


    if (memoryStatus)
        memoryStatus.textContent =
            state;


    if (settingsMemory)
        settingsMemory.textContent =
            memoryEnabled
                ? "On"
                : "Off";

}


/* =========================
   DARK MODE
========================= */

themeBtn?.addEventListener(
    "click",
    toggleTheme
);


function toggleTheme() {

    document.body.classList.toggle(
        "light"
    );


    const light =
        document.body.classList.contains(
            "light"
        );


    themeBtn.innerHTML =
        light
            ? "☀️ <span>Light Mode</span>"
            : "🌙 <span>Dark Mode</span>";

}


/* =========================
   TEXT AREA
========================= */

function resizeInput() {

    if (!userInput) return;


    userInput.style.height =
        "auto";


    userInput.style.height =
        Math.min(
            userInput.scrollHeight,
            140
        ) + "px";

}


userInput?.addEventListener(
    "input",
    resizeInput
);


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

    }


    else if (selectedVideo) {

        attachment = {

            type: "video",

            url:
                URL.createObjectURL(
                    selectedVideo
                )

        };

    }


    else if (selectedFile) {

        attachment = {

            type: "file",

            name:
                selectedFile.name

        };

    }


    addMessage(
        text || "📎 Attachment",
        "user",
        attachment
    );


    const messageText =
        text ||
        (
            selectedImage
                ? "Please analyze this image."
                : selectedVideo
                    ? "Please analyze this video."
                    : "Please analyze this file."
        );


    userInput.value = "";

    resizeInput();


    clearAttachment();


    /*
       IMPORTANT:

       This part connects to your
       Vercel API endpoint.

       If your gemini.js endpoint
       is /api/gemini, this will work.
    */


    try {

        const body = {

            message: messageText,

            thinkHarder,

            memoryEnabled

        };


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
                        JSON.stringify(body)

                }
            );


        if (!response.ok) {

            throw new Error(
                `Server error ${response.status}`
            );

        }


        const data =
            await response.json();


        const answer =
            data.reply ||
            data.text ||
            data.message ||
            data.output ||
            data.response;


        if (!answer) {

            throw new Error(
                "No response from AI"
            );

        }


        addMessage(
            answer,
            "ai"
        );


        saveHistory(
            messageText
        );


    } catch (error) {

        console.error(
            "AI Error:",
            error
        );


        addMessage(
            "❌ Connection error. Please check your Vercel API / gemini.js configuration."
        );

    }


    sending = false;


    if (sendBtn)
        sendBtn.disabled = false;


    scrollChat();

}


/* =========================
   NEW CHAT
========================= */

function startNewChat() {

    if (!messages) return;


    messages.innerHTML = `

        <div class="welcome">

            <div class="welcome-logo">
                ⚡
            </div>

            <h1>Welcome to SwiftCortex AI</h1>

            <p>
                Your intelligent AI assistant for
                chat, images, files and more.
            </p>

        </div>

    `;


    clearAttachment();


    if (userInput) {

        userInput.value = "";

        resizeInput();

        userInput.focus();

    }

}


newChat?.addEventListener(
    "click",
    startNewChat
);


newTopChat?.addEventListener(
    "click",
    startNewChat
);


/* =========================
   QUICK PROMPTS
========================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-prompt]"
            );


        if (!button) return;


        if (userInput) {

            userInput.value =
                button.dataset.prompt;

            resizeInput();

            userInput.focus();

        }

    }
);


/* =========================
   HISTORY
========================= */

function saveHistory(text) {

    if (!historyList || !text)
        return;


    const item =
        document.createElement("div");


    item.className =
        "history-item";


    item.textContent =
        text;


    item.title =
        text;


    item.onclick = () => {

        if (userInput) {

            userInput.value =
                text;

            resizeInput();

            userInput.focus();

        }

    };


    historyList.prepend(item);


    while (
        historyList.children.length > 15
    ) {

        historyList.lastElementChild.remove();

    }

}


/* =========================
   CLOSE MODAL ON BACKDROP
========================= */

[
    cameraModal,
    settingsModal,
    pluginModal,
    profileModal
].forEach(modal => {

    modal?.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                modal.classList.remove(
                    "show"
                );

                modal.classList.remove(
                    "active"
                );

            }

        }
    );

});


/* =========================
   ESC KEY
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape")
            return;


        closePlus();

        cameraModal?.classList.remove("show");

        settingsModal?.classList.remove("show");

        pluginModal?.classList.remove("show");

        profileModal?.classList.remove("show");

    }
);


/* =========================
   INITIALIZE
========================= */

if (memoryStatus)
    memoryStatus.textContent = "ON";


if (settingsMemory)
    settingsMemory.textContent = "On";


resizeInput();

scrollChat();

console.log(
    "⚡ SwiftCortex AI Ultra loaded successfully."
);
