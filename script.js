/* =========================================================
   ⚡ SwiftCortex AI Ultra
   Complete Frontend
   Text + Camera + Photos + Files + Video
   Description + Think Harder + Plugins
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const messages = document.getElementById("messages");

const plusBtn = document.getElementById("plusBtn");
const plusMenu = document.getElementById("plusMenu");

const cameraBtn = document.getElementById("cameraBtn");
const photoBtn = document.getElementById("photoBtn");
const fileBtn = document.getElementById("fileBtn");
const pluginBtn = document.getElementById("pluginBtn");
const thinkBtn = document.getElementById("thinkBtn");

const imageInput = document.getElementById("imageInput");
const fileInput = document.getElementById("fileInput");

const imagePreview = document.getElementById("imagePreview");


/* Camera */

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

let thinkHarder = false;


/* =========================================================
   SAFE HELPERS
========================================================= */

function exists(element) {
    return !!element;
}


/* =========================================================
   PLUS MENU
========================================================= */

if (exists(plusBtn) && exists(plusMenu)) {

    plusBtn.addEventListener("click", function(event) {

        event.stopPropagation();

        plusMenu.classList.toggle("show");

    });

}


/* Close menu */

document.addEventListener("click", function(event) {

    if (!plusMenu) return;

    if (
        !plusMenu.contains(event.target) &&
        event.target !== plusBtn
    ) {

        plusMenu.classList.remove("show");

    }

});


/* =========================================================
   CLOSE MENU
========================================================= */

function closePlusMenu() {

    if (plusMenu) {
        plusMenu.classList.remove("show");
    }

}


/* =========================================================
   📷 CAMERA BUTTON
========================================================= */

if (cameraBtn) {

    cameraBtn.addEventListener("click", async function() {

        closePlusMenu();

        await openCamera();

    });

}


/* =========================================================
   🖼 PHOTOS BUTTON
========================================================= */

if (photoBtn && imageInput) {

    photoBtn.addEventListener("click", function() {

        closePlusMenu();

        imageInput.click();

    });

}


/* =========================================================
   IMAGE SELECTED
========================================================= */

if (imageInput) {

    imageInput.addEventListener("change", function() {

        const file = this.files && this.files[0];

        if (!file) return;


        if (!file.type.startsWith("image/")) {

            showAIMessage(
                "⚠️ Please select a valid image."
            );

            return;

        }


        selectedImage = file;
        selectedVideo = null;


        showAttachmentPreview(
            file,
            "image"
        );

    });

}


/* =========================================================
   📄 FILE BUTTON
========================================================= */

if (fileBtn && fileInput) {

    fileBtn.addEventListener("click", function() {

        closePlusMenu();

        fileInput.click();

    });

}


/* =========================================================
   FILE SELECT
========================================================= */

if (fileInput) {

    fileInput.addEventListener("change", async function() {

        const file = this.files && this.files[0];

        if (!file) return;


        /* IMAGE */

        if (file.type.startsWith("image/")) {

            selectedImage = file;
            selectedVideo = null;

            showAttachmentPreview(
                file,
                "image"
            );

            return;
        }


        /* VIDEO */

        if (file.type.startsWith("video/")) {

            selectedVideo = file;
            selectedImage = null;

            showAttachmentPreview(
                file,
                "video"
            );

            return;
        }


        /* TEXT FILE */

        if (
            file.type === "text/plain" ||
            file.name.toLowerCase().endsWith(".txt")
        ) {

            try {

                const content =
                    await file.text();

                userInput.value =
                    content;

                userInput.focus();


                showInfoMessage(
                    "📄 Text file loaded. You can edit it and press Send."
                );

            } catch {

                showAIMessage(
                    "⚠️ Could not read this text file."
                );

            }

            return;
        }


        /* OTHER FILE */

        showAIMessage(
            "📄 File selected: " +
            file.name +
            "\n\nThis file type is not directly readable yet. Image, video and TXT files are supported."
        );

    });

}


/* =========================================================
   🧩 PLUGINS
========================================================= */

if (pluginBtn) {

    pluginBtn.addEventListener("click", function() {

        closePlusMenu();

        showPluginPanel();

    });

}


function showPluginPanel() {

    const old =
        document.getElementById("swiftPluginPanel");

    if (old) {
        old.remove();
        return;
    }


    const panel =
        document.createElement("div");

    panel.id =
        "swiftPluginPanel";

    panel.style.position = "fixed";
    panel.style.left = "50%";
    panel.style.top = "50%";
    panel.style.transform =
        "translate(-50%, -50%)";

    panel.style.zIndex = "10000";

    panel.style.width =
        "min(90vw, 400px)";

    panel.style.padding = "22px";

    panel.style.borderRadius = "20px";

    panel.style.background =
        "#0d1424";

    panel.style.border =
        "1px solid #273449";

    panel.style.color =
        "white";

    panel.style.boxShadow =
        "0 20px 70px rgba(0,0,0,.7)";


    panel.innerHTML = `
        <h3 style="margin-top:0;">
            🧩 SwiftCortex Plugins
        </h3>

        <p style="color:#9ca3af;">
            Plugin system is ready.
        </p>

        <button id="webPlugin"
            style="
                width:100%;
                padding:12px;
                margin:6px 0;
                border:0;
                border-radius:10px;
                cursor:pointer;
            ">
            🌐 Web Search
        </button>

        <button id="calculatorPlugin"
            style="
                width:100%;
                padding:12px;
                margin:6px 0;
                border:0;
                border-radius:10px;
                cursor:pointer;
            ">
            🧮 Calculator
        </button>

        <button id="closePlugin"
            style="
                width:100%;
                padding:12px;
                margin-top:12px;
                border:0;
                border-radius:10px;
                background:#ef4444;
                color:white;
                cursor:pointer;
            ">
            ✕ Close
        </button>
    `;


    document.body.appendChild(panel);


    document
        .getElementById("closePlugin")
        ?.addEventListener(
            "click",
            () => panel.remove()
        );


    document
        .getElementById("webPlugin")
        ?.addEventListener(
            "click",
            function() {

                panel.remove();

                userInput.value =
                    "Please search the web for: ";

                userInput.focus();

                showInfoMessage(
                    "🌐 Web Search mode selected."
                );

            }
        );


    document
        .getElementById("calculatorPlugin")
        ?.addEventListener(
            "click",
            function() {

                panel.remove();

                userInput.value =
                    "Calculate: ";

                userInput.focus();

                showInfoMessage(
                    "🧮 Calculator mode selected."
                );

            }
        );

}


/* =========================================================
   🧠 THINK HARDER
========================================================= */

if (thinkBtn) {

    thinkBtn.addEventListener("click", function() {

        closePlusMenu();

        thinkHarder = !thinkHarder;


        if (thinkHarder) {

            thinkBtn.textContent =
                "🧠 Think Harder ✓";

            showInfoMessage(
                "🧠 Think Harder enabled. Your next message will receive a more careful analysis."
            );

        } else {

            thinkBtn.textContent =
                "🧠 Think Harder";

            showInfoMessage(
                "🧠 Think Harder disabled."
            );

        }

    });

}


/* =========================================================
   CAMERA
========================================================= */

async function openCamera() {

    if (!cameraModal) {

        showAIMessage(
            "⚠️ Camera interface was not found."
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

    if (!cameraError) return;


    cameraError.classList.add("show");

    cameraError.style.display =
        "flex";


    let message =
        "Camera permission is required.";


    if (
        error?.name ===
        "NotAllowedError"
    ) {

        message =
            "Camera permission was denied. Please allow camera access.";

    } else if (
        error?.name ===
        "NotFoundError"
    ) {

        message =
            "No camera was found on this device.";

    } else if (
        error?.name ===
        "NotReadableError"
    ) {

        message =
            "The camera is currently being used by another application.";

    } else if (error?.message) {

        message =
            error.message;

    }


    if (cameraErrorText) {

        cameraErrorText.textContent =
            message;

    }

}


/* =========================================================
   CLOSE CAMERA
========================================================= */

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

        cameraVideo.srcObject =
            null;

    }

}


/* =========================================================
   📸 PHOTO MODE
========================================================= */

if (photoMode) {

    photoMode.addEventListener(
        "click",
        async function() {

            currentMode =
                "photo";


            photoMode.classList.add(
                "active"
            );


            if (videoMode) {

                videoMode.classList.remove(
                    "active"
                );

            }


            if (takePhoto) {

                takePhoto.style.display =
                    "inline-flex";

            }


            if (startRecord) {

                startRecord.style.display =
                    "none";

            }


            if (stopRecord) {

                stopRecord.style.display =
                    "none";

            }


            await startCamera();

        }
    );

}


/* =========================================================
   🎥 VIDEO MODE
========================================================= */

if (videoMode) {

    videoMode.addEventListener(
        "click",
        async function() {

            currentMode =
                "video";


            videoMode.classList.add(
                "active"
            );


            if (photoMode) {

                photoMode.classList.remove(
                    "active"
                );

            }


            if (takePhoto) {

                takePhoto.style.display =
                    "none";

            }


            if (startRecord) {

                startRecord.style.display =
                    "inline-flex";

            }


            if (stopRecord) {

                stopRecord.style.display =
                    "none";

            }


            await startCamera();

        }
    );

}


/* =========================================================
   TAKE PHOTO
========================================================= */

if (takePhoto) {

    takePhoto.addEventListener(
        "click",
        capturePhoto
    );

}


function capturePhoto() {

    if (
        !cameraVideo ||
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


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.drawImage(
        cameraVideo,
        0,
        0,
        canvas.width,
        canvas.height
    );


    canvas.toBlob(
        function(blob) {

            if (!blob) return;


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


            selectedImage =
                file;

            selectedVideo =
                null;


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
   🎥 START RECORDING
========================================================= */

if (startRecord) {

    startRecord.addEventListener(
        "click",
        startVideoRecording
    );

}


function startVideoRecording() {

    if (!cameraStream) {

        showAIMessage(
            "⚠️ Camera is not ready."
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
                    mimeType
                }
            );

    } catch {

        showAIMessage(
            "❌ Video recording is not supported by this browser."
        );

        return;

    }


    mediaRecorder.ondataavailable =
        function(event) {

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


    if (recordTime) {

        recordTime.classList.add(
            "show"
        );

    }


    updateRecordingTime();


    recordingTimer =
        setInterval(
            function() {

                recordingSeconds++;

                updateRecordingTime();

            },
            1000
        );


    if (startRecord) {

        startRecord.style.display =
            "none";

    }


    if (stopRecord) {

        stopRecord.style.display =
            "inline-flex";

    }

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
   STOP RECORDING
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
        mediaRecorder.state !==
        "inactive"
