"use strict";

/* =========================================================
   SwiftCortex AI Ultra
   FINAL script.js
   API: /api/gemini
========================================================= */

const $ = id => document.getElementById(id);
const $$ = selector => [...document.querySelectorAll(selector)];

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

let sending = false;
let thinkHarder = false;

let currentChat = [];

let recognition = null;
let isListening = false;

let currentTheme =
    localStorage.getItem("swift_theme") || "dark";

let memoryEnabled =
    localStorage.getItem("swift_memory") !== "off";

/* =========================================================
   SAFE JSON
========================================================= */

async function readResponse(response) {

    const text = await response.text();

    let data = null;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = {
            raw: text
        };
    }

    return {
        ok: response.ok,
        status: response.status,
        data
    };
}

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

    if (!currentChat.length) return;

    if (
        localStorage.getItem("swift_save_history") === "off"
    ) {
        return;
    }

    const history = getHistory();

    const firstUserMessage =
        currentChat.find(
            item => item.type === "user"
        );

    const title =
        firstUserMessage?.text?.trim()?.slice(0, 40) ||
        "New Chat";

    history.unshift({
        id: Date.now(),
        title,
        messages: currentChat
    });

    saveHistory(history.slice(0, 50));
    renderHistory();
}

/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

    if (!historyList) return;

    const history = getHistory();

    historyList.innerHTML = "";

    if (!history.length) {

        const empty =
            document.createElement("div");

        empty.className = "history-empty";
        empty.textContent = "No recent chats";

        historyList.appendChild(empty);

        return;
    }

    history.forEach(chat => {

        const button =
            document.createElement("button");

        button.className = "history-item";

        button.type = "button";

        button.textContent =
            chat.title || "New Chat";

        button.addEventListener(
            "click",
            () => loadHistoryChat(chat.id)
        );

        historyList.appendChild(button);
    });
}

function loadHistoryChat(id) {

    const history = getHistory();

    const chat =
        history.find(item => item.id === id);

    if (!chat) return;

    currentChat =
        Array.isArray(chat.messages)
            ? [...chat.messages]
            : [];

    if (!messages) return;

    messages.innerHTML = "";

    currentChat.forEach(message => {

        addMessage(
            message.text,
            message.type,
            null,
            false
        );
    });

    sidebar?.classList.remove("open");

    userInput?.focus();
}

/* =========================================================
   CHAT UI
========================================================= */

function scrollChat() {

    if (!messages) return;

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

    if (!messages) return;

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
                    data-prompt="Tell me today's latest news">
                    📰 Latest News
                </button>

                <button
                    data-prompt="Help me write something">
                    ✍️ Write
                </button>

                <button
                    data-prompt="Explain something to me">
                    💡 Explain
                </button>

                <button
                    data-prompt="Help me with coding">
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

        textBox.className = "message-text";

        textBox.textContent = text;

        box.appendChild(textBox);
    }

    if (
        attachment?.type === "image"
    ) {

        const img =
            document.createElement("img");

        img.src = attachment.url;
        img.alt = "Uploaded image";
        img.loading = "lazy";

        box.appendChild(img);
    }

    if (
        attachment?.type === "video"
    ) {

        const video =
            document.createElement("video");

        video.src = attachment.url;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";

        box.appendChild(video);
    }

    if (
        attachment?.type === "file"
    ) {

        const fileBox =
            document.createElement("div");

        fileBox.className = "message-file";

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
   TYPING
========================================================= */

function showTyping() {

    removeTyping();

    if (!messages) return;

    const box =
        document.createElement("div");

    box.id = "swiftTyping";
    box.className = "ai-message";

    const text =
        document.createElement("div");

    text.className = "message-text";
    text.textContent =
        "SwiftCortex is thinking…";

    box.appendChild(text);
    messages.appendChild(box);

    scrollChat();
}

function removeTyping() {
    $("swiftTyping")?.remove();
}

/* =========================================================
   INPUT SIZE
========================================================= */

function resizeInput() {

    if (!userInput) return;

    userInput.style.height = "auto";

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
   PLUS MENU
========================================================= */

plusBtn?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        plusMenu?.classList.toggle("show");
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

            plusMenu.classList.remove("show");
        }
    }
);

function closePlus() {
    plusMenu?.classList.remove("show");
}

/* =========================================================
   SIDEBAR
========================================================= */

menuBtn?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        sidebar?.classList.toggle("open");
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

            sidebar.classList.remove("open");
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

        sidebar?.classList.remove("open");

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
            event.target.closest("[data-prompt]");

        if (!button) return;

        if (userInput) {

            userInput.value =
                button.dataset.prompt;

            resizeInput();

            userInput.focus();
        }
    }
);

/* =========================================================
   ATTACHMENT PREVIEW
========================================================= */

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

    name.className = "attachment-name";

    name.textContent =
        type === "image"
            ? "🖼️ " + file.name
            : type === "video"
                ? "🎥 " + file.name
                : "📄 " + file.name;

    box.appendChild(name);

    const remove =
        document.createElement("button");

    remove.className =
        "attachment-remove";

    remove.type = "button";
    remove.textContent = "✕";

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

    if (imageInput)
        imageInput.value = "";

    if (fileInput)
        fileInput.value = "";

    if (imagePreview)
        imagePreview.innerHTML = "";
}

/* =========================================================
   PHOTO
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

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            alert("Please select an image.");

            return;
        }

        selectedImage = file;
        selectedVideo = null;
        selectedFile = null;

        showAttachment(file, "image");
    }
);

/* =========================================================
   FILES
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

        if (!file) return;

        if (file.type.startsWith("image/")) {

            selectedImage = file;
            selectedVideo = null;
            selectedFile = null;

            showAttachment(file, "image");

            return;
        }

        if (file.type.startsWith("video/")) {

            selectedVideo = file;
            selectedImage = null;
            selectedFile = null;

            showAttachment(file, "video");

            return;
        }

        selectedFile = file;
        selectedImage = null;
        selectedVideo = null;

        showAttachment(file, "file");
    }
);

/* =========================================================
   CAMERA
========================================================= */

cameraBtn?.addEventListener(
    "click",
    async () => {

        closePlus();

        cameraModal?.classList.add("show");

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

function getCameraError(error) {

    if (
        error?.name === "NotAllowedError"
    ) {

        return "Camera permission was denied. Please allow camera access.";
    }

    if (
        error?.name === "NotFoundError"
    ) {

        return "No camera was found on this device.";
    }

    if (
        error?.name === "NotReadableError"
    ) {

        return "The camera is being used by another application.";
    }

    return "Unable to access the camera.";
}

function showCameraError(text) {

    cameraError?.classList.add("show");

    if (cameraErrorText)
        cameraErrorText.textContent = text;
}

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => track.stop());

        cameraStream = null;
    }

    if (cameraVideo)
        cameraVideo.srcObject = null;
}

function closeCamera() {

    stopRecording();
    stopCamera();

    cameraModal?.classList.remove("show");
}

/* =========================================================
   CAMERA SWITCH
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

        if (!cameraStream)
            await startCamera();
    }
);

function setPhotoMode() {

    photoMode?.classList.add("active");
    videoMode?.classList.remove("active");

    if (takePhoto)
        takePhoto.style.display = "inline-block";

    if (startRecord)
        startRecord.style.display = "none";

    if (stopRecord)
        stopRecord.style.display = "none";

    if (recordTime)
        recordTime.style.display = "none";
}

/* =========================================================
   TAKE PHOTO
========================================================= */

takePhoto?.addEventListener(
    "click",
    () => {

        if (!cameraVideo || !cameraStream) {

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
                        "swiftcortex-photo.jpg",
                        {
                            type: "image/jpeg"
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
            0.92
        );
    }
);

/* =========================================================
   VIDEO MODE
========================================================= */

videoMode?.addEventListener(
    "click",
    async () => {

        setVideoMode();

        if (!cameraStream)
            await startCamera();
    }
);

function setVideoMode() {

    videoMode?.classList.add("active");
    photoMode?.classList.remove("active");

    if (takePhoto)
        takePhoto.style.display = "none";

    if (startRecord)
        startRecord.style.display = "inline-block";

    if (stopRecord)
        stopRecord.style.display = "none";

    if (recordTime)
        recordTime.style.display = "block";
}

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

    if (!cameraStream) return;

    if (
        !window.MediaRecorder
    ) {

        showCameraError(
            "Video recording is not supported by this browser."
        );

        return;
    }

    recordedChunks = [];

    let mimeType = "";

    const types = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4"
    ];

    for (const type of types) {

        if (
            MediaRecorder.isTypeSupported(type)
        ) {

            mimeType = type;
            break;
        }
    }

    try {

        recorder =
            new MediaRecorder(
                cameraStream,
                mimeType
                    ? { mimeType }
                    : undefined
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

            if (event.data?.size)
                recordedChunks.push(event.data);
        };

    recorder.onstop =
        finishRecording;

    recorder.start();

    recordingSeconds = 0;

    updateRecordTime();

    recordingTimer =
        setInterval(
            () => {

                recordingSeconds++;

                updateRecordTime();

            },
            1000
        );

    if (startRecord)
        startRecord.style.display = "none";

    if (stopRecord)
        stopRecord.style.display = "inline-block";
}

function stopRecording() {

    if (
        recordingTimer
    ) {

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

    if (startRecord)
        startRecord.style.display =
            videoMode?.classList.contains("active")
                ? "inline-block"
                : "none";

    if (stopRecord)
        stopRecord.style.display = "none";
}

function updateRecordTime() {

    if (!recordTime) return;

    const minutes =
        String(
            Math.floor(recordingSeconds / 60)
        ).padStart(2, "0");

    const seconds =
        String(
            recordingSeconds % 60
        ).padStart(2, "0");

    recordTime.textContent =
        `🔴 ${minutes}:${seconds}`;
}

function finishRecording() {

    if (!recordedChunks.length)
        return;

    const mime =
        recorder?.mimeType ||
        "video/webm";

    const blob =
        new Blob(
            recordedChunks,
            { type: mime }
        );

    const extension =
        mime.includes("mp4")
            ? "mp4"
            : "webm";

    const file =
        new File(
            [blob],
            `swiftcortex-video.${extension}`,
            { type: mime }
        );

    selectedVideo = file;
    selectedImage = null;
    selectedFile = null;

    showAttachment(
        file,
        "video"
    );

    if (mediaResult) {

        mediaResult.innerHTML = `
            <div class="media-result">
                🎥 Video ready to send
            </div>
        `;
    }

    recorder = null;
    recordedChunks = [];
}

/* =========================================================
   MICROPHONE / VOICE INPUT
========================================================= */

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        return false;
    }

    recognition =
        new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang =
        localStorage.getItem(
            "swift_language"
        ) || "en-US";

    recognition.onstart = () => {

        isListening = true;

        micBtn?.classList.add(
            "listening"
        );

        if (micBtn)
            micBtn.textContent = "🔴";
    };

    recognition.onresult =
        event => {

            let finalText = "";
            let interimText = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const transcript =
                    event.results[i][0].transcript;

                if (
                    event.results[i].isFinal
                ) {

                    finalText += transcript;

                } else {

                    interimText += transcript;
                }
            }

            if (userInput) {

                if (finalText) {

                    userInput.value =
                        (
                            userInput.value
                                ? userInput.value + " "
                                : ""
                        ) + finalText;
                }

                userInput.dataset.interim =
                    interimText;

                resizeInput();
            }
        };

    recognition.onerror =
        error => {

            console.error(
                "Speech recognition error:",
                error
            );

            stopListening();

            if (
                error.error === "not-allowed"
            ) {

                alert(
                    "Microphone permission was denied. Please allow microphone access."
                );
            }
        };

    recognition.onend = () => {

        stopListening();
    };

    return true;
}

function startListening() {

    if (!recognition) {

        const supported =
            setupSpeechRecognition();

        if (!supported) {

            alert(
                "Voice input is not supported by this browser."
            );

            return;
        }
    }

    if (isListening) {

        stopListening();

        return;
    }

    try {

        recognition.lang =
            localStorage.getItem(
                "swift_language"
            ) || "en-US";

        recognition.start();

    } catch (error) {

        console.error(error);
    }
}

function stopListening() {

    isListening = false;

    micBtn?.classList.remove(
        "listening"
    );

    if (micBtn)
        micBtn.textContent = "🎙️";

    if (recognition) {

        try {
            recognition.stop();
        } catch {}
    }
}

micBtn?.addEventListener(
    "click",
    startListening
);

/* =========================================================
   AI API
========================================================= */

async function askAI(message) {

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
                        message,
                        thinkHarder
                    })
            }
        );

    const result =
        await readResponse(response);

    if (!result.ok) {

        const serverMessage =
            result.data?.error ||
            result.data?.message ||
            result.data?.raw ||
            `HTTP ${result.status}`;

        throw new Error(
            serverMessage
        );
    }

    const data = result.data;

    return (
        data.reply ||
        data.response ||
        data.text ||
        data.message ||
        data?.candidates?.[0]
            ?.content?.parts
            ?.map(part => part.text || "")
            .join("") ||
        ""
    );
}

/* =========================================================
   IMAGE / FILE / VIDEO API
========================================================= */

async function fileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                () => {

                    const result =
                        reader.result;

                    if (
                        typeof result !== "string"
                    ) {

                        reject(
                            new Error(
                                "Unable to read file."
                            )
                        );

                        return;
                    }

                    resolve(result);
                };

            reader.onerror =
                () => reject(
                    new Error(
                        "Unable to read file."
                    )
                );

            reader.readAsDataURL(file);
        }
    );
}

async function askAIWithAttachment(
    message,
    file,
    type
) {

    const dataUrl =
        await fileToBase64(file);

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

                        message,

                        thinkHarder,

                        attachment: {

                            type,

                            name:
                                file.name,

                            mimeType:
                                file.type,

                            data:
                                dataUrl
                        }
                    })
            }
        );

    const result =
        await readResponse(response);

    if (!result.ok) {

        const error =
            result.data?.error ||
            result.data?.message ||
            result.data?.raw ||
            `HTTP ${result.status}`;

        throw new Error(error);
    }

    const data = result.data;

    return (
        data.reply ||
        data.response ||
        data.text ||
        data.message ||
        data?.candidates?.[0]
            ?.content?.parts
            ?.map(part => part.text || "")
            .join("") ||
        ""
    );
}

/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (sending) return;

    const text =
        userInput?.value?.trim() || "";

    const hasAttachment =
        !!(
            selectedImage ||
            selectedVideo ||
            selectedFile
        );

    if (!text && !hasAttachment)
        return;

    sending = true;

    sendBtn?.classList.add("loading");

    removeWelcome();

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
        text ||
            (
                selectedImage
                    ? "Please analyze this image."
                    : selectedVideo
                        ? "Please analyze this video."
                        : selectedFile
                            ? `Please analyze this file: ${selectedFile.name}`
                            : ""
            ),
        "user",
        attachment,
        true
    );

    const requestText =
        text ||
        (
            selectedImage
                ? "Analyze this image in detail."
                : selectedVideo
                    ? "Analyze this video and describe what is happening."
                    : selectedFile
                        ? `Analyze this file: ${selectedFile.name}`
                        : ""
        );

    userInput.value = "";

    resizeInput();

    const imageToSend = selectedImage;
    const videoToSend = selectedVideo;
    const fileToSend = selectedFile;

    clearAttachment();

    showTyping();

    try {

        let reply = "";

        if (imageToSend) {

            reply =
                await askAIWithAttachment(
                    requestText,
                    imageToSend,
                    "image"
                );

        } else if (videoToSend) {

            reply =
                await askAIWithAttachment(
                    requestText,
                    videoToSend,
                    "video"
                );

        } else if (fileToSend) {

            reply =
                await askAIWithAttachment(
                    requestText,
                    fileToSend,
                    "file"
                );

        } else {

            reply =
                await askAI(requestText);
        }

        removeTyping();

        if (!reply) {

            reply =
                "I received your message, but the AI returned an empty response.";
        }

        addMessage(
            reply,
            "ai",
            null,
            true
        );

    } catch (error) {

        console.error(
            "SwiftCortex API error:",
            error
        );

        removeTyping();

        let message =
            error?.message ||
            "Unknown connection error.";

        if (
            message.includes("429") ||
            message.toLowerCase().includes("rate limit") ||
            message.toLowerCase().includes("tpm")
        ) {

            message =
                "The AI service is temporarily rate-limited. Please wait a little and try again.";
        }

        addMessage(
            "Connection error: " + message,
            "ai",
            null,
            false
        );

    } finally {

        sending = false;

        sendBtn?.classList.remove(
            "loading"
        );

        userInput?.focus();
    }
}

sendBtn?.addEventListener(
    "click",
    sendMessage
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
                "Think Harder: ON";

        } else {

            thinkBtn.title =
                "Think Harder: OFF";
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

pluginClose?.addEventListener(
    "click",
    () => {

        pluginModal?.classList.remove(
            "show"
        );
    }
);

/* =========================================================
   SETTINGS
========================================================= */

settingsBtn?.addEventListener(
    "click",
    () => {

        settingsModal?.classList.add(
            "show"
        );

        updateMemoryUI();
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
   MODAL OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    event => {

        [
            cameraModal,
            settingsModal,
            pluginModal,
            profileModal
        ].forEach(modal => {

            if (
                modal &&
                event.target === modal
            ) {

                modal.classList.remove(
                    "show"
                );
            }
        });
    }
);

/* =========================================================
   MEMORY
========================================================= */

function updateMemoryUI() {

    const text =
        memoryEnabled
            ? "ON"
            : "OFF";

    if (memoryStatus)
        memoryStatus.textContent = text;

    if (settingsMemory)
        settingsMemory.textContent =
            memoryEnabled
                ? "On"
                : "Off";
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

    currentTheme = theme;

    if (theme === "system") {

        document.documentElement.removeAttribute(
            "data-theme"
        );

        return;
    }

    document.documentElement.setAttribute(
        "data-theme",
        theme
    );
}

function cycleTheme() {

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

    applyTheme(currentTheme);

    if (themeBtn) {

        themeBtn.querySelector("span")?.replaceChildren();

        const span =
            themeBtn.querySelector("span");

        if (span) {

            span.textContent =
                currentTheme === "dark"
                    ? "Dark Mode"
                    : currentTheme === "light"
                        ? "Light Mode"
                        : "System";
        }
    }
}

themeBtn?.addEventListener(
    "click",
    cycleTheme
);

/* =========================================================
   SETTINGS MEMORY ITEM
========================================================= */

$$(".setting-item").forEach(
    button => {

        const text =
            button.textContent || "";

        if (
            text.includes("Memory")
        ) {

            button.addEventListener(
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
        }

        if (
            text.includes("Clear History")
        ) {

            button.addEventListener(
                "click",
                () => {

                    const ok =
                        confirm(
                            "Clear all recent chat history?"
                        );

                    if (!ok) return;

                    localStorage.removeItem(
                        "swift_history"
                    );

                    currentChat = [];

                    renderHistory();

                    showWelcome();
                }
            );
        }

        if (
            text.includes("Privacy")
        ) {

            button.addEventListener(
                "click",
                () => {

                    const current =
                        localStorage.getItem(
                            "swift_save_history"
                        ) !== "off";

                    const save =
                        confirm(
                            current
                                ? "Chat history is currently saved locally. Press OK to turn saving OFF."
                                : "Chat history saving is currently OFF. Press OK to turn saving ON."
                        );

                    localStorage.setItem(
                        "swift_save_history",
                        save
                            ? "off"
                            : "on"
                    );
                }
            );
        }
    }
);

/* =========================================================
   INITIALIZE
========================================================= */

applyTheme(currentTheme);

updateMemoryUI();

renderHistory();

setupSpeechRecognition();

if (recordTime)
    recordTime.style.display = "none";

console.log(
    "⚡ SwiftCortex AI Ultra loaded successfully."
);
/* =========================================================
   CUSTOMER SUPPORT CHAT
========================================================= */

const supportBtn = $("supportBtn");
const supportModal = $("supportModal");
const supportClose = $("supportClose");

const supportMessages = $("supportMessages");
const supportInput = $("supportInput");
const supportSend = $("supportSend");
const supportMic = $("supportMic");

let supportListening = false;


/* =========================================================
   OPEN SUPPORT
========================================================= */

supportBtn?.addEventListener(
    "click",
    () => {

        closePlus();

        supportModal?.classList.add("show");

        sidebar?.classList.remove("open");

        setTimeout(() => {
            supportInput?.focus();
        }, 100);

    }
);


/* =========================================================
   CLOSE SUPPORT
========================================================= */

supportClose?.addEventListener(
    "click",
    () => {

        supportModal?.classList.remove("show");

    }
);


/* =========================================================
   CLOSE WHEN CLICKING OUTSIDE
========================================================= */

supportModal?.addEventListener(
    "click",
    event => {

        if (
            event.target === supportModal
        ) {

            supportModal.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   ADD SUPPORT MESSAGE
========================================================= */

function addSupportMessage(
    text,
    type = "user"
) {

    if (!supportMessages) {
        return;
    }

    const message =
        document.createElement("div");

    message.className =
        type === "user"
            ? "support-message support-user"
            : "support-message support-agent";


    const name =
        document.createElement("div");

    name.className =
        "support-message-name";


    name.textContent =
        type === "user"
            ? "👤 You"
            : "🤖 SwiftCortex Support";


    const messageText =
        document.createElement("div");

    messageText.className =
        "support-message-text";


    messageText.textContent =
        text;


    message.appendChild(name);

    message.appendChild(messageText);

    supportMessages.appendChild(message);


    supportMessages.scrollTop =
        supportMessages.scrollHeight;

}


/* =========================================================
   SUPPORT TYPING
========================================================= */

function showSupportTyping() {

    removeSupportTyping();


    const message =
        document.createElement("div");

    message.id =
        "supportTyping";

    message.className =
        "support-message support-agent";


    const name =
        document.createElement("div");

    name.className =
        "support-message-name";

    name.textContent =
        "🤖 SwiftCortex Support";


    const text =
        document.createElement("div");

    text.className =
        "support-message-text";

    text.textContent =
        "Support is typing…";


    message.appendChild(name);

    message.appendChild(text);

    supportMessages?.appendChild(
        message
    );


    if (supportMessages) {

        supportMessages.scrollTop =
            supportMessages.scrollHeight;

    }

}


function removeSupportTyping() {

    $("supportTyping")?.remove();

}


/* =========================================================
   SUPPORT AUTO REPLY
========================================================= */

function getSupportReply(message) {

    const text =
        message.toLowerCase();


    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("হাই") ||
        text.includes("হ্যালো")
    ) {

        return (
            "Hello! 👋 Welcome to SwiftCortex Support. " +
            "How can we help you?"
        );

    }


    if (
        text.includes("problem") ||
        text.includes("issue") ||
        text.includes("সমস্যা") ||
        text.includes("ঝামেলা")
    ) {

        return (
            "I'm sorry you're experiencing a problem. " +
            "Please describe the issue and tell us what " +
            "you were trying to do. We'll help you troubleshoot it."
        );

    }


    if (
        text.includes("camera") ||
        text.includes("ক্যামেরা")
    ) {

        return (
            "For camera problems, please make sure your browser " +
            "has camera permission and that no other application " +
            "is currently using the camera."
        );

    }


    if (
        text.includes("microphone") ||
        text.includes("mic") ||
        text.includes("মাইক্রোফোন") ||
        text.includes("ভয়েস")
    ) {

        return (
            "For microphone problems, please allow microphone " +
            "permission in your browser. You can also check " +
            "whether your selected language matches the language " +
            "you are speaking."
        );

    }


    if (
        text.includes("api") ||
        text.includes("connection") ||
        text.includes("error")
    ) {

        return (
            "If you're seeing a connection or API error, please " +
            "send us the exact error message or a screenshot. " +
            "That will help us identify the problem."
        );

    }


    if (
        text.includes("payment") ||
        text.includes("subscription") ||
        text.includes("premium")
    ) {

        return (
            "For subscription or payment questions, please tell us " +
            "what you're trying to change or purchase."
        );

    }


    if (
        text.includes("বাংলা") ||
        text.includes("bangla")
    ) {

        return (
            "অবশ্যই! আপনি বাংলাতেও Customer Support-এর সাথে " +
            "কথা বলতে পারেন। আপনার সমস্যাটি বাংলায় লিখুন।"
        );

    }


    return (
        "Thanks for contacting SwiftCortex Support. 😊 " +
        "Please provide a little more information about your " +
        "question or problem, and we'll help you."
    );

}


/* =========================================================
   SEND SUPPORT MESSAGE
========================================================= */

async function sendSupportMessage() {

    if (!supportInput) {
        return;
    }


    const text =
        supportInput.value.trim();


    if (!text) {
        return;
    }


    addSupportMessage(
        text,
        "user"
    );


    supportInput.value = "";

    supportInput.style.height = "auto";


    showSupportTyping();


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                700
            )
    );


    removeSupportTyping();


    const reply =
        getSupportReply(text);


    addSupportMessage(
        reply,
        "agent"
    );

}


/* =========================================================
   SUPPORT SEND BUTTON
========================================================= */

supportSend?.addEventListener(
    "click",
    sendSupportMessage
);


/* =========================================================
   SUPPORT ENTER
========================================================= */

supportInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendSupportMessage();

        }

    }
);


/* =========================================================
   SUPPORT TEXTAREA AUTO RESIZE
========================================================= */

supportInput?.addEventListener(
    "input",
    () => {

        supportInput.style.height =
            "auto";

        supportInput.style.height =
            Math.min(
                supportInput.scrollHeight,
                120
            ) + "px";

    }
);


/* =========================================================
   SUPPORT MICROPHONE
========================================================= */

supportMic?.addEventListener(
    "click",
    () => {

        if (
            !(
                "webkitSpeechRecognition"
                in window
            ) &&
            !(
                "SpeechRecognition"
                in window
            )
        ) {

            alert(
                "Voice input is not supported by this browser."
            );

            return;

        }


        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!supportRecognition) {

            supportRecognition =
                new SpeechRecognition();


            supportRecognition.continuous =
                false;

            supportRecognition.interimResults =
                false;

            supportRecognition.lang =
                document.documentElement.lang ||
                "en-US";


            supportRecognition.onstart =
                () => {

                    supportListening =
                        true;

                    supportMic.textContent =
                        "🔴";

                };


            supportRecognition.onresult =
                event => {

                    const transcript =
                        event.results[0][0]
                            .transcript;

                    if (supportInput) {

                        supportInput.value =
                            transcript;

                        supportInput.dispatchEvent(
                            new Event("input")
                        );

                    }

                };


            supportRecognition.onerror =
                error => {

                    console.error(
                        "Support voice error:",
                        error
                    );

                };


            supportRecognition.onend =
                () => {

                    supportListening =
                        false;

                    supportMic.textContent =
                        "🎙️";

                };

        }


        if (supportListening) {

            supportRecognition.stop();

            return;

        }


        supportRecognition.lang =
            getSpeechLanguage();


        supportRecognition.start();

    }
);


let supportRecognition = null;


/* =========================================================
   SPEECH LANGUAGE
========================================================= */

function getSpeechLanguage() {

    const language =
        localStorage.getItem(
            "swift_language"
        );


    if (language) {
        return language;
    }


    return (
        navigator.language ||
        "en-US"
    );

       }
/* =====================================================
   SWIFTCORTEX SETTINGS CONTROLLER
===================================================== */

const settingsPage = document.getElementById("settingsPage");
const settingsBackBtn = document.getElementById("settingsBackBtn");

const appearanceBtn = document.getElementById("appearanceBtn");
const appearanceModal = document.getElementById("appearanceModal");
const appearanceClose = document.getElementById("appearanceClose");

const appearanceValue =
  document.getElementById("appearanceValue");

const appearanceOptions =
  document.querySelectorAll(".appearance-option");


/* =====================================================
   OPEN SETTINGS
===================================================== */

function openSettings() {

  if (!settingsPage) return;

  settingsPage.classList.add("active");

  document.body.classList.add("settings-open");

  window.scrollTo(0, 0);
}


/* =====================================================
   CLOSE SETTINGS
===================================================== */

function closeSettings() {

  if (!settingsPage) return;

  settingsPage.classList.remove("active");

  document.body.classList.remove("settings-open");
}


/* =====================================================
   SETTINGS BUTTON
===================================================== */

/*
   তোমার Sidebar-এর Settings button যদি থাকে,
   তার ID settingsBtn হতে হবে।
*/

const settingsBtn =
  document.getElementById("settingsBtn");

if (settingsBtn) {

  settingsBtn.addEventListener("click", () => {

    closePlusMenu?.();

    openSettings();

  });

}


/* =====================================================
   BACK
===================================================== */

if (settingsBackBtn) {

  settingsBackBtn.addEventListener(
    "click",
    closeSettings
  );

}


/* =====================================================
   APPEARANCE
===================================================== */

if (appearanceBtn) {

  appearanceBtn.addEventListener(
    "click",
    () => {

      appearanceModal.classList.add("active");

    }
  );

}


if (appearanceClose) {

  appearanceClose.addEventListener(
    "click",
    () => {

      appearanceModal.classList.remove("active");

    }
  );

}


/* =====================================================
   THEME
===================================================== */

function setSwiftCortexTheme(theme) {

  const body = document.body;

  body.classList.remove("light-mode");

  if (theme === "light") {

    body.classList.add("light-mode");

    appearanceValue.textContent = "Light";

  }

  else if (theme === "dark") {

    appearanceValue.textContent = "Dark";

  }

  else {

    appearanceValue.textContent =
      "System (Default)";

    if (
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches
    ) {

      body.classList.add("light-mode");

    }

  }

  localStorage.setItem(
    "swiftcortex-theme",
    theme
  );

  updateThemeChecks(theme);
}


/* =====================================================
   CHECK MARK
===================================================== */

function updateThemeChecks(theme) {

  const system =
    document.getElementById("checkSystem");

  const light =
    document.getElementById("checkLight");

  const dark =
    document.getElementById("checkDark");

  if (!system || !light || !dark) return;

  system.textContent = "";
  light.textContent = "";
  dark.textContent = "";

  if (theme === "system") {

    system.textContent = "✓";

  }

  if (theme === "light") {

    light.textContent = "✓";

  }

  if (theme === "dark") {

    dark.textContent = "✓";

  }

}


/* =====================================================
   APPEARANCE OPTIONS
===================================================== */

appearanceOptions.forEach(option => {

  option.addEventListener(
    "click",
    () => {

      const theme =
        option.dataset.theme;

      setSwiftCortexTheme(theme);

      appearanceModal.classList.remove(
        "active"
      );

    }
  );

});


/* =====================================================
   LOAD SAVED THEME
===================================================== */

(function loadSwiftCortexTheme() {

  const savedTheme =
    localStorage.getItem(
      "swiftcortex-theme"
    ) || "system";

  setSwiftCortexTheme(savedTheme);

})();


/* =====================================================
   SYSTEM THEME CHANGE
===================================================== */

if (window.matchMedia) {

  const mediaQuery =
    window.matchMedia(
      "(prefers-color-scheme: light)"
    );

  mediaQuery.addEventListener(
    "change",
    () => {

      const saved =
        localStorage.getItem(
          "swiftcortex-theme"
        );

      if (saved === "system") {

        setSwiftCortexTheme("system");

      }

    }
  );

}


/* =====================================================
   CUSTOMER SUPPORT
===================================================== */

const customerSupportSettingsBtn =
  document.getElementById(
    "customerSupportSettingsBtn"
  );

if (customerSupportSettingsBtn) {

  customerSupportSettingsBtn.addEventListener(
    "click",
    () => {

      /*
        এখানে তোমার Customer Support
        page/function open হবে।
      */

      if (typeof openCustomerSupport === "function") {

        openCustomerSupport();

      }

      else {

        window.location.href =
          "mailto:swiftcortexaisupport@gmail.com";

      }

    }
  );

}


/* =====================================================
   LOGOUT
===================================================== */

const logoutBtn =
  document.getElementById("logoutBtn");

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "Are you sure you want to log out?"
        );

      if (!confirmed) return;

      localStorage.removeItem(
        "swiftcortex-theme"
      );

      /*
        এখানে তোমার authentication
        logout code পরে বসানো যাবে।
      */

      alert("You have been logged out.");

    }
  );

      }
