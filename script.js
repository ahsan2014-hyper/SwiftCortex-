/* =========================================================
   ⚡ SwiftCortex AI Ultra
   COMPLETE SCRIPT.JS
   Text + Image + Video + Camera + Plugins
========================================================= */

"use strict";


/* =========================================================
   ELEMENTS
========================================================= */

const userInput =
    document.getElementById("userInput");

const sendBtn =
    document.getElementById("sendBtn");

const plusBtn =
    document.getElementById("plusBtn");

const plusMenu =
    document.getElementById("plusMenu");

const cameraBtn =
    document.getElementById("cameraBtn");

const photoBtn =
    document.getElementById("photoBtn");

const fileBtn =
    document.getElementById("fileBtn");

const pluginBtn =
    document.getElementById("pluginBtn");

const thinkBtn =
    document.getElementById("thinkBtn");

const imageInput =
    document.getElementById("imageInput");

const fileInput =
    document.getElementById("fileInput");

const imagePreview =
    document.getElementById("imagePreview");

const messages =
    document.getElementById("messages");


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

    return (
        element !== null &&
        element !== undefined
    );

}


/* =========================================================
   PLUGIN CSS
   Added automatically so the panel works even if
   style.css does not contain plugin styles.
========================================================= */

(function addPluginStyles() {

    if (
        document.getElementById(
            "swiftPluginStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");

    style.id =
        "swiftPluginStyles";


    style.textContent = `

        #swiftPluginPanel {

            position: fixed;

            inset: 0;

            z-index: 10000;

            display: none;

            align-items: center;

            justify-content: center;

            padding: 18px;

            background:
                rgba(0, 0, 0, 0.72);

            backdrop-filter:
                blur(10px);

        }


        #swiftPluginPanel.active {

            display: flex;

        }


        .swift-plugin-box {

            width: min(
                95vw,
                560px
            );

            max-height: 90vh;

            overflow-y: auto;

            background:
                #0d1424;

            border:
                1px solid #273449;

            border-radius:
                24px;

            padding:
                20px;

            box-shadow:
                0 25px 80px
                rgba(0,0,0,.65);

            color:
                white;

        }


        .swift-plugin-header {

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            margin-bottom:
                18px;

        }


        .swift-plugin-title {

            display:
                flex;

            align-items:
                center;

            gap:
                10px;

        }


        .swift-plugin-title-icon {

            font-size:
                32px;

        }


        .swift-plugin-title h2 {

            margin:
                0;

            font-size:
                25px;

        }


        .swift-plugin-title p {

            margin:
                4px 0 0;

            color:
                #9ca3af;

            font-size:
                13px;

        }


        .swift-plugin-close {

            width:
                44px;

            height:
                44px;

            border:
                0;

            border-radius:
                50%;

            background:
                #1f2937;

            color:
                white;

            font-size:
                22px;

            cursor:
                pointer;

        }


        .swift-plugin-close:hover {

            background:
                #334155;

        }


        .swift-plugin-grid {

            display:
                grid;

            grid-template-columns:
                repeat(2, 1fr);

            gap:
                12px;

        }


        .swift-plugin-card {

            border:
                1px solid #29374d;

            border-radius:
                18px;

            background:
                #111a2b;

            color:
                white;

            padding:
                18px;

            min-height:
                150px;

            text-align:
                left;

            cursor:
                pointer;

            transition:
                transform .15s ease,
                border-color .15s ease,
                background .15s ease;

        }


        .swift-plugin-card:hover {

            transform:
                translateY(-2px);

            border-color:
                #00e5ff;

            background:
                #142033;

        }


        .swift-plugin-card:active {

            transform:
                scale(.97);

        }


        .swift-plugin-card-icon {

            display:
                block;

            font-size:
                34px;

            margin-bottom:
                12px;

        }


        .swift-plugin-card strong {

            display:
                block;

            font-size:
                17px;

            margin-bottom:
                5px;

        }


        .swift-plugin-card small {

            display:
                block;

            color:
                #9ca3af;

            font-size:
                12px;

            line-height:
                1.4;

        }


        .swift-plugin-status {

            margin-top:
                16px;

            padding:
                10px;

            border-radius:
                12px;

            background:
                #111827;

            color:
                #9ca3af;

            text-align:
                center;

            font-size:
                12px;

        }


        @media (max-width: 480px) {

            .swift-plugin-grid {

                grid-template-columns:
                    repeat(2, 1fr);

            }


            .swift-plugin-box {

                padding:
                    15px;

            }


            .swift-plugin-card {

                min-height:
                    135px;

                padding:
                    14px;

            }

        }


        .swift-attachment {

            display:
                flex;

            align-items:
                center;

            gap:
                10px;

            margin:
                8px 0;

            padding:
                8px;

            border-radius:
                12px;

            background:
                #111827;

        }


        .swift-attachment img,
        .swift-attachment video {

            width:
                75px;

            height:
                60px;

            object-fit:
                cover;

            border-radius:
                9px;

            background:
                #000;

        }


        .swift-attachment-info {

            flex:
                1;

            min-width:
                0;

            color:
                #d1d5db;

            font-size:
                12px;

            overflow:
                hidden;

            text-overflow:
                ellipsis;

            white-space:
                nowrap;

        }


        .swift-attachment-remove {

            border:
                0;

            width:
                34px;

            height:
                34px;

            border-radius:
                50%;

            background:
                #1f2937;

            color:
                white;

            cursor:
                pointer;

        }


        .swift-attachment-remove:hover {

            background:
                #7f1d1d;

        }

    `;


    document.head.appendChild(style);

})();


/* =========================================================
   PLUS MENU
========================================================= */

if (
    exists(plusBtn) &&
    exists(plusMenu)
) {

    plusBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            plusMenu.classList.toggle(
                "show"
            );

        }
    );

}


/* Close plus menu outside */

document.addEventListener(
    "click",
    function(event) {

        if (!exists(plusMenu)) {
            return;
        }


        if (
            !plusMenu.contains(
                event.target
            ) &&
            event.target !== plusBtn
        ) {

            plusMenu.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   PHOTO BUTTON
========================================================= */

if (
    exists(photoBtn) &&
    exists(imageInput)
) {

    photoBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            closePlusMenu();

            imageInput.click();

        }
    );

}


/* =========================================================
   IMAGE SELECT
========================================================= */

if (exists(imageInput)) {

    imageInput.addEventListener(
        "change",
        function() {

            const file =
                this.files &&
                this.files[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showSystemMessage(
                    "Please select a valid image."
                );

                return;

            }


            selectedImage = file;

            selectedVideo = null;


            showAttachment(
                file,
                "image"
            );

        }
    );

}


/* =========================================================
   FILE BUTTON
========================================================= */

if (
    exists(fileBtn) &&
    exists(fileInput)
) {

    fileBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            closePlusMenu();

            fileInput.click();

        }
    );

}


/* =========================================================
   FILE SELECT
========================================================= */

if (exists(fileInput)) {

    fileInput.addEventListener(
        "change",
        function() {

            const file =
                this.files &&
                this.files[0];


            if (!file) {
                return;
            }


            if (
                file.type.startsWith(
                    "image/"
                )
            ) {

                selectedImage = file;

                selectedVideo = null;

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

                selectedVideo = file;

                selectedImage = null;

                showAttachment(
                    file,
                    "video"
                );

                return;

            }


            showSystemMessage(
                "📄 File selected: " +
                file.name +
                "\n\nThis file type can be connected to File Tools later."
            );

        }
    );

}


/* =========================================================
   CAMERA BUTTON
========================================================= */

if (exists(cameraBtn)) {

    cameraBtn.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();

            event.stopPropagation();

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

        showSystemMessage(
            "Camera interface was not found."
        );

        return;

    }


    /*
      IMPORTANT:
      Your HTML uses .show
    */

    cameraModal.classList.add(
        "show"
    );


    if (exists(cameraError)) {

        cameraError.classList.remove(
            "show"
        );

        cameraError.style.display =
            "none";

    }


    try {

        await startCamera();

    } catch(error) {

        console.error(
            "Camera error:",
            error
        );

        showCameraError(
            error
        );

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

                facingMode:
                    currentCamera,

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


    cameraError.classList.add(
        "show"
    );

    cameraError.style.display =
        "flex";


    let text =
        "Camera permission is required.";


    if (
        error?.name ===
        "NotAllowedError"
    ) {

        text =
            "Camera permission was denied. Allow camera access in your browser.";

    }


    else if (
        error?.name ===
        "NotFoundError"
    ) {

        text =
            "No camera was found on this device.";

    }


    else if (
        error?.name ===
        "NotReadableError"
    ) {

        text =
            "Camera is already being used by another application.";

    }


    else if (
        error?.message
    ) {

        text =
            error.message;

    }


    if (exists(cameraErrorText)) {

        cameraErrorText.textContent =
            text;

    }

}


/* =========================================================
   CAMERA CLOSE
========================================================= */

if (exists(cameraClose)) {

    cameraClose.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeCamera();

        }
    );

}


function closeCamera() {

    stopRecording();

    stopCamera();


    if (exists(cameraModal)) {

        cameraModal.classList.remove(
            "show"
        );

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
                function(track) {

                    track.stop();

                }
            );

        cameraStream = null;

    }


    if (exists(cameraVideo)) {

        cameraVideo.srcObject =
            null;

    }

}


/* =========================================================
   PHOTO MODE
========================================================= */

if (exists(photoMode)) {

    photoMode.addEventListener(
        "click",
        async function() {

            currentMode =
                "photo";


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


            if (exists(recordTime)) {

                recordTime.classList.remove(
                    "show"
                );

            }


            try {

                await startCamera();

            } catch(error) {

                showCameraError(
                    error
                );

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
        async function() {

            currentMode =
                "video";


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

            } catch(error) {

                showCameraError(
                    error
                );

            }

        }
    );

}


/* =========================================================
   TAKE PHOTO
===================
