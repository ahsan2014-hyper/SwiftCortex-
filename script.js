/* =========================================================
   ⚡ SwiftCortex AI Ultra
   COMPLETE SCRIPT.JS
   Text + Image + Video + Camera + Files + Plugins
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

const newChat = $("newChat");
const historyList = $("historyList");
const themeBtn = $("themeBtn");


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

let recordingSeconds = 0;
let recordingTimer = null;

let sending = false;

let thinkHarder = false;


/* =========================================================
   SMALL HELPERS
========================================================= */

function closePlus() {
    if (plusMenu) {
        plusMenu.classList.remove("show");
    }
}


function scrollMessages() {
    if (!messages) return;

    requestAnimationFrame(() => {
        messages.scrollTop = messages.scrollHeight;
    });
}


function escapeText(text) {
    return String(text ?? "");
}


/* =========================================================
   PLUS MENU
========================================================= */

if (plusBtn && plusMenu) {

    plusBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        plusMenu.classList.toggle("show");

    });

}


document.addEventListener("click", (e) => {

    if (!plusMenu || !plusBtn) return;

    if (
        !plusMenu.contains(e.target) &&
        e.target !== plusBtn
    ) {
        closePlus();
    }

});


/* =========================================================
   PHOTOS
========================================================= */

if (photoBtn && imageInput) {

    photoBtn.addEventListener("click", (e) => {

        e.preventDefault();

        closePlus();

        imageInput.value = "";

        imageInput.click();

    });

}


if (imageInput) {

    imageInput.addEventListener("change", () => {

        const file = imageInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            addMessage(
                "⚠️ Please select a valid image.",
                "ai"
            );

            return;
        }

        selectedImage = file;
        selectedVideo = null;

        showSelectedMedia();

    });

}


/* =========================================================
   FILES
========================================================= */

if (fileBtn && fileInput) {

    fileBtn.addEventListener("click", (e) => {

        e.preventDefault();

        closePlus();

        fileInput.value = "";

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

            showSelectedMedia();

            return;
        }


        if (file.type.startsWith("video/")) {

            selectedVideo = file;
            selectedImage = null;

            showSelectedMedia();

            return;
        }


        /*
          Text files can be read directly.
        */

        if (
            file.type.startsWith("text/") ||
            /\.(txt|csv|json|md|js|html|css)$/i.test(file.name)
        ) {

            selectedImage = null;
            selectedVideo = null;

            showFileAttachment(file);

            return;
        }


        addMessage(
            "📄 Selected file: " + file.name +
            "\n\nThis file type is selected, but this version currently sends images, videos and text files to the AI.",
            "ai"
        );

    });

}


/* =========================================================
   SELECTED IMAGE / VIDEO PREVIEW
========================================================= */

function showSelectedMedia() {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    const box = document.createElement("div");

    box.className = "selected-media-box";

    if (selectedImage) {

        const img = document.createElement("img");

        img.src = URL.createObjectURL(selectedImage);

        img.style.maxWidth = "180px";
        img.style.maxHeight = "120px";
        img.style.borderRadius = "12px";
        img.style.objectFit = "cover";

        box.appendChild(img);

        const name = document.createElement("span");

        name.textContent =
            "📷 " + selectedImage.name;

        box.appendChild(name);
    }


    if (selectedVideo) {

        const video = document.createElement("video");

        video.src = URL.createObjectURL(selectedVideo);

        video.controls = true;

        video.style.maxWidth = "220px";
        video.style.maxHeight = "120px";
        video.style.borderRadius = "12px";

        box.appendChild(video);

        const name = document.createElement("span");

        name.textContent =
            "🎥 " + selectedVideo.name;

        box.appendChild(name);
    }


    const remove = document.createElement("button");

    remove.type = "button";

    remove.textContent = "✕";

    remove.onclick = clearAttachment;

    box.appendChild(remove);

    imagePreview.appendChild(box);

}


/* =========================================================
   TEXT FILE
========================================================= */

let selectedTextFile = null;


function showFileAttachment(file) {

    selectedTextFile = file;

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    const box = document.createElement("div");

    box.className = "selected-media-box";

    const name = document.createElement("span");

    name.textContent =
        "📄 " + file.name;

    box.appendChild(name);

    const remove = document.createElement("button");

    remove.textContent = "✕";

    remove.type = "button";

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
    selectedTextFile = null;

    if (imageInput) {
        imageInput.value = "";
    }

    if (fileInput) {
        fileInput.value = "";
    }

    if (imagePreview) {
        imagePreview.innerHTML = "";
    }

    if (mediaResult) {
        mediaResult.innerHTML = "";
    }

}


/* =========================================================
   CAMERA
========================================================= */

if (cameraBtn) {

    cameraBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        closePlus();

        await openCamera();

    });

}


async function openCamera() {

    if (!cameraModal) {

        addMessage(
            "⚠️ Camera interface was not found.",
            "ai"
        );

        return;
    }


    /*
      IMPORTANT:
      Your HTML uses .show
    */

    cameraModal.classList.add("show");

    if (cameraError) {
        cameraError.classList.remove("show");
        cameraError.style.display = "none";
    }


    try {

        await startCamera();

    } catch (error) {

        console.error("Camera:", error);

        showCameraError(error);

    }

}


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

        cameraVideo.srcObject =
            cameraStream;

        await cameraVideo.play();

    }

}


function showCameraError(error) {

    if (!cameraError) return;

    cameraError.classList.add("show");

    cameraError.style.display = "flex";


    let text =
        "Camera permission is required.";


    if (error?.name === "NotAllowedError") {

        text =
            "Camera permission was denied. Please allow camera permission in Chrome.";

    }

    else if (error?.name === "NotFoundError") {

        text =
            "No camera was found on this device.";

    }

    else if (error?.name === "NotReadableError") {

        text =
            "The camera is already being used by another application.";

    }

    else if (error?.message) {

        text = error.message;

    }


    if (cameraErrorText) {

        cameraErrorText.textContent = text;

    }

}


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


function closeCamera() {

    stopRecording();

    stopCamera();

    if (cameraModal) {

        /*
          IMPORTANT:
          HTML uses .show
        */

        cameraModal.classList.remove("show");

    }

}


if (cameraClose) {

    cameraClose.addEventListener("click", closeCamera);

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

        await startCamera();

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

        await startCamera();

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
        blob => {

            if (!blob) return;


            selectedImage =
                new File(
                    [blob],
                    "swiftcortex-photo-" +
                    Date.now() +
                    ".jpg",
                    {
                        type: "image/jpeg"
                    }
                );


            selectedVideo = null;

            showSelectedMedia();

            closeCamera();

        },
        "image/jpeg",
        0.92
    );

}


/* =========================================================
   VIDEO RECORDING
========================================================= */

if (startRecord) {

    startRecord.addEventListener(
        "click",
        startVideoRecording
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


    recordedChunks = [];


    let mimeType =
        "video/webm;codecs=vp9";


    if (
        !MediaRecorder.isTypeSupported(mimeType)
    ) {

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

    } catch (error) {

        addMessage(
            "❌ Video recording is not supported on this browser.",
            "ai"
        );

        return;
    }


    mediaRecorder.ondataavailable =
        event => {

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


    mediaRecorder.start();


    recordingSeconds = 0;

    updateRecordingTime();


    if (recordTime) {

        recordTime.classList.add("show");

    }


    recordingTimer =
        setInterval(() => {

            recordingSeconds++;

            updateRecordingTime();

        }, 1000);


    if (startRecord) {

        startRecord.style.display = "none";

    }


    if (stopRecord) {

        stopRecord.style.display = "inline-flex";

    }

}


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


    if (recordTime) {

        recordTime.classList.remove("show");

    }


    if (startRecord) {

        startRecord.style.display =
            "inline-flex";

    }


    if (stopRecord) {

        stopRecord.style.display =
            "none";

    }

}


function updateRecordingTime() {

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


function finishVideoRecording() {

    if (!recordedChunks.length) {

        addMessage(
            "⚠️ No video was recorded.",
            "ai"
        );

        return;
    }


    const blob =
        new Blob(
            recordedChunks,
            {
                type:
                    mediaRecorder?.mimeType ||
                    "video/webm"
            }
        );


    selectedVideo =
        new File(
            [blob],
            "swiftcortex-video-" +
            Date.now() +
            ".webm",
            {
                type: blob.type
            }
        );


    selectedImage = null;

    showSelectedMedia();

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

            } catch (error) {

                showCameraError(error);

            }

        }
    );

}


/* =========================================================
   FILE → BASE64
========================================================= */

function fileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = () => {

                const result =
                    reader.result;


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


                resolve(result);

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "Failed to read file."
                    )
                );

            };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   TEXT FILE → TEXT
========================================================= */

function readTextFile(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = () => {

                resolve(
                    String(reader.result || "")
                );

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "Could not read text file."
                    )
                );

            };


            reader.readAsText(file);

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

            video.onerror = () =>
                reject(
                    new Error(
                        "Could not load video."
                    )
                );

        }
    );


    const duration = video.duration;


    if (
        !duration ||
        !isFinite(duration)
    ) {

        URL.revokeObjectURL(url);

        return [];

    }


    /*
      Maximum 3 frames.
      This keeps the request smaller.
    */

    const count =
        Math.min(
            3,
            Math.max(
                1,
    
