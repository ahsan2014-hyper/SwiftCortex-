"use strict";

/* =========================================================
   SwiftCortex AI Ultra
   COMPLETE script.js

   Features
   ✅ Text chat
   ✅ Send button
   ✅ Enter to send / Shift+Enter newline
   ✅ Plus Menu
   ✅ Microphone
   ✅ Bengali + English voice input
   ✅ Camera
   ✅ Front / Back camera
   ✅ Photo capture
   ✅ Video recording
   ✅ Photos
   ✅ Files
   ✅ Image preview
   ✅ Video preview
   ✅ Remove attachment
   ✅ Plugins
   ✅ Think Harder
   ✅ Profile
   ✅ Settings
   ✅ Memory ON/OFF
   ✅ Dark / Light mode
   ✅ Customer Support
   ✅ New Chat
   ✅ Recent Chat / History
   ========================================================= */


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

function safeAddListener(element, event, handler) {
    if (element) {
        element.addEventListener(event, handler);
    }
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

function scrollMessages() {
    if (!messages) return;

    requestAnimationFrame(() => {
        messages.scrollTop = messages.scrollHeight;
    });
}


/* =========================================================
   MAIN ELEMENTS
   ========================================================= */

const plusBtn = $("plusBtn");
const plusMenu = $("plusMenu");

const cameraBtn = $("cameraBtn");
const photoBtn = $("photoBtn");
const fileBtn = $("fileBtn");
const pluginBtn = $("pluginBtn");
const thinkBtn = $("thinkBtn");

const imageInput = $("imageInput");
const fileInput = $("fileInput");

const userInput = $("userInput");
const sendBtn = $("sendBtn");

const messages = $("messages");
const imagePreview = $("imagePreview");

const newChat = $("newChat");
const themeBtn = $("themeBtn");
const historyList = $("historyList");


/* =========================================================
   OPTIONAL ELEMENTS
   ========================================================= */

const microphoneBtn =
    $("microphoneBtn") ||
    $("micBtn") ||
    $("voiceBtn");

const profileBtn = $("profileBtn");
const settingsBtn = $("settingsBtn");
const memoryBtn = $("memoryBtn");
const supportBtn = $("supportBtn");

const memoryToggle = $("memoryToggle");
const languageBtn = $("languageBtn");


/* =========================================================
   CAMERA ELEMENTS
   ========================================================= */

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


/* =========================================================
   STATE
   ========================================================= */

let selectedImage = null;
let selectedVideo = null;

let cameraStream = null;
let mediaRecorder = null;
let recordedChunks = [];

let cameraFacing = "user";
let currentCameraMode = "photo";

let recordingSeconds = 0;
let recordingTimer = null;

let isSending = false;
let thinkHarderEnabled = false;
let memoryEnabled = true;

let currentVoiceLanguage = "bn-BD";

let recognition = null;
let isListening = false;


/* =========================================================
   PLUS MENU
   ========================================================= */

function closePlusMenu() {
    if (plusMenu) {
        plusMenu.classList.remove("show");
        plusMenu.classList.remove("active");
    }
}

safeAddListener(plusBtn, "click", (event) => {
    event.stopPropagation();

    if (!plusMenu) return;

    const opened =
        plusMenu.classList.contains("show") ||
        plusMenu.classList.contains("active");

    if (opened) {
        closePlusMenu();
    } else {
        plusMenu.classList.add("show");
        plusMenu.classList.add("active");
    }
});

document.addEventListener("click", (event) => {
    if (
        plusMenu &&
        plusBtn &&
        !plusMenu.contains(event.target) &&
        !plusBtn.contains(event.target)
    ) {
        closePlusMenu();
    }
});


/* =========================================================
   MESSAGE UI
   ========================================================= */

function addMessage(text, sender = "user", attachment = null) {
    if (!messages) return null;

    const message = document.createElement("div");

    message.className =
        `message ${sender === "user" ? "user-message" : "ai-message"}`;

    const content = document.createElement("div");
    content.className = "message-content";

    if (text) {
        const textDiv = document.createElement("div");
        textDiv.className = "message-text";

        // Preserve line breaks
        textDiv.innerHTML = escapeHTML(text).replace(/\n/g, "<br>");

        content.appendChild(textDiv);
    }

    if (attachment) {
        const attachmentBox = document.createElement("div");
        attachmentBox.className = "message-attachment";

        if (attachment.type === "image") {
            const img = document.createElement("img");
            img.src = attachment.url;
            img.alt = "Attached image";
            img.className = "chat-image";

            attachmentBox.appendChild(img);
        }

        if (attachment.type === "video") {
            const video = document.createElement("video");
            video.src = attachment.url;
            video.controls = true;
            video.playsInline = true;
            video.className = "chat-video";

            attachmentBox.appendChild(video);
        }

        content.appendChild(attachmentBox);
    }

    message.appendChild(content);
    messages.appendChild(message);

    scrollMessages();

    return message;
}


/* =========================================================
   ATTACHMENT PREVIEW
   ========================================================= */

function showAttachment(file, type) {
    if (!imagePreview || !file) return;

    imagePreview.innerHTML = "";
    imagePreview.classList.add("show");

    const wrapper = document.createElement("div");
    wrapper.className = "attachment-preview-item";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-attachment";
    removeBtn.innerHTML = "×";
    removeBtn.title = "Remove attachment";

    const url = URL.createObjectURL(file);

    if (type === "image") {
        selectedImage = file;
        selectedVideo = null;

        const img = document.createElement("img");
        img.src = url;
        img.alt = "Image preview";
        img.className = "preview-image";

        wrapper.appendChild(img);
    }

    if (type === "video") {
        selectedVideo = file;
        selectedImage = null;

        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        video.muted = true;
        video.playsInline = true;
        video.className = "preview-video";

        wrapper.appendChild(video);
    }

    removeBtn.addEventListener("click", () => {
        clearAttachment();
    });

    wrapper.appendChild(removeBtn);
    imagePreview.appendChild(wrapper);
}

function clearAttachment() {
    selectedImage = null;
    selectedVideo = null;

    if (imagePreview) {
        imagePreview.innerHTML = "";
        imagePreview.classList.remove("show");
    }

    if (imageInput) imageInput.value = "";
    if (fileInput) fileInput.value = "";
}


/* =========================================================
   PHOTO BUTTON
   ========================================================= */

safeAddListener(photoBtn, "click", () => {
    closePlusMenu();

    if (imageInput) {
        imageInput.click();
    }
});


safeAddListener(imageInput, "change", (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
    }

    showAttachment(file, "image");
});


/* =========================================================
   FILE BUTTON
   ========================================================= */

safeAddListener(fileBtn, "click", () => {
    closePlusMenu();

    if (fileInput) {
        fileInput.click();
    }
});


safeAddListener(fileInput, "change", (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type.startsWith("image/")) {
        showAttachment(file, "image");
        return;
    }

    if (file.type.startsWith("video/")) {
        showAttachment(file, "video");
        return;
    }

    // Generic file
    addMessage(
        `📄 Attached file: ${file.name}`,
        "user"
    );
});


/* =========================================================
   CAMERA
   ========================================================= */

safeAddListener(cameraBtn, "click", () => {
    closePlusMenu();
    openCamera();
});


async function openCamera() {
    if (!cameraModal) {
        alert("Camera modal was not found in index.html.");
        return;
    }

    cameraModal.classList.add("show");
    cameraModal.classList.add("active");

    if (cameraError) {
        cameraError.style.display = "none";
    }

    await startCamera();
}


async function startCamera() {
    stopCamera();

    try {
        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                "Camera is not supported by this browser."
            );
        }

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: cameraFacing
                    },
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
            cameraVideo.srcObject = cameraStream;
            cameraVideo.muted = true;
            cameraVideo.playsInline = true;

            try {
                await cameraVideo.play();
            } catch (e) {
                console.warn("Camera autoplay:", e);
            }
        }

        if (cameraError) {
            cameraError.style.display = "none";
        }

    } catch (error) {
        console.error("Camera error:", error);
        showCameraError(error);
    }
}


function showCameraError(error) {
    if (!cameraError) {
        alert(
            "Unable to access camera. Please allow camera permission."
        );
        return;
    }

    cameraError.style.display = "block";

    if (cameraErrorText) {
        cameraErrorText.textContent =
            error?.message ||
            "Camera permission was denied or unavailable.";
    }
}


function closeCamera() {
    stopCamera();

    if (cameraModal) {
        cameraModal.classList.remove("show");
        cameraModal.classList.remove("active");
    }

    if (cameraVideo) {
        cameraVideo.srcObject = null;
    }
}


function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
            track.stop();
        });

        cameraStream = null;
    }
}


safeAddListener(cameraClose, "click", closeCamera);


/* =========================================================
   PHOTO MODE
   ========================================================= */

safeAddListener(photoMode, "click", () => {
    currentCameraMode = "photo";

    photoMode.classList.add("active");

    if (videoMode) {
        videoMode.classList.remove("active");
    }

    if (takePhoto) {
        takePhoto.style.display = "";
    }

    if (startRecord) {
        startRecord.style.display = "none";
    }

    if (stopRecord) {
        stopRecord.style.display = "none";
    }
});


/* =========================================================
   VIDEO MODE
   ========================================================= */

safeAddListener(videoMode, "click", () => {
    currentCameraMode = "video";

    videoMode.classList.add("active");

    if (photoMode) {
        photoMode.classList.remove("active");
    }

    if (takePhoto) {
        takePhoto.style.display = "none";
    }

    if (startRecord) {
        startRecord.style.display = "";
    }

    if (stopRecord) {
        stopRecord.style.display = "none";
    }
});


/* =========================================================
   CAPTURE PHOTO
   ========================================================= */

safeAddListener(takePhoto, "click", () => {
    capturePhoto();
});


function capturePhoto() {
    if (!cameraVideo ||
        !cameraVideo.videoWidth ||
        !cameraVideo.videoHeight) {
        alert("Camera is not ready yet.");
        return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Mirror front camera photo correctly
    if (cameraFacing === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(
        cameraVideo,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.toBlob((blob) => {
        if (!blob) return;

        const file = new File(
            [blob],
            `swiftcortex-photo-${Date.now()}.jpg`,
            {
                type: "image/jpeg"
            }
        );

        showAttachment(file, "image");

        closeCamera();

    }, "image/jpeg", 0.92);
}


/* =========================================================
   SWITCH FRONT / BACK CAMERA
   ========================================================= */

safeAddListener(switchCamera, "click", async () => {
    cameraFacing =
        cameraFacing === "user"
            ? "environment"
            : "user";

    await startCamera();
});


/* =========================================================
   VIDEO RECORDING
   ========================================================= */

safeAddListener(startRecord, "click", () => {
    startVideoRecording();
});


function startVideoRecording() {
    if (!cameraStream) {
        alert("Camera is not active.");
        return;
    }

    if (!window.MediaRecorder) {
        alert(
            "Video recording is not supported by this browser."
        );
        return;
    }

    recordedChunks = [];

    let options = {};

    if (
        MediaRecorder.isTypeSupported &&
        MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ) {
        options.mimeType =
            "video/webm;codecs=vp9,opus";
    } else if (
        MediaRecorder.isTypeSupported &&
        MediaRecorder.isTypeSupported("video/webm")
    ) {
        options.mimeType = "video/webm";
    }

    try {
        mediaRecorder =
            new MediaRecorder(
                cameraStream,
                options
            );
    } catch (error) {
        console.error(error);

        try {
            mediaRecorder =
                new MediaRecorder(cameraStream);
        } catch (secondError) {
            alert("Unable to start video recording.");
            return;
        }
    }

    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        finishVideoRecording();
    };

    mediaRecorder.start(250);

    recordingSeconds = 0;

    updateRecordTime();

    recordingTimer = setInterval(() => {
        recordingSeconds++;
        updateRecordTime();
    }, 1000);

    if (startRecord) {
        startRecord.style.display = "none";
    }

    if (stopRecord) {
        stopRecord.style.display = "";
    }
}


safeAddListener(stopRecord, "click", () => {
    stopRecording();
});


function stopRecording() {
    if (
        mediaRecorder &&
        mediaRecorder.state !== "inactive"
    ) {
        mediaRecorder.stop();
    }

    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }

    if (stopRecord) {
        stopRecord.style.display = "none";
    }
}


function finishVideoRecording() {
    if (!recordedChunks.length) {
        return;
    }

    const mimeType =
        mediaRecorder?.mimeType ||
        "video/webm";

    const blob = new Blob(
        recordedChunks,
        {
            type: mimeType
        }
    );

    const extension =
        mimeType.includes("mp4")
            ? "mp4"
            : "webm";

    const file = new File(
        [blob],
        `swiftcortex-video-${Date.now()}.${extension}`,
        {
            type: mimeType
        }
    );

    showAttachment(file, "video");

    closeCamera();

    recordedChunks = [];
}


function updateRecordTime() {
    if (!recordTime) return;

    const minutes =
        Math.floor(recordingSeconds / 60)
            .toString()
            .padStart(2, "0");

    const seconds =
        (recordingSeconds % 60)
            .toString()
            .padStart(2, "0");

    recordTime.textContent =
        `${minutes}:${seconds}`;
}


/* =========================================================
   FILE TO BASE64
   ========================================================= */

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;

            if (typeof result !== "string") {
                resolve(null);
                return;
            }

            const commaIndex = result.indexOf(",");

            resolve(
                commaIndex >= 0
                    ? result.substring(commaIndex + 1)
                    : result
            );
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}


/* =========================================================
   VIDEO FRAME EXTRACTION
   ========================================================= */

async function extractVideoFrames(videoFile) {
    if (!videoFile) return [];

    const url = URL.createObjectURL(videoFile);

    try {
        const video = document.createElement("video");

        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";

        await new Promise((resolve, reject) => {
            video.onloadedmetadata = resolve;
            video.onerror = reject;
        });

        const duration =
            Number.isFinite(video.duration)
                ? video.duration
                : 0;

        if (!duration) {
            return [];
        }

        const frameCount =
            Math.min(6, Math.max(1, Math.ceil(duration)));

        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            const time =
                frameCount === 1
                    ? 0
                    : (duration * i) /
                      (frameCount - 1);

            try {
                await seekVideo(video, time);

                const canvas =
                    document.createElement("canvas");

                const maxWidth = 768;

                const scale =
                    video.videoWidth > maxWidth
                        ? maxWidth / video.videoWidth
                        : 1;

                canvas.width =
                    Math.max(
                        1,
                        Math.round(video.videoWidth * scale)
                    );

                canvas.height =
                    Math.max(
                        1,
                        Math.round(video.videoHeight * scale)
                    );

                const ctx =
                    canvas.getContext("2d");

                ctx.drawImage(
                    video,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                const dataURL =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.75
                    );

                const commaIndex =
                    dataURL.indexOf(",");

                frames.push(
                    commaIndex >= 0
                        ? dataURL.substring(
                            commaIndex + 1
                        )
                        : dataURL
                );

            } catch (error) {
                console.warn(
                    "Video frame error:",
                    error
                );
            }
        }

        return frames;

    } catch (error) {
        console.error(
            "Video extraction error:",
            error
        );

        return [];

    } finally {
        URL.revokeObjectURL(url);
    }
}


function seekVideo(video, time) {
    return new Promise((resolve, reject) => {
        const onSeeked = () => {
            cleanup();
            resolve();
        };

        const onError = () => {
            cleanup();
            reject(
                new Error("Unable to seek video.")
            );
        };

        const cleanup = () => {
            video.removeEventListener(
                "seeked",
                onSeeked
            );

            video.removeEventListener(
                "error",
                onError
            );
        };

        video.addEventListener(
            "seeked",
            onSeeked,
            {
                once: true
            }
        );

        video.addEventListener(
            "error",
            onError,
            {
                once: true
            }
        );

        video.currentTime = Math.max(
            0,
            Math.min(
                time,
                Number.isFinite(video.duration)
                    ? video.duration
                    : time
            )
        );
    });
}


/* =========================================================
   THINK HARDER
   ========================================================= */

safeAddListener(thinkBtn, "click", () => {
    thinkHarderEnabled =
        !thinkHarderEnabled;

    thinkBtn.classList.toggle(
        "active",
        thinkHarderEnabled
    );

    if (thinkHarderEnabled) {
        thinkBtn.setAttribute(
            "aria-pressed",
            "true"
        );
    } else {
        thinkBtn.setAttribute(
            "aria-pressed",
            "false"
        );
    }

    closePlusMenu();
});


/* =========================================================
   PLUGINS
   ========================================================= */

safeAddListener(pluginBtn, "click", () => {
    closePlusMenu();

    alert(
        "Plugins menu is ready. You can connect your plugins here."
    );
});


/* =========================================================
   MEMORY
   ========================================================= */

function updateMemoryUI() {
    const buttons = [
        memoryBtn,
        memoryToggle
    ].filter(Boolean);

    buttons.forEach(button => {
        button.classList.toggle(
            "active",
            memoryEnabled
        );

        button.setAttribute(
            "aria-pressed",
            String(memoryEnabled)
        );
    });
}


function toggleMemory() {
    memoryEnabled = !memoryEnabled;

    localStorage.setItem(
        "swiftcortex-memory",
        memoryEnabled
            ? "on"
            : "off"
    );

    updateMemoryUI();
}


safeAddListener(memoryBtn, "click", toggleMemory);

safeAddListener(memoryToggle, "change", () => {
    memoryEnabled =
        Boolean(memoryToggle.checked);

    localStorage.setItem(
        "swiftcortex-memory",
        memoryEnabled
            ? "on"
            : "off"
    );

    updateMemoryUI();
});


const savedMemory =
    localStorage.getItem(
        "swiftcortex-memory"
    );

if (savedMemory === "off") {
    memoryEnabled = false;
}

updateMemoryUI();


/* =========================================================
   DARK / LIGHT MODE
   ========================================================= */

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle(
        "dark-mode",
        isDark
    );

    document.documentElement.classList.toggle(
        "dark-mode",
        isDark
    );

    if (themeBtn) {
        themeBtn.setAttribute(
            "aria-pressed",
            String(isDark)
        );

        themeBtn.title =
            isDark
                ? "Switch to Light Mode"
                : "Switch to Dark Mode";
    }

    localStorage.setItem(
        "swiftcortex-theme",
        theme
    );
}


function toggleTheme() {
    const currentlyDark =
        document.body.classList.contains(
            "dark-mode"
        ) ||
        document.documentElement.classList.contains(
            "dark-mode"
        );

    applyTheme(
        currentlyDark
            ? "light"
            : "dark"
    );
}


safeAddListener(
    themeBtn,
    "click",
    toggleTheme
);


const savedTheme =
    localStorage.getItem(
        "swiftcortex-theme"
    );

if (savedTheme) {
    applyTheme(savedTheme);
} else {
    applyTheme("light");
}


/* =========================================================
   PROFILE
   ========================================================= */

safeAddListener(profileBtn, "click", () => {
    closePlusMenu();

    const name =
        localStorage.getItem(
            "swiftcortex-profile-name"
        ) ||
        "SwiftCortex User";

    alert(
        `👤 Profile\n\nName: ${name}`
    );
});


/* =========================================================
   SETTINGS
   ========================================================= */

safeAddListener(settingsBtn, "click", () => {
    closePlusMenu();

    alert(
        "⚙️ Settings\n\n" +
        "Voice: Bengali / English\n" +
        `Memory: ${memoryEnabled ? "ON" : "OFF"}\n` +
        `Think Harder: ${thinkHarderEnabled ? "ON" : "OFF"}`
    );
});


/* =========================================================
   CUSTOMER SUPPORT
   ========================================================= */

safeAddListener(supportBtn, "click", () => {
    closePlusMenu();

    window.location.href =
        "mailto:swiftcortexaisupport@gmail.com" +
        "?subject=SwiftCortex AI Ultra Customer Support";
});


/* =========================================================
   NEW CHAT
   ========================================================= */

safeAddListener(newChat, "click", () => {
    if (messages) {
        messages.innerHTML = "";
    }

    clearAttachment();

    if (userInput) {
        userInput.value = "";
        userInput.focus();
    }

    addMessage(
        "Hello! 👋 I'm SwiftCortex AI Ultra. How can I help you?",
        "ai"
    );

    scrollMessages();
});


/* =========================================================
   CHAT HISTORY
   ========================================================= */

function saveChatToHistory(userText, aiText) {
    if (!userText) return;

    try {
        const history =
            JSON.parse(
                localStorage.getItem(
                    "swiftcortex-history"
                ) || "[]"
            );

        history.unshift({
            id: Date.now(),
            title:
                userText.length > 40
                    ? userText.substring(0, 40) + "..."
                    : userText,
            user: userText,
            assistant: aiText || "",
            time: new Date().toISOString()
        });

        const limited =
            history.slice(0, 30);

        localStorage.setItem(
            "swiftcortex-history",
            JSON.stringify(limited)
        );

        renderHistory();

    } catch (error) {
        console.warn(
            "History save error:",
            error
        );
    }
}


function renderHistory() {
    if (!historyList) return;

    historyList.innerHTML = "";

    try {
        const history =
            JSON.parse(
                localStorage.getItem(
                    "swiftcortex-history"
                ) || "[]"
            );

        history.forEach(item => {
            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "history-item";

            button.textContent =
                item.title || "Previous Chat";

            button.addEventListener(
                "click",
                () => {
                    loadHistoryItem(item);
                }
            );

            historyList.appendChild(button);
        });

    } catch (error) {
        console.warn(
            "History render error:",
            error
        );
    }
}


function loadHistoryItem(item) {
    if (!messages) return;

    messages.innerHTML = "";

    if (item.user) {
        addMessage(
            item.user,
            "user"
        );
    }

    if (item.assistant) {
        addMessage(
            item.assistant,
            "ai"
        );
    }

    scrollMessages();
}


renderHistory();


/* =========================================================
   VOICE INPUT
   ========================================================= */

function setupVoiceRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return null;
    }

    const recog =
        new SpeechRecognition();

    recog.continuous = false;
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    recog.lang =
        currentVoiceLanguage;

    recog.onstart = () => {
        isListening = true;

        if (microphoneBtn) {
            microphoneBtn.classList.add(
                "active"
            );

            microphoneBtn.setAttribute(
                "aria-pressed",
                "true"
            );

            microphoneBtn.title =
                "Stop voice input";
        }
    };

    recog.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {
            const transcript =
                event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalText += transcript;
            } else {
                interimText += transcript;
            }
        }

        const existing =
            userInput?.value || "";

        if (userInput) {
            if (finalText) {
                const separator =
                    existing &&
                    !existing.endsWith(" ")
                        ? " "
                        : "";

                userInput.value =
                    existing +
                    separator +
                    finalText.trim();
            }

            // Interim text is not inserted permanently,
            // avoiding duplicated speech.
            userInput.dispatchEvent(
                new Event("input")
            );
        }
    };

    recog.onerror = (event) => {
        console.warn(
            "Speech recognition:",
            event.error
        );

        isListening = false;

        if (microphoneBtn) {
            microphoneBtn.classList.remove(
                "active"
            );

            microphoneBtn.setAttribute(
                "aria-pressed",
                "false"
            );
        }

        if (event.error === "not-allowed") {
            alert(
                "Microphone permission was denied. Please allow microphone access."
            );
        }
    };

    recog.onend = () => {
        isListening = false;

        if (microphoneBtn) {
            microphoneBtn.classList.remove(
                "active"
            );

            microphoneBtn.setAttribute(
                "aria-pressed",
                "false"
            );

            microphoneBtn.title =
                "Voice input";
        }
    };

    return recog;
}


function toggleVoiceInput() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert(
            "Voice input is not supported in this browser. Try Chrome or another browser with Speech Recognition support."
        );
        return;
    }

    if (isListening && recognition) {
        recognition.stop();
        return;
    }

    recognition =
        setupVoiceRecognition();

    if (!recognition) return;

    recognition.lang =
        currentVoiceLanguage;

    try {
        recognition.start();
    } catch (error) {
        console.warn(
            "Recognition start:",
            error
        );
    }
}


safeAddListener(
    microphoneBtn,
    "click",
    toggleVoiceInput
);


/* =========================================================
   VOICE LANGUAGE SWITCH
   ========================================================= */

safeAddListener(
    languageBtn,
    "click",
    () => {
        currentVoiceLanguage =
            currentVoiceLanguage === "bn-BD"
                ? "en-US"
                : "bn-BD";

        languageBtn.textContent =
            currentVoiceLanguage === "bn-BD"
                ? "বাংলা"
                : "English";

        languageBtn.title =
            currentVoiceLanguage === "bn-BD"
                ? "Voice: Bengali"
                : "Voice: English";
    }
);


/* =========================================================
   TEXTAREA AUTO HEIGHT
   ========================================================= */

safeAddListener(
    userInput,
    "input",
    () => {
        if (!userInput) return;

        userInput.style.height = "auto";

        userInput.style.height =
            Math.min(
                userInput.scrollHeight,
                180
            ) + "px";
    }
);


/* =========================================================
   ENTER TO SEND
   ========================================================= */

safeAddListener(
    userInput,
    "keydown",
    (event) => {
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

safeAddListener(
    sendBtn,
    "click",
    sendMessage
);


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {
    if (isSending) return;

    const text =
        userInput?.value.trim() || "";

    const imageFile =
        selectedImage;

    const videoFile =
        selectedVideo;

    if (
        !text &&
        !imageFile &&
        !videoFile
    ) {
        return;
    }

    isSending = true;

    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.classList.add(
            "sending"
        );
    }

    const attachmentBeforeClear =
        imageFile
            ? {
                type: "image",
                url: URL.createObjectURL(
                    imageFile
                )
            }
            : videoFile
                ? {
                    type: "video",
                    url: URL.createObjectURL(
                        videoFile
                    )
                }
                : null;

    addMessage(
        text || "",
        "user",
        attachmentBeforeClear
    );

    const originalText = text;

    if (userInput) {
        userInput.value = "";
        userInput.style.height = "auto";
    }

    clearAttachment();

    let temporaryAIMessage = null;

    try {
        let imageBase64 = null;
        let videoFrames = [];

        if (imageFile) {
            imageBase64 =
                await fileToBase64(
                    imageFile
                );
        }

        if (videoFile) {
            videoFrames =
                await extractVideoFrames(
                    videoFile
                );
        }

        temporaryAIMessage =
            addMessage(
                "Thinking…",
                "ai"
            );

        const requestBody = {
            message:
                originalText ||
                (
                    imageFile
                        ? "Please analyze this image."
                        : "Please analyze this video."
                ),

            image:
                imageBase64,

            videoFrames:
                videoFrames,

            thinkHarder:
                thinkHarderEnabled,

            memory:
                memoryEnabled,

            voiceLanguage:
                currentVoiceLanguage
        };


        /* =====================================================
           VERCEL API
           ===================================================== */

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
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        let data = null;

        try {
            data =
                await response.json();
        } catch {
            data = null;
        }


        if (!response.ok) {
            throw new Error(
                data?.error ||
                `Server error: ${response.status}`
            );
        }


        const aiText =
            data?.reply ||
            data?.message ||
            data?.text ||
            data?.response ||
            "I received your message, but no response was returned.";


        /* =====================================================
           REPLACE THINKING MESSAGE
           ===================================================== */

        if (temporaryAIMessage) {
            const content =
                temporaryAIMessage.querySelector(
                    ".message-content"
                );

            if (content) {
                content.innerHTML = "";

                const textDiv =
                    document.createElement(
                        "div"
                    );

                textDiv.className =
                    "message-text";

                textDiv.innerHTML =
                    escapeHTML(
                        aiText
                    ).replace(
                        /\n/g,
                        "<br>"
                    );

                content.appendChild(
                    textDiv
                );
            }
        }


        saveChatToHistory(
            originalText,
            aiText
        );

        scrollMessages();

    } catch (error) {
        console.error(
            "Send message error:",
            error
        );

        const errorText =
            `Connection error: ${
                error?.message ||
                "Unable to connect to the AI server."
            }`;

        if (temporaryAIMessage) {
            const content =
                temporaryAIMessage.querySelector(
                    ".message-content"
                );

            if (content) {
                content.innerHTML =
                    `<div class="message-text">${escapeHTML(
                        errorText
                    )}</div>`;
            }
        } else {
            addMessage(
                errorText,
                "ai"
            );
        }

        scrollMessages();

    } finally {
        isSending = false;

        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.classList.remove(
                "sending"
            );
        }

        if (userInput) {
            userInput.focus();
        }
    }
}


/* =========================================================
   CAMERA MODAL ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            cameraModal &&
            (
                cameraModal.classList.contains(
                    "show"
                ) ||
                cameraModal.classList.contains(
                    "active"
                )
            )
        ) {
            closeCamera();
        }
    }
);


/* =========================================================
   CAMERA MODAL BACKDROP
   ========================================================= */

safeAddListener(
    cameraModal,
    "click",
    (event) => {
        if (
            event.target === cameraModal
        ) {
            closeCamera();
        }
    }
);


/* =========================================================
   INITIAL GREETING
   ========================================================= */

function initializeChat() {
    if (!messages) return;

    if (
        messages.children.length === 0
    ) {
        addMessage(
            "Hello! 👋 I'm SwiftCortex AI Ultra. How can I help you?",
            "ai"
        );
    }

    scrollMessages();
}


initializeChat();


/* =========================================================
   CLEANUP
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {
        stopCamera();

        if (recordingTimer) {
            clearInterval(
                recordingTimer
            );
        }

        if (
            recognition &&
            isListening
        ) {
            try {
                recognition.stop();
            } catch {}
        }
    }
);


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.SwiftCortex = {
    sendMessage,
    openCamera,
    closeCamera,
    clearAttachment,
    toggleTheme,
    toggleMemory,
    toggleVoiceInput,
    renderHistory
};

console.log(
    "⚡ SwiftCortex AI Ultra loaded successfully."
);
