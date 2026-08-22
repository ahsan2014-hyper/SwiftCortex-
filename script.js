/* =========================================================
   SwiftCortex AI Ultra
   NEW COMPLETE script.js
   ========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const $ = (id) => document.getElementById(id);

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

const pluginModal = $("pluginModal");


/* =========================================================
   STATE
========================================================= */

let selectedImage = null;
let selectedVideo = null;
let selectedFile = null;

let cameraStream = null;
let mediaRecorder = null;
let recordedChunks = [];

let currentCamera = "user";
let currentMode = "photo";

let recordingSeconds = 0;
let recordingTimer = null;

let isSending = false;
let thinkHarder = false;


/* =========================================================
   BASIC
========================================================= */

function exists(el) {
    return !!el;
}

function closePlusMenu() {
    if (plusMenu) {
        plusMenu.classList.remove("show");
    }
}


/* =========================================================
   PLUS MENU
========================================================= */

if (plusBtn && plusMenu) {

    plusBtn.addEventListener("click", function (e) {

        e.stopPropagation();

        plusMenu.classList.toggle("show");

    });

}


document.addEventListener("click", function (e) {

    if (!plusMenu) return;

    if (
        !plusMenu.contains(e.target) &&
        e.target !== plusBtn
    ) {
        closePlusMenu();
    }

});


/* =========================================================
   PHOTO BUTTON
========================================================= */

if (photoBtn && imageInput) {

    photoBtn.addEventListener("click", function (e) {

        e.preventDefault();
        e.stopPropagation();

        closePlusMenu();

        imageInput.value = "";

        setTimeout(() => {
            imageInput.click();
        }, 50);

    });

}


/* =========================================================
   IMAGE SELECT
========================================================= */

if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = this.files && this.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            showSystemMessage(
                "Please select an image.",
                "error"
            );

            return;
        }

        selectedImage = file;
        selectedVideo = null;
        selectedFile = null;

        showAttachment(file, "image");

    });

}


/* =========================================================
   FILE BUTTON
========================================================= */

if (fileBtn && fileInput) {

    fileBtn.addEventListener("click", function (e) {

        e.preventDefault();
        e.stopPropagation();

        closePlusMenu();

        fileInput.value = "";

        setTimeout(() => {
            fileInput.click();
        }, 50);

    });

}


/* =========================================================
   FILE SELECT
========================================================= */

if (fileInput) {

    fileInput.addEventListener("change", function () {

        const file = this.files && this.files[0];

        if (!file) return;

        selectedFile = file;

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

            selectedImage = null;
            selectedVideo = null;

            showFileAttachment(file);

        }

    });

}


/* =========================================================
   SHOW IMAGE / VIDEO ATTACHMENT
========================================================= */

function showAttachment(file, type) {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    const box = document.createElement("div");

    box.className = "swift-attachment";

    if (type === "image") {

        const img = document.createElement("img");

        img.src = URL.createObjectURL(file);

        img.style.maxWidth = "180px";
        img.style.maxHeight = "130px";
        img.style.borderRadius = "12px";
        img.style.objectFit = "cover";

        box.appendChild(img);

    }

    if (type === "video") {

        const video = document.createElement("video");

        video.src = URL.createObjectURL(file);

        video.controls = true;

        video.style.maxWidth = "220px";
        video.style.maxHeight = "130px";
        video.style.borderRadius = "12px";

        box.appendChild(video);

    }

    const name = document.createElement("span");

    name.textContent = "📎 " + file.name;

    name.style.marginLeft = "8px";

    const remove = document.createElement("button");

    remove.textContent = "✕";

    remove.type = "button";

    remove.style.marginLeft = "8px";

    remove.onclick = clearAttachment;

    box.appendChild(name);
    box.appendChild(remove);

    imagePreview.appendChild(box);

}


/* =========================================================
   OTHER FILE
========================================================= */

function showFileAttachment(file) {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    const box = document.createElement("div");

    box.className = "swift-attachment";

    box.textContent =
        "📄 " + file.name + " ";

    const remove = document.createElement("button");

    remove.textContent = "✕";

    remove.onclick = clearAttachment;

    box.appendChild(remove);

    imagePreview.appendChild(box);

}


/* =========================================================
   CLEAR ATTACHMENT
========================================================= */

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
   CAMERA OPEN
========================================================= */

if (cameraBtn) {

    cameraBtn.addEventListener("click", async function (e) {

        e.preventDefault();
        e.stopPropagation();

        closePlusMenu();

        await openCamera();

    });

}


async function openCamera() {

    if (!cameraModal) {

        showSystemMessage(
            "Camera interface is missing from HTML.",
            "error"
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

        try {
            await cameraVideo.play();
        } catch (e) {
            console.log(e);
        }

    }

}


/* =========================================================
   CAMERA ERROR
========================================================= */

function showCameraError(error) {

    if (!cameraError) return;

    cameraError.style.display = "flex";
    cameraError.classList.add("show");

    let message =
        "Camera permission is required.";

    if (error?.name === "NotAllowedError") {

        message =
            "Camera permission denied. Please allow camera access.";

    }

    else if (error?.name === "NotFoundError") {

        message =
            "No camera was found.";

    }

    else if (error?.name === "NotReadableError") {

        message =
            "Camera is being used by another application.";

    }

    else if (error?.message) {

        message = error.message;

    }

    if (cameraErrorText) {
        cameraErrorText.textContent = message;
    }

}


/* =========================================================
   CLOSE CAMERA
========================================================= */

if (cameraClose) {

    cameraClose.addEventListener("click", closeCamera);

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

        cameraStream.getTracks().forEach(
            track => track.stop()
        );

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

        if (recordTime) {
            recordTime.classList.remove("show");
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

    videoMode.addEventListener("click", async function () {

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

    takePhoto.addEventListener("click", capturePhoto);

}


function capturePhoto() {

    if (!cameraVideo || !cameraStream) {

        showSystemMessage(
            "Camera is not ready.",
            "error"
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

    canvas.toBlob(function (blob) {

        if (!blob) return;

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
        selectedFile = null;

        showAttachment(file, "image");

        closeCamera();

    }, "image/jpeg", 0.92);

}


/* =========================================================
   SWITCH CAMERA
========================================================= */

if (switchCamera) {

    switchCamera.addEventListener(
        "click",
        async function () {

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
   START VIDEO RECORD
========================================================= */

if (startRecord) {

    startRecord.addEventListener(
        "click",
        startVideoRecording
    );

}


function startVideoRecording() {

    if (!cameraStream) {

        showSystemMessage(
            "Camera is not ready.",
            "error"
        );

        return;

    }

    if (!window.MediaRecorder) {

        showSystemMessage(
            "Video recording is not supported.",
            "error"
        );

        return;

    }

    recordedChunks = [];

    let mimeType = "video/webm;codecs=vp9";

    if (!MediaRecorder.isTypeSupported(mimeType)) {

        mimeType = "video/webm";

    }

    try {

        mediaRecorder =
            new MediaRecorder(
                cameraStream,
                {
                    mimeType
                }
            );

    }

    catch (error) {

        console.error(error);

        showSystemMessage(
            "Could not start video recording.",
            "error"
        );

        return;

    }

    mediaRecorder.ondataavailable =
        function (event) {

            if (event.data && event.data.size) {

                recordedChunks.push(event.data);

            }

        };

    mediaRecorder.onstop =
        finishVideoRecording;

    mediaRecorder.start();

    if (startRecord) {
        startRecord.style.display = "none";
    }

    if (stopRecord) {
        stopRecord.style.display = "inline-flex";
    }

    if (recordTime) {
        recordTime.classList.add("show");
    }

    recordingSeconds = 0;

    updateRecordTime();

    recordingTimer =
        setInterval(function () {

            recordingSeconds++;

            updateRecordTime();

        }, 1000);

}


/* =========================================================
   RECORD TIME
========================================================= */

function updateRecordTime() {

    if (!recordTime) return;

    const min =
        Math.floor(recordingSeconds / 60);

    const sec =
        recordingSeconds % 60;

    recordTime.textContent =
        "🔴 " +
        String(min).padStart(2, "0") +
        ":" +
        String(sec).padStart(2, "0");

}


/* =========================================================
   STOP RECORD
========================================================= */

if (stopRecord) {

    stopRecord.addEventListener(
        "click",
        stopRecording
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

    if (!recordedChunks.length) return;

    const blob =
        new Blob(
            recordedChunks,
            {
                type:
                    mediaRecorder?.mimeType ||
                    "video/webm"
            }
        );

    const file =
        new File(
            [blob],
            "swiftcortex-video-" +
            Date.now() +
            ".webm",
            {
                type: blob.type
            }
        );

    selectedVideo = file;
    selectedImage = null;
    selectedFile = null;

    showAttachment(file, "video");

    if (recordTime) {
        recordTime.classList.remove("show");
    }

    closeCamera();

}


/* =========================================================
   FILE TO DATA URL
========================================================= */

function fileToDataURL(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                () => resolve(reader.result);

            reader.onerror =
                () =>
                    reject(
                        new Error(
                            "Could not read file."
                        )
                    );

            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   VIDEO FRAMES
========================================================= */

async function extractVideoFrames(file) {

    const url =
        URL.createObjectURL(file);

    const video =
        document.createElement("video");

    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    await new Promise((resolve, reject) => {

        video.onloadedmetadata = resolve;

        video.onerror = () =>
            reject(
                new Error(
                    "Could not load video."
                )
            );

    });

    const duration = video.duration;

    if (!duration || !isFinite(duration)) {

        URL.revokeObjectURL(url);

        return [];

    }

    const count =
        Math.min(
            5,
            Math.max(
                1,
                Math.ceil(duration / 5)
            )
        );

    const canvas =
        document.createElement("canvas");

    const ctx =
        canvas.getContext("2d");

    const frames = [];

    for (let i = 0; i < count; i++) {

        const time =
            count === 1
                ? 0
                : duration *
                  i /
                  (count - 1);

        await seekVideo(video, time);

        const width =
            video.videoWidth || 640;

       
