"use strict";

/* =====================================================
   SwiftCortex AI Ultra
   SCRIPT.JS — PART 1/2
===================================================== */

const $ = id => document.getElementById(id);

/* =========================
   MAIN ELEMENTS
========================= */

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

const newChat = $("newChat");
const themeBtn = $("themeBtn");


/* =========================
   STATE
========================= */

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


/* =========================
   MESSAGE
========================= */

function addMessage(text, type = "ai", attachment = null) {

    if (!messages) return null;

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

        img.style.maxWidth = "280px";
        img.style.maxHeight = "280px";
        img.style.borderRadius = "14px";
        img.style.display = "block";
        img.style.marginTop = "8px";

        box.appendChild(img);
    }

    if (attachment?.type === "video") {

        const video =
            document.createElement("video");

        video.src = attachment.url;
        video.controls = true;
        video.playsInline = true;

        video.style.maxWidth = "300px";
        video.style.maxHeight = "280px";
        video.style.borderRadius = "14px";
        video.style.display = "block";
        video.style.marginTop = "8px";

        box.appendChild(video);
    }

    if (attachment?.type === "file") {

        const fileBox =
            document.createElement("div");

        fileBox.textContent =
            "📄 " + attachment.name;

        fileBox.style.marginTop = "8px";

        box.appendChild(fileBox);
    }

    messages.appendChild(box);

    messages.scrollTop =
        messages.scrollHeight;

    return box;
}


/* =========================
   PLUS MENU
========================= */

if (plusBtn && plusMenu) {

    plusBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            plusMenu.classList.toggle("show");
        }
    );
}


document.addEventListener(
    "click",
    function(event) {

        if (!plusMenu || !plusBtn) return;

        if (
            !plusMenu.contains(event.target) &&
            event.target !== plusBtn
        ) {

            plusMenu.classList.remove("show");
        }
    }
);


function closeMenu() {

    if (plusMenu) {

        plusMenu.classList.remove("show");
    }
}


/* =========================
   PHOTO BUTTON
========================= */

if (photoBtn && imageInput) {

    photoBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeMenu();

            imageInput.value = "";

            imageInput.click();
        }
    );
}


if (imageInput) {

    imageInput.addEventListener(
        "change",
        function() {

            const file =
                imageInput.files &&
                imageInput.files[0];

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

            showPreview(file, "image");
        }
    );
}


/* =========================
   FILE BUTTON
========================= */

if (fileBtn && fileInput) {

    fileBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeMenu();

            fileInput.value = "";

            fileInput.click();
        }
    );
}


if (fileInput) {

    fileInput.addEventListener(
        "change",
        function() {

            const file =
                fileInput.files &&
                fileInput.files[0];

            if (!file) return;


            if (file.type.startsWith("image/")) {

                selectedImage = file;
                selectedVideo = null;
                selectedFile = null;

                showPreview(file, "image");

                return;
            }


            if (file.type.startsWith("video/")) {

                selectedVideo = file;
                selectedImage = null;
                selectedFile = null;

                showPreview(file, "video");

                return;
            }


            selectedFile = file;
            selectedImage = null;
            selectedVideo = null;

            showPreview(file, "file");
        }
    );
}


/* =========================
   PREVIEW
========================= */

function showPreview(file, type) {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    const box =
        document.createElement("div");

    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.gap = "10px";
    box.style.padding = "8px";
    box.style.background = "#111827";
    box.style.borderRadius = "12px";


    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "10px";

        box.appendChild(img);
    }


    if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(file);

        video.controls = true;
        video.muted = true;

        video.style.width = "90px";
        video.style.height = "60px";
        video.style.objectFit = "cover";
        video.style.borderRadius = "10px";

        box.appendChild(video);
    }


    const name =
        document.createElement("span");

    name.textContent =
        type === "image"
            ? "🖼 " + file.name
            : type === "video"
                ? "🎥 " + file.name
                : "📄 " + file.name;

    name.style.color = "white";
    name.style.flex = "1";

    box.appendChild(name);


    const remove =
        document.createElement("button");

    remove.type = "button";
    remove.textContent = "✕";

    remove.style.border = "0";
    remove.style.background = "#374151";
    remove.style.color = "white";
    remove.style.borderRadius = "8px";
    remove.style.padding = "6px 9px";

    remove.addEventListener(
        "click",
        clearAttachment
    );

    box.appendChild(remove);

    imagePreview.appendChild(box);
}


/* =========================
   CLEAR ATTACHMENT
========================= */

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


/* =========================
   CAMERA BUTTON
========================= */

if (cameraBtn) {

    cameraBtn.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();

            closeMenu();

            if (cameraModal) {
                cameraModal.classList.add("show");
            }

            await startCamera();
        }
    );
}


/* =========================
   START CAMERA
========================= */

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


        if (cameraError) {

            cameraError.classList.remove(
                "show"
            );
        }


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


/* =========================
   CAMERA ERROR
========================= */

function showCameraError(message) {

    if (cameraError) {

        cameraError.classList.add(
            "show"
        );
    }

    if (cameraErrorText) {

        cameraErrorText.textContent =
            message;
    }
}


function getCameraError(error) {

    if (
        error &&
        error.name === "NotAllowedError"
    ) {

        return "Camera permission was denied. Please allow camera access.";
    }

    if (
        error &&
        error.name === "NotFoundError"
    ) {

        return "No camera was found.";
    }

    if (
        error &&
        error.name === "NotReadableError"
    ) {

        return "Camera is being used by another app.";
    }

    return (
        error?.message ||
        "Unable to access the camera."
    );
}


/* =========================
   CLOSE CAMERA
========================= */

if (cameraClose) {

    cameraClose.addEventListener(
        "click",
        closeCamera
    );
}


function closeCamera() {

    stopRecording();
    stopCamera();

    if (cameraModal) {

        cameraModal.classList.remove(
            "show"
        );
    }
}


/* =========================
   STOP CAMERA
========================= */

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

        cameraVideo.srcObject = null;
    }
}


/* =========================
   SWITCH CAMERA
========================= */

if (switchCamera) {

    switchCamera.addEventListener(
        "click",
        async function() {

            cameraFacing =
                cameraFacing === "user"
                    ? "environment"
                    : "user";

            await startCamera();
        }
    );
               }
/* =========================
   PART 2/2 — SEND + API
========================= */

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    if (sending) return;

    const text =
        userInput?.value?.trim() || "";

    if (
        !text &&
        !selectedImage &&
        !selectedVideo &&
        !selectedFile
    ) {
        return;
    }

    sending = true;

    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.style.opacity = "0.6";
    }


    /* USER MESSAGE */

    let userAttachment = null;

    if (selectedImage) {
        userAttachment = {
            type: "image",
            url: URL.createObjectURL(selectedImage)
        };
    }

    if (selectedVideo) {
        userAttachment = {
            type: "video",
            url: URL.createObjectURL(selectedVideo)
        };
    }

    if (selectedFile) {
        userAttachment = {
            type: "file",
            name: selectedFile.name
        };
    }

    addMessage(
        text || " ",
        "user",
        userAttachment
    );


    /* CLEAR INPUT */

    if (userInput) {
        userInput.value = "";
        userInput.style.height = "auto";
    }


    /* AI LOADING */

    const loadingBox =
        addMessage(
            "⚡ SwiftCortex AI is thinking...",
            "ai"
        );


    try {

        let image = null;
        let videoFrames = [];


        /* =========================
           IMAGE
        ========================= */

        if (selectedImage) {

            image =
                await fileToBase64(
                    selectedImage
                );
        }


        /* =========================
           VIDEO
        ========================= */

        if (selectedVideo) {

            videoFrames =
                await extractVideoFrames(
                    selectedVideo,
                    3
                );
        }


        /* =========================
           FILE
        ========================= */

        let fileText = "";

        if (selectedFile) {

            fileText =
                `\n\nUser attached a file named: ${selectedFile.name}`;
        }


        /* =========================
           REQUEST
        ========================= */

        const response =
            await fetch(
                "/api/gemini",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message:
                            (text || "Please analyze the attachment.") +
                            fileText,

                        image:
                            image,

                        videoFrames:
                            videoFrames,

                        thinkHarder:
                            thinkHarder
                    })
                }
            );


        /* =========================
           RESPONSE TEXT
        ========================= */

        let data = null;

        try {
            data = await response.json();
        } catch {
            data = {};
        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Server error: ${response.status}`
            );
        }


        const reply =
            data?.text ||
            data?.reply ||
            data?.message ||
            "No response from AI.";


        /* REMOVE LOADING */

        loadingBox?.remove();


        /* AI RESPONSE */

        addMessage(
            reply,
            "ai"
        );


    } catch (error) {

        console.error(
            "SwiftCortex API Error:",
            error
        );


        loadingBox?.remove();


        addMessage(
            "❌ Connection error: " +
            (error?.message ||
            "Unable to connect to server."),
            "ai"
        );

    } finally {

        /* CLEAR ATTACHMENTS */

        clearAttachment();


        sending = false;


        if (sendBtn) {

            sendBtn.disabled = false;
            sendBtn.style.opacity = "1";
        }
    }
}


/* =========================
   EXTRACT VIDEO FRAMES
========================= */

async function extractVideoFrames(
    file,
    maxFrames = 3
) {

    return new Promise(
        resolve => {

            const video =
                document.createElement(
                    "video"
                );

            const canvas =
                document.createElement(
                    "canvas"
                );

            const url =
                URL.createObjectURL(
                    file
                );

            video.src = url;

            video.muted = true;
            video.playsInline = true;
            video.preload = "metadata";


            video.onloadedmetadata =
                async () => {

                    try {

                        const duration =
                            video.duration || 1;


                        canvas.width =
                            video.videoWidth ||
                            640;

                        canvas.height =
                            video.videoHeight ||
                            360;


                        const ctx =
                            canvas.getContext(
                                "2d"
                            );


                        const frames = [];


                        for (
                            let i = 0;
                            i < maxFrames;
                            i++
                        ) {

                            const time =
                                Math.min(
                                    duration *
                                    (
                                        (i + 1) /
                                        (maxFrames + 1)
                                    ),
                                    duration - 0.1
                                );


                            await seekVideo(
                                video,
                                time
                            );


                            ctx.drawImage(
                                video,
                                0,
                                0,
                                canvas.width,
                                canvas.height
                            );


                            const frame =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.65
                                );


                            frames.push(
                                frame
                            );
                        }


                        URL.revokeObjectURL(
                            url
                        );


                        resolve(frames);

                    } catch (error) {

                        console.error(
                            "Video frame error:",
                            error
                        );

                        URL.revokeObjectURL(
                            url
                        );

                        resolve([]);
                    }
                };


            video.onerror =
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                    resolve([]);
                };
        }
    );
}


/* =========================
   SEEK VIDEO
========================= */

function seekVideo(
    video,
    time
) {

    return new Promise(
        resolve => {

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
                time;
        }
    );
}


/* =========================
   CAMERA MODAL BACKDROP
========================= */

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


/* =========================
   ESCAPE KEY
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeMenu();

            if (
                cameraModal?.classList.contains(
                    "show"
                )
            ) {

                closeCamera();
            }
        }
    }
);


/* =========================
   INITIAL STATE
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (plusMenu) {
            plusMenu.classList.remove(
                "show"
            );
        }

        if (cameraModal) {
            cameraModal.classList.remove(
                "show"
            );
        }

        if (imagePreview) {
            imagePreview.innerHTML = "";
        }

        resizeInput();
    }
);


/* =========================
   SAFETY — PREVENT FORM
========================= */

document.addEventListener(
    "submit",
    event => {

        if (
            event.target?.contains(
                sendBtn
            )
        ) {

            event.preventDefault();
            sendMessage();
        }
    }
);


/* =========================
   FINAL BUTTON CHECK
========================= */

if (sendBtn) {

    sendBtn.type = "button";
}


/* =========================
   READY
========================= */

console.log(
    "⚡ SwiftCortex AI Ultra loaded successfully."
);
