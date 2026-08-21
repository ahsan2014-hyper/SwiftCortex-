/* =========================================================
   SwiftCortex AI Ultra
   Complete script.js
   Compatible with provided HTML + Vercel API
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

const messages = document.getElementById("messages");
const imagePreview = document.getElementById("imagePreview");


/* Camera */

const cameraModal =
    document.getElementById("cameraModal");

const cameraClose =
    document.getElementById("cameraClose");

const cameraVideo =
    document.getElementById("cameraVideo");

const cameraError =
    document.getElementById("cameraError");

const cameraErrorText =
    document.getElementById("cameraErrorText");

const photoMode =
    document.getElementById("photoMode");

const videoMode =
    document.getElementById("videoMode");

const takePhoto =
    document.getElementById("takePhoto");

const startRecord =
    document.getElementById("startRecord");

const stopRecord =
    document.getElementById("stopRecord");

const switchCamera =
    document.getElementById("switchCamera");

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

let thinkHarder = false;


/* =========================================================
   HELPER
========================================================= */

function exists(element) {
    return element !== null &&
           element !== undefined;
}


/* =========================================================
   PLUS MENU
========================================================= */

if (exists(plusBtn) && exists(plusMenu)) {

    plusBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            plusMenu.classList.toggle("show");

        }
    );

}


/* Close Plus Menu */

document.addEventListener(
    "click",
    function (event) {

        if (!exists(plusMenu)) {
            return;
        }

        if (
            !plusMenu.contains(event.target) &&
            event.target !== plusBtn
        ) {

            plusMenu.classList.remove("show");

        }

    }
);


/* =========================================================
   PHOTOS BUTTON
========================================================= */

if (exists(photoBtn)) {

    photoBtn.addEventListener(
        "click",
        function () {

            closePlusMenu();

            if (exists(imageInput)) {
                imageInput.click();
            }

        }
    );

}


/* =========================================================
   IMAGE INPUT
========================================================= */

if (exists(imageInput)) {

    imageInput.addEventListener(
        "change",
        function () {

            const file =
                imageInput.files &&
                imageInput.files[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {

                showError(
                    "Please select a valid image."
                );

                return;
            }

            selectedImage = file;
            selectedVideo = null;

            showSelectedMedia(
                file,
                "image"
            );

        }
    );

}


/* =========================================================
   FILE BUTTON
========================================================= */

if (exists(fileBtn)) {

    fileBtn.addEventListener(
        "click",
        function () {

            closePlusMenu();

            if (exists(fileInput)) {
                fileInput.click();
            }

        }
    );

}


/* =========================================================
   FILE INPUT
========================================================= */

if (exists(fileInput)) {

    fileInput.addEventListener(
        "change",
        function () {

            const file =
                fileInput.files &&
                fileInput.files[0];

            if (!file) {
                return;
            }


            if (file.type.startsWith("image/")) {

                selectedImage = file;
                selectedVideo = null;

                showSelectedMedia(
                    file,
                    "image"
                );

                return;
            }


            if (file.type.startsWith("video/")) {

                selectedVideo = file;
                selectedImage = null;

                showSelectedMedia(
                    file,
                    "video"
                );

                return;
            }


            /*
              Other files are currently shown
              as selected but not sent to AI.
            */

            showError(
                "This file type is not supported yet. Please select an image or video."
            );

        }
    );

}


/* =========================================================
   CLOSE PLUS MENU
========================================================= */

function closePlusMenu() {

    if (exists(plusMenu)) {
        plusMenu.classList.remove("show");
    }

}


/* =========================================================
   CAMERA BUTTON
========================================================= */

if (exists(cameraBtn)) {

    cameraBtn.addEventListener(
        "click",
        async function () {

            closePlusMenu();

            await openCamera();

        }
    );

}


/* =========================================================
   OPEN CAMERA
========================================================= */

async function openCamera() {

    if (!exists(cameraModal)) {
        return;
    }


    /*
      IMPORTANT:
      Your HTML uses .camera-modal.show
    */

    cameraModal.classList.add("show");


    hideCameraError();


    currentMode = "photo";


    if (exists(photoMode)) {
        photoMode.classList.add("active");
    }

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


    if (exists(cameraVideo)) {

        cameraVideo.srcObject =
            cameraStream;

        await cameraVideo.play();

    }

}


/* =========================================================
   CAMERA ERROR
========================================================= */

function showCameraError(error) {

    if (!exists(cameraError)) {
        return;
    }


    cameraError.classList.add("show");


    let text =
        "Camera permission is required.";


    if (
        error &&
        error.name === "NotAllowedError"
    ) {

        text =
            "Camera permission was denied. Please allow camera access.";

    } else if (
        error &&
        error.name === "NotFoundError"
    ) {

        text =
            "No camera was found on this device.";

    } else if (
        error &&
        error.name === "NotReadableError"
    ) {

        text =
            "The camera is being used by another application.";

    } else if (
        error &&
        error.message
    ) {

        text =
            error.message;

    }


    if (exists(cameraErrorText)) {
        cameraErrorText.textContent = text;
    }

}


function hideCameraError() {

    if (exists(cameraError)) {
        cameraError.classList.remove("show");
    }

}


/* =========================================================
   CLOSE CAMERA
========================================================= */

if (exists(cameraClose)) {

    cameraClose.addEventListener(
        "click",
        function () {

            closeCamera();

        }
    );

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

        cameraStream
            .getTracks()
            .forEach(
                function (track) {

                    track.stop();

                }
            );

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

    photoMode.addEventListener(
        "click",
        async function () {

            currentMode = "photo";


            photoMode.classList.add(
                "active"
            );


            if (exists(videoMode)) {
                videoMode.classList.remove(
                    "active"
                );
            }


            if (exists(takePhoto)) {
                takePhoto.style.display =
                    "inline-flex";
            }


            if (exists(startRecord)) {
                startRecord.style.display =
                    "none";
            }


            if (exists(stopRecord)) {
                stopRecord.style.display =
                    "none";
            }


            try {

                await startCamera();

            } catch (error) {

                showCameraError(error);

            }

        }
    );

}


/* =========================================================
   VIDEO MODE
========================================================= */

if (exists(videoMode)) {

    videoMode.addEventListener(
        "click",
        async function () {

            currentMode = "video";


            videoMode.classList.add(
                "active"
            );


            if (exists(photoMode)) {
                photoMode.classList.remove(
                    "active"
                );
            }


            if (exists(takePhoto)) {
                takePhoto.style.display =
                    "none";
            }


            if (exists(startRecord)) {
                startRecord.style.display =
                    "inline-flex";
            }


            if (exists(stopRecord)) {
                stopRecord.style.display =
                    "none";
            }


            try {

                await startCamera();

            } catch (error) {

                showCameraError(error);

            }

        }
    );

}


/* =========================================================
   TAKE PHOTO
========================================================= */

if (exists(takePhoto)) {

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

    if (
        !exists(cameraVideo) ||
        !cameraStream
    ) {

        showCameraError(
            new Error(
                "Camera is not ready."
            )
        );

        return;
    }


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        cameraVideo.videoWidth ||
        1280;

    canvas.height =
        cameraVideo.videoHeight ||
        720;


    const context =
        canvas.getContext(
            "2d"
        );


    context.drawImage(
        cameraVideo,
        0,
        0,
        canvas.width,
        canvas.height
    );


    canvas.toBlob(
        function (blob) {

            if (!blob) {

                showError(
                    "Could not capture photo."
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
                        type:
                            "image/jpeg"
                    }
                );


            selectedImage = file;
            selectedVideo = null;


            showSelectedMedia(
                file,
                "image"
            );


            closeCamera();

        },
        "image/jpeg",
        0.9
    );

}


/* =========================================================
   START RECORDING
========================================================= */

if (exists(startRecord)) {

    startRecord.addEventListener(
        "click",
        function () {

            startVideoRecording();

        }
    );

}


function startVideoRecording() {

    if (!cameraStream) {

        showError(
            "Camera is not ready."
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

        mimeType =
            "video/webm";

    }


    try {

        mediaRecorder =
            new MediaRecorder(
                cameraStream,
                {
                    mimeType:
                        mimeType
                }
            );

    } catch (error) {

        console.error(error);

        showError(
            "Video recording is not supported on this device."
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

            finishRecording();

        };


    mediaRecorder.start();


    if (exists(startRecord)) {
        startRecord.style.display =
            "none";
    }

    if (exists(stopRecord)) {
        stopRecord.style.display =
            "inline-flex";
    }


    recordingSeconds = 0;

    updateRecordingTime();


    if (exists(recordTime)) {
        recordTime.classList.add(
            "show"
        );
    }


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
   RECORD TIMER
========================================================= */

function updateRecordingTime() {

    if (!exists(recordTime)) {
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
        String(minutes).padStart(
            2,
            "0"
        ) +
        ":" +
        String(seconds).padStart(
            2,
            "0"
        );

}


/* =========================================================
   STOP RECORDING
========================================================= */

if (exists(stopRecord)) {

    stopRecord.addEventListener(
        "click",
        function () {

            stopRecording();

        }
    );

}


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


    if (exists(recordTime)) {
        recordTime.classList.remove(
            "show"
        );
    }


    if (exists(startRecord)) {
        startRecord.style.display =
            "inline-flex";
    }


    if (exists(stopRecord)) {
        stopRecord.style.display =
            "none";
    }

}


/* =========================================================
   FINISH RECORDING
========================================================= */

function finishRecording() {

    if (!recordedChunks.length) {

        showError(
            "No video was recorded."
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


    showSelectedMedia(
        file,
        "video"
    );


    closeCamera();

}


/* =========================================================
   SWITCH CAMERA
========================================================= */

if (exists(switchCamera)) {

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
   SELECTED MEDIA PREVIEW
========================================================= */

function showSelectedMedia(
    file,
    type
) {

    if (!exists(imagePreview)) {
        return;
    }


    imagePreview.innerHTML = "";


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "selected-attachment";


    if (type === "image") {

        const img =
            document.createElement(
                "img"
            );


        img.src =
            URL.createObjectURL(
                file
         
