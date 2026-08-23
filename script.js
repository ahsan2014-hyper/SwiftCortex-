"use strict";

/* =========================================================
   SwiftCortex AI Ultra
   COMPLETE NEW script.js

   API:
   /api/gemini

   FEATURES:
   ✅ Normal AI chat
   ✅ Voice input / Microphone
   ✅ Enter to send
   ✅ New Chat
   ✅ Chat history
   ✅ Plus menu
   ✅ Camera
   ✅ Front / Back camera
   ✅ Take photo
   ✅ Video recording
   ✅ Photos
   ✅ Files
   ✅ Image preview
   ✅ Video preview
   ✅ Video first-frame analysis
   ✅ Plugins modal
   ✅ Think Harder
   ✅ Memory
   ✅ Settings
   ✅ Dark / Light / System
   ✅ Language
   ✅ Notifications
   ✅ Privacy
   ✅ Clear History
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
let chunks = [];

let recordingSeconds = 0;
let recordingTimer = null;

let thinkHarder = false;

let sending = false;

let currentChat = [];

let speechRecognition = null;
let isListening = false;

let currentTheme =
    localStorage.getItem("swift_theme") || "dark";

let memoryEnabled =
    localStorage.getItem("swift_memory") !== "off";


/* =========================================================
   STORAGE
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

        text:
            text || "",

        type,

        time:
            Date.now()

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


    const firstUserMessage =
        currentChat.find(
            message =>
                message.type === "user"
        );


    const title =
        firstUserMessage?.text
            ?.slice(0, 40) ||
        "New Chat";


    history.unshift({

        id:
            Date.now(),

        title,

        messages:
            currentChat

    });


    saveHistory(
        history.slice(0, 50)
    );

    renderHistory();

}


/* =========================================================
   HISTORY UI
========================================================= */

function renderHistory() {

    if (!historyList) {
        return;
    }


    const history =
        getHistory();


    historyList.innerHTML = "";


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


    history.forEach(
        chat => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "history-item";

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

        }
    );

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
        message => {

            addMessage(
                message.text,
                message.type,
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
   CHAT SCROLL
========================================================= */

function scrollChat() {

    if (!messages) {
        return;
    }


    requestAnimationFrame(
        () => {

            messages.scrollTop =
                messages.scrollHeight;

        }
    );

}


/* =========================================================
   WELCOME
========================================================= */

function removeWelcome() {

    const welcome =
        messages?.querySelector(
            ".welcome"
        );


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
        attachment &&
        attachment.type === "image"
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
        attachment &&
        attachment.type === "video"
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
        attachment &&
        attachment.type === "file"
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


    messages?.appendChild(
        box
    );


    scrollChat();

}


function removeTyping() {

    $("swiftTyping")?.remove();

}


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


    if (type === "image") {

        name.textContent =
            "🖼️ " +
            file.name;

    } else if (type === "video") {

        name.textContent =
            "🎥 " +
            file.name;

    } else {

        name.textContent =
            "📄 " +
            file.name;

    }


    box.appendChild(
        name
    );


    const remove =
        document.createElement(
            "button"
        );


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
   PHOTO UPLOAD
========================================================= */

photoBtn?.addEventListener(
    "click",
    () => {

        closePlus();


        if (!imageInput) {
            return;
        }


        imageInput.value = "";


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


        fileInput.value = "";


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
            cameraVideo.videoWidth ||
            1280;


        canvas.height =
            cameraVideo.videoHeight ||
            720;


        const context =
            canvas.getContext(
                "2d"
            );


        context.drawImage(
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
                        `swift-photo-${Date.now()}.jpg`,
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
);


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
   START RECORDING
========================================================= */

startRecord?.addEventListener(
    "click",
    startRecording
);


function startRecording() {

    if (
        !cameraStream
    ) {

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


    recordingSeconds =
        0;


    updateRecordTime();


    let options = {};


    if (
        MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp9,opus"
        )
    ) {

        options.mimeType =
            "video/webm;codecs=vp9,opus";

    } else if (
        MediaRecorder.isTypeSupported(
            "video/webm"
        )
    ) {

        options.mimeType =
            "video/webm";

    }


    try {

        recorder =
            new MediaRecorder(
                cameraStream,
                options
            );

    } catch (error) {

        console.error(
            "MediaRecorder error:",
            error
        );


        alert(
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

                chunks.push(
                    event.data
                );

            }

        };


    recorder.onstop =
        saveRecordedVideo;


    recorder.start(
        250
    );


    if (startRecord) {

        startRecord.style.display =
            "none";

    }


    if (stopRecord) {

        stopRecord.style.display =
            "inline-block";

    }


    recordingTimer =
        setInterval(
            () => {

                recordingSeconds++;

                updateRecordTime();

            },
            1000
        );

}


/* =========================================================
   STOP RECORDING
========================================================= */

stopRecord?.addEventListener(
    "click",
    stopRecording
);


function stopRecording() {

    if (
        recorder &&
        recorder.state !==
            "inactive"
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
        `🔴 ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* =========================================================
   SAVE RECORDED VIDEO
========================================================= */

function saveRecordedVideo() {

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
                type: mime
            }
        );


    const file =
        new File(
            [blob],
            `swift-video-${Date.now()}.webm`,
            {
                type: mime
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


    recorder =
        null;


    chunks = [];


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
   RESIZE TEXTAREA
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
            160
        ) + "px";

}


userInput?.addEventListener(
    "input",
    resizeInput
);


/* =========================================================
   VOICE INPUT
========================================================= */

function setupVoiceInput() {

    if (!micBtn || !userInput) {
        return;
    }


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        micBtn.addEventListener(
            "click",
            () => {

                alert(
                    "Voice input is not supported by this browser. Try Chrome on Android."
                );

            }
        );


        return;

    }


    speechRecognition =
        new SpeechRecognition();


    speechRecognition.continuous =
        false;


    speechRecognition.interimResults =
        true;


    speechRecognition.lang =
        navigator.language ||
        "en-US";


    speechRecognition.onstart =
        () => {

            isListening =
                true;


            micBtn.classList.add(
                "recording"
            );


            micBtn.textContent =
                "🔴";


            userInput?.focus();

        };


    speechRecognition.onresult =
        event => {

            let finalText =
                "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const result =
                    event.results[i];


                const transcript =
                    result[0]
                        ?.transcript || "";


                if (
                    result.isFinal
                ) {

                    finalText +=
                        transcript;

                }

            }


            if (finalText) {

                const existing =
                    userInput.value.trim();


                userInput.value =
                    existing
                        ? existing +
                          " " +
                          finalText
                        : finalText;


                resizeInput();

            }

        };


    speechRecognition.onerror =
        event => {

            console.error(
                "Speech recognition:",
                event.error
            );


            if (
                event.error ===
                "not-allowed"
            ) {

                alert(
                    "Microphone permission was denied. Please allow microphone access."
                );

            }


            if (
                event.error ===
                "no-speech"
            ) {

                console.log(
                    "No speech detected."
                );

            }

        };


    speechRecognition.onend =
        () => {

            isListening =
                false;


            micBtn.classList.remove(
                "recording"
            );


            micBtn.textContent =
                "🎤";

        };


    micBtn.addEventListener(
        "click",
        () => {

            if (isListening) {

                speechRecognition.stop();

                return;

            }


            speechRecognition.lang =
                navigator.language ||
                "en-US";


            try {

                speechRecognition.start();

            } catch (error) {

                console.error(
                    "Voice start error:",
                    error
                );

            }

        }
    );

}


setupVoiceInput();


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


                    const commaIndex =
                        result.indexOf(",");


                    resolve(
                        commaIndex >= 0
                            ? result.slice(
                                commaIndex + 1
                            )
                            : result
                    );

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Unable to read file."
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
   VIDEO -> FIRST FRAME
   Used because current API accepts image input.
========================================================= */

function videoToImage(
    videoFile
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const video =
                document.createElement(
                    "video"
                );


            const url =
                URL.createObjectURL(
                    videoFile
                );


            video.src =
                url;


            video.muted =
                true;


            video.playsInline =
                true;


            video.preload =
                "metadata";


            video.onloadedmetadata =
                () => {

                    const duration =
                        video.duration || 0;


                    const time =
                        Math.min(
                            Math.max(
                                duration * 0.2,
                                0
                            ),
                            Math.max(
                                duration - 0.1,
                                0
                            )
                        );


                    video.currentTime =
                        time;

                };


            video.onseeked =
                () => {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        video.videoWidth ||
                        640;


                    canvas.height =
                        video.videoHeight ||
                        360;


                    const context =
                        canvas.getContext(
                            "2d"
                        );


                    context.drawImage(
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
                                        "Could not extract video frame."
                                    )
                                );


                                return;

                            }


                            resolve(
                                new File(
                                    [
                                        blob
                                    ],
                                    "video-frame.jpg",
                                    {
                                        type:
                                            "image/jpeg"
                                    }
                                )
                            );

                        },
                        "image/jpeg",
                        0.85
                    );

                };


            video.onerror =
                () => {

                    URL.revokeObjectURL(
                        url
                    );


                    reject(
                        new Error(
                            "Could not read the video."
                        )
                    );

                };

        }
    );

}


/* =========================================================
   SEND TO API
========================================================= */

async function sendMessage() {

    if (sending) {
        return;
    }


    const text =
        userInput?.value.trim() ||
        "";


    if (
        !text &&
        !selectedImage &&
        !selectedVideo &&
        !selectedFile
    ) {

        return;

    }


    sending =
        true;


    setSendingState(
        true
    );


    closePlus();


    removeWelcome();


    let attachment =
        null;


    let apiImage =
        null;


    try {

        /* ===================================================
           IMAGE
        =================================================== */

        if (selectedImage) {

            attachment = {

                type:
                    "image",

                url:
                    URL.createObjectURL(
                        selectedImage
                    )

            };


            const base64 =
                await fileToBase64(
                    selectedImage
                );


            apiImage = {

                data:
                    base64,

                mimeType:
                    selectedImage.type ||
                    "image/jpeg"

            };

        }


        /* ===================================================
           VIDEO
        =================================================== */

        else if (selectedVideo) {

            attachment = {

                type:
                    "video",

                url:
                    URL.createObjectURL(
                        selectedVideo
                    )

            };


            /*
             * The current Vercel API accepts images.
             * Extract a frame from the video and send
             * that frame for AI analysis.
             */

            const frame =
                await videoToImage(
                    selectedVideo
                );


            const base64 =
                await fileToBase64(
                    frame
                );


            apiImage = {

                data:
                    base64,

                mimeType:
                    "image/jpeg"

            };

        }


        /* ===================================================
           FILE
        =================================================== */

        else if (selectedFile) {

            attachment = {

                type:
                    "file",

                name:
                    selectedFile.name

            };

        }


        /* ===================================================
           SHOW USER MESSAGE
        =================================================== */

        addMessage(
            text ||
                (
                    selectedVideo
                        ? "Please analyze this video."
                        : selectedImage
                            ? "Please analyze this image."
                            : ""
                ),
            "user",
            attachment,
            true
        );


        userInput.value =
            "";


        resizeInput();


        showTyping();


        /* ===================================================
           REQUEST BODY
        =================================================== */

        const requestBody = {

            message:
                text,

            thinkHarder:
                thinkHarder

        };


        if (apiImage) {

            requestBody.image =
                apiImage;

        }


        /* ===================================================
           API REQUEST
        =================================================== */

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
                            requestBody
                        )

                }
            );


        let data =
            null;


        try {

            data =
                await response.json();

        } catch {

            data =
                null;

        }


        removeTyping();


        /* ===================================================
           RATE LIMIT
        =================================================== */

        if (
            response.status === 429
        ) {

            addMessage(
                "⏳ The AI is temporarily rate-limited. Please wait a few seconds and try again.",
                "ai"
            );


            return;

        }


        /* ===================================================
           API ERROR
        =================================================== */

        if (
            !response.ok ||
            !data?.success
        ) {

            const errorMessage =
                data?.error ||
                `API request failed (${response.status}).`;


            addMessage(
                "⚠️ " +
                errorMessage,
                "ai"
            );


            return;

        }


        /* ===================================================
           AI ANSWER
        =================================================== */

        const answer =
            (
                data.answer ||
                data.reply ||
                data.text ||
                ""
            ).trim();


        if (!answer) {

            addMessage(
                "⚠️ The AI returned an empty response. Please try again.",
                "ai"
            );


            return;

        }


        addMessage(
            answer,
            "ai",
            null,
            true
        );


    } catch (error) {

        console.error(
            "SEND ERROR:",
            error
        );


        removeTyping();


        let message =
            "Connection error. Please check your Vercel API/function and try again.";


        if (
            error?.message
        ) {

            console.error(
                error.message
            );

        }


        addMessage(
            "❌ " +
            message,
            "ai"
        );


    } finally {

        sending =
            false;


        setSendingState(
            false
        );


        clearAttachment();


        userInput?.focus();

    }

}


/* =========================================================
   SEND BUTTON
========================================================= */

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
   SENDING STATE
========================================================= */

function setSendingState(
    active
) {

    if (!sendBtn) {
        return;
    }


    sendBtn.disabled =
        active;


    sendBtn.textContent =
        active
            ? "⏳"
            : "➤";


    if (micBtn) {

        micBtn.disabled =
            active;

    }

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

            showTemporaryNotice(
                "🧠 Think Harder enabled"
            );

        } else {

            showTemporaryNotice(
                "🧠 Think Harder disabled"
            );

        }

    }
);


/* =========================================================
   TEMPORARY NOTICE
========================================================= */

function showTemporaryNotice(
    text
) {

    const notice =
        document.createElement(
            "div"
        );


    notice.className =
        "swift-notice";


    notice.textContent =
        text;


    document.body.appendChild(
        notice
    );


    setTimeout(
        () => {

            notice.remove();

        },
        1800
    );

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
   MODAL BACKDROP
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   MEMORY
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

function applyTheme(
    theme
) {

    currentTheme =
        theme;


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


        applyTheme(
            next
        );

    }
);


/* =========================================================
   SETTINGS
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
                    You are currently using SwiftCortex as a guest.
                </p>

                <button class="settings-action">
                    🔐 Sign In
                </button>

                <button class="settings-action">
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
                        Allow SwiftCortex to remember useful information between conversations.
                    </small>

                </div>

                <button
                    id="memoryToggleSettings"
                    class="settings-toggle"
                >
                    <span></span>
                </button>

            </div>

            <div class="settings-info">
                🧠 Memory helps SwiftCortex provide more personalized responses.
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
            >
                <span>🌙</span>

                <div>
                    <strong>Dark</strong>
                    <small>Dark appearance</small>
                </div>

                <b class="theme-check">
                    ✓
                </b>
            </button>

            <button
                class="appearance-option"
                data-theme="light"
            >
                <span>☀️</span>

                <div>
                    <strong>Light</strong>
                    <small>Light appearance</small>
                </div>

                <b class="theme-check">
                    ✓
                </b>
            </button>

            <button
                class="appearance-option"
                data-theme="system"
            >
                <span>💻</span>

                <div>
                    <strong>System</strong>
                    <small>Follow your device settings</small>
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

                <option value="ar">
                    العربية
                </option>

            </select>

            <div class="settings-info">
                🌐 Your language preference is saved on this device.
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
                        Allow SwiftCortex to send notifications.
                    </small>

                </div>

                <button
                    id="notificationToggle"
                    class="settings-toggle"
                >
                    <span></span>
                </button>

            </div>

            <div class="settings-info">
                🔔 Notification support depends on your browser.
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
                    You are currently using the SwiftCortex Free Plan.
                </p>

                <button class="premium-btn">
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
                        Store recent conversations on this device.
                    </small>

                </div>

                <button
                    id="historyToggle"
                    class="settings-toggle"
                >
                    <span></span>
                </button>

            </div>

            <div class="settings-info">
                🔒 Your local preferences are stored in your browser.
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
                    This will remove the recent chat list saved on this device.
                </p>

                <button
                    id="clearHistoryConfirm"
                    class="danger-btn"
                >
                    🗑️ Clear History
                </button>

            </div>

        `

    }

};


/* =========================================================
   SETTINGS HOME
========================================================= */

function openSettingsHome() {

    const box =
        settingsModal?.querySelector(
            ".settings-box"
        );


    if (!box) {
        return;
    }


    const header =
        box.querySelector(
            ".modal-header"
        );


    const list =
        box.querySelector(
            ".settings-list"
        );


    if (!list) {
        return;
    }


    const title =
        header?.querySelector(
            "strong"
        );


    const subtitle =
        header?.querySelector(
            "small"
        );


    if (title) {

        title.textContent =
            "⚙️ Settings";

    }


    if (subtitle) {

        subtitle.textContent =
            "SwiftCortex AI preferences";

    }


    const names = [

        "account",
        "memory",
        "appearance",
        "language",
        "notifications",
        "subscription",
        "privacy",
        "clear"

    ];


    const items =
        $$(".settings-list .setting-item");


    items.forEach(
        (item, index) => {

            const key =
                names[index];


            if (!key) {
                return;
            }


            const data =
                settingsData[key];


            item.dataset.setting =
                key;


            const span =
                item.querySelector(
                    "span"
                );


            const small =
                item.querySelector(
                    "small"
                );


            if (span) {

                span.textContent =
                    `${data.icon} ${data.title}`;

            }


            if (small) {

                small.textContent =
                    data.description;

            }


            item.onclick =
                () => {

                    openSettingPage(
                        key
                    );

                };

        }
    );

}


function openSettingPage(
    key
) {

    const data =
        settingsData[key];


    if (!data) {
        return;
    }


    const box =
        settingsModal?.querySelector(
            ".settings-box"
        );


    if (!box) {
        return;
    }


    const header =
        box.querySelector(
            ".modal-header"
        );


    const list =
        box.querySelector(
            ".settings-list"
        );


    if (!header || !list) {
        return;
    }


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
   SETTINGS CONTROLS
========================================================= */

function bindSettingControls(
    key
) {

    if (key === "memory") {

        const toggle =
            $("memoryToggleSettings");


        if (!toggle) {
            return;
        }


        setToggleState(
            toggle,
            memoryEnabled
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


                setToggleState(
                    toggle,
                    memoryEnabled
                );

            };

    }


    if (key === "appearance") {

        const options =
            $$(".appearance-option");


        const saved =
            localStorage.getItem(
                "swift_theme"
            ) || "dark";


        updateThemeChecks(
            options,
            saved
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


    if (key === "language") {

        const select =
            $("languageSelect");


        if (!select) {
            return;
        }


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


    if (key === "notifications") {

        const toggle =
            $("notificationToggle");


        if (!toggle) {
            return;
        }


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


    if (key === "privacy") {

        const toggle =
            $("historyToggle");


        if (!toggle) {
            return;
        }


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


    if (key === "clear") {

        $("clearHistoryConfirm")
            ?.addEventListener(
                "click",
                clearAllHistory
            );

    }

}


function setToggleState(
    toggle,
    enabled
) {

    if (!toggle) {
        return;
    }


    toggle.classList.toggle(
        "active",
        enabled
    );

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
   SETTINGS OPEN/CLOSE
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


    showTemporaryNotice(
        "✅ Chat history cleared"
    );


    openSettingsHome();

}


/* =========================================================
   INITIALIZE
========================================================= */

function loadSettings() {

    const savedTheme =
        localStorage.getItem(
            "swift_theme"
        ) || "dark";


    applyTheme(
        savedTheme
    );


    memoryEnabled =
        localStorage.getItem(
            "swift_memory"
        ) !== "off";


    updateMemoryUI();


    renderHistory();


    resizeInput();

}


/* =========================================================
   PAGE LOAD
========================================================= */

loadSettings();
