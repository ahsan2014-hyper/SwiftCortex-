const messages = document.getElementById("messages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const plusBtn = document.getElementById("plusBtn");
const plusMenu = document.getElementById("plusMenu");

const imageInput = document.getElementById("imageInput");
const fileInput = document.getElementById("fileInput");

const imagePreview = document.getElementById("imagePreview");


// ================= CAMERA ELEMENTS =================

const cameraModal = document.getElementById("cameraModal");
const cameraVideo = document.getElementById("cameraVideo");
const cameraClose = document.getElementById("cameraClose");

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


// ================= VARIABLES =================

let selectedImage = null;

let cameraStream = null;

let mediaRecorder = null;

let recordedChunks = [];

let recordedVideo = null;

let currentMode = "photo";

let cameraFacing = "environment";

let recordingTimer = null;

let recordingSeconds = 0;


// ================= PLUS MENU =================

plusBtn.onclick = (event) => {

    event.stopPropagation();

    plusMenu.classList.toggle("show");

};


plusMenu.addEventListener("click", (event) => {

    event.stopPropagation();

});


document.addEventListener("click", () => {

    plusMenu.classList.remove("show");

});


// ================= OPEN CAMERA =================

document.getElementById("cameraBtn").onclick = async () => {

    plusMenu.classList.remove("show");

    openCamera();

};


// ================= CAMERA START =================

async function openCamera() {

    cameraModal.classList.add("show");

    cameraError.classList.remove("show");

    mediaResult.innerHTML = "";

    try {

        await startCamera();

    } catch (error) {

        console.error("Camera error:", error);

        showCameraError(error);

    }

}


// ================= START CAMERA =================

async function startCamera() {

    stopCamera();


    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {

        throw new Error(
            "Camera API is not supported by this browser."
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


    cameraVideo.srcObject = cameraStream;

    await cameraVideo.play();

}


// ================= CAMERA ERROR =================

function showCameraError(error) {

    cameraError.classList.add("show");


    if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
    ) {

        cameraErrorText.innerHTML =
            "Camera permission was blocked.<br><br>" +
            "Allow Camera permission for this website " +
            "in your browser settings, then try again.";

    }

    else if (error.name === "NotFoundError") {

        cameraErrorText.textContent =
            "No camera was found on this device.";

    }

    else {

        cameraErrorText.textContent =
            error.message ||
            "Unable to access the camera.";

    }

}


// ================= CLOSE CAMERA =================

cameraClose.onclick = () => {

    closeCamera();

};


cameraModal.addEventListener("click", (event) => {

    if (event.target === cameraModal) {

        closeCamera();

    }

});


function closeCamera() {

    stopRecording();

    stopCamera();

    cameraModal.classList.remove("show");

}


function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => track.stop());

        cameraStream = null;

    }

    cameraVideo.srcObject = null;

}


// ================= PHOTO MODE =================

photoMode.onclick = () => {

    currentMode = "photo";


    photoMode.classList.add("active");
    videoMode.classList.remove("active");


    takePhoto.style.display = "inline-block";

    startRecord.style.display = "none";

    stopRecord.style.display = "none";

};


// ================= VIDEO MODE =================

videoMode.onclick = () => {

    currentMode = "video";


    videoMode.classList.add("active");
    photoMode.classList.remove("active");


    takePhoto.style.display = "none";

    startRecord.style.display = "inline-block";

    stopRecord.style.display = "none";

};


// ================= TAKE PHOTO =================

takePhoto.onclick = () => {

    if (!cameraStream) {

        showCameraError(
            new Error("Camera is not running.")
        );

        return;

    }


    const canvas = document.createElement("canvas");


    canvas.width = cameraVideo.videoWidth;

    canvas.height = cameraVideo.videoHeight;


    const context = canvas.getContext("2d");


    context.drawImage(
        cameraVideo,
        0,
        0,
        canvas.width,
        canvas.height
    );


    selectedImage =
        canvas.toDataURL("image/jpeg", 0.88);


    mediaResult.innerHTML = `
        <img src="${selectedImage}" alt="Captured photo">

        <div class="media-ready">
            📸 Photo captured successfully
        </div>
    `;


    imagePreview.innerHTML = `
        <div class="image-box">
            📸 Camera photo ready
        </div>
    `;

};


// ================= SWITCH CAMERA =================

switchCamera.onclick = async () => {

    cameraFacing =
        cameraFacing === "environment"
            ? "user"
            : "environment";


    try {

        await startCamera();

    } catch (error) {

        console.error(error);

        showCameraError(error);

    }

};


// ================= START RECORDING =================

startRecord.onclick = () => {

    if (!cameraStream) return;


    if (!window.MediaRecorder) {

        alert(
            "Video recording is not supported by this browser."
        );

        return;

    }


    recordedChunks = [];


    let options = {};


    if (
        MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp9,opus"
        )
    ) {

        options.mimeType =
            "video/webm;codecs=vp9,opus";

    }

    else if (
        MediaRecorder.isTypeSupported(
            "video/webm"
        )
    ) {

        options.mimeType = "video/webm";

    }


    try {

        mediaRecorder =
            new MediaRecorder(
                cameraStream,
                options
            );

    } catch (error) {

        console.error(error);

        alert(
            "This browser cannot start video recording."
        );

        return;

    }


    mediaRecorder.ondataavailable = (event) => {

        if (event.data && event.data.size > 0) {

            recordedChunks.push(event.data);

        }

    };


    mediaRecorder.onstop = finishRecording;


    mediaRecorder.start();


    startRecord.style.display = "none";

    stopRecord.style.display = "inline-block";


    startTimer();

};


// ================= STOP RECORDING =================

stopRecord.onclick = () => {

    stopRecording();

};


function stopRecording() {

    if (
        mediaRecorder &&
        mediaRecorder.state !== "inactive"
    ) {

        mediaRecorder.stop();

    }

    stopTimer();

}


function finishRecording() {

    const blob = new Blob(
        recordedChunks,
        {
            type:
                mediaRecorder.mimeType ||
                "video/webm"
        }
    );


    recordedVideo = blob;


    const videoURL =
        URL.createObjectURL(blob);


    mediaResult.innerHTML = `
        <video
            src="${videoURL}"
            controls
            playsinline
        ></video>

        <div class="media-ready">
            🎥 Video recorded successfully
        </div>
    `;


    imagePreview.innerHTML = `
        <div class="image-box">
            🎥 Video ready
        </div>
    `;


    startRecord.style.display = "inline-block";

    stopRecord.style.display = "none";

}


// ================= RECORDING TIMER =================

function startTimer() {

    recordingSeconds = 0;

    recordTime.classList.add("show");

    updateTimer();


    recordingTimer =
        setInterval(() => {

            recordingSeconds++;

            updateTimer();

        }, 1000);

}


function stopTimer() {

    if (recordingTimer) {

        clearInterval(recordingTimer);

        recordingTimer = null;

    }

    recordTime.classList.remove("show");

}


function updateTimer() {

    const minutes =
        Math.floor(recordingSeconds / 60)
        .toString()
        .padStart(2, "0");


    const seconds =
        (recordingSeconds % 60)
        .toString()
        .padStart(2, "0");


    recordTime.textContent =
        `🔴 ${minutes}:${seconds}`;

}


// ================= PHOTOS / GALLERY =================

document.getElementById("photoBtn").onclick = () => {

    plusMenu.classList.remove("show");

    imageInput.click();

};


imageInput.onchange = () => {

    const file = imageInput.files[0];

    if (!file) return;


    const reader = new FileReader();


    reader.onload = () => {

        selectedImage = reader.result;


        imagePreview.innerHTML = `
            <div class="image-box">
                🖼 ${file.name}
            </div>
        `;

    };


    reader.readAsDataURL(file);

};


// ================= FILES =================

document.getElementById("fileBtn").onclick = () => {

    plusMenu.classList.remove("show");

    fileInput.click();

};


fileInput.onchange = () => {

    const file = fileInput.files[0];

    if (!file) return;


    imagePreview.innerHTML = `
        <div class="image-box">
            📄 ${file.name}
        </div>
    `;

};


// ================= PLUGINS =================

document.getElementById("pluginBtn").onclick = () => {

    plusMenu.classList.remove("show");


    addMessage(
        "🧩 Plugins are coming soon.",
        "ai"
    );

};


// ================= THINK HARDER =================

document.getElementById("thinkBtn").onclick = () => {

    plusMenu.classList.remove("show");


    userInput.value +=
        " Give a detailed and thoughtful answer.";

    userInput.focus();

};


// ================= SEND BUTTON =================

sendBtn.onclick = sendMessage;


// ================= ENTER TO SEND =================

userInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ================= SEND MESSAGE =================

async function sendMessage() {

    const text =
        userInput.value.trim();


    if (
        !text &&
        !selectedImage
    ) {

        return;

    }


    addMessage(
        text || "📷 Image",
        "user"
    );


    userInput.value = "";


    const loading =
        addMessage(
            "⏳ Thinking...",
            "ai"
        );


    try {

        const response =
            await fetch(
                "/api/gemini",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: text,

                        image: selectedImage

                    })

                }
            );


        const data =
            await response.json();


        loading.remove();


        if (response.ok && data.text) {

            addMessage(
                data.text,
                "ai"
            );

        }

        else {

            addMessage(
                "⚠️ " +
                (
                    data.error ||
                    "No response from AI."
                ),
                "ai"
            );

        }

    }

    catch (error) {

        console.error(
            "API Error:",
            error
        );


        loading.remove();


        addMessage(
            "❌ Connection error. " +
            "Please check your Vercel API.",
            "ai"
        );

    }


    selectedImage = null;

    recordedVideo = null;

    imagePreview.innerHTML = "";

}


// ================= ADD MESSAGE =================

function addMessage(text, type) {

    const div =
        document.createElement("div");


    div.className =
        type === "user"
            ? "user-message"
            : "ai-message";


    div.innerText = text;


    messages.appendChild(div);


    messages.scrollTop =
        messages.scrollHeight;


    return div;

}


// ================= NEW CHAT =================

document.getElementById("newChat").onclick = () => {

    messages.innerHTML = `
        <div class="ai-message">
            👋 New chat started.
            How can I help you?
        </div>
    `;

};
