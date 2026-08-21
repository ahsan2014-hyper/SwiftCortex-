/* =========================================================
   SwiftCortex AI Ultra
   Complete script.js
   Text + Image + Video + Camera + File + Plus Menu
========================================================= */


/* =========================================================
   ELEMENTS
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

const cameraModal = document.getElementById("cameraModal");
const cameraClose = document.getElementById("cameraClose");

const cameraVideo = document.getElementById("cameraVideo");
const cameraError = document.getElementById("cameraError");
const cameraErrorText =
    document.getElementById("cameraErrorText");

const photoMode = document.getElementById("photoMode");
const videoMode = document.getElementById("videoMode");

const takePhoto = document.getElementById("takePhoto");
const startRecord = document.getElementById("startRecord");
const stopRecord = document.getElementById("stopRecord");

const switchCamera = document.getElementById("switchCamera");

const recordTime =
    document.getElementById("recordTime");

const mediaResult =
    document.getElementById("mediaResult");


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


/* =========================================================
   BASIC HELPERS
========================================================= */

function safeElement(element) {
    return element !== null && element !== undefined;
}


/* =========================================================
   PLUS MENU
========================================================= */

if (safeElement(plusBtn) && safeElement(plusMenu)) {

    plusBtn.addEventListener("click", function (event) {

        event.stopPropagation();

        plusMenu.classList.toggle("show");

    });

}


/* Close Plus Menu when clicking outside */

document.addEventListener("click", function (event) {

    if (!safeElement(plusMenu)) {
        return;
    }

    if (
        !plusMenu.contains(event.target) &&
        event.target !== plusBtn
    ) {
        plusMenu.classList.remove("show");
    }

});


/* =========================================================
   PHOTOS
========================================================= */

if (safeElement(photoBtn) && safeElement(imageInput)) {

    photoBtn.addEventListener("click", function () {

        if (plusMenu) {
            plusMenu.classList.remove("show");
        }

        imageInput.click();

    });

}


/* =========================================================
   IMAGE SELECT
========================================================= */

if (safeElement(imageInput)) {

    imageInput.addEventListener(
        "change",
        function () {

            const file = this.files?.[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {

                addMessage(
                    "⚠️ Please select a valid image.",
                    "ai"
                );

                return;
            }

            selectedImage = file;
            selectedVideo = null;

            showAttachmentPreview(
                file,
                "image"
            );

        }
    );

}


/* =========================================================
   FILE BUTTON
========================================================= */

if (safeElement(fileBtn) && safeElement(fileInput)) {

    fileBtn.addEventListener("click", function () {

        if (plusMenu) {
            plusMenu.classList.remove("show");
        }

        fileInput.click();

    });

}


/* =========================================================
   FILE SELECT
========================================================= */

if (safeElement(fileInput)) {

    fileInput.addEventListener(
        "change",
        function () {

            const file = this.files?.[0];

            if (!file) {
                return;
            }

            /*
              Allow image and video files.
            */

            if (file.type.startsWith("image/")) {

                selectedImage = file;
                selectedVideo = null;

                showAttachmentPreview(
                    file,
                    "image"
                );

            } else if (file.type.startsWith("video/")) {

                selectedVideo = file;
                selectedImage = null;

                showAttachmentPreview(
                    file,
                    "video"
                );

            } else {

                addMessage(
                    "📄 File selected: " +
                    file.name,
                    "user"
                );

                /*
                  Other file types can later
                  be connected to your backend.
                */

            }

        }
    );

}


/* =========================================================
   CAMERA BUTTON
========================================================= */

if (safeElement(cameraBtn)) {

    cameraBtn.addEventListener(
        "click",
        async function () {

            if (plusMenu) {
                plusMenu.classList.remove("show");
            }

            await openCamera();

        }
    );

}


/* =========================================================
   OPEN CAMERA
========================================================= */

async function openCamera() {

    if (!safeElement(cameraModal)) {
        return;
    }

    cameraModal.classList.add("active");

    if (cameraError) {
        cameraError.style.display = "none";
    }

    try {

        await startCamera();

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

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

        cameraVideo.srcObject =
            cameraStream;

        await cameraVideo.play();

    }

}


/* =========================================================
   CAMERA ERROR
========================================================= */

function showCameraError(error) {

    if (!cameraError) {
        return;
    }

    cameraError.style.display = "flex";

    let message =
        "Camera permission is required.";

    if (error && error.name === "NotAllowedError") {

        message =
            "Camera permission was denied. Please allow camera access in your browser.";

    } else if (
        error &&
        error.name === "NotFoundError"
    ) {

        message =
            "No camera was found on this device.";

    } else if (
        error &&
        error.name === "NotReadableError"
    ) {

        message =
            "The camera is already being used by another application.";

    } else if (error && error.message) {

        message = error.message;

    }

    if (cameraErrorText) {
        cameraErrorText.textContent =
            message;
    }

}


/* =========================================================
   CLOSE CAMERA
========================================================= */

if (safeElement(cameraClose)) {

    cameraClose.addEventListener(
        "click",
        function () {

            closeCamera();

        }
    );

}


/* =========================================================
   CLOSE CAMERA FUNCTION
========================================================= */

function closeCamera() {

    stopRecording();

    stopCamera();

    if (cameraModal) {
        cameraModal.classList.remove("active");
    }

}


/* =========================================================
   STOP CAMERA STREAM
========================================================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function (track) {

                track.stop();

            });

        cameraStream = null;

    }

    if (cameraVideo) {
        cameraVideo.srcObject = null;
    }

}


/* =========================================================
   CAMERA MODE - PHOTO
========================================================= */

if (safeElement(photoMode)) {

    photoMode.addEventListener(
        "click",
        async function () {

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

        }
    );

}


/* =========================================================
   CAMERA MODE - VIDEO
========================================================= */

if (safeElement(videoMode)) {

    videoMode.addEventListener(
        "click",
        async function () {

            currentMode = "video";

            videoMode.classList.add("active");

            if (photoMode) {
                photoMode.classList.remove("active");
            }

            if (takePhoto) {
                takePhoto.style.display = "none";
            }

            if (startRecord) {
                startRecord.style.display =
                    "inline-flex";
            }

            if (stopRecord) {
                stopRecord.style.display = "none";
            }

            await startCamera();

        }
    );

}


/* =========================================================
   TAKE PHOTO
========================================================= */

if (safeElement(takePhoto)) {

    takePhoto.addEventListener(
        "click",
        function () {

            capturePhoto();

        }
    );

}


/* =========================================================
   CAPTURE PHOTO
========================================================= */

function capturePhoto() {

    if (!cameraVideo || !cameraStream) {

        showCameraError(
            new Error(
                "Camera is not ready."
            )
        );

        return;
    }


    const canvas =
        document.createElement("canvas");


    canvas.width =
        cameraVideo.videoWidth ||
        1280;

    canvas.height =
        cameraVideo.videoHeight ||
        720;


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
        function (blob) {

            if (!blob) {
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


            showAttachmentPreview(
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
   START VIDEO RECORDING
========================================================= */

if (safeElement(startRecord)) {

    startRecord.addEventListener(
        "click",
        function () {

            startVideoRecording();

        }
    );

}


/* =========================================================
   START RECORDING
========================================================= */

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
                    mimeType: mimeType
                }
            );

    } catch (error) {

        console.error(error);

        addMessage(
            "❌ Video recording is not supported.",
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

            finishVideoRecording();

        };


    mediaRecorder.start();


    if (startRecord) {
        startRecord.style.display =
            "none";
    }

    if (stopRecord) {
        stopRecord.style.display =
            "inline-flex";
    }


    recordingSeconds = 0;

    updateRecordingTime();


    recordingTimer =
        setInterval(
            function () {

                recordingSeconds++;

                updateRecordingTime();

            },
            1000
        );

}


/* =========================================================
   RECORDING TIMER
========================================================= */

function updateRecordingTime() {

    if (!recordTime) {
        return;
    }

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

if (safeElement(stopRecord)) {

    stopRecord.addEventListener(
        "click",
        function () {

            stopRecording();

        }
    );

}


/* =========================================================
   STOP RECORDING
========================================================= */

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


    if (startRecord) {
        startRecord.style.display =
            "inline-flex";
    }

    if (stopRecord) {
        stopRecord.style.display =
            "none";
    }

}


/* =========================================================
   FINISH VIDEO RECORDING
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


    showAttachmentPreview(
        file,
        "video"
    );


    closeCamera();

}


/* =========================================================
   SWITCH CAMERA
========================================================= */

if (safeElement(switchCamera)) {

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

                console.error(error);

                showCameraError(error);

            }

        }
    );

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            if (
                cameraModal &&
                cameraModal.classList.contains(
                    "active"
                )
            ) {

                closeCamera();

            }

            if (plusMenu) {
                plusMenu.classList.remove(
                    "show"
                );
            }

        }

    }
);


/* =========================================================
   ATTACHMENT PREVIEW
========================================================= */

function showAttachmentPreview(
    file,
    type
) {

    if (!mediaResult) {
        return;
    }


    mediaResult.innerHTML = "";


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "selected-media";


    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.alt =
            file.name;

        wrapper.appendChild(img);


    } else if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(file);

        video.controls = true;

        video.muted = true;

        wrapper.appendChild(video);

    }


    const info =
        document.createElement("div");

    info.className =
        "media-info";


    info.textContent =
        "📎 " + file.name;


    const removeBtn =
        document.createElement("button");

    removeBtn.type = "button";

    removeBtn.textContent = "✕";

    removeBtn.title =
        "Remove attachment";


    removeBtn.addEventListener(
        "click",
        function () {

            clearAttachment();

        }
    );


    wrapper.appendChild(info);

    wrapper.appendChild(removeBtn);


    mediaResult.appendChild(wrapper);

}


/* =========================================================
   CLEAR ATTACHMENT
========================================================= 
