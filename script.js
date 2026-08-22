/* =========================================================
   ⚡ SwiftCortex AI Ultra
   COMPLETE STABLE SCRIPT.JS
   Text + Image + Video + Camera + Plugins
========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const $ = (id) => document.getElementById(id);

const messages = $("messages");
const userInput = $("userInput");
const sendBtn = $("sendBtn");

const plusBtn = $("plusBtn");
const plusMenu = $("plusMenu");

const cameraBtn = $("cameraBtn");
const photoBtn = $("photoBtn");
const fileBtn = $("fileBtn");
const pluginBtn = $("pluginBtn");
const thinkBtn = $("thinkBtn");

const imageInput = $("imageInput");
const fileInput = $("fileInput");

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

let currentCamera = "user";
let currentMode = "photo";

let recordingTimer = null;
let recordingSeconds = 0;

let isSending = false;
let thinkHarder = false;


/* =========================================================
   BASIC
========================================================= */

function closePlusMenu() {
    if (plusMenu) {
        plusMenu.classList.remove("show");
    }
}


function openPlusMenu() {
    if (plusMenu) {
        plusMenu.classList.add("show");
    }
}


function scrollMessages() {
    if (!messages) return;

    requestAnimationFrame(() => {
        messages.scrollTop = messages.scrollHeight;
    });
}


/* =========================================================
   PLUS MENU
========================================================= */

if (plusBtn) {

    plusBtn.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        if (
            plusMenu &&
            plusMenu.classList.contains("show")
        ) {
            closePlusMenu();
        } else {
            openPlusMenu();
        }

    });

}


if (plusMenu) {

    plusMenu.addEventListener("click", (event) => {
        event.stopPropagation();
    });

}


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
   PHOTOS
========================================================= */

if (photoBtn && imageInput) {

    photoBtn.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        closePlusMenu();

        imageInput.click();

    });

}


/* =========================================================
   IMAGE SELECT
========================================================= */

if (imageInput) {

    imageInput.addEventListener("change", () => {

        const file = imageInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            addMessage(
                "⚠️ Please select a valid image.",
                "ai"
            );

            imageInput.value = "";
            return;
        }

        selectedImage = file;
        selectedVideo = null;

        showAttachment(file, "image");

    });

}


/* =========================================================
   FILES
========================================================= */

if (fileBtn && fileInput) {

    fileBtn.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        closePlusMenu();

        fileInput.click();

    });

}


if (fileInput) {

    fileInput.addEventListener("change", () => {

        const file = fileInput.files?.[0];

        if (!file) return;


        if (file.type.startsWith("image/")) {

            selectedImage = file;
            selectedVideo = null;

            showAttachment(file, "image");

        }

        else if (file.type.startsWith("video/")) {

            selectedVideo = file;
            selectedImage = null;

            showAttachment(file, "video");

        }

        else {

            showAttachment(file, "file");

        }

    });

}


/* =========================================================
   ATTACHMENT PREVIEW
========================================================= */

function showAttachment(file, type) {

    if (!mediaResult) return;

    mediaResult.innerHTML = "";

    const wrapper = document.createElement("div");

    wrapper.style.cssText = `
        position:relative;
        padding:10px;
        margin-top:8px;
        background:#111827;
        border:1px solid #273449;
        border-radius:14px;
        color:white;
    `;


    if (type === "image") {

        const img = document.createElement("img");

        img.src = URL.createObjectURL(file);

        img.style.cssText = `
            width:100%;
            max-height:220px;
            object-fit:contain;
            border-radius:12px;
            background:#000;
        `;

        wrapper.appendChild(img);

    }


    else if (type === "video") {

        const video = document.createElement("video");

        video.src = URL.createObjectURL(file);

        video.controls = true;
        video.playsInline = true;

        video.style.cssText = `
            width:100%;
            max-height:220px;
            border-radius:12px;
            background:#000;
        `;

        wrapper.appendChild(video);

    }


    const info = document.createElement("div");

    info.style.cssText = `
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-top:8px;
        gap:10px;
    `;


    const name = document.createElement("span");

    name.textContent =
        "📎 " + file.name;


    const remove = document.createElement("button");

    remove.type = "button";

    remove.textContent = "✕";

    remove.style.cssText = `
        border:0;
        background:#ef4444;
        color:white;
        width:32px;
        height:32px;
        border-radius:50%;
        cursor:pointer;
    `;


    remove.addEventListener("click", () => {
        clearAttachment();
    });


    info.appendChild(name);
    info.appendChild(remove);

    wrapper.appendChild(info);

    mediaResult.appendChild(wrapper);

}


/* =========================================================
   CLEAR ATTACHMENT
========================================================= */

function clearAttachment() {

    selectedImage = null;
    selectedVideo = null;

    if (imageInput) {
        imageInput.value = "";
    }

    if (fileInput) {
        fileInput.value = "";
    }

    if (mediaResult) {
        mediaResult.innerHTML = "";
    }

}


/* =========================================================
   CAMERA BUTTON
========================================================= */

if (cameraBtn) {

    cameraBtn.addEventListener("click", async (event) => {

        event.preventDefault();
        event.stopPropagation();

        closePlusMenu();

        await openCamera();

    });

}


/* =========================================================
   OPEN CAMERA
========================================================= */

async function openCamera() {

    if (!cameraModal) {
        addMessage(
            "⚠️ Camera interface was not found.",
            "ai"
        );
        return;
    }


    cameraModal.classList.add("show");

    if (cameraError) {
        cameraError.classList.remove("show");
        cameraError.style.display = "none";
    }


    try {

        await startCamera();

    }

    catch (error) {

        console.error("Camera error:", error);

        showCameraError(error);

    }

}


/* =========================================================
   START CAMERA
========================================================= */

async function startCamera() {

    stopCamera();


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        throw new Error(
            "Camera is not supported by this browser."
        );

    }


    cameraStream =
        await navigator.mediaDevices.getUserMedia({

            video: {
                facingMode: currentCamera,
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

        await cameraVideo.play();

    }

}


/* =========================================================
   CAMERA ERROR
========================================================= */

function showCameraError(error) {

    if (!cameraError) return;

    cameraError.classList.add("show");
    cameraError.style.display = "flex";


    let text =
        "Camera permission is required.";


    if (error?.name === "NotAllowedError") {

        text =
            "Camera permission was denied. Please allow camera access.";

    }

    else if (error?.name === "NotFoundError") {

        text =
            "No camera was found on this device.";

    }

    else if (error?.name === "NotReadableError") {

        text =
            "The camera is currently being used by another application.";

    }

    else if (error?.message) {

        text = error.message;

    }


    if (cameraErrorText) {
        cameraErrorText.textContent = text;
    }

}


/* =========================================================
   CLOSE CAMERA
========================================================= */

if (cameraClose) {

    cameraClose.addEventListener("click", () => {

        closeCamera();

    });

}


function closeCamera() {

    stopRecording();
    stopCamera();

    if (cameraModal) {
        cameraModal.classList.remove("show");
    }

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(track => {
            track.stop();
        });

        cameraStream = null;

    }


    if (cameraVideo) {
        cameraVideo.srcObject = null;
    }

}


/* =========================================================
   PHOTO MODE
========================================================= */

if (photoMode) {

    photoMode.addEventListener("click", async () => {

        currentMode = "photo";

        photoMode.classList.add("active");

        if (videoMode) {
            videoMode.classList.remove("active");
        }


        if (takePhoto) {
            takePhoto.style.display = "inline-flex";
        }

        if (startRecord) {
            startRecord.style.display = "none";
        }

        if (stopRecord) {
            stopRecord.style.display = "none";
        }


        try {
            await startCamera();
        }

        catch (error) {
            showCameraError(error);
        }

    });

}


/* =========================================================
   VIDEO MODE
========================================================= */

if (videoMode) {

    videoMode.addEventListener("click", async () => {

        currentMode = "video";

        videoMode.classList.add("active");

        if (photoMode) {
            photoMode.classList.remove("active");
        }


        if (takePhoto) {
            takePhoto.style.display = "none";
        }

        if (startRecord) {
            startRecord.style.display = "inline-flex";
        }

        if (stopRecord) {
            stopRecord.style.display = "none";
        }


        try {
            await startCamera();
        }

        catch (error) {
            showCameraError(error);
        }

    });

}


/* =========================================================
   TAKE PHOTO
========================================================= */

if (takePhoto) {

    takePhoto.addEventListener("click", () => {

        capturePhoto();

    });

}


function capturePhoto() {

    if (!cameraVideo || !cameraStream) {

        showCameraError(
            new Error("Camera is not ready.")
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


            selectedImage = file;
            selectedVideo = null;


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


/* =========================================================
   START RECORD
========================================================= */

if (startRecord) {

    startRecord.addEventListener(
        "click",
        () => startVideoRecording()
    );

}


function startVideoRecording() {

    if (!cameraStream) {

        addMessage(
            "⚠️ Camera is not ready.",
            "ai"
        );

        return;
    }


    if (!window.MediaRecorder) {

        addMessage(
            "❌ Video recording is not supported by this browser.",
            "ai"
        );

        return;
    }


    recordedChunks = [];


    let mimeType = "";


    const types = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm"
    ];


    for (const type of types) {

        if (MediaRecorder.isTypeSupported(type)) {

            mimeType = type;
            break;

        }

    }


    try {

        mediaRecorder =
            new MediaRecorder(
                cameraStream,
                mimeType
                    ? { mimeType }
                    : undefined
            );

    }

    catch (error) {

        console.error(error);

        addMessage(
            "❌ Unable to start video recording.",
            "ai"
        );

        return;
    }


    mediaRecorder.ondataavailable = (event) => {

        if (
            event.data &&
            event.data.size > 0
        ) {
            recordedChunks.push(event.data);
        }

    };


    mediaRecorder.onstop = () => {

        finishVideoRecording();

    };


    mediaRecorder.start();


    recordingSeconds = 0;

    updateRecordingTime();


    if (recordTime) {
        recordTime.classList.add("show");
    }


    if (startRecord) {
        startRecord.style.display = "none";
    }


    if (stopRecord) {
        stopRecord.style.display = "inline-flex";
    }


    recordingTimer =
        setInterval(() => {

            recordingSeconds++;

            updateRecordingTime();

        }, 1000);

}


/* =========================================================
   RECORD TIMER
========================================================= */

function updateRecordingTime() {

    if (!recordTime) return;


    const minutes =
        Math.floor(recordingSeconds / 60);

    const seconds =
        recordingSeconds % 60;


    recordTime.textContent =
        "🔴 " +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}


/* =========================================================
   STOP RECORD
========================================================= */

if (stopRecord) {

    stopRecord.addEventListener(
        "click",
        () => stopRecording()
    );

}


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


    if (recordTime) {
        recordTime.classList.remove("show");
    }


    if (startRecord) {
        startRecord.style.display = "inline-flex";
    }


    if (stopRecord) {
        stopRecord.style.display = "none";
    }

}


/* =========================================================
   FINISH VIDEO
========================================================= */

function finishVideoRecording() {

    if (!recordedChunks.length) {

        addMessage(
            "⚠️ No video was recorded.",
            "ai"
        );

        return;
    }


    const type =
        mediaRecorder?.mimeType ||
        "video/webm";


    const blob =
        new Blob(
            recordedChunks,
            {
                type
            }
        );


    const file =
        new File(
            [blob],
            `swiftcortex-video-${Date.now()}.webm`,
            {
                type
            }
        );


    selectedVideo = file;
    selectedImage = null;


    showAttachment(
        file,
        "video"
    );


    closeCamera();

}


/* =========================================================
   SWITCH CAMERA
========================================================= */

if (switchCamera) {

    switchCamera.addEventListener(
        "click",
        async () => {

            currentCamera =
                currentCamera === "user"
                    ? "environment"
                    : "user";


            try {

                await startCamera();

            }

            catch (error) {

                showCameraError(error);

            }

        }
    );

}


/* =========================================================
   FILE → DATA URL
========================================================= */

function fileToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = () => {

                resolve(reader.result);

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "Could not read file."
                    )
                );

            };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   VIDEO → FRAMES
========================================================= */

async function extractVideoFrames(file) {

    const video =
        document.createElement("video");


    const url =
        URL.createObjectURL(file);


    video.src = url;

    video.muted = true;

    video.playsInline = true;

    video.preload = "metadata";


    await new Promise(
        (resolve, reject) => {

            video.onloadedmetadata = resolve;

            video.onerror = () => {

                reject(
                    new Error(
                        "Could not load video."
                    )
                );

            };

        }
    );


    const duration = video.duration;
