"use strict";

/* =========================================================
   SwiftCortex AI Ultra
   COMPLETE script.js
   API: /api/gemini

   Features:
   ✅ Normal Chat
   ✅ Microphone / Voice Input
   ✅ Enter to Send
   ✅ New Chat
   ✅ Chat History
   ✅ Plus Menu
   ✅ Camera
   ✅ Front / Back Camera
   ✅ Take Photo
   ✅ Video Recording
   ✅ Photos
   ✅ Files
   ✅ Image Preview
   ✅ Video Preview
   ✅ Image AI Analysis
   ✅ Video First-Frame Analysis
   ✅ Plugins
   ✅ Think Harder
   ✅ Memory
   ✅ Settings
   ✅ Theme
   ✅ Clear History
========================================================= */


/* =========================================================
   HELPER
========================================================= */

const $ = id => document.getElementById(id);


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

const micBtn = $("micBtn");

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
let recordedChunks = [];

let recordingSeconds = 0;
let recordingTimer = null;

let thinkHarder = false;
let sending = false;

let currentChat = [];

let recognition = null;
let isListening = false;

let memoryEnabled =
    localStorage.getItem("swift_memory") !== "off";

let currentTheme =
    localStorage.getItem("swift_theme") || "dark";


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    applyTheme();

    updateMemoryUI();

    renderHistory();

    setupSpeechRecognition();

    setupTextarea();

    setupModals();

});


/* =========================================================
   THEME
========================================================= */

function applyTheme() {

    document.documentElement.dataset.theme =
        currentTheme;

    document.body.dataset.theme =
        currentTheme;

    if (!themeBtn) return;

    if (currentTheme === "dark") {

        themeBtn.innerHTML =
            "🌙 <span>Dark Mode</span>";

    } else if (currentTheme === "light") {

        themeBtn.innerHTML =
            "☀️ <span>Light Mode</span>";

    } else {

        themeBtn.innerHTML =
            "🖥️ <span>System</span>";

    }

}


themeBtn?.addEventListener("click", () => {

    if (currentTheme === "dark") {

        currentTheme = "light";

    } else if (currentTheme === "light") {

        currentTheme = "system";

    } else {

        currentTheme = "dark";

    }

    localStorage.setItem(
        "swift_theme",
        currentTheme
    );

    applyTheme();

});


/* =========================================================
   MEMORY
========================================================= */

function updateMemoryUI() {

    if (memoryStatus) {

        memoryStatus.textContent =
            memoryEnabled ? "ON" : "OFF";

    }

    if (settingsMemory) {

        settingsMemory.textContent =
            memoryEnabled ? "On" : "Off";

    }

}


memoryBtn?.addEventListener("click", () => {

    memoryEnabled =
        !memoryEnabled;

    localStorage.setItem(
        "swift_memory",
        memoryEnabled ? "on" : "off"
    );

    updateMemoryUI();

});


/* =========================================================
   HISTORY
========================================================= */

function getHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "swift_history"
            ) || "[]"
        );

    } catch {

        return [];

    }

}


function saveHistory(history) {

    if (
        localStorage.getItem(
            "swift_save_history"
        ) === "off"
    ) {
        return;
    }

    localStorage.setItem(
        "swift_history",
        JSON.stringify(history)
    );

}


function saveCurrentMessage(
    text,
    type
) {

    if (
        localStorage.getItem(
            "swift_save_history"
        ) === "off"
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
        localStorage.getItem(
            "swift_save_history"
        ) === "off"
    ) {
        return;
    }

    const history =
        getHistory();

    const firstUser =
        currentChat.find(
            item =>
                item.type === "user"
        );

    const title =
        firstUser?.text?.trim()?.slice(
            0,
            45
        ) ||
        "New Chat";

    history.unshift({

        id: Date.now(),

        title,

        messages: currentChat

    });

    saveHistory(
        history.slice(0, 50)
    );

    renderHistory();

}


function renderHistory() {

    if (!historyList) {
        return;
    }

    historyList.innerHTML = "";

    const history =
        getHistory();

    if (!history.length) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "history-empty";

        empty.textContent =
            "No recent chats";

        historyList.appendChild(
            empty
        );

        return;
    }

    history.forEach(chat => {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "history-item";

        button.type =
            "button";

        button.textContent =
            chat.title ||
            "New Chat";

        button.addEventListener(
            "click",
            () => {

                loadHistoryChat(
                    chat.id
                );

            }
        );

        historyList.appendChild(
            button
        );

    });

}


function loadHistoryChat(id) {

    const history =
        getHistory();

    const chat =
        history.find(
            item =>
                item.id === id
        );

    if (!chat) {
        return;
    }

    currentChat =
        Array.isArray(chat.messages)
            ? [...chat.messages]
            : [];

    if (!messages) {
        return;
    }

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

    userInput?.focus();

}


/* =========================================================
   CHAT UI
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


function removeWelcome() {

    messages
        ?.querySelector(".welcome")
        ?.remove();

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
        document.createElement(
            "div"
        );

    box.className =
        type === "user"
            ? "user-message"
            : "ai-message";

    if (text) {

        const textBox =
            document.createElement(
                "div"
            );

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
            document.createElement(
                "img"
            );

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
            document.createElement(
                "video"
            );

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
            document.createElement(
                "div"
            );

        fileBox.className =
            "message-file";

        fileBox.textContent =
            "📄 " +
            attachment.name;

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
        document.createElement(
            "div"
        );

    box.id =
        "swiftTyping";

    box.className =
        "ai-message";

    const text =
        document.createElement(
            "div"
        );

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
            !plusMenu.contains(
                event.target
            ) &&
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
            sidebar?.classList.contains(
                "open"
            ) &&
            !sidebar.contains(
                event.target
            ) &&
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

        if (!userInput) {
            return;
        }

        userInput.value =
            button.dataset.prompt;

        resizeInput();

        userInput.focus();

    }
);


/* =========================================================
   TEXTAREA
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


function setupTextarea() {

    if (!userInput) {
        return;
    }

    userInput.addEventListener(
        "input",
        resizeInput
    );

    userInput.addEventListener(
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

}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

photoBtn?.addEventListener(
    "click",
    () => {

        closePlus();

        if (!imageInput) {
            return;
        }

        imageInput.value =
            "";

        imageInput.click();

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
   FILE UPLOAD
========================================================= */

fileBtn?.addEventListener(
    "click",
    () => {

        closePlus();

        if (!fileInput) {
            return;
        }

        fileInput.value =
            "";

        fileInput.click();

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
   ATTACHMENT PREVIEW
========================================================= */

function showAttachment(
    file,
    type
) {

    if (!imagePreview) {
        return;
    }

    imagePreview.innerHTML =
        "";

    const box =
        document.createElement(
            "div"
        );

    box.className =
        "attachment-box";

    if (type === "image") {

        const img =
            document.createElement(
                "img"
            );

        img.src =
            URL.createObjectURL(
                file
            );

        img.alt =
            file.name;

        box.appendChild(
            img
        );

    }

    if (type === "video") {

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

        video.muted =
            true;

        video.playsInline =
            true;

        box.appendChild(
            video
        );

    }

    const name =
        document.createElement(
            "div"
        );

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
        document.createElement(
            "button"
        );

    remove.type =
        "button";

    remove.className =
        "attachment-remove";

    remove.textContent =
        "✕";

    remove.addEventListener(
        "click",
        clearAttachment
    );

    box.appendChild(
        remove
    );

    imagePreview.appendChild(
        box
    );

}


function clearAttachment() {

    selectedImage =
        null;

    selectedVideo =
        null;

    selectedFile =
        null;

    if (imageInput) {
        imageInput.value =
            "";
    }

    if (fileInput) {
        fileInput.value =
            "";
    }

    if (imagePreview) {
        imagePreview.innerHTML =
            "";
    }

}


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

    return (
        "Unable to access the camera."
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

        if (
            recorder &&
            recorder.state !==
                "inactive"
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

        if (
            !cameraStream
        ) {

            await startCamera();

        }

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
   TAKE PHOTO
========================================================= */

takePhoto?.addEventListener(
    "click",
    takeCameraPhoto
);


function takeCameraPhoto() {

    if (
        !cameraVideo ||
        !cameraStream
    ) {

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
        cameraVideo.videoWidth ||
        1280;

    canvas.height =
        cameraVideo.videoHeight ||
        720;

    const ctx =
        canvas.getContext(
            "2d"
        );

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
                    `camera-${Date.now()}.jpg`,
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
   VIDEO MODE
========================================================= */

videoMode?.addEventListener(
    "click",
    async () => {

        setVideoMode();

        if (
            !cameraStream
        ) {

            await startCamera();

        }

    }
);


function setVideoMode() {

    photoMode?.classList.remove(
        "active"
    );

    videoMode?.classList.add(
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

}


/* =========================================================
   VIDEO RECORDING
========================================================= */

startRecord?.addEventListener(
    "click",
    startVideoRecording
);


stopRecord?.addEventListener(
    "click",
    stopRecording
);


function startVideoRecording() {

    if (
        !cameraStream
    ) {

        showCameraError(
            "Camera is not ready."
        );

        return;

    }

    if (
        !window.MediaRecorder
    ) {

        showCameraError(
            "Video recording is not supported by this browser."
        );

        return;

    }

    recordedChunks = [];

    let mimeType =
        "";

    const formats = [

        "video/webm;codecs=vp9",

        "video/webm;codecs=vp8",

        "video/webm"

    ];

    for (
        const format of formats
    ) {

        if (
            MediaRecorder.isTypeSupported(
                format
            )
        ) {

            mimeType =
                format;

            break;

        }

    }

    try {

        recorder =
            mimeType
                ? new MediaRecorder(
                    cameraStream,
                    {
                        mimeType
                    }
                )
                : new MediaRecorder(
                    cameraStream
                );

    } catch (error) {

        console.error(error);

        showCameraError(
            "Unable to start video recording."
        );

        return;

    }

    recorder.ondataavailable =
        event => {

            if (
                event.data &&
                event.data.size > 0
            ) {

                recordedChunks.push(
                    event.data
                );

            }

        };

    recorder.onstop =
        saveRecordedVideo;

    recorder.start(
        250
    );

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
        recordingTimer
    ) {

        clearInterval(
            recordingTimer
        );

        recordingTimer =
            null;

    }

    if (
        recorder &&
        recorder.state !==
            "inactive"
    ) {

        recorder.stop();

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
        String(
            Math.floor(
                recordingSeconds / 60
            )
        ).padStart(
            2,
            "0"
        );

    const seconds =
        String(
            recordingSeconds % 60
        ).padStart(
            2,
            "0"
        );

    recordTime.textContent =
        `🔴 ${minutes}:${seconds}`;

}


function saveRecordedVideo() {

    if (!recordedChunks.length) {
        return;
    }

    const blob =
        new Blob(
            recordedChunks,
            {
                type:
                    recorder?.mimeType ||
                    "video/webm"
            }
        );

    const file =
        new File(
            [blob],
            `video-${Date.now()}.webm`,
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

    if (mediaResult) {

        mediaResult.innerHTML =
            "<div>🎥 Video ready to send</div>";

    }

    closeCamera();

}


/* =========================================================
   MICROPHONE / VOICE INPUT
========================================================= */

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (
        !SpeechRecognition
    ) {

        if (micBtn) {

            micBtn.title =
                "Voice input is not supported by this browser";

        }

        return;

    }

    recognition =
        new SpeechRecognition();

    recognition.continuous =
        false;

    recognition.interimResults =
        true;

    recognition.lang =
        navigator.language ||
        "en-US";

    recognition.onstart =
        () => {

            isListening =
                true;

            micBtn?.classList.add(
                "listening"
            );

            if (micBtn) {

                micBtn.innerHTML =
                    "🔴";

            }

        };

    recognition.onresult =
        event => {

            let transcript =
                "";

            for (
                let i =
                    event.resultIndex;
                i <
                    event.results.length;
                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcript;

            }

            if (userInput) {

                userInput.value =
                    transcript;

                resizeInput();

            }

        };

    recognition.onerror =
        error => {

            console.error(
                "Speech recognition:",
                error
            );

            stopListening();

        };

    recognition.onend =
        () => {

            stopListening();

        };

}


function startListening() {

    if (!recognition) {

        alert(
            "Voice input is not supported in this browser."
        );

        return;

    }

    try {

        recognition.lang =
            navigator.language ||
            "en-US";

        recognition.start();

    } catch (error) {

        console.log(
            "Speech start:",
            error
        );

    }

}


function stopListening() {

    isListening =
        false;

    micBtn?.classList.remove(
        "listening"
    );

    if (micBtn) {

        micBtn.innerHTML =
            "🎤";

    }

}


micBtn?.addEventListener(
    "click",
    () => {

        if (isListening) {

            recognition?.stop();

        } else {

            startListening();

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
   FILE TO BASE64
========================================================= */

function fileToBase64(
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

                    const result =
                        reader.result;

                    if (
                        typeof result !==
                        "string"
                    ) {

                        reject(
                            new Error(
                                "Unable to read file."
                            )
                        );

                        return;

                    }

                    const comma =
                        result.indexOf(
                            ","
                        );

                    resolve(
                        comma >= 0
                            ? result.slice(
                                comma + 1
                            )
                            : result
                    );

                };

            reader.onerror =
                () => {

                    reject(
                        reader.error ||
                        new Error(
                            "File reading failed."
                        )
                    );

                };

            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   VIDEO FIRST FRAME
========================================================= */

function videoToImage(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const url =
                URL.createObjectURL(
                    file
                );

            const video =
                document.createElement(
                    "video"
                );

            video.src =
                url;

            video.muted =
                true;

            video.playsInline =
                true;

            video.preload =
                "metadata";

            video.addEventListener(
                "loadeddata",
                () => {

                    try {

                        video.currentTime =
                            Math.min(
                                0.1,
                                video.duration ||
                                    0.1
                            );

                    } catch {

                        captureFrame();

                    }

                }
            );

            video.addEventListener(
                "seeked",
                captureFrame,
                {
                    once: true
                }
            );

            video.addEventListener(
                "error",
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                    reject(
                        new Error(
                            "Unable to read video."
                        )
                    );

                }
            );

            function captureFrame() {

                try {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        video.videoWidth ||
                        1280;

                    canvas.height =
                        video.videoHeight ||
                        720;

                    const ctx =
                        canvas.getContext(
                            "2d"
                        );

                    ctx.drawImage(
                        video,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                    canvas.toBlob(
                        blob => {

                            URL.revokeObjectURL(
                                url
                            );

                            if (!blob) {

                                reject(
                                    new Error(
                                        "Could not capture video frame."
                                    )
                                );

                                return;

                            }

                            resolve(
                                new File(
                                    [blob],
                                    "video-frame.jpg",
                                    {
                                        type:
                                            "image/jpeg"
                                    }
                                )
                            );

                        },
                        "image/jpeg",
                        0.9
                    );

                } catch (error) {

                    URL.revokeObjectURL(
                        url
                    );

                    reject(
                        error
                    );

                }

            }

        }
    );

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (sending) {
        return;
    }

    const message =
        userInput?.value?.trim() ||
        "";

    if (
        !message &&
        !selectedImage &&
        !selectedVideo &&
        !selectedFile
    ) {

        return;

    }

    sending =
        true;

    if (sendBtn) {

        sendBtn.disabled =
            true;

    }

    const imageFile =
        selectedImage;

    const videoFile =
        selectedVideo;

    const file =
        selectedFile;

    let attachment =
        null;

    if (imageFile) {

        attachment = {

            type:
                "image",

            url:
                URL.createObjectURL(
                    imageFile
                )

        };

    } else if (videoFile) {

        attachment = {

            type:
                "video",

            url:
                URL.createObjectURL(
                    videoFile
                )

        };

    } else if (file) {

        attachment = {

            type:
                "file",

            name:
                file.name

        };

    }

    addMessage(
        message,
        "user",
        attachment,
        true
    );

    userInput.value =
        "";

    resizeInput();

    clearAttachment();

    showTyping();

    try {

        const body = {

            message,

            thinkHarder

        };


        /* -----------------------------------------
           IMAGE
        ----------------------------------------- */

        if (imageFile) {

            const base64 =
                await fileToBase64(
                    imageFile
                );

            body.image = {

                data:
                    base64,

                mimeType:
                    imageFile.type ||
                    "image/jpeg"

            };

        }


        /* -----------------------------------------
           VIDEO
        ----------------------------------------- */

        if (videoFile) {

            const frame =
                await videoToImage(
                    videoFile
                );

            const base64 =
                await fileToBase64(
                    frame
                );

            body.image = {

                data:
                    base64,

                mimeType:
                    "image/jpeg"

            };

            if (!body.message) {

                body.message =
                    "Please analyze this video frame and describe what is happening.";

            }

        }


        /* -----------------------------------------
           API
        ----------------------------------------- */

        const response =
            await fetch(
                "/api/gemini",
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


        let data =
            null;


        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                `Server returned HTTP ${response.status}`
            );

        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Request failed (${response.status})`
            );

        }


        if (
            data?.success === false
        ) {

            throw new Error(
                data.error ||
                "AI request failed."
            );

        }


        const answer =
            (
                data?.answer ||
                data?.reply ||
                data?.text ||
                ""
            )
            .toString()
            .trim();


        if (!answer) {

            throw new Error(
                "AI returned an empty response."
            );

        }


        removeTyping();

        addMessage(
            cleanAIResponse(
                answer
            ),
            "ai",
            null,
            true
        );


        if (memoryEnabled) {

            localStorage.setItem(
                "swift_last_topic",
                message.slice(
                    0,
                    300
                )
            );

        }


    } catch (error) {

        console.error(
            "SwiftCortex API Error:",
            error
        );

        removeTyping();

        addMessage(
            "Connection error: " +
            (
                error?.message ||
                "Unable to connect to SwiftCortex API."
            ),
            "ai",
            null,
            false
        );

    } finally {

        sending =
            false;

        if (sendBtn) {

            sendBtn.disabled =
                false;

        }

        userInput?.focus();

    }

}


/* =========================================================
   CLEAN AI RESPONSE
========================================================= */

function cleanAIResponse(
    text
) {

    if (!text) {
        return "";
    }

    let result =
        String(text);

    /*
       Prevent visible <think> blocks.
       This does NOT expose or display reasoning.
    */

    result =
        result.replace(
            /<think>[\s\S]*?<\/think>/gi,
            ""
        );

    result =
        result.replace(
            /<think>[\s\S]*$/gi,
            ""
        );

    result =
        result.trim();

    return result;

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

        closePlus();

        if (thinkHarder) {

            thinkBtn.title =
                "Think Harder is ON";

        } else {

            thinkBtn.title =
                "Think Harder is OFF";

        }

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


/* =========================================================
   MODALS
========================================================= */

function setupModals() {

    settingsClose?.addEventListener(
        "click",
        () => {

            settingsModal?.classList.remove(
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

    profileClose?.addEventListener(
        "click",
        () => {

            profileModal?.classList.remove(
                "show"
            );

        }
    );


    settingsModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                settingsModal
            ) {

                settingsModal.classList.remove(
                    "show"
                );

            }

        }
    );


    pluginModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                pluginModal
            ) {

                pluginModal.classList.remove(
                    "show"
                );

            }

        }
    );


    profileModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                profileModal
            ) {

                profileModal.classList.remove(
                    "show"
                );

            }

        }
    );


    cameraModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                cameraModal
            ) {

                closeCamera();

            }

        }
    );

}


/* =========================================================
   SETTINGS
========================================================= */

settingsBtn?.addEventListener(
    "click",
    () => {

        settingsModal?.classList.add(
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


/* =========================================================
   CLEAR HISTORY
========================================================= */

document.addEventListener(
    "click",
    event => {

        const setting =
            event.target.closest(
                ".setting-item"
            );

        if (!setting) {
            return;
        }

        const text =
            setting.textContent ||
            "";

        if (
            text.includes(
                "Clear History"
            )
        ) {

            const confirmed =
                confirm(
                    "Clear all recent chats?"
                );

            if (!confirmed) {
                return;
            }

            localStorage.removeItem(
                "swift_history"
            );

            currentChat = [];

            renderHistory();

            showWelcome();

        }

    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }

        plusMenu?.classList.remove(
            "show"
        );

        settingsModal?.classList.remove(
            "show"
        );

        pluginModal?.classList.remove(
            "show"
        );

        profileModal?.classList.remove(
            "show"
        );

        closeCamera();

    }
);


/* =========================================================
   BEFORE LEAVING
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        if (
            currentChat.length
        ) {

            saveCurrentChat();

        }

        stopRecording();

        stopCamera();

    }
);


/* =========================================================
   INITIAL UI
========================================================= */

renderHistory();

updateMemoryUI();

applyTheme();

resizeInput();


console.log(
    "⚡ SwiftCortex AI Ultra loaded successfully."
);
