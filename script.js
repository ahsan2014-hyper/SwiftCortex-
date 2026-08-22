"use strict";

/* =========================================================
   SwiftCortex AI Ultra
   COMPLETE script.js

   Features:
   ✅ Normal text chat
   ✅ Plus menu
   ✅ Camera photo
   ✅ Camera video
   ✅ Front/back camera
   ✅ Photos
   ✅ Files
   ✅ Image + description
   ✅ Video + description
   ✅ Plugins menu
   ✅ Think Harder
   ✅ Enter to send
   ✅ Attachment preview
   ✅ Vercel /api/gemini
========================================================= */


/* =========================================================
   ELEMENT HELPER
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   MAIN ELEMENTS
========================================================= */

const plusBtn      = $("plusBtn");
const plusMenu     = $("plusMenu");

const cameraBtn    = $("cameraBtn");
const photoBtn     = $("photoBtn");
const fileBtn      = $("fileBtn");
const pluginBtn    = $("pluginBtn");
const thinkBtn     = $("thinkBtn");

const imageInput   = $("imageInput");
const fileInput    = $("fileInput");

const userInput    = $("userInput");
const sendBtn      = $("sendBtn");

const messages     = $("messages");
const imagePreview = $("imagePreview");

const newChat      = $("newChat");
const themeBtn     = $("themeBtn");
const historyList  = $("historyList");


/* =========================================================
   CAMERA ELEMENTS
========================================================= */

const cameraModal     = $("cameraModal");
const cameraClose     = $("cameraClose");
const cameraVideo     = $("cameraVideo");

const cameraError     = $("cameraError");
const cameraErrorText = $("cameraErrorText");

const photoMode       = $("photoMode");
const videoMode       = $("videoMode");

const takePhoto       = $("takePhoto");
const startRecord     = $("startRecord");
const stopRecord      = $("stopRecord");

const switchCamera    = $("switchCamera");
const recordTime      = $("recordTime");
const mediaResult     = $("mediaResult");


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


/* =========================================================
   BASIC HELPERS
========================================================= */

function closePlusMenu() {

    if (plusMenu) {
        plusMenu.classList.remove("show");
    }

}


function showText(text, sender = "ai") {

    if (!messages) return null;

    const box = document.createElement("div");

    box.className =
        sender === "user"
            ? "user-message"
            : "ai-message";

    box.textContent = text;

    messages.appendChild(box);

    scrollMessages();

    return box;

}


function scrollMessages() {

    if (!messages) return;

    requestAnimationFrame(() => {

        messages.scrollTop =
            messages.scrollHeight;

    });

}


/* =========================================================
   PLUS MENU
========================================================= */

if (plusBtn && plusMenu) {

    plusBtn.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        plusMenu.classList.toggle("show");

    });

}


document.addEventListener("click", function (event) {

    if (!plusMenu) return;

    if (
        event.target !== plusBtn &&
        !plusMenu.contains(event.target)
    ) {

        closePlusMenu();

    }

});


/* =========================================================
   PHOTO BUTTON
========================================================= */

if (photoBtn && imageInput) {

    photoBtn.addEventListener("click", function (event) {

        event.preventDefault();

        closePlusMenu();

        imageInput.value = "";

        imageInput.click();

    });

}


/* =========================================================
   IMAGE SELECTED
========================================================= */

if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = this.files && this.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            showText(
                "⚠️ Please select a valid image.",
                "ai"
            );

            return;

        }

        selectedImage = file;
        selectedVideo = null;

        showAttachment(file, "image");

    });

}


/* =========================================================
   FILE BUTTON
========================================================= */

if (fileBtn && fileInput) {

    fileBtn.addEventListener("click", function (event) {

        event.preventDefault();

        closePlusMenu();

        fileInput.value = "";

        fileInput.click();

    });

}


/* =========================================================
   FILE SELECTED
========================================================= */

if (fileInput) {

    fileInput.addEventListener("change", function () {

        const file = this.files && this.files[0];

        if (!file) return;


        /* IMAGE */

        if (file.type.startsWith("image/")) {

            selectedImage = file;
            selectedVideo = null;

            showAttachment(file, "image");

            return;

        }


        /* VIDEO */

        if (file.type.startsWith("video/")) {

            selectedVideo = file;
            selectedImage = null;

            showAttachment(file, "video");

            return;

        }


        /* OTHER FILE */

        showAttachment(file, "file");

    });

}


/* =========================================================
   SHOW ATTACHMENT
========================================================= */

function showAttachment(file, type) {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    const wrapper =
        document.createElement("div");

    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "10px";
    wrapper.style.padding = "8px";
    wrapper.style.margin = "5px 0";
    wrapper.style.borderRadius = "12px";
    wrapper.style.background = "#111827";


    /* IMAGE */

    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.style.width = "65px";
        img.style.height = "65px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "10px";

        wrapper.appendChild(img);

    }


    /* VIDEO */

    if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(file);

        video.muted = true;
        video.controls = true;

        video.style.width = "100px";
        video.style.height = "65px";
        video.style.objectFit = "cover";
        video.style.borderRadius = "10px";

        wrapper.appendChild(video);

    }


    const info =
        document.createElement("div");

    info.style.flex = "1";

    info.style.color = "white";

    info.textContent =
        type === "image"
            ? "🖼 " + file.name
            : type === "video"
                ? "🎥 " + file.name
                : "📄 " + file.name;

    wrapper.appendChild(info);


    const remove =
        document.createElement("button");

    remove.type = "button";

    remove.textContent = "✕";

    remove.style.border = "none";
    remove.style.background = "#374151";
    remove.style.color = "white";
    remove.style.borderRadius = "8px";
    remove.style.padding = "7px 10px";
    remove.style.cursor = "pointer";

    remove.onclick = function () {

        clearAttachment();

    };


    wrapper.appendChild(remove);

    imagePreview.appendChild(wrapper);

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

    if (imagePreview) {
        imagePreview.innerHTML = "";
    }

}


/* =========================================================
   CAMERA BUTTON
========================================================= */

if (cameraBtn) {

    cameraBtn.addEventListener("click", async function (event) {

        event.preventDefault();

        closePlusMenu();

        await openCamera();

    });

}


/* =========================================================
   OPEN CAMERA
========================================================= */

async function openCamera() {

    if (!cameraModal) return;

    cameraModal.classList.add("show");

    if (cameraError) {
        cameraError.classList.remove("show");
    }

    try {

        await startCamera();

    } catch (error) {

        console.error("Camera:", error);

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

        try {

            await cameraVideo.play();

        } catch (error) {

            console.log(error);

        }

    }

}


/* =========================================================
   CAMERA ERROR
========================================================= */

function showCameraError(error) {

    if (!cameraError) return;

    cameraError.classList.add("show");

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

        cameraErrorText.textContent =
            text;

    }

}


/* =========================================================
   CLOSE CAMERA
========================================================= */

if (cameraClose) {

    cameraClose.addEventListener("click", function () {

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

        cameraStream
            .getTracks()
            .forEach(track => track.stop());

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

    photoMode.addEventListener("click", async function () {

        currentCameraMode = "photo";

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

        if (recordTime) {
            recordTime.classList.remove("show");
        }

        try {

            await startCamera();

        } catch (error) {

            showCameraError(error);

        }

    });

}


/* =========================================================
   VIDEO MODE
========================================================= */

if (videoMode) {

    videoMode.addEventListener("click", async function () {

        currentCameraMode = "video";

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

        } catch (error) {

            showCameraError(error);

        }

    });

}


/* =========================================================
   TAKE PHOTO
========================================================= */

if (takePhoto) {

    takePhoto.addEventListener("click", function () {

        capturePhoto();

    });

}


/* =========================================================
   CAPTURE PHOTO
========================================================= */

function capturePhoto() {

    if (!cameraVideo || !cameraStream) {

        showText(
            "⚠️ Camera is not ready.",
            "ai"
        );

        return;

    }


    const canvas =
        document.createElement("canvas");

    const width =
        cameraVideo.videoWidth || 1280;

    const height =
        cameraVideo.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;


    const ctx =
        canvas.getContext("2d");

    if (!ctx) return;


    ctx.drawImage(
        cameraVideo,
        0,
        0,
        width,
        height
    );


    canvas.toBlob(function (blob) {

        if (!blob) {

            showText(
                "⚠️ Could not capture photo.",
                "ai"
            );

            return;

        }


        const file =
            new File(
                [blob],
                "swiftcortex-photo-" +
                Date.now() +
                ".jpg",
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

    }, "image/jpeg", 0.92);

}


/* =========================================================
   SWITCH CAMERA
========================================================= */

if (switchCamera) {

    switchCamera.addEventListener("click", async function () {

        cameraFacing =
            cameraFacing === "user"
                ? "environment"
                : "user";

        try {

            await startCamera();

        } catch (error) {

            showCameraError(error);

        }

    });

}


/* =========================================================
   VIDEO RECORDING
========================================================= */

if (startRecord) {

    startRecord.addEventListener("click", function () {

        startVideoRecording();

    });

}


function getVideoMimeType() {

    const types = [

        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"

    ];


    for (const type of types) {

        if (
            window.MediaRecorder &&
            MediaRecorder.isTypeSupported(type)
        ) {

            return type;

        }

    }


    return "";

}


/* =========================================================
   START RECORDING
========================================================= */

function startVideoRecording() {

    if (!cameraStream) {

        showText(
            "⚠️ Camera is not ready.",
            "ai"
        );

        return;

    }


    if (!window.MediaRecorder) {

        showText(
            "❌ Video recording is not supported.",
            "ai"
        );

        return;

    }


    recordedChunks = [];


    const mimeType =
        getVideoMimeType();


    try {

        mediaRecorder =
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

        showText(
            "❌ Could not start recording.",
            "ai"
        );

        return;

    }


    mediaRecorder.ondataavailable =
        function (event) {

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
        function () {

            finishVideo();

        };


    mediaRecorder.start(250);


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
        setInterval(function () {

            recordingSeconds++;

            updateRecordingTime();

        }, 1000);

}


/* =========================================================
   RECORDING TIME
========================================================= */

function updateRecordingTime() {

    if (!recordTime) return;

    const minutes =
        Math.floor(
            recordingSeconds / 60
        );

    const seconds =
        recordingSeconds % 60;


    recordTime.textContent =
        "🔴 " +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}


/* =========================================================
   STOP RECORDING BUTTON
========================================================= */

if (stopRecord) {

    stopRecord.addEventListener("click", function () {

        stopRecording();

    });

}


function stopRecording() {

    if (recordingTimer) {

        clearInterval(recordingTimer);

        recordingTimer = null;

    }


    if (
        mediaRecorder &&
        mediaRecorder.state !== "inactive"
    ) {

        mediaRecorder.stop();

    }


    if (stopRecord) {
        stopRecord.style.display = "none";
    }


    if (recordTime) {
        recordTime.classList.remove("show");
    }

}


/* =========================================================
   FINISH VIDEO
========================================================= */

function finishVideo() {

    if (!recordedChunks.length) {

        showText(
            "⚠️ No video was recorded.",
            "ai"
        );

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


    const file =
        new File(
            [blob],
            "swiftcortex-vid
