"use strict";

/* =========================================================
   SwiftCortex AI Ultra
   NEW COMPLETE script.js
   ========================================================= */

/* =========================
   HELPER
========================= */

const $ = (id) => document.getElementById(id);

const API_ENDPOINT = "/api/gemini";


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
let memoryEnabled = true;
let sending = false;

let chatHistory = [];


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadStoredSettings() {

    memoryEnabled =
        localStorage.getItem("swift_memory") !== "off";

    const savedTheme =
        localStorage.getItem("swift_theme");

    if (savedTheme) {
        applyTheme(savedTheme);
    }

    loadHistory();

    updateMemoryUI();
}


function saveMemory() {

    localStorage.setItem(
        "swift_memory",
        memoryEnabled ? "on" : "off"
    );
}


/* =========================================================
   PLUS MENU
========================================================= */

plusBtn?.addEventListener("click", (event) => {

    event.stopPropagation();

    plusMenu?.classList.toggle("show");

});


function closePlus() {

    plusMenu?.classList.remove("show");

}


document.addEventListener("click", (event) => {

    if (
        plusMenu &&
        !plusMenu.contains(event.target) &&
        event.target !== plusBtn
    ) {
        closePlus();
    }

});


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

menuBtn?.addEventListener("click", (event) => {

    event.stopPropagation();

    sidebar?.classList.toggle("open");

});


document.addEventListener("click", (event) => {

    if (
        window.innerWidth <= 800 &&
        sidebar?.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        event.target !== menuBtn
    ) {

        sidebar.classList.remove("open");

    }

});


/* =========================================================
   CHAT MESSAGE
========================================================= */

function addMessage(
    text = "",
    type = "ai",
    attachment = null
) {

    if (!messages) return null;

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


    if (attachment?.type === "image") {

        const img =
            document.createElement("img");

        img.src =
            attachment.url;

        img.alt =
            "Uploaded image";

        img.className =
            "chat-image";

        box.appendChild(img);

    }


    if (attachment?.type === "video") {

        const video =
            document.createElement("video");

        video.src =
            attachment.url;

        video.controls = true;

        video.playsInline = true;

        video.className =
            "chat-video";

        box.appendChild(video);

    }


    if (attachment?.type === "file") {

        const fileBox =
            document.createElement("div");

        fileBox.className =
            "chat-file";

        fileBox.textContent =
            "📄 " + attachment.name;

        box.appendChild(fileBox);

    }


    messages.appendChild(box);

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


/* =========================================================
   ATTACHMENT PREVIEW
========================================================= */

function showAttachment(file, type) {

    if (!imagePreview) return;

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

        img.src = url;

        img.alt = file.name;

        box.appendChild(img);

    }


    if (type === "video") {

        const video =
            document.createElement("video");

        video.src = url;

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

    remove.textContent =
        "✕";

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


/* =========================================================
   PHOTOS
========================================================= */

photoBtn?.addEventListener("click", () => {

    closePlus();

    if (!imageInput) return;

    imageInput.value = "";

    imageInput.click();

});


imageInput?.addEventListener("change", () => {

    const file =
        imageInput.files?.[0];

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

    showAttachment(
        file,
        "image"
    );

});


/* =========================================================
   FILES
========================================================= */

fileBtn?.addEventListener("click", () => {

    closePlus();

    if (!fileInput) return;

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


/* =========================================================
   CAMERA
========================================================= */

cameraBtn?.addEventListener(
    "click",
    async () => {

        closePlus();

        cameraModal?.classList.add("show");

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
            getCameraError(error)
        );

    }
}


function getCameraError(error) {

    if (
        error?.name === "NotAllowedError"
    ) {

        return "📷 Camera permission was denied. Please allow camera access.";

    }


    if (
        error?.name === "NotFoundError"
    ) {

        return "📷 No camera was found.";

    }


    if (
        error?.name === "NotReadableError"
    ) {

        return "📷 Camera is being used by another application.";

    }


    return "📷 Could not access the camera.";

}


function showCameraError(text) {

    cameraError?.classList.add("show");

    if (cameraErrorText) {

        cameraErrorText.textContent =
            text;

    }

}


function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        cameraStream = null;

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

        photoMode.classList.add("active");

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

        await startCamera();

    }
);


/* =========================================================
   VIDEO MODE
========================================================= */

videoMode?.addEventListener(
    "click",
    async () => {

        videoMode.classList.add("active");

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

        await startCamera();

    }
);


/* =========================================================
   TAKE PHOTO
========================================================= */

takePhoto?.addEventListener(
    "click",
    capturePhoto
);


function capturePhoto() {

    if (!cameraStream || !cameraVideo) {

        showCameraError(
            "Camera is not ready."
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


/* =========================================================
   VIDEO RECORDING
========================================================= */

function getSupportedMime() {

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
            "❌ Video recording is not supported.",
            "ai"
        );

        return;
    }


    chunks = [];


    const mime =
        getSupportedMime();


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
            "❌ Could not start recording.",
            "ai"
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
        .padStart(2, "0");


    const seconds =
        (recordingSeconds % 60)
        .toString()
        .padStart(2, "0");


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

        recordingTimer = null;

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

    if (!chunks.length)
        return;


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

                <h3>Guest User</h3>

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
                    <strong>Memory</strong>

                    <small>
                        Allow SwiftCortex to remember
                        useful information.
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
                🧠 Memory can make conversations
                more personalized.
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

                <b class="theme-check">✓</b>
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

                <b class="theme-check">✓</b>
            </button>


            <button
                class="appearance-option"
                data-theme="system"
            >
                <span>💻</span>

                <div>
                    <strong>System</strong>
                    <small>
                        Follow device settings
                    </small>
                </div>

                <b class="theme-check">✓</b>
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
                🌐 Language preference is saved
                on this device.
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
                    <strong>Notifications</strong>

                    <small>
                        Allow SwiftCortex
                        notifications.
                    </small>
                </div>

                <button
                    id="notificationToggle"
                    class="settings-toggle"
                >
                    <span></span>
                </button>

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

                <h3>Free Plan</h3>

                <p>
                    You are currently using
                    the SwiftCortex Free Plan.
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
                        Store recent conversations
                        on this device.
                    </small>
                </div>

                <button
                    id="historyToggle"
                    class="settings-toggle"
                >
                    <span></span>
                </button>

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
                    This will remove chats
                    saved on this device.
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

    if (!list) return;


    const title =
        header?.querySelector(
            "strong"
        );

    const subtitle =
        header?.querySelector(
            "small"
        );


    if (title)
        title.textContent =
            "⚙️ Settings";


    if (subtitle)
        subtitle.textContent =
            "SwiftCortex AI preferences";


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
        list.querySelectorAll(
            ".setting-item"
        );


    items.forEach(
        (item, index) => {

            const key =
                names[index];

            const data =
                settingsData[key];

            if (!data) return;


            item.dataset.setting =
                key;


            const spans =
                item.querySelectorAll(
                    "span"
                );

            const small =
                item.querySelector(
                    "small"
                );


            if (spans[0]) {

                spans[0].textContent =
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


function openSettingPage(key) {

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


    list.innerHTML =
        `
        <div class="settings-detail">
            ${data.content}
        </div>
        `;


    bindSettingControls(key);

}


/* =========================================================
   SETTING CONTROLS
========================================================= */

function bindSettingControls(key) {


    if (key === "memory") {

        const toggle =
            $("memoryToggleSettings");

        if (!toggle) return;


        setToggleState(
            toggle,
            memoryEnabled
        );


        toggle.onclick =
            () => {

                memoryEnabled =
                    !memoryEnabled;

                saveMemory();

                setToggleState(
                    toggle,
                    memoryEnabled
                );

                updateMemoryUI();

            };

    }


    if (key === "appearance") {

        const options =
            document.querySelectorAll(
                ".appearance-option"
            );


        const current =
            localStorage.getItem(
                "swift_theme"
            ) || "dark";


        updateThemeChecks(
            options,
            current
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

    if (!toggle) return;

    toggle.classList.toggle(
        "active",
        enabled
    );

}


function updateMemoryUI() {

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
   MEMORY BUTTON
========================================================= */

memoryBtn?.addEventListener(
    "click",
    () => {

        memoryEnabled =
            !memoryEnabled;

        saveMemory();

        updateMemoryUI();

    }
);


/* =========================================================
   CLEAR HISTORY
========================================================= */

function clearAllHistory() {

    chatHistory = [];

    localStorage.removeItem(
        "swift_history"
    );


    if (historyList)
        historyList.innerHTML = "";


    if (messages)
        messages.innerHTML = "";


    openSettingsHome();

}


/* =========================================================
   NEW CHAT
========================================================= */

function createNewChat() {

    if (messages)
        messages.innerHTML = "";


    chatHistory = [];

    clearAttachment();


    if (userInput) {

        userInput.value = "";

        userInput.style.height =
            "auto";

    }


    sidebar?.classList.remove(
        "open"
    );

}


newChat?.addEventListener(
    "click",
    createNewChat
);


newTopChat?.addEventListener(
    "click",
    createNewChat
);


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
   FILE → BASE64
========================================================= */

function fileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => resolve(
                    reader.result
                );


            reader.onerror =
                reject;


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   AI RESPONSE TEXT
========================================================= */

function extractAIText(data) {

    if (!data)
        return "";


    if (typeof data === "string")
        return data;


    if (data.reply)
        return data.reply;


    if (data.response)
        return data.response;


    if (data.message)
        return data.message;


    if (
        data.choices &&
        data.choices[0]
    ) {

        const message =
            data.choices[0].message;


        if (
            message &&
            typeof message.content === "string"
        ) {

            return message.content;

        }

    }


    if (
        data.candidates &&
        data.candidates[0]
    ) {

        const candidate =
            data.candidates[0];


        const parts =
            candidate.content?.parts;


        if (Array.isArray(parts)) {

            return parts
                .map(
                    part =>
                        part.text || ""
                )
                .join("");

        }

    }


    return "";
}


/* =========================================================
   SEND MESSAGE
========================================================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);


async function sendMessage() {

    if (sending)
        return;


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


    try {

        /* IMAGE */

        if (selectedImage) {

            attachment = {

                type: "image",

                url:
                    URL.createObjectURL(
                        selectedImage
                    )

            };

        }


        /* VIDEO */

        else if (selectedVideo) {

            attachment = {

                type: "video",

                url:
                    URL.createObjectURL(
                        selectedVideo
                    )

            };

        }


        /* FILE */

        else if (selectedFile) {

            attachment = {

                type: "file",

                name:
                    selectedFile.name

            };

        }


        addMessage(
            text,
            "user",
            attachment
        );


        /* HISTORY */

        chatHistory.push({

            role: "user",
            content: text

        });


        if (userInput) {

            userInput.value = "";

            userInput.style.height =
                "auto";

        }


        clearAttachment();


        const aiBox =
            addMessage(
                "Thinking...",
                "ai"
            );


        let imageData = null;
        let videoData = null;
        let fileData = null;


        if (attachment?.type === "image") {

            imageData =
                await fileToBase64(
                    selectedImage
                );

        }


        if (selectedVideo) {

            videoData =
                await fileToBase64(
                    selectedVideo
                );

        }


        /* NOTE:
           selectedFile is cleared above,
           so use attachment-independent
           file handling only when needed.
        */


        const payload = {

            message:
                text || "Please analyze the attached media.",

            image:
                imageData,

            video:
                videoData,

            file:
                fileData,

            thinkHarder:
                thinkHarder,

            memory:
                memoryEnabled

        };


        const response =
            await fetch(
                API_ENDPOINT,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data =
            await response.json();


        const answer =
            extractAIText(data);


        if (!answer) {

            throw new Error(
                "No response from AI."
            );

        }


        if (aiBox) {

            aiBox.innerHTML = "";

            const textBox =
                document.createElement(
                    "div"
                );

            textBox.className =
                "message-text";

            textBox.textContent =
                answer;

            aiBox.appendChild(
                textBox
            );

        }


        chatHistory.push({

            role: "assistant",

            content:
                answer

        });


        saveHistory();


    } catch (error) {

        console.error(
            "AI error:",
            error
        );


        const aiMessages =
            messages?.querySelectorAll(
                ".ai-message"
            );


        const lastAI =
            aiMessages?.[
                aiMessages.length - 1
            ];


        if (lastAI) {

            lastAI.innerHTML = "";

            const errorBox =
                document.createElement(
                    "div"
                );

            errorBox.className =
                "message-text";

            errorBox.textContent =
                "⚠️ Connection error. Please try again.";

            lastAI.appendChild(
                errorBox
            );

        }

    }


    finally {

        sending = false;

        if (sendBtn)
            sendBtn.disabled = false;

        scrollChat();

    }

}


/* =========================================================
   HISTORY
========================================================= */

function saveHistory() {

    if (
        localStorage.getItem(
            "swift_save_history"
        ) === "off"
    ) {

        return;

    }


    localStorage.setItem(
        "swift_history",
        JSON.stringify(
            chatHistory
        )
    );

}


function loadHistory() {

    try {

        const saved =
            localStorage.getItem(
                "swift_history"
            );


        if (!saved)
            return;


        const parsed =
            JSON.parse(saved);


        if (Array.isArray(parsed)) {

            chatHistory =
                parsed;

        }

    } catch (error) {

        console.warn(
            "Could not load history.",
            error
        );

    }

}


/* =========================================================
   PROFILE MODAL
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
   CLOSE MODALS ON BACKDROP
========================================================= */

[
    settingsModal,
    pluginModal,
    profileModal,
    cameraModal
].forEach(
    modal => {

        modal?.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    if (
                        modal === cameraModal
                    ) {

                        closeCamera();

                    }

                    else {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }

            }
        );

    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape")
            return;


        closePlus();

        settingsModal?.classList.remove(
            "show"
        );

        pluginModal?.classList.remove(
            "show"
        );

        profileModal?.classList.remove(
            "show"
        );

        if (
            cameraModal?.classList.contains(
                "show"
            )
        ) {

            closeCamera();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

loadStoredSettings();

updateThemeButton();

scrollChat();
