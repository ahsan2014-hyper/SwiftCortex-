/* =========================================================
   SwiftCortex AI Ultra
   Complete script.js
   Text + Image + Video + Camera
========================================================= */

const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const plusBtn = document.getElementById("plusBtn");
const plusMenu = document.getElementById("plusMenu");

const cameraBtn = document.getElementById("cameraBtn");
const photoBtn = document.getElementById("photoBtn");
const fileBtn = document.getElementById("fileBtn");
const pluginBtn = document.getElementById("pluginBtn");
const thinkBtn = document.getElementById("thinkBtn");

const imageInput = document.getElementById("imageInput");
const fileInput = document.getElementById("fileInput");

const messages = document.getElementById("messages");
const imagePreview = document.getElementById("imagePreview");

const cameraModal = document.getElementById("cameraModal");
const cameraClose = document.getElementById("cameraClose");
const cameraVideo = document.getElementById("cameraVideo");
const cameraError = document.getElementById("cameraError");
const cameraErrorText = document.getElementById("cameraErrorText");

const photoMode = document.getElementById("photoMode");
const videoMode = document.getElementById("videoMode");

const takePhoto = document.getElementById("takePhoto");
const startRecord = document.getElementById("startRecord");
const stopRecord = document.getElementById("stopRecord");

const switchCamera = document.getElementById("switchCamera");
const recordTime = document.getElementById("recordTime");
const mediaResult = document.getElementById("mediaResult");


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

        plusMenu.classList.remove("show");

    }

});


/* =========================================================
   PHOTO BUTTON
========================================================= */

if (photoBtn && imageInput) {

    photoBtn.addEventListener("click", function () {

        plusMenu?.classList.remove("show");

        imageInput.click();

    });

}


/* =========================================================
   IMAGE SELECT
========================================================= */

if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = this.files?.[0];

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

        showAttachment(file, "image");

    });

}


/* =========================================================
   FILE BUTTON
========================================================= */

if (fileBtn && fileInput) {

    fileBtn.addEventListener("click", function () {

        plusMenu?.classList.remove("show");

        fileInput.click();

    });

}


/* =========================================================
   FILE SELECT
========================================================= */

if (fileInput) {

    fileInput.addEventListener("change", function () {

        const file = this.files?.[0];

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

            addMessage(
                "📄 Selected file: " + file.name,
                "user"
            );

        }

    });

}


/* =========================================================
   CAMERA BUTTON
========================================================= */

if (cameraBtn) {

    cameraBtn.addEventListener("click", async function () {

        plusMenu?.classList.remove("show");

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

        await cameraVideo.play();

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
            "No camera was found.";

    }

    else if (error?.name === "NotReadableError") {

        text =
            "Camera is already being used by another application.";

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

    cameraClose.addEventListener("click", closeCamera);

}


function closeCamera() {

    stopRecording();
    stopCamera();

    cameraModal?.classList.remove("show");

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

    photoMode.addEventListener("click", async function () {

        currentMode = "photo";

        photoMode.classList.add("active");
        videoMode?.classList.remove("active");

        takePhoto.style.display = "inline-flex";
        startRecord.style.display = "none";
        stopRecord.style.display = "none";

        recordTime?.classList.remove("show");

        await startCamera();

    });

}


/* =========================================================
   VIDEO MODE
========================================================= */

if (videoMode) {

    videoMode.addEventListener("click", async function () {

        currentMode = "video";

        videoMode.classList.add("active");
        photoMode?.classList.remove("active");

        takePhoto.style.display = "none";
        startRecord.style.display = "inline-flex";
        stopRecord.style.display = "none";

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


    const canvas = document.createElement("canvas");

    canvas.width =
        cameraVideo.videoWidth || 1280;

    canvas.height =
        cameraVideo.videoHeight || 720;


    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        cameraVideo,
        0,
        0,
        canvas.width,
        canvas.height
    );


    canvas.toBlob(function (blob) {

        if (!blob) return;

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

        showAttachment(file, "image");

        closeCamera();

    }, "image/jpeg", 0.92);

}


/* =========================================================
   START VIDEO
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
        !MediaRecorder.isTypeSupported(
            mimeType
        )
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
            "❌ Video recording is not supported.",
            "ai"
        );

        return;

    }


    mediaRecorder.ondataavailable =
        function (event) {

            if (event.data?.size > 0) {

                recordedChunks.push(
                    event.data
                );

            }

        };


    mediaRecorder.onstop =
        finishVideoRecording;


    mediaRecorder.start();


    startRecord.style.display = "none";
    stopRecord.style.display = "inline-flex";

    recordingSeconds = 0;

    recordTime?.classList.add("show");

    updateRecordingTime();


    recordingTimer =
        setInterval(function () {

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
   STOP VIDEO
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


    startRecord.style.display = "inline-flex";
    stopRecord.style.display = "none";

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

    showAttachment(file, "video");

    closeCamera();

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

            } catch (error) {

                showCameraError(error);

            }

        }
    );

}


/* =========================================================
   ATTACHMENT PREVIEW
========================================================= */

function showAttachment(file, type) {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";


    const box =
        document.createElement("div");

    box.className = "attachment-preview";


    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.alt = file.name;

        box.appendChild(img);

    }


    if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(file);

        video.controls = true;

        video.muted = true;

        box.appendChild(video);

    }


    const name =
        document.createElement("span");

    name.textContent =
        "📎 " + file.name;


    const remove =
        document.createElement("button");

    remove.type = "button";

    remove.textContent = "✕";


    remove.onclick = clearAttachment;


    box.appendChild(name);
    box.appendChild(remove);

    imagePreview.appendChild(box);

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
   FILE TO BASE64 DATA URL
========================================================= */

function fileToDataURL(file) {

    return new Promise(function (resolve, reject) {

        const reader = new FileReader();

        reader.onload = function () {

            resolve(reader.result);

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
   VIDEO FRAMES
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


    await new Promise(function (resolve, reject) {

        video.onloadedmetadata = resolve;

        video.onerror = function () {

            reject(
                new Error(
                    "Could not load video."
                )
            );

        };

    });


    const duration = video.duration;

    if (!duration || !isFinite(duration)) {

        URL.revokeObjectURL(url);

        return [];

    }


    /*
      Qwen 3.6 supports up to 3 images
      in a vision request, so use 3 frames.
    */

    const frameCount = 3;

    const canvas =
        document.createElement("canvas");

    const ctx =
        canvas.getContext("2d");


    const frames = [];


    for (let i = 0; i < frameCount; i++) {

        const time =
            frameCount === 1
                ? 0
                : duration * i /
                  (frameCount - 1);


        await seekVideo(
            video,
            time
        );


        const width =
            video.videoWidth || 640;

        const height =
            video.videoHeight || 360;


        const maxWidth = 640;

        const scale =
            Math.min(
                1,
                maxWidth / width
            );


        canvas.width =
            Math.round(
                width * scale
            );

        canvas.height =
            Math.round(
                height * scale
            );


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


        frames.push(dataURL);

    }


    URL.revokeObjectURL(url);

    return frames;

}


/* =========================================================
   SEEK VIDEO
========================================================= */

function seekVideo(video, time) {

    return new Promise(function (resolve) {

        const done = function () {

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


        video.currentTime = time;

    });

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (isSending) return;


    const text =
        userInput?.value.trim() || "";


    if (
        !text &&
        !selectedImage &&
        !selectedVideo
    ) {

        return;

    }


    isSending = true;


    const imageFile = selectedImage;
    const videoFile = selectedVideo;


    /*
      Keep the user's attachment visible.
    */

    let videoPreviewURL = null;

    if (videoFile) {

        videoPreviewURL =
            URL.createObjectURL(
                videoFile
            );

    }


    /*
      Extract video frames BEFORE
      clearing the attachment.
    */

    let videoFrames = [];


    if (videoFile) {

        try {

            videoFrames =
                await extractVideoFrames(
                    videoFile
                );

       
