"use strict";

/* =========================================================
   SwiftCortex AI Ultra
   COMPLETE NEW script.js

   Includes:
   ✅ New Chat
   ✅ Chat UI
   ✅ Enter to send
   ✅ Plus menu
   ✅ Camera
   ✅ Front / Back camera
   ✅ Take photo
   ✅ Video recording
   ✅ Photos upload
   ✅ Files upload
   ✅ Attachment preview
   ✅ Plugins modal
   ✅ Think Harder
   ✅ Memory
   ✅ Dark / Light / System theme
   ✅ ChatGPT-style Settings
   ✅ Language setting
   ✅ Notifications setting
   ✅ Privacy / Save history
   ✅ Clear history
   ✅ Local chat history
========================================================= */


/* =========================================================
   HELPER
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

let memoryEnabled =
    localStorage.getItem("swift_memory") !== "off";

let sending = false;

let currentChat = [];


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
        text,
        type,
        time: Date.now()
    });

}


function saveCurrentChat() {

    if (!currentChat.length) return;

    if (
        localStorage.getItem("swift_save_history") === "off"
    ) {
        return;
    }

    const history = getHistory();

    const firstUserMessage =
        currentChat.find(
            message => message.type === "user"
        );

    const title =
        firstUserMessage?.text?.slice(0, 40) ||
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

    if (!messages) return;

    requestAnimationFrame(() => {

        messages.scrollTop =
            messages.scrollHeight;

    });

}


/* =========================================================
   REMOVE WELCOME SCREEN
========================================================= */

function removeWelcome() {

    const welcome =
        messages?.querySelector(".welcome");

    if (welcome) {

        welcome.remove();

    }

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

    if (!messages) return null;

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

        box.appendChild(textBox);

    }


    if (
        attachment &&
        attachment.type === "image"
    ) {

        const img =
            document.createElement("img");

        img.src =
            attachment.url;

        img.alt =
            "Uploaded image";

        img.loading =
            "lazy";

        box.appendChild(img);

    }


    if (
        attachment &&
        attachment.type === "video"
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

        box.appendChild(video);

    }


    if (
        attachment &&
        attachment.type === "file"
    ) {

        const fileBox =
            document.createElement("div");

        fileBox.className =
            "message-file";

        fileBox.textContent =
            "📄 " + attachment.name;

        box.appendChild(fileBox);

    }


    messages.appendChild(box);

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
   TYPING INDICATOR
========================================================= */

function showTyping() {

    removeTyping();

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

    box.appendChild(text);

    messages?.appendChild(box);

    scrollChat();

}


function removeTyping() {

    const typing =
        $("swiftTyping");

    typing?.remove();

}


/* =========================================================
   ATTACHMENT PREVIEW
========================================================= */

function showAttachment(
    file,
    type
) {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";


    const box =
        document.createElement("div");

    box.className =
        "attachment-box";


    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.alt =
            file.name;

        box.appendChild(img);

    }


    if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(file);

        video.controls =
            true;

        video.muted =
            true;

        video.playsInline =
            true;

        box.appendChild(video);

    }


    const name =
        document.createElement("div");

    name.className =
        "attachment-name";

    if (type === "image") {

        name.textContent =
            "🖼️ " + file.name;

    }

    else if (type === "video") {

        name.textContent =
            "🎥 " + file.name;

    }

    else {

        name.textContent =
            "📄 " + file.name;

    }

    box.appendChild(name);


    const remove =
        document.createElement("button");

    remove.className =
        "attachment-remove";

    remove.type =
        "button";

    remove.textContent =
        "✕";

    remove.addEventListener(
        "click",
        clearAttachment
    );

    box.appendChild(remove);


    imagePreview.appendChild(box);

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
   MOBILE SIDEBAR
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


document.addEventListener(
    "click",
    event => {

        if (
            window.innerWidth <= 800 &&
            sidebar?.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            event.target !== menuBtn
        ) {

            sidebar.classList.remove(
                "open"
            );

        }

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


    if (messages) {

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

                    <button
                        data-prompt="Tell me today's latest news"
                    >
                        📰 Latest News
                    </button>

                    <button
                        data-prompt="Help me write something"
                    >
                        ✍️ Write
                    </button>

                    <button
                        data-prompt="Explain something to me"
                    >
                        💡 Explain
                    </button>

                    <button
                        data-prompt="Help me with coding"
                    >
                        💻 Coding
                    </button>

                </div>

            </div>

        `;

    }


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

        if (!button) return;

        const prompt =
            button.dataset.prompt;

        if (userInput) {

            userInput.value =
                prompt;

            resizeInput();

            userInput.focus();

        }

    }
);


/* =========================================================
   PHOTOS
========================================================= */

photoBtn?.addEventListener(
    "click",
    () => {

        closePlus();

        if (!imageInput) return;

        imageInput.value = "";

        imageInput.click();

    }
);


imageInput?.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files?.[0];

        if (!file) return;


        if (
            !file.type.startsWith(
                "image/"
            )
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
   FILES
========================================================= */

fileBtn?.addEventListener(
    "click",
    () => {

        closePlus();

        if (!fileInput) return;

        fileInput.value = "";

        fileInput.click();

    }
);


fileInput?.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files?.[0];

        if (!file) return;


        if (
            file.type.startsWith(
                "image/"
            )
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
            file.type.startsWith(
                "video/"
            )
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
            cameraErrorMessage(
                error
            )
        );

    }

}


function showCameraError(
    message
) {

    cameraError?.classList.add(
        "show"
    );


    if (cameraErrorText) {

        cameraErrorText.textContent =
            message;

    }

}


function cameraErrorMessage(
    error
) {

    if (
        error?.name ===
        "NotAllowedError"
    ) {

        return (
            "Camera permission was denied. " +
            "Allow camera access in your browser settings."
        );

    }


    if (
        error?.name ===
        "NotFoundError"
    ) {

        return (
            "No camera was found on this device."
        );

    }


    if (
        error?.name ===
        "NotReadableError"
    ) {

        return (
            "The camera is being used by another application."
        );

    }


    if (
        error?.name ===
        "SecurityError"
    ) {

        return (
            "Camera access is blocked by browser security."
        );

    }


    return (
        "Camera permission or device error."
    );

}


function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
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

        if (recorder &&
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


    if (takePhoto)
        takePhoto.style.display =
            "inline-block";


    if (startRecord)
        startRecord.style.display =
            "none";


    if (stopRecord)
        stopRecord.style.display =
            "none";

}


/* =========================================================
   VIDEO MODE
========================================================= */

videoMode?.addEventListener(
    "click",
    async () => {

        setVideoMode();

        await startCamera();

    }
);


function setVideoMode() {

    videoMode?.classList.add(
        "active"
    );

    photoMode?.classList.remove(
        "active"
    );


    if (takePhoto)
        takePhoto.style.display =
            "none";


    if (startRecord)
        startRecord.style.display =
            "inline-block";


    if (stopRecord)
        stopRecord.style.display =
            "none";

}


/* =========================================================
   TAKE PHOTO
========================================================= */

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
        document.createElement(
            "canvas"
        );


    canvas.width =
        cameraVideo?.videoWidth ||
        1280;


    canvas.height =
        cameraVideo?.videoHeight ||
        720;


    const ctx =
        canvas.getContext(
            "2d"
        );


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
        0.9
    );

}


/* =========================================================
   VIDEO RECORDING
========================================================= */

function supportedMime() {

    if (
        !window.MediaRecorder
    ) {

        return "";

    }


    const types = [

        "video/webm;codecs=vp9,opus",

        "video/webm;codecs=vp8,opus",

        "video/webm"

    ];


    for (
        const type of types
    ) {

        if (
            MediaRecorder.isTypeSupported(
                type
            )
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


    if (
        !window.MediaRecorder
    ) {

        addMessage(
            "❌ Video recording is not supported by this browser.",
            "ai"
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
                        mimeType:
                            mime
                    }
                )
                : new MediaRecorder(
                    cameraStream
                );

    } catch (error) {

        console.error(
            error
        );

        addMessage(
            "❌ Could not start video recording.",
            "ai"
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


    recordTime?.classList.add(
        "show"
    );


    if (startRecord)
        startRecord.style.display =
            "none";


    if (stopRecord)
        stopRecord.style.display =
            "inline-block";


    if (switchCamera)
        switchCamera.disabled =
            true;

}


function updateRecordTime() {

    if (!recordTime) return;


    const minutes =
        Math.floor(
            recordingSeconds / 60
        )
        .toString()
        .padStart(
            2,
            "0"
        );


    const seconds =
        (
            recordingSeconds % 60
        )
        .toString()
        .padStart(
            2,
            "0"
        );


    recordTime.textContent =
        `🔴 ${minutes}:${seconds}`;

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

        recordingTimer =
            null;

    }


    if (
        recorder &&
        recorder.state !== "inactive"
    ) {

        recorder.stop();

    }


    recordTime?.classList.remove(
        "show"
    );


    if (stopRecord)
        stopRecord.style.display =
            "none";


    if (
        videoMode?.classList.contains(
            "active"
        )
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

    if (!chunks.length) {

        return;

    }


    const mime =
        recorder?.mimeType ||
        "video/webm";


    const blob =
        new Blob(
            chunks,
            {
                type:
                    mime
            }
        );


    const extension =
        mime.includes("mp4")
            ? "mp4"
            : "webm";


    const file =
        new File(
            [blob],
            `camera-video.${extension}`,
            {
                type:
                    mime
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


    if (mediaResult) {

        mediaResult.innerHTML =
            "";


        const video =
            document.createElement(
                "video"
            );


        video.src =
            URL.createObjectURL(
                file
            );


        video.controls =
            true;

        video.playsInline =
            true;


        mediaResult.appendChild(
            video
        );

    }


    chunks = [];

}


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
   SETTINGS DATA
========================================================= */

const settingsData = {

    account: {

        icon: "👤",

        title: "Account",

        description:
            "Manage your SwiftCortex account",

        content: `

            <div class="settings-detail-card">

                <div class="settings-big-icon">
                    👤
                </div>

                <h3>
                    Guest User
                </h3>

                <p>
                    You are currently using
                    SwiftCortex as a guest.
                </p>

                <button
                    class="settings-action"
                    type="button"
                    onclick="alert('Sign in system coming soon.')"
                >
                    🔐 Sign In
                </button>

                <button
                    class="settings-action"
                    type="button"
                    onclick="alert('Account creation coming soon.')"
                >
                    📝 Create Account
                </button>

            </div>

        `

    },


    memory: {

        icon: "🧠",

        title: "Memory",

        description:
            "Control what SwiftCortex remembers",

        content: `

            <div class="settings-option-row">

                <div>

                    <strong>
                        Memory
                    </strong>

                    <small>
                        Allow SwiftCortex to remember
                        useful information between
                        conversations.
                    </small>

                </div>

                <button
                    id="memoryToggleSettings"
                    class="settings-toggle"
                    type="button"
                >
                    <span></span>
                </button>

            </div>

            <div class="settings-info">

                🧠 Memory helps SwiftCortex
                provide more personalized responses.

            </div>

        `

    },


    appearance: {

        icon: "🎨",

        title: "Appearance",

        description:
            "Choose how SwiftCortex looks",

        content: `

            <div class="settings-section-title">
                Theme
            </div>

            <button
                class="appearance-option"
                data-theme="dark"
                type="button"
            >

                <span>🌙</span>

                <div>

                    <strong>
                        Dark
                    </strong>

                    <small>
                        Dark appearance
                    </small>

                </div>

                <b class="theme-check">
                    ✓
                </b>

            </button>


            <button
                class="appearance-option"
                data-theme="light"
                type="button"
            >

                <span>☀️</span>

                <div>

                    <strong>
                        Light
                    </strong>

                    <small>
                        Light appearance
                    </small>

                </div>

                <b class="theme-check">
                    ✓
                </b>

            </button>


            <button
                class="appearance-option"
                data-theme="system"
                type="button"
            >

                <span>💻</span>

                <div>

                    <strong>
                        System
                    </strong>

                    <small>
                        Follow your device settings
                    </small>

                </div>

                <b class="theme-check">
                    ✓
                </b>

            </button>

        `

    },


    language: {

        icon: "🌐",

        title: "Language",

        description:
            "Choose your preferred language",

        content: `

            <div class="settings-section-title">
                App language
            </div>

            <select
                id="languageSelect"
                class="settings-select"
            >

                <option value="auto">
                    Auto
                </option>

                <option value="en">
                    English
                </option>

                <option value="bn">
                    বাংলা
                </option>

                <option value="it">
                    Italiano
                </option>

            </select>

            <div class="settings-info">

                🌐 Your language preference is
                saved on this device.

            </div>

        `

    },


    notifications: {

        icon: "🔔",

        title: "Notifications",

        description:
            "Manage notifications",

        content: `

            <div class="settings-option-row">

                <div>

                    <strong>
                        Notifications
                    </strong>

                    <small>
                        Allow SwiftCortex to send
                        notifications.
                    </small>

                </div>

                <button
                    id="notificationToggle"
                    class="settings-toggle"
                    type="button"
                >
                    <span></span>
                </button>

            </div>

            <div class="settings-info">

                🔔 Notification support depends
                on your browser.

            </div>

        `

    },


    subscription: {

        icon: "💎",

        title: "Subscription",

        description:
            "Manage your plan",

        content: `

            <div class="subscription-card">

                <div class="subscription-icon">
                    💎
                </div>

                <h3>
                    Free Plan
                </h3>

                <p>
                    You are currently using
                    the SwiftCortex Free Plan.
                </p>

                <button
                    class="premium-btn"
                    type="button"
                    onclick="alert('Premium subscription coming soon.')"
                >
                    💎 Upgrade to Premium
                </button>

            </div>

        `

    },


    privacy: {

        icon: "🔒",

        title: "Privacy & Data",

        description:
            "Manage your privacy",

        content: `

            <div class="settings-option-row">

                <div>

                    <strong>
                        Save chat history
                    </strong>

                    <small>
                        Store recent conversations
                        on this device.
                    </small>

                </div>

                <button
                    id="historyToggle"
                    class="settings-toggle"
                    type="button"
                >
                    <span></span>
                </button>

            </div>

            <div class="settings-info">

                🔒 Your local preferences are
                stored in your browser.

            </div>

        `

    },


    clear: {

        icon: "🗑️",

        title: "Clear History",

        description:
            "Remove recent chats",

        content: `

            <div class="danger-card">

                <div class="danger-icon">
                    🗑️
                </div>

                <h3>
                    Clear chat history?
                </h3>

                <p>
                    This will remove the recent
                    chat list saved on this device.
                </p>

                <button
                    id="clearHistoryConfirm"
                    class="danger-btn"
                    type="button"
                >
                    🗑️ Clear History
                </button>

            </div>

        `

    }

};


const settingNames = [

    "account",
    "memory",
    "appearance",
    "language",
    "notifications",
    "subscription",
    "privacy",
    "clear"

];


/* =========================================================
   SETTINGS
========================================================= */

const settingsItems =
    $$(".settings-list .setting-item");


settingsBtn?.addEventListener(
    "click",
    () => {

        sidebar?.classList.remove(
            "open"
        );

        settingsModal?.classList.add(
            "show"
        );

        openSettingsHome();

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


function openSettingsHome() {

    const box =
        settingsModal?.querySelector(
            ".settings-box"
        );

    if (!box) return;


    const header =
        box.querySelector(
            ".modal-header"
        );

    const list =
        box.querySelector(
            ".settings-list"
        );

    if (!header || !list) return;


    const title =
        header.querySelector(
            "strong"
        );

    const subtitle =
        header.querySelector(
            "small"
        );


    if (title) {

        title.textContent =
            "⚙️ Settings";

        title.style.cursor =
            "default";

        title.onclick =
            null;

    }


    if (subtitle) {

        subtitle.textContent =
            "SwiftCortex AI preferences";

    }


    list.innerHTML = "";


    settingNames.forEach(
        key => {

            const data =
                settingsData[key];

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "setting-item";

            button.dataset.setting =
                key;


            button.innerHTML = `

                <span>
                    ${data.icon} ${data.title}
                </span>

                <small>
                    ${data.description}
                </small>

            `;


            button.addEventListener(
                "click",
                () => {

                    openSettingPage(
                        key
                    );

                }
            );


            list.appendChild(
                button
            );

        }
    );

}


function openSettingPage(
    key
) {

    const data =
        settingsData[key];

    if (!data) return;


    const box =
        settingsModal?.querySelector(
            ".settings-box"
        );

    if (!box) return;


    const header =
        box.querySelector(
            ".modal-header"
        );

    const list =
        box.querySelector(
            ".settings-list"
        );

    if (!header || !list) return;


    const title =
        header.querySelector(
            "strong"
        );

    const subtitle =
        header.querySelector(
            "small"
        );


    if (title) {

        title.innerHTML =
            `‹ &nbsp; ${data.icon} ${data.title}`;

        title.style.cursor =
            "pointer";

        title.onclick =
            openSettingsHome;

    }


    if (subtitle) {

        subtitle.textContent =
            data.description;

    }


    list.innerHTML = `

        <div class="settings-detail">

            ${data.content}

        </div>

    `;


    bindSettingControls(
        key
    );

}


/* =========================================================
   SETTING CONTROLS
========================================================= */

function bindSettingControls(
    key
) {


    /* MEMORY */

    if (key === "memory") {

        const toggle =
            $("memoryToggleSettings");

        if (!toggle) return;


        updateMemoryToggle(
            toggle
        );


        toggle.onclick =
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

                updateMemoryToggle(
                    toggle
                );

            };

    }


    /* APPEARANCE */

    if (key === "appearance") {

        const options =
            $$(".appearance-option");


        const savedTheme =
            localStorage.getItem(
                "swift_theme"
            ) || "dark";


        updateThemeChecks(
            options,
            savedTheme
        );


        options.forEach(
            option => {

                option.onclick =
                    () => {

                        const theme =
                            option.dataset.theme;


                        localStorage.setItem(
                            "swift_theme",
                            theme
                        );


                        applyTheme(
                            theme
                        );


                        updateThemeChecks(
                            options,
                            theme
                        );

                    };

            }
        );

    }


    /* LANGUAGE */

    if (key === "language") {

        const select =
            $("languageSelect");

        if (!select) return;


        select.value =
            localStorage.getItem(
                "swift_language"
            ) || "auto";


        select.onchange =
            () => {

                localStorage.setItem(
                    "swift_language",
                    select.value
                );

            };

    }


    /* NOTIFICATIONS */

    if (key === "notifications") {

        const toggle =
            $("notificationToggle");

        if (!toggle) return;


        let enabled =
            localStorage.getItem(
                "swift_notifications"
            ) !== "off";


        setToggleState(
            toggle,
            enabled
        );


        toggle.onclick =
            () => {

                enabled =
                    !enabled;


                localStorage.setItem(
                    "swift_notifications",
                    enabled
                        ? "on"
                        : "off"
                );


                setToggleState(
                    toggle,
                    enabled
                );

            };

    }


    /* PRIVACY */

    if (key === "privacy") {

        const toggle =
            $("historyToggle");

        if (!toggle) return;


        let enabled =
            localStorage.getItem(
                "swift_save_history"
            ) !== "off";


        setToggleState(
            toggle,
            enabled
        );


        toggle.onclick =
            () => {

                enabled =
                    !enabled;


                localStorage.setItem(
                    "swift_save_history",
                    enabled
                        ? "on"
                        : "off"
                );


                setToggleState(
                    toggle,
                    enabled
                );

            };

    }


    /* CLEAR */

    if (key === "clear") {

        const button =
            $("clearHistoryConfirm");

        button?.addEventListener(
            "click",
            clearAllHistory
        );

    }

}


/* =========================================================
   TOGGLE
========================================================= */

function setToggleState(
    toggle,
    enabled
) {

    if (!toggle) return;


    toggle.classList.toggle(
        "active",
        enabled
    );

}


/* =========================================================
   MEMORY UI
========================================================= */

function updateMemoryUI() {

    const state =
        memoryEnabled
            ? "ON"
            : "OFF";


    if (memoryStatus) {

        memoryStatus.textContent =
            state;

    }


    if (settingsMemory) {

        settingsMemory.textContent =
            memoryEnabled
                ? "On"
                : "Off";

    }

}


function updateMemoryToggle(
    toggle
) {

    setToggleState(
        toggle,
        memoryEnabled
    );

}


/* =========================================================
   THEME
========================================================= */

function applyTheme(
    theme
) {

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

        const prefersLight =
            window.matchMedia(
                "(prefers-color-scheme: light)"
            ).matches;


        document.body.classList.toggle(
            "light",
            prefersLight
        );

    }


    updateThemeButton();

}


function updateThemeButton() {

    if (!themeBtn) return;


    const light =
        document.body.classList.contains(
            "light"
        );


    themeBtn.innerHTML =
        light
            ? "☀️ <span>Light Mode</span>"
            : "🌙 <span>Dark Mode</span>";

}


function updateThemeChecks(
    options,
    current
) {

    options.forEach(
        option => {

            option.classList.toggle(
                "selected",
                option.dataset.theme === current
            );

        }
    );

}


/* =========================================================
   THEME BUTTON
========================================================= */

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


        applyTheme(
            next
        );

    }
);


/* =========================================================
   MEMORY BUTTON
========================================================= */

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
   CLEAR HISTORY
========================================================= */

function clearAllHistory() {

    localStorage.removeItem(
        "swift_history"
    );


    currentChat = [];


    if (historyList) {

        historyList.innerHTML =
            "";

    }


    alert(
        "✅ Chat history has been cleared."
    );


    openSettingsHome();

}


/* =========================================================
   LOAD HISTORY LIST
========================================================= */

function renderHistory() {

    if (!historyList) return;


    historyList.innerHTML =
        "";


    const history =
        getHistory();


    history.forEach(
        chat => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "history-item";

            button.type =
                "button";

            button.textContent =
                chat.title || "New Chat";


            button.addEventListener(
                "click",
                () => {

                    loadChat(
                        chat
                    );

                }
            );


            historyList.appendChild(
                button
            );

        }
    );

}


function loadChat(
    chat
) {

    if (!chat) return;


    currentChat = [];


    removeWelcome();


    if (messages) {

        messages.innerHTML =
            "";

    }


    (chat.messages || [])
        .forEach(
            message => {

                addMessage(
                    message.text,
                    message.type,
                    null,
                    false
                );


                currentChat.push(
                    message
                );

            }
        );


    sidebar?.classList.remove(
        "open"
    );


    scrollChat();

}


/* =========================================================
   TEXT AREA
========================================================= */

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


/* =========================================================
   ENTER TO SEND
========================================================= */

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
   SEND BUTTON
========================================================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);


/* =========================================================
   BUILD ATTACHMENT
========================================================= */

function getSelectedAttachment() {

    if (selectedImage) {

        return {

            type:
                "image",

            file:
                selectedImage,

            url:
                URL.createObjectURL(
                    selectedImage
                )

        };

    }


    if (selectedVideo) {

        return {

            type:
                "video",

            file:
                selectedVideo,

            url:
                URL.createObjectURL(
                    selectedVideo
                )

        };

    }


    if (selectedFile) {

        return {

            type:
                "file",

            file:
                selectedFile,

            name:
                selectedFile.name

        };

    }


    return null;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (sending) return;


    const text =
        userInput?.value.trim() ||
        "";


    const attachment =
        getSelectedAttachment();


    if (
        !text &&
        !attachment
    ) {

        return;

    }


    sending = true;


    const attachmentForUI =
        attachment
            ? {
                type:
                    attachment.type,

                url:
                    attachment.url,

                name:
                    attachment.file?.name ||
                    attachment.name ||
                    ""
            }
            : null;


    addMessage(
        text,
        "user",
        attachmentForUI
    );


    if (userInput) {

        userInput.value =
            "";

        resizeInput();

    }


    clearAttachment();

    showTyping();


    try {

        const response =
            await callAI(
                text,
                attachment
            );


        removeTyping();


        addMessage(
            response,
            "ai"
        );


    } catch (error) {

        console.error(
            "AI error:",
            error
        );


        removeTyping();


        addMessage(
            "⚠️ Connection error. Please check your Vercel API/function and try again.",
            "ai"
        );

    }


    sending = false;

}


/* =========================================================
   AI REQUEST
========================================================= */

async function callAI(
    text,
    attachment
) {

    /*
       IMPORTANT:

       This calls your Vercel backend.

       Change only this URL if your backend
       function has a different path.
    */

    const endpoint =
        "/api/chat";


    const body = {

        message:
            text || "",

        thinkHarder:
            thinkHarder,

        memory:
            memoryEnabled

    };


    /*
       Images are converted to Base64.

       This allows your Vercel backend to
       receive the image without exposing
       an API key in the browser.
    */

    if (
        attachment &&
        attachment.type === "image"
    ) {

        body.image =
            await fileToDataURL(
                attachment.file
            );

        body.imageName =
            attachment.file.name;

    }


    /*
       Video / generic files are sent as
       metadata only here.

       Your backend can later be upgraded
       to process them.
    */

    if (
        attachment &&
        attachment.type === "video"
    ) {

        body.videoName =
            attachment.file.name;

        body.videoType =
            attachment.file.type;

    }


    if (
        attachment &&
        attachment.type === "file"
    ) {

        body.fileName =
            attachment.file.name;

        body.fileType =
            attachment.file.type;

    }


    const response =
        await fetch(
            endpoint,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        body
                    )

            }
        );


    if (!response.ok) {

        const errorText =
            await response.text()
                .catch(
                    () => ""
                );


        throw new Error(
            `API ${response.status}: ${errorText}`
        );

    }


    const data =
        await response.json();


    /*
       Supports several common backend
       response formats.
    */

    const answer =
        data.reply ||
        data.response ||
        data.message ||
        data.text ||
        data.output ||
        data.content ||
        data.choices?.[0]?.message?.content ||
        data.candidates?.[0]?.content?.parts?.map(
            part => part.text || ""
        ).join("") ||
        "";


    if (!answer) {

        throw new Error(
            "No response from AI."
        );

    }


    return answer;

}


/* =========================================================
   FILE → DATA URL
========================================================= */

function fileToDataURL(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    resolve(
                        reader.result
                    );

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
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    event => {

        const modals =
            [
                cameraModal,
                settingsModal,
                pluginModal,
                profileModal
            ];


        modals.forEach(
            modal => {

                if (
                    modal &&
                    event.target === modal
                ) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

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
   LOAD SETTINGS
========================================================= */

function loadSettings() {

    const savedMemory =
        localStorage.getItem(
            "swift_memory"
        );


    if (
        savedMemory !== null
    ) {

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


/* =========================================================
   INITIALIZE
========================================================= */

function initializeSwiftCortex() {

    loadSettings();

    renderHistory();

    resizeInput();


    /*
       Prevent accidental form-like submission
       if buttons are inside a form.
    */

    document
        .querySelectorAll("button")
        .forEach(
            button => {

                if (
                    !button.type
                ) {

                    button.type =
                        "button";

                }

            }
        );


    console.log(
        "⚡ SwiftCortex AI Ultra loaded successfully."
    );

}


initializeSwiftCortex();


/* =========================================================
   SAVE CHAT BEFORE PAGE CLOSE
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (
            currentChat.length
        ) {

            saveCurrentChat();

        }

    }
);
