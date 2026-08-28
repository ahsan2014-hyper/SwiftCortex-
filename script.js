"use strict";

/* =========================================================
   ⚡ SWIFTCORTEX AI ULTRA
   COMPLETE UNIVERSAL script.js
   Mobile + Desktop Edition
   =========================================================

   FEATURES
   ---------------------------------------------------------
   ✅ Text Chat
   ✅ Send Button
   ✅ Enter to Send
   ✅ Shift + Enter = New Line
   ✅ Plus Menu
   ✅ Microphone
   ✅ Bengali Voice Input
   ✅ English Voice Input
   ✅ Camera
   ✅ Front / Back Camera
   ✅ Photo Capture
   ✅ Video Recording
   ✅ Photos
   ✅ Files
   ✅ Image Preview
   ✅ Video Preview
   ✅ Remove Attachment
   ✅ Plugins
   ✅ Think Harder
   ✅ Profile
   ✅ Settings
   ✅ Memory ON/OFF
   ✅ Dark / Light Mode
   ✅ Customer Support
   ✅ New Chat
   ✅ Recent Chat / History
   ✅ Mobile Sidebar
   ✅ Desktop Sidebar
   ✅ Responsive Menu
   ✅ Local Storage
   ========================================================= */


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HELPERS
       ===================================================== */

    const $ = (id) => document.getElementById(id);

    const safe = (element, event, handler) => {
        if (element) {
            element.addEventListener(event, handler);
        }
    };

    const escapeHTML = (text) => {
        const div = document.createElement("div");
        div.textContent = text ?? "";
        return div.innerHTML;
    };


    /* =====================================================
       MAIN ELEMENTS
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

    const profileBtn = $("profileBtn");
    const settingsBtn = $("settingsBtn");
    const memoryBtn = $("memoryBtn");
    const supportBtn = $("supportBtn");

    const memoryToggle = $("memoryToggle");
    const languageBtn = $("languageBtn");

    const microphoneBtn =
        $("microphoneBtn") ||
        $("micBtn") ||
        $("voiceBtn");

    /* =====================================================
       MOBILE / SIDEBAR BUTTONS
       ===================================================== */

    const menuBtn =
        $("menuBtn") ||
        $("hamburgerBtn") ||
        $("sidebarBtn") ||
        $("mobileMenuBtn") ||
        $("threeDotsBtn");

    const sidebar =
        $("sidebar") ||
        $("sideBar") ||
        $("mobileSidebar");

    const sidebarOverlay =
        $("sidebarOverlay") ||
        $("menuOverlay") ||
        $("overlay");


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
       STATE
       ===================================================== */

    let selectedImage = null;
    let selectedVideo = null;

    let cameraStream = null;

    let mediaRecorder = null;
    let recordedChunks = [];

    let cameraFacing = "user";
    let cameraMode = "photo";

    let recordingSeconds = 0;
    let recordingTimer = null;

    let isSending = false;

    let thinkHarderEnabled =
        localStorage.getItem("swiftcortex-think")
        === "true";

    let memoryEnabled =
        localStorage.getItem("swiftcortex-memory")
        !== "false";

    let currentVoiceLanguage =
        localStorage.getItem(
            "swiftcortex-language"
        ) || "bn-BD";

    let recognition = null;
    let isListening = false;

    let currentChatId = null;


    /* =====================================================
       STORAGE KEYS
       ===================================================== */

    const STORAGE = {
        theme: "swiftcortex-theme",
        memory: "swiftcortex-memory",
        think: "swiftcortex-think",
        language: "swiftcortex-language",
        chats: "swiftcortex-chats"
    };


    /* =====================================================
       UTILITY
       ===================================================== */

    function scrollMessages() {

        if (!messages) return;

        requestAnimationFrame(() => {

            messages.scrollTop =
                messages.scrollHeight;

        });
    }


    function isMobile() {

        return window.innerWidth <= 768;

    }


    /* =====================================================
       SIDEBAR / THREE LINE MENU
       ===================================================== */

    function openSidebar() {

        if (!sidebar) return;

        sidebar.classList.add("open");
        sidebar.classList.add("active");
        sidebar.classList.add("show");

        if (sidebarOverlay) {

            sidebarOverlay.classList.add("show");
            sidebarOverlay.classList.add("active");

        }

        document.body.classList.add(
            "sidebar-open"
        );

    }


    function closeSidebar() {

        if (!sidebar) return;

        sidebar.classList.remove("open");
        sidebar.classList.remove("active");
        sidebar.classList.remove("show");

        if (sidebarOverlay) {

            sidebarOverlay.classList.remove("show");
            sidebarOverlay.classList.remove("active");

        }

        document.body.classList.remove(
            "sidebar-open"
        );

    }


    function toggleSidebar() {

        if (!sidebar) return;

        const opened =
            sidebar.classList.contains("open") ||
            sidebar.classList.contains("active") ||
            sidebar.classList.contains("show");

        if (opened) {

            closeSidebar();

        } else {

            openSidebar();

        }

    }


    safe(menuBtn, "click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        toggleSidebar();

    });


    safe(sidebarOverlay, "click", () => {

        closeSidebar();

    });


    /*
       On mobile, clicking sidebar links closes sidebar.
    */

    if (sidebar) {

        sidebar.addEventListener(
            "click",
            (event) => {

                const target =
                    event.target.closest(
                        "button, a"
                    );

                if (
                    target &&
                    isMobile()
                ) {

                    setTimeout(
                        closeSidebar,
                        80
                    );

                }

            }
        );

    }


    /*
       Escape closes sidebar.
    */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeSidebar();

                closePlusMenu();

                closeDynamicPanel();

            }

        }
    );


    /* =====================================================
       PLUS MENU
       ===================================================== */

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


    safe(plusBtn, "click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        if (!plusMenu) return;

        const opened =
            plusMenu.classList.contains("show") ||
            plusMenu.classList.contains("active");

        if (opened) {

            closePlusMenu();

        } else {

            openPlusMenu();

        }

    });


    document.addEventListener(
        "click",
        (event) => {

            if (
                plusMenu &&
                plusBtn &&
                !plusMenu.contains(event.target) &&
                !plusBtn.contains(event.target)
            ) {

                closePlusMenu();

            }

        }
    );


    /* =====================================================
       MESSAGE UI
       ===================================================== */

    function addMessage(
        text,
        sender = "user",
        attachment = null
    ) {

        if (!messages) return null;

        const message =
            document.createElement("div");

        message.className =
            sender === "user"
                ? "message user-message"
                : "message ai-message";


        const content =
            document.createElement("div");

        content.className =
            "message-content";


        if (text) {

            const textDiv =
                document.createElement("div");

            textDiv.className =
                "message-text";

            textDiv.innerHTML =
                escapeHTML(text)
                    .replace(/\n/g, "<br>");

            content.appendChild(textDiv);

        }


        if (attachment) {

            const attachmentBox =
                document.createElement("div");

            attachmentBox.className =
                "message-attachment";


            if (
                attachment.type === "image"
            ) {

                const img =
                    document.createElement("img");

                img.src =
                    attachment.url;

                img.alt =
                    "Attached image";

                img.className =
                    "chat-image";

                content.appendChild(
                    img
                );

            }


            if (
                attachment.type === "video"
            ) {

                const video =
                    document.createElement(
                        "video"
                    );

                video.src =
                    attachment.url;

                video.controls = true;
                video.playsInline = true;

                video.className =
                    "chat-video";

                content.appendChild(
                    video
                );

            }


            content.appendChild(
                attachmentBox
            );

        }


        message.appendChild(content);

        messages.appendChild(message);

        scrollMessages();

        return message;

    }


    /* =====================================================
       ATTACHMENT
       ===================================================== */

    function clearAttachment() {

        selectedImage = null;
        selectedVideo = null;

        if (imagePreview) {

            imagePreview.innerHTML = "";

            imagePreview.classList.remove(
                "show"
            );

            imagePreview.classList.remove(
                "active"
            );

        }

        if (imageInput) {
            imageInput.value = "";
        }

        if (fileInput) {
            fileInput.value = "";
        }

    }


    function showAttachment(
        file,
        type
    ) {

        if (!imagePreview || !file) {
            return;
        }

        clearAttachment();

        imagePreview.innerHTML = "";

        imagePreview.classList.add(
            "show"
        );

        imagePreview.classList.add(
            "active"
        );


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "attachment-preview-item";


        const removeBtn =
            document.createElement(
                "button"
            );

        removeBtn.type = "button";

        removeBtn.className =
            "remove-attachment";

        removeBtn.innerHTML = "×";

        removeBtn.title =
            "Remove attachment";


        const url =
            URL.createObjectURL(file);


        if (type === "image") {

            selectedImage = file;
            selectedVideo = null;

            const img =
                document.createElement(
                    "img"
                );

            img.src = url;

            img.alt =
                "Image preview";

            img.className =
                "preview-image";

            wrapper.appendChild(
                img
            );

        }


        if (type === "video") {

            selectedVideo = file;
            selectedImage = null;

            const video =
                document.createElement(
                    "video"
                );

            video.src = url;

            video.controls = true;
            video.muted = true;
            video.playsInline = true;

            video.className =
                "preview-video";

            wrapper.appendChild(
                video
            );

        }


        removeBtn.addEventListener(
            "click",
            clearAttachment
        );


        wrapper.appendChild(
            removeBtn
        );

        imagePreview.appendChild(
            wrapper
        );

    }


    /* =====================================================
       PHOTOS
       ===================================================== */

    safe(photoBtn, "click", () => {

        closePlusMenu();

        if (imageInput) {

            imageInput.click();

        }

    });


    safe(imageInput, "change", (event) => {

        const file =
            event.target.files?.[0];

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


        showAttachment(
            file,
            "image"
        );

    });


    /* =====================================================
       FILES
       ===================================================== */

    safe(fileBtn, "click", () => {

        closePlusMenu();

        if (fileInput) {

            fileInput.click();

        }

    });


    safe(fileInput, "change", (event) => {

        const file =
            event.target.files?.[0];

        if (!file) return;


        if (
            file.type.startsWith(
                "image/"
            )
        ) {

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

            showAttachment(
                file,
                "video"
            );

            return;

        }


        addMessage(
            `📄 Attached file: ${file.name}`,
            "user"
        );

    });


    /* =====================================================
       CAMERA
       ===================================================== */

    safe(cameraBtn, "click", () => {

        closePlusMenu();

        openCamera();

    });


    async function openCamera() {

        if (!cameraModal) {

            alert(
                "Camera modal is missing from index.html."
            );

            return;

        }


        cameraModal.classList.add(
            "show"
        );

        cameraModal.classList.add(
            "active"
        );


        if (cameraError) {

            cameraError.style.display =
                "none";

        }


        await startCamera();

    }


    async function startCamera() {

        stopCamera();


        try {

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices
                    .getUserMedia
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
                                ideal:
                                    cameraFacing
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

                cameraVideo.muted =
                    true;

                cameraVideo.playsInline =
                    true;


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

            showCameraError(
                error
            );

        }

    }


    function showCameraError(
        error
    ) {

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
                "Camera permission denied.";

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

    }


    function closeCamera() {

        stopCamera();


        if (cameraModal) {

            cameraModal.classList.remove(
                "show"
            );

            cameraModal.classList.remove(
                "active"
            );

        }


        if (cameraVideo) {

            cameraVideo.srcObject =
                null;

        }

    }


    safe(
        cameraClose,
        "click",
        closeCamera
    );


    /* =====================================================
       PHOTO MODE
       ===================================================== */

    safe(
        photoMode,
        "click",
        () => {

            cameraMode =
                "photo";


            if (photoMode) {

                photoMode.classList.add(
                    "active"
                );

            }


            if (videoMode) {

                videoMode.classList.remove(
                    "active"
                );

            }


            if (takePhoto) {

                takePhoto.style.display =
                    "";

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
    );


    /* =====================================================
       VIDEO MODE
       ===================================================== */

    safe(
        videoMode,
        "click",
        () => {

            cameraMode =
                "video";


            if (videoMode) {

                videoMode.classList.add(
                    "active"
                );

            }


            if (photoMode) {

                photoMode.classList.remove(
                    "active"
                );

            }


            if (takePhoto) {

                takePhoto.style.display =
                    "none";

            }


            if (startRecord) {

                startRecord.style.display =
                    "";

            }


            if (stopRecord) {

                stopRecord.style.display =
                    "none";

            }

        }
    );


    /* =====================================================
       CAPTURE PHOTO
       ===================================================== */

    safe(
        takePhoto,
        "click",
        capturePhoto
    );


    function capturePhoto() {

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
            document.createElement(
                "canvas"
            );


        canvas.width =
            cameraVideo.videoWidth;

        canvas.height =
            cameraVideo.videoHeight;


        const ctx =
            canvas.getContext("2d");


        if (!ctx) return;


        if (
            cameraFacing === "user"
        ) {

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
                            type:
                                "image/jpeg"
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

    }


    /* =====================================================
       SWITCH CAMERA
       ===================================================== */

    safe(
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

    safe(
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
                "Video recording is not supported."
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

        } else if (
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

            try {

                mediaRecorder =
                    new MediaRecorder(
                        cameraStream
                    );

            } catch (secondError) {

                alert(
                    "Unable to start recording."
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


    safe(
        stopRecord,
        "click",
        stopRecording
    );


    function stopRecording() {

        if (
            mediaRecorder &&
            mediaRecorder.state !==
                "inactive"
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
                    type:
                        mimeType
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
                    type:
                        mimeType
                }
            );


        showAttachment(
            file,
            "video"
        );


        closeCamera();


        recordedChunks = [];

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
       VOICE INPUT
       ===================================================== */

    function getSpeechRecognition() {

        return (
            window.SpeechRecognition ||
            window.webkitSpeechRecognition ||
            null
        );

    }


    function setupRecognition() {

        const SpeechRecognition =
            getSpeechRecognition();


        if (!SpeechRecognition) {

            alert(
                "Voice input is not supported in this browser."
            );

            return null;

        }


        const r =
            new SpeechRecognition();


        r.continuous = true;

        r.interimResults = true;

        r.lang =
            currentVoiceLanguage;


        r.onstart = () => {

            isListening = true;

            updateMicrophoneUI();

        };


        r.onresult =
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

                    const result =
                        event.results[i];


                    const transcript =
                        result[0]
                            .transcript;


                    if (
                        result.isFinal
                    ) {

                        finalText +=
                            transcript;

                    } else {

                        interimText +=
                            transcript;

                    }

                }


                if (userInput) {

                    if (finalText) {

                        userInput.value +=
                            (
                                userInput.value
                                    ? " "
                                    : ""
                            ) +
                            finalText;

                    }


                    userInput.dataset.interim =
                        interimText;

                    autoResizeInput();

                }

            };


        r.onerror =
            (event) => {

                console.warn(
                    "Speech recognition:",
                    event.error
                );

                isListening = false;

                updateMicrophoneUI();

            };


        r.onend = () => {

            isListening = false;

            updateMicrophoneUI();

        };


        return r;

    }


    function toggleVoiceInput() {

        if (isListening) {

            try {

                recognition?.stop();

            } catch (error) {

                console.warn(error);

            }

            return;

        }


        if (!recognition) {

            recognition =
                setupRecognition();

        }


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
                : `Voice input (${currentVoiceLanguage})`;

    }


    safe(
        microphoneBtn,
        "click",
        toggleVoiceInput
    );


    /* =====================================================
       VOICE LANGUAGE
       ===================================================== */

    safe(
        languageBtn,
        "click",
        () => {

            currentVoiceLanguage =
                currentVoiceLanguage ===
                    "bn-BD"
                    ? "en-US"
                    : "bn-BD";


            localStorage.setItem(
                STORAGE.language,
                currentVoiceLanguage
            );


            if (recognition) {

                recognition.lang =
                    currentVoiceLanguage;

            }


            updateMicrophoneUI();


            if (languageBtn) {

                languageBtn.textContent =
                    currentVoiceLanguage ===
                        "bn-BD"
                        ? "বাংলা"
                        : "English";

            }

        }
    );


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


    safe(
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
       DYNAMIC PANELS
       ===================================================== */

    let activeDynamicPanel = null;


    function closeDynamicPanel() {

        if (
            activeDynamicPanel &&
            activeDynamicPanel.parentNode
        ) {

            activeDynamicPanel.remove();

        }

        activeDynamicPanel = null;

    }


    function createPanel(
        id,
        title,
        bodyHTML
    ) {

        closeDynamicPanel();


        const panel =
            document.createElement(
                "div"
            );


        panel.id = id;

        panel.className =
            "swift-dynamic-panel";


        panel.innerHTML = `

            <div class="swift-panel-header">

                <strong>
                    ${title}
                </strong>

                <button
                    type="button"
                    class="swift-panel-close"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>

            <div class="swift-panel-body">
                ${bodyHTML}
            </div>

        `;


        document.body.appendChild(
            panel
        );


        const close =
            panel.querySelector(
                ".swift-panel-close"
            );


        safe(
            close,
            "click",
            closeDynamicPanel
        );


        activeDynamicPanel =
            panel;


        return panel;

    }


    /* =====================================================
       PLUGINS
       ===================================================== */

    function openPluginsPanel() {

        closePlusMenu();


        const panel =
            createPanel(
                "swiftPluginsPanel",
                "🧩 Plugins",
                `

                <div class="swift-plugin-row">

                    <span>
                        🌐 Web Search
                    </span>

                    <span>
                        Ready
                    </span>

                </div>


                <div class="swift-plugin-row">

                    <span>
                        🖼️ Image Analysis
                    </span>

                    <span>
                        Ready
                    </span>

                </div>


                <div class="swift-plugin-row">

                    <span>
                        📄 File Analysis
                    </span>

                    <span>
                        Ready
                    </span>

                </div>


                <div class="swift-plugin-row">

                    <span>
                        🎥 Video Analysis
                    </span>

                    <span>
                        Ready
                    </span>

                </div>

                `
            );


        panel.dataset.panel =
            "plugins";

    }


    safe(
        pluginBtn,
        "click",
        openPluginsPanel
    );


    /* =====================================================
       MEMORY
       ===================================================== */

    function updateMemoryUI() {

        if (memoryToggle) {

            if (
                memoryToggle.type ===
                "checkbox"
            ) {

                memoryToggle.checked =
                    memoryEnabled;

            }

            memoryToggle.setAttribute(
                "aria-pressed",
                String(
                    memoryEnabled
                )
            );

        }


        if (memoryBtn) {

            memoryBtn.classList.toggle(
                "active",
                memoryEnabled
            );


            memoryBtn.setAttribute(
                "aria-pressed",
                String(
                    memoryEnabled
                )
            );


            memoryBtn.title =
                memoryEnabled
                    ? "Memory: ON"
                    : "Memory: OFF";

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


    safe(
        memoryBtn,
        "click",
        toggleMemory
    );


    safe(
        memoryToggle,
        "change",
        () => {

            if (
                memoryToggle.type ===
                "checkbox"
            ) {

                memoryEnabled =
                    memoryToggle.checked;

            } else {

                toggleMemory();

                return;

            }


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
       DARK / LIGHT MODE
       ===================================================== */

    function applyTheme(
        theme
    ) {

        const isDark =
            theme === "dark";


        document.documentElement
            .classList.toggle(
                "dark-mode",
                isDark
            );


        document.body
            .classList.toggle(
                "dark-mode",
                isDark
            );


        document.documentElement
            .setAttribute(
                "data-theme",
                theme
            );


        document.body
            .setAttribute(
                "data-theme",
                theme
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
            STORAGE.theme,
            theme
        );

    }


    function toggleTheme() {

        const isDark =
            document.documentElement
                .classList.contains(
                    "dark-mode"
                );


        applyTheme(
            isDark
                ? "light"
                : "dark"
        );

    }


    safe(
        themeBtn,
        "click",
        toggleTheme
    );


    const savedTheme =
        localStorage.getItem(
            STORAGE.theme
        );


    applyTheme(
        savedTheme === "dark"
            ? "dark"
            : "light"
    );


    /* =====================================================
       SETTINGS
       ===================================================== */

    function openSettings() {

        closeSidebar();


        const panel =
            createPanel(
                "swiftSettingsPanel",
                "⚙️ Settings",
                `

                <div class="swift-setting-row">

                    <div>
                        <strong>
                            Appearance
                        </strong>

                        <small>
                            Dark / Light Mode
                        </small>
                    </div>

                    <button
                        type="button"
                        id="swiftThemeControl"
                    >
                        ${
                            document.documentElement
                                .classList.contains(
                                    "dark-mode"
                                )
                                ? "☀️ Light"
                                : "🌙 Dark"
                        }
                    </button>

                </div>


                <div class="swift-setting-row">

                    <div>
                        <strong>
                            🧠 Memory
                        </strong>

                        <small>
                            Save recent chat preferences
                        </small>
                    </div>

                    <button
                        type="button"
                        id="swiftMemoryControl"
                    >
                        ${
                            memoryEnabled
                                ? "ON"
                                : "OFF"
                        }
                    </button>

                </div>


                <div class="swift-setting-row">

                    <div>
                        <strong>
                            🎙️ Voice Language
                        </strong>

                        <small>
                            Bengali / English
                        </small>
                    </div>

                    <button
                        type="button"
                        id="swiftLanguageControl"
                    >
                        ${
                            currentVoiceLanguage ===
                                "bn-BD"
                                ? "বাংলা"
                                : "English"
                        }
                    </button>

                </div>

                `
            );


        const themeControl =
            panel.querySelector(
                "#swiftThemeControl"
            );


        const memoryControl =
            panel.querySelector(
                "#swiftMemoryControl"
            );


        const languageControl =
            panel.querySelector(
                "#swiftLanguageControl"
            );


        safe(
            themeControl,
            "click",
            () => {

                toggleTheme();

                themeControl.textContent =
                    document.documentElement
                        .classList.contains(
                            "dark-mode"
                        )
                        ? "☀️ Light"
                        : "🌙 Dark";

            }
        );


        safe(
            memoryControl,
            "click",
            () => {

                toggleMemory();

                memoryControl.textContent =
                    memoryEnabled
                        ? "ON"
                        : "OFF";

            }
        );


        safe(
            languageControl,
            "click",
            () => {

                currentVoiceLanguage =
                    currentVoiceLanguage ===
                        "bn-BD"
                        ? "en-US"
                        : "bn-BD";


                localStorage.setItem(
                    STORAGE.language,
                    currentVoiceLanguage
                );


                languageControl.textContent =
                    currentVoiceLanguage ===
                        "bn-BD"
                        ? "বাংলা"
                        : "English";


                updateMicrophoneUI();

            }
        );

    }


    safe(
        settingsBtn,
        "click",
        openSettings
    );


    /* =====================================================
       PROFILE
       ===================================================== */

    function openProfile() {

        closeSidebar();


        createPanel(
            "swiftProfilePanel",
            "👤 Profile",
            `

            <div class="swift-profile">

                <div class="swift-profile-icon">
                    ⚡
                </div>

                <h3>
                    SwiftCortex AI Ultra
                </h3>

                <p>
                    AI Assistant
                </p>

                <div class="swift-profile-info">
                    <strong>
                        Creator
                    </strong>

                    <span>
                        Abdullah Tahmid
                    </span>
                </div>

            </div>

            `
        );

    }


    safe(
        profileBtn,
        "click",
        openProfile
    );


    /* =====================================================
       CUSTOMER SUPPORT
       ===================================================== */

    function openCustomerSupport() {

        closeSidebar();


        createPanel(
            "swiftSupportPanel",
            "💬 Customer Support",
            `

            <div class="swift-support">

                <h3>
                    SwiftCortex AI Ultra Support
                </h3>

                <p>
                    Need help with SwiftCortex AI?
                </p>

                <a
                    href="mailto:swiftcortexaisupport@gmail.com"
                    class="swift-support-email"
                >
                    ✉️ swiftcortexaisupport@gmail.com
                </a>

                <button
                    type="button"
                    id="swiftSupportMail"
                >
                    Send Support Email
                </button>

            </div>

            `
        );


        const mail =
            document.getElementById(
                "swiftSupportMail"
            );


        safe(
            mail,
            "click",
            () => {

                window.location.href =
                    "mailto:swiftcortexaisupport@gmail.com";

            }
        );

    }


    safe(
        supportBtn,
        "click",
        openCustomerSupport
    );


    /* =====================================================
       NEW CHAT
       ===================================================== */

    function startNewChat() {

        currentChatId =
            Date.now().toString();


        if (messages) {

            messages.innerHTML = "";

        }


        clearAttachment();


        if (userInput) {

            userInput.value = "";

            autoResizeInput();

            userInput.focus();

        }


        closeSidebar();

        closeDynamicPanel();


        addMessage(
            "Hello! I'm SwiftCortex AI Ultra. How can I help you?",
            "ai"
        );

    }


    safe(
        newChat,
        "click",
        startNewChat
    );


    /* =====================================================
       CHAT STORAGE
       ===================================================== */

    function getChats() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    STORAGE.chats
                ) || "[]"
            );

        } catch (error) {

            console.warn(
                "Chat storage:",
                error
            );

            return [];

        }

    }


    function saveChats(chats) {

        try {

            localStorage.setItem(
                STORAGE.chats,
                JSON.stringify(
                    chats
                )
            );

        } catch (error) {

            console.warn(
                "Unable to save chats:",
                error
            );

        }

    }


    function saveCurrentChat(
        userText,
        aiText
    ) {

        if (!memoryEnabled) {
            return;
        }


        const chats =
            getChats();


        const id =
            currentChatId ||
            Date.now().toString();


        currentChatId =
            id;


        let chat =
            chats.find(
                item =>
                    item.id === id
            );


        if (!chat) {

            chat = {

                id,

                title:
                    userText
                        .trim()
                        .slice(
                            0,
                            50
                        ) ||
                    "New Chat",

                messages: [],

                updatedAt:
                    Date.now()

            };


            chats.unshift(
                chat
            );

        }


        if (userText) {

            chat.messages.push({

                role: "user",

                content:
                    userText,

                time:
                    Date.now()

            });

        }


        if (aiText) {

            chat.messages.push({

                role: "assistant",

                content:
                    aiText,

                time:
                    Date.now()

            });

        }


        chat.updatedAt =
            Date.now();


        saveChats(
            chats.slice(
                0,
                50
            )
        );


        renderHistory();

    }


    /* =====================================================
       HISTORY
       ===================================================== */

    function renderHistory() {

        if (!historyList) return;


        const chats =
            getChats();


        historyList.innerHTML = "";


        if (!chats.length) {

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


        chats.forEach(
            chat => {

                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";


                item.className =
                    "history-item";


                item.dataset.chatId =
                    chat.id;


                item.textContent =
                    chat.title ||
                    "New Chat";


                item.addEventListener(
                    "click",
                    () => {

                        loadChat(
                            chat.id
                        );

                        closeSidebar();

                    }
                );


                historyList.appendChild(
                    item
                );

            }
        );

    }


    function loadChat(
        id
    ) {

        const chats =
            getChats();


        const chat =
            chats.find(
                item =>
                    item.id === id
            );


        if (!chat) return;


        currentChatId =
            id;


        if (messages) {

            messages.innerHTML = "";

        }


        clearAttachment();


        chat.messages.forEach(
            item => {

                addMessage(
                    item.content,
                    item.role ===
                        "user"
                        ? "user"
                        : "ai"
                );

            }
        );


        scrollMessages();

    }


    renderHistory();


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


    safe(
        userInput,
        "input",
        autoResizeInput
    );


    /* =====================================================
       FILE TO BASE64
       ===================================================== */

    function fileToBase64(
        file
    ) {

        return new Promise(
            (resolve, reject) => {

                if (!file) {

                    resolve(null);

                    return;

                }


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

                            resolve(null);

                            return;

                        }


                        const comma =
                            result.indexOf(
                                ","
                            );


                        resolve(
                            comma >= 0
                                ? result.substring(
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
       VIDEO FRAME EXTRACTION
       ===================================================== */

    async function seekVideo(
        video,
        time
    ) {

        return new Promise(
            (resolve) => {

                const done =
                    () => {

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
                    Math.min(
                        time,
                        Math.max(
                            0,
                            video.duration - 0.05
                        )
                    );

            }
        );

    }


    async function extractVideoFrames(
        videoFile
    ) {

        if (!videoFile) {
            return [];
        }


        const url =
            URL.createObjectURL(
                videoFile
            );


        try {

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
                            duration *
                            i
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


                const maxWidth =
                    768;


                const scale =
                    video.videoWidth >
                    maxWidth
                        ? maxWidth /
                          video.videoWidth
                        : 1;


                canvas.width =
                    Math.max(
                        1,
                        Math.floor(
                            video.videoWidth *
                            scale
                        )
                    );


                canvas.height =
                    Math.max(
                        1,
                        Math.floor(
                            video.videoHeight *
                            scale
                        )
                    );


                const ctx =
                    canvas.getContext(
                        "2d"
                    );


                if (!ctx) {
                    continue;
                }


                ctx.drawImage(
                    video,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                const data =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.75
                    );


                frames.push(
                    data.split(",")[1]
                );

            }


            return frames;

        } catch (error) {

            console.warn(
                "Video frames:",
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
       SEND BUTTON UI
       ===================================================== */

    function setSendingState(
        sending
    ) {

        isSending =
            sending;


        if (sendBtn) {

            sendBtn.disabled =
                sending;


            sendBtn.classList.toggle(
                "sending",
                sending
            );

        }

    }


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    async function sendMessage() {

        if (isSending) {
            return;
        }


        const text =
            userInput?.value
                ?.trim() || "";


        const image =
            selectedImage;


        const video =
            selectedVideo;


        if (
            !text &&
            !image &&
            !video
        ) {

            return;

        }


        setSendingState(
            true
        );


        const attachment =
            image
                ? {

                    type: "image",

                    url:
                        URL.createObjectURL(
                            image
                        )

                }
                : video
                    ? {

                        type: "video",

                        url:
                            URL.createObjectURL(
                                video
                            )

                    }
                    : null;


        addMessage(
            text,
            "user",
            attachment
        );


        if (userInput) {

            userInput.value = "";

            autoResizeInput();

        }


        const imageToSend =
            image;


        const videoToSend =
            video;


        clearAttachment();


        const loadingMessage =
            addMessage(
                "SwiftCortex is thinking…",
                "ai"
            );


        try {

            let imageBase64 =
                null;


            let videoFrames =
                [];


            if (imageToSend) {

                imageBase64 =
                    await fileToBase64(
                        imageToSend
                    );

            }


            if (videoToSend) {

                videoFrames =
                    await extractVideoFrames(
                        videoToSend
                    );

            }


            const payload = {

                message:
                    text,

                thinkHarder:
                    thinkHarderEnabled,

                memory:
                    memoryEnabled,

                language:
                    currentVoiceLanguage,

                image:
                    imageBase64,

                videoFrames:
                    videoFrames

            };


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


            let answer =
                data?.reply ||
                data?.response ||
                data?.text ||
                data?.message ||
                data?.output;


            if (
                !answer &&
                data?.choices?.[0]
                    ?.message?.content
            ) {

                answer =
                    data.choices[0]
                        .message.content;

            }


            if (!answer) {

                answer =
                    "I received an empty response from the AI.";

            }


            if (loadingMessage) {

                loadingMessage.remove();

            }


            addMessage(
                answer,
                "ai"
            );


            saveCurrentChat(
                text,
                answer
            );


        } catch (error) {

            console.error(
                "Send message error:",
                error
            );


            if (loadingMessage) {

                loadingMessage.remove();

            }


            addMessage(
                "⚠️ Connection error. Please check your Vercel API route (/api/gemini) and try again.",
                "ai"
            );

        } finally {

            setSendingState(
                false
            );


            if (userInput) {

                userInput.focus();

            }

        }

    }


    safe(
        sendBtn,
        "click",
        sendMessage
    );


    /* =====================================================
       ENTER TO SEND
       ===================================================== */

    safe(
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
       INITIAL UI
       ===================================================== */

    updateMicrophoneUI();

    updateThinkButton();

    updateMemoryUI();

    autoResizeInput();


    /* =====================================================
       MOBILE RESPONSIVE FIX
       ===================================================== */

    function applyResponsiveState() {

        if (
            window.innerWidth > 768
        ) {

            closeSidebar();

        }

    }


    window.addEventListener(
        "resize",
        applyResponsiveState
    );


    /* =====================================================
       PAGE VISIBILITY
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden &&
                isListening &&
                recognition
            ) {

                try {

                    recognition.stop();

                } catch (error) {

                    console.warn(error);

                }

            }

        }
    );


    /* =====================================================
       BEFORE UNLOAD
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            stopCamera();

            if (
                recordingTimer
            ) {

                clearInterval(
                    recordingTimer
                );

            }

        }
    );


    /* =====================================================
       GLOBAL ACCESS
       ===================================================== */

    /*
       Useful if HTML buttons or future modules
       need these functions.
    */

    window.SwiftCortex = {

        sendMessage,

        startNewChat,

        openCamera,

        closeCamera,

        toggleTheme,

        toggleMemory,

        openPluginsPanel,

        openSettings,

        openProfile,

        openCustomerSupport,

        toggleVoiceInput,

        renderHistory,

        loadChat,

        clearAttachment

    };


    /* =====================================================
       STARTUP
       ===================================================== */

    console.log(
        "⚡ SwiftCortex AI Ultra loaded successfully."
    );

});
/* =========================================================
   MOBILE SIDEBAR TOUCH SWIPE
   ========================================================= */

const sidebar = document.getElementById("sidebar");

let sidebarTouchStartX = 0;
let sidebarTouchCurrentX = 0;
let sidebarIsDragging = false;

if (sidebar) {

    sidebar.addEventListener(
        "touchstart",
        (e) => {
            if (window.innerWidth > 768) return;

            sidebarTouchStartX =
                e.touches[0].clientX;

            sidebarTouchCurrentX =
                sidebarTouchStartX;

            sidebarIsDragging = true;

            sidebar.style.transition = "none";
        },
        { passive: true }
    );


    sidebar.addEventListener(
        "touchmove",
        (e) => {
            if (
                !sidebarIsDragging ||
                window.innerWidth > 768
            ) return;

            sidebarTouchCurrentX =
                e.touches[0].clientX;

            const difference =
                sidebarTouchCurrentX -
                sidebarTouchStartX;

            /*
             * Only allow dragging toward the left.
             */
            if (difference < 0) {

                const sidebarWidth =
                    sidebar.offsetWidth;

                const translateX =
                    Math.max(
                        -sidebarWidth,
                        difference
                    );

                sidebar.style.transform =
                    `translateX(${translateX}px)`;
            }
        },
        { passive: true }
    );


    sidebar.addEventListener(
        "touchend",
        () => {
            if (
                !sidebarIsDragging ||
                window.innerWidth > 768
            ) return;

            sidebarIsDragging = false;

            sidebar.style.transition =
                "transform 0.25s ease";

            const difference =
                sidebarTouchCurrentX -
                sidebarTouchStartX;

            const threshold = 80;

            /*
             * Swipe left → close sidebar
             */
            if (difference < -threshold) {

                sidebar.classList.remove("open");
                sidebar.classList.remove("active");
                sidebar.classList.remove("show");

                sidebar.style.transform =
                    "translateX(-100%)";

            } else {

                /*
                 * Not enough swipe → return open
                 */
                sidebar.style.transform =
                    "translateX(0)";
            }

            setTimeout(() => {

                sidebar.style.transform = "";

            }, 300);
        },
        { passive: true }
    );
}
