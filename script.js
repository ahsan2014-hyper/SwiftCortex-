/* =========================================================
   SwiftCortex AI Ultra
   Complete script.js
   Text + Images + Files + Camera + Video
   Plugins + Think Harder
   ========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const $ = (id) => document.getElementById(id);

const plusBtn       = $("plusBtn");
const plusMenu      = $("plusMenu");

const cameraBtn     = $("cameraBtn");
const photoBtn      = $("photoBtn");
const fileBtn       = $("fileBtn");
const pluginBtn     = $("pluginBtn");
const thinkBtn      = $("thinkBtn");

const imageInput    = $("imageInput");
const fileInput     = $("fileInput");

const userInput     = $("userInput");
const sendBtn       = $("sendBtn");

const messages      = $("messages");
const imagePreview  = $("imagePreview");

const newChat       = $("newChat");
const themeBtn      = $("themeBtn");
const historyList   = $("historyList");

/* Camera */

const cameraModal   = $("cameraModal");
const cameraClose   = $("cameraClose");
const cameraVideo   = $("cameraVideo");
const cameraError   = $("cameraError");
const cameraErrorText = $("cameraErrorText");

const photoMode     = $("photoMode");
const videoMode     = $("videoMode");

const takePhoto     = $("takePhoto");
const startRecord   = $("startRecord");
const stopRecord    = $("stopRecord");

const switchCamera  = $("switchCamera");
const recordTime    = $("recordTime");
const mediaResult   = $("mediaResult");


/* =========================================================
   STATE
========================================================= */

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
let thinkHarder = false;


/* =========================================================
   SMALL HELPERS
========================================================= */

function exists(element) {
    return element !== null && element !== undefined;
}


function escapeText(text) {
    return String(text ?? "");
}


/* =========================================================
   PLUS MENU
========================================================= */

if (exists(plusBtn) && exists(plusMenu)) {

    plusBtn.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        plusMenu.classList.toggle("show");

    });

}


document.addEventListener("click", function (event) {

    if (!exists(plusMenu)) return;

    if (
        !plusMenu.contains(event.target) &&
        event.target !== plusBtn
    ) {
        plusMenu.classList.remove("show");
    }

});


function closePlusMenu() {

    if (exists(plusMenu)) {
        plusMenu.classList.remove("show");
    }

}


/* =========================================================
   PHOTO BUTTON
========================================================= */

if (exists(photoBtn) && exists(imageInput)) {

    photoBtn.addEventListener("click", function (event) {

        event.preventDefault();

        closePlusMenu();

        imageInput.click();

    });

}


/* =========================================================
   IMAGE INPUT
========================================================= */

if (exists(imageInput)) {

    imageInput.addEventListener("change", function () {

        const file = imageInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            showSystemMessage(
                "⚠️ Please select a valid image.",
                "ai"
            );

            imageInput.value = "";
            return;
        }

        selectedImage = file;
        selectedVideo = null;

        showAttachmentPreview(file, "image");

    });

}


/* =========================================================
   FILE BUTTON
========================================================= */

if (exists(fileBtn) && exists(fileInput)) {

    fileBtn.addEventListener("click", function (event) {

        event.preventDefault();

        closePlusMenu();

        fileInput.click();

    });

}


/* =========================================================
   FILE INPUT
========================================================= */

if (exists(fileInput)) {

    fileInput.addEventListener("change", function () {

        const file = fileInput.files?.[0];

        if (!file) return;

        if (file.type.startsWith("image/")) {

            selectedImage = file;
            selectedVideo = null;

            showAttachmentPreview(file, "image");

        }

        else if (file.type.startsWith("video/")) {

            selectedVideo = file;
            selectedImage = null;

            showAttachmentPreview(file, "video");

        }

        else {

            showAttachmentPreview(file, "file");

        }

    });

}


/* =========================================================
   CAMERA BUTTON
========================================================= */

if (exists(cameraBtn)) {

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

    if (!exists(cameraModal)) return;

    cameraModal.classList.add("show");

    if (exists(cameraError)) {
        cameraError.classList.remove("show");
    }

    try {

        await startCamera();

    } catch (error) {

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

    if (exists(cameraVideo)) {

        cameraVideo.srcObject = cameraStream;

        try {
            await cameraVideo.play();
        } catch (error) {
            console.log("Video autoplay:", error);
        }

    }

}


/* =========================================================
   CAMERA ERROR
========================================================= */

function showCameraError(error) {

    if (!exists(cameraError)) return;

    cameraError.classList.add("show");

    let message =
        "Camera permission is required.";

    if (error?.name === "NotAllowedError") {

        message =
            "Camera permission was denied. Please allow camera access.";

    }

    else if (error?.name === "NotFoundError") {

        message =
            "No camera was found on this device.";

    }

    else if (error?.name === "NotReadableError") {

        message =
            "The camera is already being used by another application.";

    }

    else if (error?.message) {

        message = error.message;

    }

    if (exists(cameraErrorText)) {
        cameraErrorText.textContent = message;
    }

}


/* =========================================================
   CLOSE CAMERA
========================================================= */

if (exists(cameraClose)) {

    cameraClose.addEventListener("click", function () {

        closeCamera();

    });

}


function closeCamera() {

    stopRecording();
    stopCamera();

    if (exists(cameraModal)) {
        cameraModal.classList.remove("show");
    }

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });

        cameraStream = null;

    }

    if (exists(cameraVideo)) {
        cameraVideo.srcObject = null;
    }

}


/* =========================================================
   PHOTO MODE
========================================================= */

if (exists(photoMode)) {

    photoMode.addEventListener("click", async function () {

        cameraMode = "photo";

        photoMode.classList.add("active");

        if (exists(videoMode)) {
            videoMode.classList.remove("active");
        }

        if (exists(takePhoto)) {
            takePhoto.style.display = "inline-flex";
        }

        if (exists(startRecord)) {
            startRecord.style.display = "none";
        }

        if (exists(stopRecord)) {
            stopRecord.style.display = "none";
        }

        if (exists(recordTime)) {
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

if (exists(videoMode)) {

    videoMode.addEventListener("click", async function () {

        cameraMode = "video";

        videoMode.classList.add("active");

        if (exists(photoMode)) {
            photoMode.classList.remove("active");
        }

        if (exists(takePhoto)) {
            takePhoto.style.display = "none";
        }

        if (exists(startRecord)) {
            startRecord.style.display = "inline-flex";
        }

        if (exists(stopRecord)) {
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

if (exists(takePhoto)) {

    takePhoto.addEventListener("click", function () {

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

    const canvas = document.createElement("canvas");

    const width =
        cameraVideo.videoWidth || 1280;

    const height =
        cameraVideo.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

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

            showSystemMessage(
                "⚠️ Could not capture photo.",
                "ai"
            );

            return;
        }

        const file = new File(
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

        showAttachmentPreview(file, "image");

        closeCamera();

    }, "image/jpeg", 0.92);

}


/* =========================================================
   SWITCH CAMERA
========================================================= */

if (exists(switchCamera)) {

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
   START VIDEO RECORDING
========================================================= */

if (exists(startRecord)) {

    startRecord.addEventListener("click", function () {

        startVideoRecording();

    });

}


function getSupportedMimeType() {

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


function startVideoRecording() {

    if (!cameraStream) {

        showSystemMessage(
            "⚠️ Camera is not ready.",
            "ai"
        );

        return;

    }

    if (!window.MediaRecorder) {

        showSystemMessage(
            "❌ Video recording is not supported by this browser.",
            "ai"
        );

        return;

    }

    recordedChunks = [];

    const mimeType = getSupportedMimeType();

    try {

        mediaRecorder =
            mimeType
                ? new MediaRecorder(
                    cameraStream,
                    { mimeType }
                )
                : new MediaRecorder(cameraStream);

    } catch (error) {

        console.error(error);

        showSystemMessage(
            "❌ Could not start video recording.",
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

                recordedChunks.push(event.data);

            }

        };


    mediaRecorder.onstop =
        function () {

            finishVideoRecording();

        };


    mediaRecorder.start(250);

    recordingSeconds = 0;

    updateRecordingTime();

    if (exists(recordTime)) {
        recordTime.classList.add("show");
    }

    if (exists(startRecord)) {
        startRecord.style.display = "none";
    }

    if (exists(stopRecord)) {
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

    if (!exists(recordTime)) return;

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
   STOP RECORDING BUTTON
========================================================= */

if (exists(stopRecord)) {

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

    if (exists(stopRecord)) {
        stopRecord.style.display = "none";
    }

}


/* =========================================================
   FINISH VIDEO
========================================================= */

function finishVideoRecording() {

    if (!recordedChunks.length) {

        showSystemMessage(
            "⚠️ No video was recorded.",
            "ai"
        );

        return;

    }

    const mime =
        mediaRecorder?.mimeType ||
        "video/webm";

    const blob =
        new Blob(
            recordedChunks,
            { type: mime }
        );

    const file =
        new File(
            [blob],
            "swiftcortex-video-" +
            Date.now() +
            ".webm",
            {
                type: mime
            }
        );

    selectedVideo = file;
    selectedImage = null;

    showAttachmentPreview(
        file,
        "video"
    );

    closeCamera();

}


/* =========================================================
   ATTACHMENT PREVIEW
========================================================= */

function showAttachmentPreview(file, type) {

    if (!exists(imagePreview)) return;

    imagePreview.innerHTML = "";

    const wrapper =
        document.createElement("div");

    wrapper.className = "media-ready";

    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.style.maxWidth = "180px";
        img.style.maxHeight = "140px";
        img.style.borderRadius = "12px";
        img.style.objectFit = "cover";

        wrapper.appendChild(img);

        const label =
            document.createElement("div");

        label.textContent =
            "🖼 " + file.name;

        wrapper.appendChild(label);

    }

    else if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(file);

        video.controls = true;

        video.muted = true;

        video.style.maxWidth = "220px";
        video.style.maxHeight = "140px";
        video.style.borderRadius = "12px";

        wrapper.appendChild(video);

        const label =
            document.createElement("div");

        label.textContent =
            "🎥 " + file.name;

        wrapper.appendChild(label);

    }

    else {

        const label =
            document.createElement("div");

        label.textContent =
            "📄 " + file.name;

        wrapper.appendChild(label);

    }


    const remove =
        document.createElement("button");

    remove.type = "button";
    remove.textContent = "✕ Remove";

    remove.style.marginTop = "8px";
    remove.style.cursor = "pointer";

    remove.addEventListener("click", function () {

        clearAttachment();

    });

    wrapper.appendChild(remove);

    imagePreview.appendChild(wrapper);

}


/* =========================================================
   CLEAR ATTACHMENT
========================================================= */

function clearAttachment() {

    selectedImage = null;
    selectedVideo = null;

    if (exists(imageInput)) {
        imageInput.value = "";
    }

    if (exists(fileInput)) {
        fileInput.value = "";
    }

    if (exists(imagePreview)) {
        imagePreview.innerHTML = "";
    }

}


/* =========================================================
   FILE → BASE64
========================================================= */

function fileToBase64(file) {

    return new Promise(function (resolve, reject) {

        const reader =
            new FileReader();

        reader.onload = function () {

            const result = reader.result;

            if (
                typeof result !== "string"
            ) {

                reject(
                    new Error(
                        "Could not read file."
                    )
                );

                return;

            }

            const comma =
                result.indexOf(",");

            resolve(
                comma >= 0
                    ? result.substring(comma + 1)
                    : result
            );

        };

        reader.onerror = function () {

            reject(
                new Error(
                    "Failed to read file."
                )
            );

        };

        reader.readAsDataURL(file);

    });

}


/* =========================================================
   
