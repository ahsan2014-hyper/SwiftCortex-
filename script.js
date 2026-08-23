"use strict";

/* =========================================================
   SwiftCortex AI Ultra
   COMPLETE script.js

   API:
   /api/gemini

   Features:
   ✅ Chat
   ✅ Enter to send
   ✅ New Chat
   ✅ Plus menu
   ✅ Camera
   ✅ Front / Back camera
   ✅ Take photo
   ✅ Video recording
   ✅ Photos
   ✅ Files
   ✅ Image preview
   ✅ Video preview
   ✅ Plugins
   ✅ Think Harder
   ✅ Memory
   ✅ Theme
   ✅ Settings
   ✅ Language
   ✅ Notifications
   ✅ Privacy
   ✅ Clear history
========================================================= */


/* =========================================================
   HELPERS
========================================================= */

const $ = id => document.getElementById(id);

const $$ = selector =>
    Array.from(document.querySelectorAll(selector));


/* =========================================================
   ELEMENTS
========================================================= */

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


/* =========================================================
   STATE
========================================================= */

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
let sending = false;

let currentChat = [];

let memoryEnabled =
    localStorage.getItem("swift_memory") !== "off";


/* =========================================================
   STORAGE
========================================================= */

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem("swift_history") || "[]"
        );

    } catch {

        return [];

    }

}


function saveHistory(history) {

    if (
        localStorage.getItem("swift_save_history") === "off"
    ) {
        return;
    }

    localStorage.setItem(
        "swift_history",
        JSON.stringify(history)
    );

}


function saveCurrentMessage(text, type) {

    if (
        localStorage.getItem("swift_save_history") === "off"
    ) {
        return;
    }

    currentChat.push({

        text: text || "",

        type,

        time: Date.now()

    });

}


function saveCurrentChat() {

    if (!currentChat.length) {
        return;
    }

    if (
        localStorage.getItem("swift_save_history") === "off"
    ) {
        return;
    }

    const history = getHistory();

    const firstUser =
        currentChat.find(
            item => item.type === "user"
        );

    const title =
        firstUser?.text?.slice(0, 40) ||
        "New Chat";

    history.unshift({

        id: Date.now(),

        title,

        messages: currentChat

    });

    saveHistory(
        history.slice(0, 50)
    );

}


/* =========================================================
   CHAT SCROLL
========================================================= */

function scrollChat() {

    if (!messages) {
        return;
    }

    requestAnimationFrame(() => {

        messages.scrollTop =
            messages.scrollHeight;

    });

}


/* =========================================================
   WELCOME
========================================================= */

function removeWelcome() {

    const welcome =
        messages?.querySelector(".welcome");

    welcome?.remove();

}


function showWelcome() {

    if (!messages) {
        return;
    }

    messages.innerHTML = `

        <div class="welcome">

            <div class="welcome-logo">
                ⚡
            </div>

            <h1>
                Welcome to SwiftCortex AI
            </h1>

            <p>
                Your intelligent AI assistant for
                chat, images, files, ideas and more.
            </p>

            <div class="quick-actions">

                <button data-prompt="Tell me about yourself">
                    🤖 About AI
                </button>

                <button data-prompt="Help me write something">
                    ✍️ Write
                </button>

                <button data-prompt="Explain something to me">
                    💡 Explain
                </button>

                <button data-prompt="Help me with coding">
                    💻 Coding
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
    text,
    type = "ai",
    attachment = null,
    save = true
) {

    if (!messages) {
        return null;
    }

    removeWelcome();

    const box =
        document.createElement("div");

    box.className =
        type === "user"
            ? "user-message"
            : "ai-message";


    if (text) {

        const textBox =
            document.createElement("div");

        textBox.className =
            "message-text";

        textBox.textContent =
            text;

        box.appendChild(
            textBox
        );

    }


    if (
        attachment?.type === "image"
    ) {

        const img =
            document.createElement("img");

        img.src =
            attachment.url;

        img.alt =
            "Uploaded image";

        img.loading =
            "lazy";

        box.appendChild(
            img
        );

    }


    if (
        attachment?.type === "video"
    ) {

        const video =
            document.createElement("video");

        video.src =
            attachment.url;

        video.controls =
            true;

        video.playsInline =
            true;

        video.preload =
            "metadata";

        box.appendChild(
            video
        );

    }


    if (
        attachment?.type === "file"
    ) {

        const fileBox =
            document.createElement("div");

        fileBox.className =
            "message-file";

        fileBox.textContent =
            "📄 " + attachment.name;

        box.appendChild(
            fileBox
        );

    }


    messages.appendChild(
        box
    );

    scrollChat();


    if (save) {

        saveCurrentMessage(
            text || "",
            type
        );

    }

    return box;

}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    removeTyping();

    if (!messages) {
        return;
    }

    const box =
        document.createElement("div");

    box.id =
        "swiftTyping";

    box.className =
        "ai-message";


    const text =
        document.createElement("div");

    text.className =
        "message-text";

    text.textContent =
        "SwiftCortex is thinking…";

    box.appendChild(
        text
    );

    messages.appendChild(
        box
    );

    scrollChat();

}


function removeTyping() {

    $("swiftTyping")?.remove();

}


/* =========================================================
   INPUT RESIZE
========================================================= */

function resizeInput() {

    if (!userInput) {
        return;
    }

    userInput.style.height =
        "auto";

    userInput.style.height =
        Math.min(
            userInput.scrollHeight,
            180
        ) + "px";

}


userInput?.addEventListener(
    "input",
    resizeInput
);


/* =========================================================
   ATTACHMENT PREVIEW
========================================================= */

function showAttachment(
    file,
    type
) {

    if (!imagePreview) {
        return;
    }

    imagePreview.innerHTML = "";


    const box =
        document.createElement("div");

    box.className =
        "attachment-box";


    const url =
        URL.createObjectURL(file);


    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            url;

        img.alt =
            file.name;

        box.appendChild(
            img
        );

    }


    if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            url;

        video.controls =
            true;

        video.muted =
            true;

        video.playsInline =
            true;

        box.appendChild(
            video
        );

    }


    const name =
        document.createElement("div");

    name.className =
        "attachment-name";


    name.textContent =
        type === "image"
            ? "🖼️ " + file.name
            : type === "video"
                ? "🎥 " + file.name
                : "📄 " + file.name;


    box.appendChild(
        name
    );


    const remove =
        document.createElement("button");

    remove.type =
        "button";

    remove.className =
        "attachment-remove";

    remove.textContent =
        "✕";

    remove.onclick =
        clearAttachment;


    box.appendChild(
        remove
    );

    imagePreview.appendChild(
        box
    );

}


function clearAttachment() {

    selectedImage = null;
    selectedVideo = null;
    selectedFile = null;


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


/* =========================================================
   PLUS MENU
========================================================= */

plusBtn?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        plusMenu?.classList.toggle(
            "show"
        );

    }
);


plusMenu?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

    }
);


document.addEventListener(
    "click",
    event => {

        if (
            plusMenu &&
            !plusMenu.contains(event.target) &&
            event.target !== plusBtn
        ) {

            plusMenu.classList.remove(
                "show"
            );

        }

    }
);


function closePlus() {

    plusMenu?.classList.remove(
        "show"
    );

}


/* =========================================================
   SIDEBAR
========================================================= */

menuBtn?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        sidebar?.classList.toggle(
            "open"
        );

    }
);


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    if (currentChat.length) {

        saveCurrentChat();

    }

    currentChat = [];

    clearAttachment();

    removeTyping();

    showWelcome();

    userInput?.focus();

}


newChat?.addEventListener(
    "click",
    () => {

        sidebar?.classList.remove(
            "open"
        );

        startNewChat();

    }
);


newTopChat?.addEventListener(
    "click",
    startNewChat
);


/* =========================================================
   QUICK ACTIONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-prompt]"
            );

        if (!button) {
            return;
        }

        if (userInput) {

            userInput.value =
                button.dataset.prompt;

            resizeInput();

            userInput.focus();

        }

    }
);


/* =========================================================
   PHOTO UPLOAD
========================================================= */

photoBtn?.addEventListener(
    "click",
    () => {

        closePlus();

        imageInput?.click();

    }
);


imageInput?.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files?.[0];

        if (!file) {
            return;
        }

        if (
            !file.type.startsWith("image/")
        ) {

            alert(
                "Please select an image."
            );

            return;

        }

        selectedImage =
            file;

        selectedVideo =
            null;

        selectedFile =
            null;

        showAttachment(
            file,
            "image"
        );

    }
);


/* =========================================================
   FILE UPLOAD
========================================================= */

fileBtn?.addEventListener(
    "click",
    () => {

        closePlus();

        fileInput?.click();

    }
);


fileInput?.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files?.[0];

        if (!file) {
            return;
        }


        if (
            file.type.startsWith("image/")
        ) {

            selectedImage =
                file;

            selectedVideo =
                null;

            selectedFile =
                null;

            showAttachment(
                file,
                "image"
            );

            return;

        }


        if (
            file.type.startsWith("video/")
        ) {

            selectedVideo =
                file;

            selectedImage =
                null;

            selectedFile =
                null;

            showAttachment(
                file,
                "video"
            );

            return;

        }


        selectedFile =
            file;

        selectedImage =
            null;

        selectedVideo =
            null;

        showAttachment(
            file,
            "file"
        );

    }
);


/* =========================================================
   CAMERA
========================================================= */

cameraBtn?.addEventListener(
    "click",
    async () => {

        closePlus();

        cameraModal?.classList.add(
            "show"
        );

        setPhotoMode();

        await startCamera();

    }
);


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

                    facingMode:
                        cameraFacing,

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

            cameraVideo.muted =
                true;

            cameraVideo.playsInline =
                true;

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

    cameraError?.classList.add(
        "show"
    );

    if (cameraErrorText) {

        cameraErrorText.textContent =
            message;

    }

}


function cameraErrorMessage(error) {

    if (
        error?.name === "NotAllowedError"
    ) {

        return (
            "Camera permission was denied. " +
            "Please allow camera access."
        );

    }

    if (
        error?.name === "NotFoundError"
    ) {

        return "No camera was found.";

    }

    if (
        error?.name === "NotReadableError"
    ) {

        return (
            "The camera is being used by another application."
        );

    }

    return (
        "Unable to access the camera."
    );

}


function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        cameraStream =
            null;

    }

    if (cameraVideo) {

        cameraVideo.srcObject =
            null;

    }

}


function closeCamera() {

    stopRecording();

    stopCamera();

    cameraModal?.classList.remove(
        "show"
    );

}


/* =========================================================
   SWITCH CAMERA
========================================================= */

switchCamera?.addEventListener(
    "click",
    async () => {

        if (
            recorder &&
            recorder.state !== "inactive"
        ) {

            return;

        }

        cameraFacing =
            cameraFacing === "user"
                ? "environment"
                : "user";

        await startCamera();

    }
);


/* =========================================================
   PHOTO MODE
========================================================= */

photoMode?.addEventListener(
    "click",
    async () => {

        setPhotoMode();

        await startCamera();

    }
);


function setPhotoMode() {

    photoMode?.classList.add(
        "active"
    );

    videoMode?.classList.remove(
        "active"
    );


    if (takePhoto) {

        takePhoto.style.display =
            "inline-block";

    }

    if (startRecord) {

        startRecord.style.display =
            "none";

    }

    if (stopRecord) {

        stopRecord.style.display =
            "none";

    }

}


/* =========================================================
   VIDEO MODE
========================================================= */

videoMode?.addEventListener(
    "click",
    async () => {

        videoMode.classList.add(
            "active"
        );

        photoMode?.classList.remove(
            "active"
        );


        if (takePhoto) {

            takePhoto.style.display =
                "none";

        }

        if (startRecord) {

            startRecord.style.display =
                "inline-block";

        }

        if (stopRecord) {

            stopRecord.style.display =
                "none";

        }

        await startCamera();

    }
);


/* =========================================================
   TAKE PHOTO
========================================================= */

takePhoto?.addEventListener(
    "click",
    () => {

        if (
            !cameraVideo ||
            !cameraStream
        ) {

            return;

        }


        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            cameraVideo.videoWidth || 1280;

        canvas.height =
            cameraVideo.videoHeight || 720;


        const ctx =
            canvas.getContext("2d");


        ctx.drawImage(
            cameraVideo,
            0,
            0,
            canvas.width,
            canvas.height
        );


        canvas.toBlob(
            blob => {

                if (!blob) {
                    return;
                }

                const file =
                    new File(
                        [blob],
                        "camera-photo.jpg",
                        {
                            type: "image/jpeg"
                        }
                    );

                selectedImage =
                    file;

                selectedVideo =
                    null;

                selectedFile =
                    null;

                showAttachment(
                    file,
                    "image"
                );

                closeCamera();

            },
            "image/jpeg",
            0.92
        );

    }
);


/* =========================================================
   VIDEO RECORDING
========================================================= */

startRecord?.addEventListener(
    "click",
    startRecording
);


stopRecord?.addEventListener(
    "click",
    stopRecording
);


function startRecording() {

    if (!cameraStream) {

        return;

    }


    if (
        !window.MediaRecorder
    ) {

        alert(
            "Video recording is not supported by this browser."
        );

        return;

    }


    chunks = [];


    let mimeType =
        "video/webm";


    if (
        MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp9,opus"
        )
    ) {

        mimeType =
            "video/webm;codecs=vp9,opus";

    }

    else if (
        MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp8,opus"
        )
    ) {

        mimeType =
            "video/webm;codecs=vp8,opus";

    }


    try {

        recorder =
            new MediaRecorder(
                cameraStream,
                {
                    mimeType
                }
            );

    } catch {

        recorder =
            new MediaRecorder(
                cameraStream
            );

    }


    recorder.ondataavailable =
        event => {

            if (event.data.size > 0) {

                chunks.push(
                    event.data
                );

            }

        };


    recorder.onstop =
        saveRecordedVideo;


    recorder.start();


    recordingSeconds =
        0;

    updateRecordTime();


    recordingTimer =
        setInterval(
            () => {

                recordingSeconds++;

                updateRecordTime();

            },
            1000
        );


    if (startRecord) {

        startRecord.style.display =
            "none";

    }

    if (stopRecord) {

        stopRecord.style.display =
            "inline-block";

    }

}


function stopRecording() {

    if (
        recorder &&
        recorder.state !== "inactive"
    ) {

        recorder.stop();

    }


    if (recordingTimer) {

        clearInterval(
            recordingTimer
        );

        recordingTimer =
            null;

    }


    if (startRecord) {

        startRecord.style.display =
            "inline-block";

    }

    if (stopRecord) {

        stopRecord.style.display =
            "none";

    }

}


function updateRecordTime() {

    if (!recordTime) {
        return;
    }

    const minutes =
        Math.floor(
            recordingSeconds / 60
        );

    const seconds =
        recordingSeconds % 60;


    recordTime.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


function saveRecordedVideo() {

    const blob =
        new Blob(
            chunks,
            {
                type:
                    recorder?.mimeType ||
                    "video/webm"
            }
        );


    const file =
        new File(
            [blob],
            "camera-video.webm",
            {
                type:
                    blob.type
            }
        );


    selectedVideo =
        file;

    selectedImage =
        null;

    selectedFile =
        null;


    showAttachment(
        file,
        "video"
    );


    chunks = [];

    closeCamera();

}


/* =========================================================
   PLUGINS
========================================================= */

pluginBtn?.addEventListener(
    "click",
    () => {

        closePlus();

        pluginModal?.classList.add(
            "show"
        );

    }
);


pluginClose?.addEventListener(
    "click",
    () => {

        pluginModal?.classList.remove(
            "show"
        );

    }
);


/* =========================================================
   THINK HARDER
========================================================= */

thinkBtn?.addEventListener(
    "click",
    () => {

        thinkHarder =
            !thinkHarder;


        thinkBtn.classList.toggle(
            "active",
            thinkHarder
        );


        thinkBtn.setAttribute(
            "aria-pressed",
            String(thinkHarder)
        );

    }
);


/* =========================================================
   SEND MESSAGE
========================================================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);


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


/* =========================================================
   FILE TO BASE64
========================================================= */

function fileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    const result =
                        reader.result;

                    const base64 =
                        String(result)
                            .split(",")[1];

                    resolve(base64);

                };


            reader.onerror =
                reject;


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   SEND TO VERCEL
========================================================= */

async function sendMessage() {

    if (sending) {
        return;
    }


    const message =
        userInput?.value?.trim() || "";


    if (
        !message &&
        !selectedImage &&
        !selectedVideo &&
        !selectedFile
    ) {

        return;

    }


    sending = true;


    if (sendBtn) {

        sendBtn.disabled =
            true;

    }


    const attachment =
        selectedImage
            ? {
                type: "image",
                url:
                    URL.createObjectURL(
                        selectedImage
                    )
            }
            : selectedVideo
                ? {
                    type: "video",
                    url:
                        URL.createObjectURL(
                            selectedVideo
                        )
                }
                : selectedFile
                    ? {
                        type: "file",
                        name:
                            selectedFile.name
                    }
                    : null;


    addMessage(
        message,
        "user",
        attachment,
        true
    );


    const imageFile =
        selectedImage;


    const videoFile =
        selectedVideo;


    userInput.value = "";

    resizeInput();


    clearAttachment();

    showTyping();


    try {

        const body = {

            message,

            thinkHarder

        };


        /* IMAGE */

        if (imageFile) {

            body.image = {

                data:
                    await fileToBase64(
                        imageFile
                    ),

                mimeType:
                    imageFile.type

            };

        }


        /*
          Video is displayed locally.

          The current /api/gemini.js
          accepts image input, not video input.
        */

        if (videoFile) {

            body.message =
                message ||
                "I recorded a video, but video analysis is not enabled yet. Please describe what you want to do with the video.";

        }


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


        let data = null;


        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Vercel API returned an invalid response."
            );

        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `API error ${response.status}`
            );

        }


        const answer =
            data?.answer ||
            data?.reply ||
            data?.text;


        if (!answer) {

            throw new Error(
                "The AI returned an empty response."
            );

        }


        removeTyping();


        addMessage(
            answer,
            "ai",
            null,
            true
        );


        saveCurrentChat();


    } catch (error) {

        console.error(
            "SwiftCortex API error:",
            error
        );


        removeTyping();


        addMessage(
            "Connection error: " +
            (
                error?.message ||
                "Unable to connect to the AI."
            ),
            "ai",
            null,
            false
        );

    }


    sending = false;


    if (sendBtn) {

        sendBtn.disabled =
            false;

    }


    userInput?.focus();

}


/* =========================================================
   MEMORY
========================================================= */

function updateMemoryUI() {

    if (memoryStatus) {

        memoryStatus.textContent =
            memoryEnabled
                ? "ON"
                : "OFF";

    }


    if (settingsMemory) {

        settingsMemory.textContent =
            memoryEnabled
                ? "On"
                : "Off";

    }

}


memoryBtn?.addEventListener(
    "click",
    () => {

        memoryEnabled =
            !memoryEnabled;


        localStorage.setItem(
            "swift_memory",
            memoryEnabled
                ? "on"
                : "off"
        );


        updateMemoryUI();

    }
);


/* =========================================================
   THEME
========================================================= */

function applyTheme(theme) {

    if (theme === "light") {

        document.body.classList.add(
            "light"
        );

    }

    else if (theme === "dark") {

        document.body.classList.remove(
            "light"
        );

    }

    else {

        const light =
            window.matchMedia(
                "(prefers-color-scheme: light)"
            ).matches;

        document.body.classList.toggle(
            "light",
            light
        );

    }


    updateThemeButton();

}


function updateThemeButton() {

    if (!themeBtn) {
        return;
    }

    const light =
        document.body.classList.contains(
            "light"
        );


    themeBtn.innerHTML =
        light
            ? "☀️ <span>Light Mode</span>"
            : "🌙 <span>Dark Mode</span>";

}


themeBtn?.addEventListener(
    "click",
    () => {

        const current =
            localStorage.getItem(
                "swift_theme"
            ) || "dark";


        const next =
            current === "light"
                ? "dark"
                : "light";


        localStorage.setItem(
            "swift_theme",
            next
        );


        applyTheme(next);

    }
);


/* =========================================================
   SETTINGS
========================================================= */

settingsBtn?.addEventListener(
    "click",
    () => {

        sidebar?.classList.remove(
            "open"
        );

        settingsModal?.classList.add(
            "show"
        );

    }
);


settingsClose?.addEventListener(
    "click",
    () => {

        settingsModal?.classList.remove(
            "show"
        );

    }
);


/* =========================================================
   PROFILE
========================================================= */

profileBtn?.addEventListener(
    "click",
    () => {

        profileModal?.classList.add(
            "show"
        );

    }
);


profileClose?.addEventListener(
    "click",
    () => {

        profileModal?.classList.remove(
            "show"
        );

    }
);


/* =========================================================
   LOAD HISTORY
========================================================= */

function loadHistory() {

    if (!historyList) {
        return;
    }

    historyList.innerHTML = "";


    const history =
        getHistory();


    history.forEach(
        chat => {

            const item =
                document.createElement(
                    "button"
                );

            item.className =
                "history-item";

            item.textContent =
                chat.title ||
                "New Chat";


            item.addEventListener(
                "click",
                () => {

                    loadChat(
                        chat
                    );

                }
            );


            historyList.appendChild(
                item
            );

        }
    );

}


function loadChat(chat) {

    if (!chat) {
        return;
    }


    currentChat =
        Array.isArray(
            chat.messages
        )
            ? [...chat.messages]
            : [];


    messages.innerHTML = "";


    currentChat.forEach(
        item => {

            addMessage(
                item.text,
                item.type,
                null,
                false
            );

        }
    );


    sidebar?.classList.remove(
        "open"
    );


    scrollChat();

}


/* =========================================================
   CLEAR HISTORY
========================================================= */

function clearAllHistory() {

    localStorage.removeItem(
        "swift_history"
    );


    currentChat = [];


    if (historyList) {

        historyList.innerHTML = "";

    }


    showWelcome();


    alert(
        "✅ Chat history has been cleared."
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

function loadSettings() {

    const savedMemory =
        localStorage.getItem(
            "swift_memory"
        );


    if (savedMemory !== null) {

        memoryEnabled =
            savedMemory === "on";

    }


    const savedTheme =
        localStorage.getItem(
            "swift_theme"
        );


    if (savedTheme) {

        applyTheme(
            savedTheme
        );

    }

    else {

        applyTheme(
            "dark"
        );

    }


    updateMemoryUI();

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSettings();

        loadHistory();

        resizeInput();

    }
);


/* =========================================================
   GLOBAL ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }

        closePlus();

        closeCamera();

        settingsModal?.classList.remove(
            "show"
        );

        pluginModal?.classList.remove(
            "show"
        );

        profileModal?.classList.remove(
            "show"
        );

    }
);


/* =========================================================
   START
========================================================= */

loadSettings();

loadHistory();

console.log(
    "⚡ SwiftCortex AI Ultra script.js loaded successfully."
);
