"use strict";

/* =========================================================
   ⚡ SwiftCortex AI Ultra
   COMPLETE MODERN SCRIPT.JS
   =========================================================

   Core:
   • Text chat
   • Enter to send
   • Shift+Enter newline
   • Plus menu
   • Voice input
   • Bengali / English voice
   • Camera
   • Front / Back camera
   • Photo capture
   • Video recording
   • Photos
   • Files
   • Image / Video preview
   • Remove attachment
   • Plugins
   • Think Harder
   • Profile
   • Settings
   • Memory
   • Dark / Light
   • Customer Support
   • New Chat
   • Recent Chat / History
   • LocalStorage
   • API connection
   ========================================================= */


/* =========================================================
   APP START
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HELPERS
       ===================================================== */

    const $ = (id) => document.getElementById(id);

    const safeOn = (element, event, handler) => {
        if (!element) return;
        element.addEventListener(event, handler);
    };

    const escapeHTML = (value) => {
        const div = document.createElement("div");
        div.textContent = value ?? "";
        return div.innerHTML;
    };

    const sleep = (ms) =>
        new Promise(resolve => setTimeout(resolve, ms));


    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

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
    const historyList = $("historyList");

    const themeBtn = $("themeBtn");

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


    /* =====================================================
       CAMERA ELEMENTS
       ===================================================== */

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


    /* =====================================================
       STORAGE KEYS
       ===================================================== */

    const STORAGE = {
        theme: "swiftcortex-theme",
        memory: "swiftcortex-memory",
        history: "swiftcortex-history",
        language: "swiftcortex-voice-language",
        think: "swiftcortex-think-harder"
    };


    /* =====================================================
       APP STATE
       ===================================================== */

    let selectedImage = null;
    let selectedVideo = null;

    let selectedFile = null;

    let cameraStream = null;
    let cameraFacing = "user";

    let currentCameraMode = "photo";

    let mediaRecorder = null;
    let recordedChunks = [];

    let recordingTimer = null;
    let recordingSeconds = 0;

    let isSending = false;

    let thinkHarderEnabled =
        localStorage.getItem(STORAGE.think) === "true";

    let memoryEnabled =
        localStorage.getItem(STORAGE.memory) !== "false";

    let currentVoiceLanguage =
        localStorage.getItem(STORAGE.language) || "bn-BD";

    let recognition = null;
    let isListening = false;

    let currentConversation = [];

    let currentChatId =
        "chat-" + Date.now();


    /* =====================================================
       GENERAL UTILITIES
       ===================================================== */

    function scrollMessages() {

        if (!messages) return;

        requestAnimationFrame(() => {
            messages.scrollTop = messages.scrollHeight;
        });
    }


    function closePlusMenu() {

        if (!plusMenu) return;

        plusMenu.classList.remove("show");
        plusMenu.classList.remove("active");
    }


    function openPlusMenu() {

        if (!plusMenu) return;

        plusMenu.classList.add("show");
        plusMenu.classList.add("active");
    }


    function setButtonDisabled(button, disabled) {

        if (!button) return;

        button.disabled = disabled;

        button.setAttribute(
            "aria-disabled",
            String(disabled)
        );
    }


    /* =====================================================
       PLUS MENU
       ===================================================== */

    safeOn(plusBtn, "click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        if (!plusMenu) return;

        const isOpen =
            plusMenu.classList.contains("show") ||
            plusMenu.classList.contains("active");

        if (isOpen) {
            closePlusMenu();
        } else {
            openPlusMenu();
        }
    });


    document.addEventListener("click", (event) => {

        if (!plusMenu || !plusBtn) return;

        if (
            !plusMenu.contains(event.target) &&
            !plusBtn.contains(event.target)
        ) {
            closePlusMenu();
        }
    });


    /* =====================================================
       MESSAGE UI
       ===================================================== */

    function addMessage(
        text = "",
        sender = "user",
        attachment = null,
        saveToHistory = true
    ) {

        if (!messages) return null;

        const message = document.createElement("div");

        message.className =
            sender === "user"
                ? "message user-message"
                : "message ai-message";

        const content =
            document.createElement("div");

        content.className = "message-content";


        /* TEXT */

        if (text) {

            const textDiv =
                document.createElement("div");

            textDiv.className = "message-text";

            textDiv.innerHTML =
                escapeHTML(text)
                    .replace(/\n/g, "<br>");

            content.appendChild(textDiv);
        }


        /* ATTACHMENT */

        if (attachment) {

            const attachmentBox =
                document.createElement("div");

            attachmentBox.className =
                "message-attachment";


            if (
                attachment.type === "image" &&
                attachment.url
            ) {

                const img =
                    document.createElement("img");

                img.src = attachment.url;

                img.alt =
                    "SwiftCortex attachment";

                img.className =
                    "chat-image";

                attachmentBox.appendChild(img);
            }


            if (
                attachment.type === "video" &&
                attachment.url
            ) {

                const video =
                    document.createElement("video");

                video.src = attachment.url;

                video.controls = true;
                video.playsInline = true;

                video.className =
                    "chat-video";

                attachmentBox.appendChild(video);
            }


            if (
                attachment.type === "file" &&
                attachment.name
            ) {

                const fileBox =
                    document.createElement("div");

                fileBox.className =
                    "chat-file";

                fileBox.textContent =
                    `📄 ${attachment.name}`;

                attachmentBox.appendChild(fileBox);
            }


            content.appendChild(attachmentBox);
        }


        message.appendChild(content);
        messages.appendChild(message);

        scrollMessages();


        /* SAVE */

        if (saveToHistory) {

            currentConversation.push({
                role:
                    sender === "user"
                        ? "user"
                        : "assistant",

                text: text || "",

                attachment:
                    attachment
                        ? {
                            type: attachment.type,
                            name: attachment.name || ""
                        }
                        : null,

                timestamp:
                    Date.now()
            });
        }

        return message;
    }


    /* =====================================================
       TYPING / LOADING MESSAGE
       ===================================================== */

    function createLoadingMessage() {

        if (!messages) return null;

        const message =
            document.createElement("div");

        message.className =
            "message ai-message loading-message";

        const content =
            document.createElement("div");

        content.className =
            "message-content";

        const text =
            document.createElement("div");

        text.className =
            "message-text";

        text.innerHTML =
            "SwiftCortex AI is thinking <span class=\"typing-dots\">•••</span>";

        content.appendChild(text);

        message.appendChild(content);

        messages.appendChild(message);

        scrollMessages();

        return message;
    }


    function removeLoadingMessage(message) {

        if (message && message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }


    /* =====================================================
       ATTACHMENT PREVIEW
       ===================================================== */

    function clearAttachment() {

        selectedImage = null;
        selectedVideo = null;
        selectedFile = null;

        if (imagePreview) {

            imagePreview.innerHTML = "";

            imagePreview.classList.remove("show");
            imagePreview.classList.remove("active");
        }

        if (imageInput) {
            imageInput.value = "";
        }

        if (fileInput) {
            fileInput.value = "";
        }
    }


    function showAttachment(file, type) {

        if (!file || !imagePreview) return;

        clearAttachment();

        const url =
            URL.createObjectURL(file);

        imagePreview.classList.add("show");
        imagePreview.classList.add("active");

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "attachment-preview-item";


        const removeBtn =
            document.createElement("button");

        removeBtn.type = "button";

        removeBtn.className =
            "remove-attachment";

        removeBtn.innerHTML = "×";

        removeBtn.title =
            "Remove attachment";


        if (type === "image") {

            selectedImage = file;

            const img =
                document.createElement("img");

            img.src = url;

            img.alt =
                "Image preview";

            img.className =
                "preview-image";

            wrapper.appendChild(img);
        }


        else if (type === "video") {

            selectedVideo = file;

            const video =
                document.createElement("video");

            video.src = url;

            video.controls = true;
            video.muted = true;
            video.playsInline = true;

            video.className =
                "preview-video";

            wrapper.appendChild(video);
        }


        else {

            selectedFile = file;

            const fileInfo =
                document.createElement("div");

            fileInfo.className =
                "file-preview";

            fileInfo.innerHTML =
                `
                    <span class="file-icon">📄</span>
                    <span class="file-name">
                        ${escapeHTML(file.name)}
                    </span>
                `;

            wrapper.appendChild(fileInfo);
        }


        removeBtn.addEventListener(
            "click",
            clearAttachment
        );

        wrapper.appendChild(removeBtn);

        imagePreview.appendChild(wrapper);
    }


    /* =====================================================
       PHOTO BUTTON
       ===================================================== */

    safeOn(photoBtn, "click", () => {

        closePlusMenu();

        if (imageInput) {
            imageInput.click();
        }
    });


    safeOn(imageInput, "change", (event) => {

        const file =
            event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            alert(
                "Please select an image."
            );

            return;
        }

        showAttachment(
            file,
            "image"
        );
    });


    /* =====================================================
       FILE BUTTON
       ===================================================== */

    safeOn(fileBtn, "click", () => {

        closePlusMenu();

        if (fileInput) {
            fileInput.click();
        }
    });


    safeOn(fileInput, "change", (event) => {

        const file =
            event.target.files?.[0];

        if (!file) return;


        if (file.type.startsWith("image/")) {

            showAttachment(
                file,
                "image"
            );

            return;
        }


        if (file.type.startsWith("video/")) {

            showAttachment(
                file,
                "video"
            );

            return;
        }


        showAttachment(
            file,
            "file"
        );
    });


    /* =====================================================
       CAMERA
       ===================================================== */

    safeOn(cameraBtn, "click", () => {

        closePlusMenu();

        openCamera();
    });


    async function openCamera() {

        if (!cameraModal) {

            alert(
                "Camera modal was not found in index.html."
            );

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

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                throw new Error(
                    "Camera is not supported by this browser."
                );
            }


            cameraStream =
                await navigator.mediaDevices
                    .getUserMedia({
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

                cameraVideo.srcObject =
                    cameraStream;

                cameraVideo.muted = true;
                cameraVideo.playsInline = true;

                try {
                    await cameraVideo.play();
                } catch (error) {
                    console.warn(
                        "Camera play:",
                        error
                    );
                }
            }

            if (cameraError) {
                cameraError.style.display =
                    "none";
            }

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );

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

        cameraError.style.display =
            "block";


        if (cameraErrorText) {

            cameraErrorText.textContent =
                error?.message ||
                "Camera permission was denied or unavailable.";
        }
    }


    function stopCamera() {

        if (!cameraStream) return;

        cameraStream
            .getTracks()
            .forEach(track => {
                track.stop();
            });

        cameraStream = null;
    }


    function closeCamera() {

        if (
            mediaRecorder &&
            mediaRecorder.state !== "inactive"
        ) {

            try {
                mediaRecorder.stop();
            } catch (error) {
                console.warn(error);
            }
        }


        stopCamera();


        if (cameraVideo) {
            cameraVideo.srcObject = null;
        }


        if (cameraModal) {

            cameraModal.classList.remove("show");
            cameraModal.classList.remove("active");
        }
    }


    safeOn(
        cameraClose,
        "click",
        closeCamera
    );


    /* =====================================================
       PHOTO MODE
       ===================================================== */

    safeOn(photoMode, "click", () => {

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


    /* =====================================================
       VIDEO MODE
       ===================================================== */

    safeOn(videoMode, "click", () => {

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


    /* =====================================================
       CAPTURE PHOTO
       ===================================================== */

    safeOn(takePhoto, "click", () => {

        if (
            !cameraVideo ||
            !cameraVideo.videoWidth ||
            !cameraVideo.videoHeight
        ) {

            alert(
                "Camera is not ready yet."
            );

            return;
        }


        const canvas =
            document.createElement("canvas");

        canvas.width =
            cameraVideo.videoWidth;

        canvas.height =
            cameraVideo.videoHeight;


        const ctx =
            canvas.getContext("2d");

        if (!ctx) return;


        if (cameraFacing === "user") {

            ctx.translate(
                canvas.width,
                0
            );

            ctx.scale(
                -1,
                1
            );
        }


        ctx.drawImage(
            cameraVideo,
            0,
            0,
            canvas.width,
            canvas.height
        );


        canvas.toBlob(
            (blob) => {

                if (!blob) return;

                const file =
                    new File(
                        [blob],
                        `swiftcortex-photo-${Date.now()}.jpg`,
                        {
                            type: "image/jpeg"
                        }
                    );

                showAttachment(
                    file,
                    "image"
                );

                closeCamera();
            },

            "image/jpeg",
            0.92
        );
    });


    /* =====================================================
       SWITCH CAMERA
       ===================================================== */

    safeOn(
        switchCamera,
        "click",
        async () => {

            cameraFacing =
                cameraFacing === "user"
                    ? "environment"
                    : "user";

            await startCamera();
        }
    );


    /* =====================================================
       VIDEO RECORDING
       ===================================================== */

    safeOn(
        startRecord,
        "click",
        startVideoRecording
    );


    function startVideoRecording() {

        if (!cameraStream) {

            alert(
                "Camera is not active."
            );

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
            MediaRecorder.isTypeSupported(
                "video/webm;codecs=vp9,opus"
            )
        ) {

            options.mimeType =
                "video/webm;codecs=vp9,opus";
        }

        else if (
            MediaRecorder.isTypeSupported &&
            MediaRecorder.isTypeSupported(
                "video/webm"
            )
        ) {

            options.mimeType =
                "video/webm";
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
                    new MediaRecorder(
                        cameraStream
                    );

            } catch (secondError) {

                alert(
                    "Unable to start video recording."
                );

                return;
            }
        }


        mediaRecorder.ondataavailable =
            (event) => {

                if (
                    event.data &&
                    event.data.size > 0
                ) {

                    recordedChunks.push(
                        event.data
                    );
                }
            };


        mediaRecorder.onstop =
            finishVideoRecording;


        mediaRecorder.start(250);


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


        if (startRecord) {
            startRecord.style.display =
                "none";
        }

        if (stopRecord) {
            stopRecord.style.display =
                "";
        }
    }


    safeOn(
        stopRecord,
        "click",
        stopRecording
    );


    function stopRecording() {

        if (
            mediaRecorder &&
            mediaRecorder.state !== "inactive"
        ) {

            mediaRecorder.stop();
        }


        if (recordingTimer) {

            clearInterval(
                recordingTimer
            );

            recordingTimer = null;
        }


        if (stopRecord) {

            stopRecord.style.display =
                "none";
        }
    }


    function finishVideoRecording() {

        if (!recordedChunks.length) {
            return;
        }


        const mimeType =
            mediaRecorder?.mimeType ||
            "video/webm";


        const blob =
            new Blob(
                recordedChunks,
                {
                    type: mimeType
                }
            );


        const extension =
            mimeType.includes("mp4")
                ? "mp4"
                : "webm";


        const file =
            new File(
                [blob],
                `swiftcortex-video-${Date.now()}.${extension}`,
                {
                    type: mimeType
                }
            );


        showAttachment(
            file,
            "video"
        );


        recordedChunks = [];

        closeCamera();
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
            `${minutes}:${seconds}`;
    }


    /* =====================================================
       BASE64
       ===================================================== */

    function fileToBase64(file) {

        return new Promise(
            (resolve, reject) => {

                if (!file) {

                    resolve(null);

                    return;
                }


                const reader =
                    new FileReader();


                reader.onload = () => {

                    const result =
                        reader.result;


                    if (
                        typeof result !==
                        "string"
                    ) {

                        resolve(null);

                        return;
                    }


                    const comma =
                        result.indexOf(",");


                    resolve(
                        comma >= 0
                            ? result.slice(
                                comma + 1
                            )
                            : result
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


    /* =====================================================
       VIDEO SEEK
       ===================================================== */

    function seekVideo(video, time) {

        return new Promise(
            (resolve) => {

                const target =
                    Math.max(
                        0,
                        Math.min(
                            time,
                            video.duration || time
                        )
                    );


                const done = () => {

                    video.removeEventListener(
                        "seeked",
                        done
                    );

                    resolve();
                };


                video.addEventListener(
                    "seeked",
                    done
                );


                video.currentTime =
                    target;
            }
        );
    }


    /* =====================================================
       EXTRACT VIDEO FRAMES
       ===================================================== */

    async function extractVideoFrames(file) {

        if (!file) return [];


        const url =
            URL.createObjectURL(file);


        try {

            const video =
                document.createElement(
                    "video"
                );

            video.src = url;

            video.muted = true;
            video.playsInline = true;
            video.preload = "metadata";


            await new Promise(
                (resolve, reject) => {

                    video.onloadedmetadata =
                        resolve;

                    video.onerror =
                        reject;
                }
            );


            const duration =
                Number.isFinite(
                    video.duration
                )
                    ? video.duration
                    : 0;


            if (!duration) {
                return [];
            }


            const frameCount =
                Math.min(
                    6,
                    Math.max(
                        1,
                        Math.ceil(
                            duration
                        )
                    )
                );


            const frames = [];


            for (
                let i = 0;
                i < frameCount;
                i++
            ) {

                const time =
                    frameCount === 1
                        ? 0
                        : (
                            duration * i
                        ) /
                        (
                            frameCount - 1
                        );


                await seekVideo(
                    video,
                    time
                );


                const canvas =
                    document.createElement(
                        "canvas"
                    );


                const maxWidth = 768;


                const scale =
                    video.videoWidth >
                    maxWidth
                        ? maxWidth /
                          video.videoWidth
                        : 1;


                canvas.width =
                    Math.max(
                        1,
                        Math.round(
                            video.videoWidth *
                            scale
                        )
                    );


                canvas.height =
                    Math.max(
                        1,
                        Math.round(
                            video.videoHeight *
                            scale
                        )
                    );


                const ctx =
                    canvas.getContext(
                        "2d"
                    );


                if (!ctx) continue;


                ctx.drawImage(
                    video,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                const dataUrl =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.78
                    );


                const comma =
                    dataUrl.indexOf(",");


                frames.push(
                    comma >= 0
                        ? dataUrl.slice(
                            comma + 1
                        )
                        : dataUrl
                );
            }


            return frames;

        } catch (error) {

            console.error(
                "Video frame error:",
                error
            );

            return [];

        } finally {

            URL.revokeObjectURL(
                url
            );
        }
    }


    /* =====================================================
       THINK HARDER
       ===================================================== */

    function updateThinkButton() {

        if (!thinkBtn) return;


        thinkBtn.classList.toggle(
            "active",
            thinkHarderEnabled
        );


        thinkBtn.setAttribute(
            "aria-pressed",
            String(
                thinkHarderEnabled
            )
        );


        thinkBtn.title =
            thinkHarderEnabled
                ? "Think Harder: ON"
                : "Think Harder: OFF";
    }


    safeOn(
        thinkBtn,
        "click",
        () => {

            thinkHarderEnabled =
                !thinkHarderEnabled;


            localStorage.setItem(
                STORAGE.think,
                String(
                    thinkHarderEnabled
                )
            );


            updateThinkButton();

            closePlusMenu();
        }
    );


    updateThinkButton();


    /* =====================================================
       PLUGINS
       ===================================================== */

    function closePluginsPanel() {

        const panel =
            $("swiftPluginsPanel");

        if (!panel) return;

        panel.classList.remove(
            "active"
        );

        setTimeout(() => {

            if (
                panel &&
                panel.parentNode
            ) {

                panel.remove();
            }

        }, 200);
    }


    function openPluginsPanel() {

        closePlusMenu();


        const existing =
            $("swiftPluginsPanel");


        if (existing) {

            existing.classList.add(
                "active"
            );

            return;
        }


        const panel =
            document.createElement(
                "div"
            );


        panel.id =
            "swiftPluginsPanel";


        panel.className =
            "swift-plugins-panel active";


        panel.innerHTML =
            `
            <div class="swift-plugins-header">
                <strong>🧩 Plugins</strong>

                <button
                    type="button"
                    id="swiftPluginClose"
                    aria-label="Close plugins"
                >
                    ×
                </button>
            </div>

            <div class="swift-plugin-item">
                <span>🌐 Web Search</span>
                <span class="plugin-status">Ready</span>
            </div>

            <div class="swift-plugin-item">
                <span>🖼️ Image Analysis</span>
                <span class="plugin-status">Ready</span>
            </div>

            <div class="swift-plugin-item">
                <span>📄 File Analysis</span>
                <span class="plugin-status">Ready</span>
            </div>

            <div class="swift-plugin-item">
                <span>🎥 Video Analysis</span>
                <span class="plugin-status">Ready</span>
            </div>

            <div class="swift-plugin-item">
                <span>🧠 Think Harder</span>
                <span class="plugin-status">
                    ${thinkHarderEnabled ? "ON" : "OFF"}
                </span>
            </div>
            `;


        document.body.appendChild(
            panel
        );


        safeOn(
            $("swiftPluginClose"),
            "click",
            closePluginsPanel
        );
    }


    safeOn(
        pluginBtn,
        "click",
        openPluginsPanel
    );


    /* =====================================================
       THEME
       ===================================================== */

    function applyTheme(theme) {

        const dark =
            theme === "dark";


        document.documentElement
            .classList.toggle(
                "dark-mode",
                dark
            );


        document.body
            .classList.toggle(
                "dark-mode",
                dark
            );


        document.documentElement
            .setAttribute(
                "data-theme",
                dark
                    ? "dark"
                    : "light"
            );


        if (themeBtn) {

            themeBtn.setAttribute(
                "aria-pressed",
                String(dark)
            );


            themeBtn.title =
                dark
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode";


            const icon =
                themeBtn.querySelector(
                    ".theme-icon"
                );


            if (icon) {

                icon.textContent =
                    dark
                        ? "☀️"
                        : "🌙";
            }
        }


        localStorage.setItem(
            STORAGE.theme,
            theme
        );
    }


    function toggleTheme() {

        const dark =
            document.documentElement
                .classList.contains(
                    "dark-mode"
                );


        applyTheme(
            dark
                ? "light"
                : "dark"
        );
    }


    safeOn(
        themeBtn,
        "click",
        toggleTheme
    );


    applyTheme(
        localStorage.getItem(
            STORAGE.theme
        ) === "dark"
            ? "dark"
            : "light"
    );


    /* =====================================================
       MEMORY
       ===================================================== */

    function updateMemoryUI() {

        if (memoryBtn) {

            memoryBtn.classList.toggle(
                "active",
                memoryEnabled
            );


            memoryBtn.setAttribute(
                "aria-pressed",
                String(memoryEnabled)
            );


            memoryBtn.title =
                memoryEnabled
                    ? "Memory: ON"
                    : "Memory: OFF";
        }


        if (memoryToggle) {

            if (
                memoryToggle.type ===
                "checkbox"
            ) {

                memoryToggle.checked =
                    memoryEnabled;
            }


            memoryToggle.setAttribute(
                "aria-checked",
                String(memoryEnabled)
            );
        }
    }


    function toggleMemory() {

        memoryEnabled =
            !memoryEnabled;


        localStorage.setItem(
            STORAGE.memory,
            String(
                memoryEnabled
            )
        );


        updateMemoryUI();
    }


    safeOn(
        memoryBtn,
        "click",
        toggleMemory
    );


    safeOn(
        memoryToggle,
        "change",
        (event) => {

            memoryEnabled =
                Boolean(
                    event.target.checked
                );


            localStorage.setItem(
                STORAGE.memory,
                String(
                    memoryEnabled
                )
            );


            updateMemoryUI();
        }
    );


    updateMemoryUI();


    /* =====================================================
       VOICE INPUT
       ===================================================== */

    function getSpeechRecognition() {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!SpeechRecognition) {
            return null;
        }


        return new SpeechRecognition();
    }


    function updateMicrophoneUI() {

        if (!microphoneBtn) return;


        microphoneBtn.classList.toggle(
            "active",
            isListening
        );


        microphoneBtn.setAttribute(
            "aria-pressed",
            String(isListening)
        );


        microphoneBtn.title =
            isListening
                ? "Stop voice input"
                : `Voice input: ${currentVoiceLanguage}`;
    }


    function startVoiceInput() {

        if (isListening) {

            stopVoiceInput();

            return;
        }


        recognition =
            getSpeechRecognition();


        if (!recognition) {

            alert(
                "Voice input is not supported in this browser."
            );

            return;
        }


        recognition.lang =
            currentVoiceLanguage;


        recognition.continuous = false;

        recognition.interimResults = true;

        recognition.maxAlternatives = 1;


        recognition.onstart = () => {

            isListening = true;

            updateMicrophoneUI();
        };


        recognition.onresult =
            (event) => {

                let finalText = "";
                let interimText = "";


                for (
                    let i =
                        event.resultIndex;
                    i <
                        event.results.length;
                    i++
                ) {

                    const transcript =
                        event.results[i][0]
                            .transcript;


                    if (
                        event.results[i]
                            .isFinal
                    ) {

                        finalText +=
                            transcript;

                    } else {

                        interimText +=
                            transcript;
                    }
                }


                if (userInput) {

                    const existing =
                        userInput.value
                            .trim();


                    if (finalText) {

                        userInput.value =
                            existing
                                ? `${existing} ${finalText}`
                                : finalText;

                    } else if (interimText) {

                        userInput.placeholder =
                            interimText;
                    }


                    autoResizeInput();
                }
            };


        recognition.onerror =
            (event) => {

                console.warn(
                    "Speech recognition:",
                    event.error
                );


                isListening = false;

                updateMicrophoneUI();


                if (
                    event.error ===
                    "not-allowed"
                ) {

                    alert(
                        "Please allow microphone permission."
                    );
                }
            };


        recognition.onend = () => {

            isListening = false;

            if (userInput) {

                userInput.placeholder =
                    "Message SwiftCortex AI...";
            }

            updateMicrophoneUI();
        };


        try {

            recognition.start();

        } catch (error) {

            console.warn(
                "Recognition start:",
                error
            );

            isListening = false;

            updateMicrophoneUI();
        }
    }


    function stopVoiceInput() {

        if (!recognition) {

            isListening = false;

            updateMicrophoneUI();

            return;
        }


        try {
            recognition.stop();
        } catch (error) {
            console.warn(error);
        }


        isListening = false;

        updateMicrophoneUI();
    }


    safeOn(
        microphoneBtn,
        "click",
        startVoiceInput
    );


    /* =====================================================
       VOICE LANGUAGE SWITCH
       ===================================================== */

    function toggleVoiceLanguage() {

        currentVoiceLanguage =
            currentVoiceLanguage === "bn-BD"
                ? "en-US"
                : "bn-BD";


        localStorage.setItem(
            STORAGE.language,
            currentVoiceLanguage
        );


        updateMicrophoneUI();


        if (languageBtn) {

            languageBtn.textContent =
                currentVoiceLanguage ===
                    "bn-BD"
                    ? "বাংলা"
                    : "English";
        }
    }


    safeOn(
        languageBtn,
        "click",
        toggleVoiceLanguage
    );


    if (languageBtn) {

        languageBtn.textContent =
            currentVoiceLanguage ===
                "bn-BD"
                ? "বাংলা"
                : "English";
    }


    updateMicrophoneUI();


    /* =====================================================
       INPUT AUTO RESIZE
       ===================================================== */

    function autoResizeInput() {

        if (!userInput) return;


        userInput.style.height =
            "auto";


        userInput.style.height =
            Math.min(
                userInput.scrollHeight,
                180
            ) + "px";
    }


    safeOn(
        userInput,
        "input",
        autoResizeInput
    );


    /* =====================================================
       ENTER TO SEND
       ===================================================== */

    safeOn(
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


    /* =====================================================
       API REQUEST
       ===================================================== */

    async function requestAI(
        messageText,
        imageBase64 = null,
        videoFrames = []
    ) {

        const payload = {

            message:
                messageText || "",

            image:
                imageBase64,

            frames:
                videoFrames,

            thinkHarder:
                thinkHarderEnabled,

            memory:
                memoryEnabled,

            language:
                currentVoiceLanguage,

            history:
                memoryEnabled
                    ? currentConversation
                    : []
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
                        JSON.stringify(
                            payload
                        )
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            data = null;
        }


        if (!response.ok) {

            const errorMessage =
                data?.error ||
                data?.message ||
                `Server error (${response.status})`;


            throw new Error(
                errorMessage
            );
        }


        return data;
    }


    /* =====================================================
       EXTRACT AI TEXT
       ===================================================== */

    function extractAIText(data) {

        if (!data) {

            return "No response received.";
        }


        if (typeof data === "string") {

            return data;
        }


        return (
            data.reply ||
            data.response ||
            data.text ||
            data.message ||
            data.content ||
            data.answer ||
            "I couldn't generate a response."
        );
    }


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    async function sendMessage() {

        if (isSending) return;


        const text =
            userInput?.value.trim() || "";


        const image =
            selectedImage;


        const video =
            selectedVideo;


        const file =
            selectedFile;


        if (
            !text &&
            !image &&
            !video &&
            !file
        ) {

            return;
        }


        isSending = true;


        setButtonDisabled(
            sendBtn,
            true
        );


        /* ---------------------------------------------
           SAVE ATTACHMENT DATA BEFORE CLEARING
           --------------------------------------------- */

        let attachmentForUI = null;


        if (image) {

            attachmentForUI = {

                type: "image",

                url:
                    URL.createObjectURL(
                        image
                    ),

                name:
                    image.name
            };
        }


        else if (video) {

            attachmentForUI = {

                type: "video",

                url:
                    URL.createObjectURL(
                        video
                    ),

                name:
                    video.name
            };
        }


        else if (file) {

            attachmentForUI = {

                type: "file",

                name:
                    file.name
            };
        }


        /* ---------------------------------------------
           ADD USER MESSAGE
           --------------------------------------------- */

        addMessage(
            text,
            "user",
            attachmentForUI
        );


        /* ---------------------------------------------
           CLEAR INPUT
           --------------------------------------------- */

        if (userInput) {

            userInput.value = "";

            userInput.style.height =
                "auto";
        }


        /* ---------------------------------------------
           PREPARE API MEDIA
           --------------------------------------------- */

        let imageBase64 = null;
        let videoFrames = [];


        try {

            if (image) {

                imageBase64 =
                    await fileToBase64(
                        image
                    );
            }


            if (video) {

                videoFrames =
                    await extractVideoFrames(
                        video
                    );
            }


            clearAttachment();


            /* -----------------------------------------
               LOADING
               ----------------------------------------- */

            const loading =
                createLoadingMessage();


            /* -----------------------------------------
               API
               ----------------------------------------- */

            const data =
                await requestAI(
                    text,
                    imageBase64,
                    videoFrames
                );


            removeLoadingMessage(
                loading
            );


            const reply =
                extractAIText(data);


            addMessage(
                reply,
                "assistant",
                null,
                true
            );


            saveCurrentChat();


        } catch (error) {

            console.error(
                "SwiftCortex API error:",
                error
            );


            const loading =
                document.querySelector(
                    ".loading-message"
                );


            removeLoadingMessage(
                loading
            );


            let message =
                error?.message ||
                "Unable to connect to SwiftCortex AI.";


            if (
                message.includes(
                    "Failed to fetch"
                )
            ) {

                message =
                    "Connection error. Please check your Vercel API route and internet connection.";
            }


            addMessage(
                `⚠️ ${message}`,
                "assistant",
                null,
                false
            );


        } finally {

            isSending = false;


            setButtonDisabled(
                sendBtn,
                false
            );


            if (userInput) {
                userInput.focus();
            }
        }
    }


    safeOn(
        sendBtn,
        "click",
        sendMessage
    );


    /* =====================================================
       NEW CHAT
       ===================================================== */

    function startNewChat() {

        if (isSending) return;


        saveCurrentChat();


        currentConversation = [];

        currentChatId =
            "chat-" + Date.now();


        if (messages) {

            messages.innerHTML = "";
        }


        clearAttachment();


        if (userInput) {

            userInput.value = "";

            userInput.style.height =
                "auto";

            userInput.focus();
        }


        addMessage(
            "Hello! I'm SwiftCortex AI Ultra. How can I help you today?",
            "assistant",
            null,
            false
        );
    }


    safeOn(
        newChat,
        "click",
        startNewChat
    );


    /* =====================================================
       HISTORY STORAGE
       ===================================================== */

    function getHistory() {

        try {

            const data =
                localStorage.getItem(
                    STORAGE.history
                );


            if (!data) return [];


            const parsed =
                JSON.parse(data);


            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.warn(
                "History read error:",
                error
            );

            return [];
        }
    }


    function saveCurrentChat() {

        if (
            !currentConversation.length
        ) {
            return;
        }


        const history =
            getHistory();


        const firstUserMessage =
            currentConversation.find(
                item =>
                    item.role === "user" &&
                    item.text
            );


        const title =
            firstUserMessage?.text
                ?.slice(0, 50)
                ||
                "New Chat";


        const chat = {

            id:
                currentChatId,

            title:
                title,

            messages:
                currentConversation,

            updatedAt:
                Date.now()
        };


        const existingIndex =
            history.findIndex(
                item =>
                    item.id ===
                    currentChatId
            );


        if (existingIndex >= 0) {

            history[
                existingIndex
            ] = chat;

        } else {

            history.unshift(chat);
        }


        const limited =
            history.slice(0, 50);


        try {

            localStorage.setItem(
                STORAGE.history,
                JSON.stringify(
                    limited
                )
            );

        } catch (error) {

            console.warn(
                "History save error:",
                error
            );
        }


        renderHistory();
    }


    /* =====================================================
       RENDER HISTORY
       ===================================================== */

    function renderHistory() {

        if (!historyList) return;


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
                "No recent chats yet.";

            historyList.appendChild(
                empty
            );

            return;
        }


        history.forEach(
            (chat) => {

                const item =
                    document.createElement(
                        "button"
                    );


                item.type = "button";

                item.className =
                    "history-item";


                if (
                    chat.id ===
                    currentChatId
                ) {

                    item.classList.add(
                        "active"
                    );
                }


                item.innerHTML =
                    `
                    <span class="history-icon">
                        🕘
                    </span>

                    <span class="history-title">
                        ${escapeHTML(
                            chat.title ||
                            "Recent Chat"
                        )}
                    </span>
                    `;


                item.addEventListener(
                    "click",
                    () => {

                        loadChat(
                            chat.id
                        );
                    }
                );


                historyList.appendChild(
                    item
                );
            }
        );
    }


    /* =====================================================
       LOAD HISTORY CHAT
       ===================================================== */

    function loadChat(chatId) {

        const history =
            getHistory();


        const chat =
            history.find(
                item =>
                    item.id === chatId
            );


        if (!chat) return;


        currentChatId =
            chat.id;


        currentConversation =
            Array.isArray(
                chat.messages
            )
                ? chat.messages
                : [];


        if (messages) {

            messages.innerHTML = "";
        }


        currentConversation.forEach(
            (item) => {

                addMessage(
                    item.text || "",
                    item.role === "user"
                        ? "user"
                        : "assistant",
                    null,
                    false
                );
            }
        );


        renderHistory();


        if (userInput) {
            userInput.focus();
        }
    }


    renderHistory();


    /* =====================================================
       PROFILE
       ===================================================== */

    function openProfile() {

        const existing =
            $("swiftProfilePanel");


        if (existing) {

            existing.classList.add(
                "active"
            );

            return;
        }


        const panel =
            document.createElement(
                "div"
            );


        panel.id =
            "swiftProfilePanel";


        panel.className =
            "swift-modal-panel active";


        panel.innerHTML =
            `
            <div class="swift-modal-header">
                <strong>👤 Profile</strong>

                <button
                    type="button"
                    id="swiftProfileClose"
                >
                    ×
                </button>
            </div>

            <div class="swift-profile-body">
                <div class="swift-profile-avatar">
                    ⚡
                </div>

                <h3>SwiftCortex AI Ultra</h3>

                <p>
                    AI Assistant
                </p>
            </div>
            `;


        document.body.appendChild(
            panel
        );


        safeOn(
            $("swiftProfileClose"),
            "click",
            () => panel.remove()
        );
    }


    safeOn(
        profileBtn,
        "click",
        () => {

            closePlusMenu();

            openProfile();
        }
    );


    /* =====================================================
       SETTINGS
       ===================================================== */

    function openSettings() {

        const existing =
            $("swiftSettingsPanel");


        if (existing) {

            existing.classList.add(
                "active"
            );

            return;
        }


        const panel =
            document.createElement(
                "div"
            );


        panel.id =
            "swiftSettingsPanel";


        panel.className =
            "swift-modal-panel active";


        panel.innerHTML =
            `
            <div class="swift-modal-header">
                <strong>⚙️ Settings</strong>

                <button
                    type="button"
                    id="swiftSettingsClose"
                >
                    ×
                </button>
            </div>

            <div class="swift-settings-body">

                <button
                    type="button"
                    class="swift-setting-row"
                    id="settingsThemeBtn"
                >
                    <span>🌙 Dark / Light Mode</span>
                    <span>›</span>
                </button>

                <button
                    type="button"
                    class="swift-setting-row"
                    id="settingsMemoryBtn"
                >
                    <span>🧠 Memory</span>
                    <span>
                        ${memoryEnabled ? "ON" : "OFF"}
                    </span>
                </button>

                <button
                    type="button"
                    class="swift-setting-row"
                    id="settingsVoiceBtn"
                >
                    <span>🎙️ Voice Language</span>
                    <span>
                        ${
                            currentVoiceLanguage ===
                            "bn-BD"
                                ? "বাংলা"
                                : "English"
                        }
                    </span>
                </button>

            </div>
            `;


        document.body.appendChild(
            panel
        );


        safeOn(
            $("swiftSettingsClose"),
            "click",
            () => panel.remove()
        );


        safeOn(
            $("settingsThemeBtn"),
            "click",
            () => {

                toggleTheme();

                panel.remove();
            }
        );


        safeOn(
            $("settingsMemoryBtn"),
            "click",
            () => {

                toggleMemory();

                panel.remove();
            }
        );


        safeOn(
            $("settingsVoiceBtn"),
            "click",
            () => {

                toggleVoiceLanguage();

                panel.remove();
            }
        );
    }


    safeOn(
        settingsBtn,
        "click",
        () => {

            closePlusMenu();

            openSettings();
        }
    );


    /* =====================================================
       CUSTOMER SUPPORT
       ===================================================== */

    function openSupport() {

        const supportEmail =
            "swiftcortexaisupport@gmail.com";


        const panel =
            document.createElement(
                "div"
            );


        panel.className =
            "swift-modal-panel active";


        panel.innerHTML =
            `
            <div class="swift-modal-header">
                <strong>💬 Customer Support</strong>

                <button
                    type="button"
                    id="swiftSupportClose"
                >
                    ×
                </button>
            </div>

            <div class="swift-support-body">

                <p>
                    Need help with SwiftCortex AI Ultra?
                </p>

                <p>
                    Our customer support email:
                </p>

                <strong>
                    ${supportEmail}
                </strong>

                <a
                    href="mailto:${supportEmail}"
                    class="swift-support-button"
                >
                    📧 Contact Support
                </a>

            </div>
            `;


        document.body.appendChild(
            panel
        );


        safeOn(
            $("swiftSupportClose"),
            "click",
            () => panel.remove()
        );
    }


    safeOn(
        supportBtn,
        "click",
        () => {

            closePlusMenu();

            openSupport();
        }
    );


    /* =====================================================
       GLOBAL ESCAPE KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }


            closePlusMenu();


            const panels =
                document.querySelectorAll(
                    ".swift-modal-panel.active, .swift-plugins-panel.active"
                );


            panels.forEach(
                panel => {

                    panel.classList.remove(
                        "active"
                    );

                    setTimeout(
                        () => {

                            if (
                                panel.parentNode
                            ) {

                                panel.remove();
                            }

                        },
                        200
                    );
                }
            );


            if (
                cameraModal &&
                (
                    cameraModal.classList
                        .contains("active") ||
                    cameraModal.classList
                        .contains("show")
                )
            ) {

                closeCamera();
            }
        }
    );


    /* =====================================================
       PAGE VISIBILITY
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden &&
                isListening
            ) {

                stopVoiceInput();
            }
        }
    );


    /* =====================================================
       BEFORE UNLOAD
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            saveCurrentChat();

            stopVoiceInput();

            stopCamera();

            if (recordingTimer) {

                clearInterval(
                    recordingTimer
                );

                recordingTimer = null;
            }
        }
    );


    /* =====================================================
       INITIAL UI
       ===================================================== */

    if (
        messages &&
        messages.children.length === 0
    ) {

        addMessage(
            "Hello! I'm SwiftCortex AI Ultra. How can I help you today?",
            "assistant",
            null,
            false
        );
    }


    autoResizeInput();

    scrollMessages();


    /* =====================================================
       DEBUG INFO
       ===================================================== */

    console.log(
        "%c⚡ SwiftCortex AI Ultra loaded successfully",
        "font-weight:bold;font-size:16px;"
    );

    console.log(
        "Memory:",
        memoryEnabled
            ? "ON"
            : "OFF"
    );

    console.log(
        "Think Harder:",
        thinkHarderEnabled
            ? "ON"
            : "OFF"
    );

    console.log(
        "Voice:",
        currentVoiceLanguage
    );

});
