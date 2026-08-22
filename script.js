"use strict";

const $ = id => document.getElementById(id);

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

let selectedImage = null;
let selectedVideo = null;
let selectedFile = null;

let cameraStream = null;
let cameraFacing = "user";

let recorder = null;
let chunks = [];

let recordingSeconds = 0;
let recordingTimer = null;

let thinkHarder = false;
let sending = false;


/* =========================
   MESSAGE
========================= */

function addMessage(text, type = "ai", attachment = null) {

    const box = document.createElement("div");

    box.className =
        type === "user"
            ? "user-message"
            : "ai-message";

    if (text) {

        const textBox =
            document.createElement("div");

        textBox.textContent = text;

        box.appendChild(textBox);
    }

    if (attachment?.type === "image") {

        const img =
            document.createElement("img");

        img.src = attachment.url;

        img.style.maxWidth = "280px";
        img.style.maxHeight = "280px";
        img.style.borderRadius = "14px";
        img.style.display = "block";
        img.style.marginTop = "8px";

        box.appendChild(img);
    }

    if (attachment?.type === "video") {

        const video =
            document.createElement("video");

        video.src = attachment.url;
        video.controls = true;
        video.playsInline = true;

        video.style.maxWidth = "300px";
        video.style.maxHeight = "280px";
        video.style.borderRadius = "14px";
        video.style.display = "block";
        video.style.marginTop = "8px";

        box.appendChild(video);
    }

    if (attachment?.type === "file") {

        const fileBox =
            document.createElement("div");

        fileBox.textContent =
            "📄 " + attachment.name;

        fileBox.style.marginTop = "8px";

        box.appendChild(fileBox);
    }

    messages.appendChild(box);

    messages.scrollTop =
        messages.scrollHeight;

    return box;
}


/* =========================
   PLUS MENU
========================= */

plusBtn?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        plusMenu.classList.toggle("show");
    }
);


document.addEventListener(
    "click",
    event => {

        if (
            plusMenu &&
            !plusMenu.contains(event.target) &&
            event.target !== plusBtn
        ) {

            plusMenu.classList.remove("show");
        }
    }
);


function closeMenu() {

    plusMenu?.classList.remove("show");
}


/* =========================
   PHOTO BUTTON
========================= */

photoBtn?.addEventListener(
    "click",
    () => {

        closeMenu();

        imageInput.value = "";

        imageInput.click();
    }
);


imageInput?.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            addMessage(
                "⚠️ Please select an image."
            );

            return;
        }

        selectedImage = file;
        selectedVideo = null;
        selectedFile = null;

        showPreview(
            file,
            "image"
        );
    }
);


/* =========================
   FILE BUTTON
========================= */

fileBtn?.addEventListener(
    "click",
    () => {

        closeMenu();

        fileInput.value = "";

        fileInput.click();
    }
);


fileInput?.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files?.[0];

        if (!file) return;

        if (file.type.startsWith("image/")) {

            selectedImage = file;
            selectedVideo = null;
            selectedFile = null;

            showPreview(
                file,
                "image"
            );

            return;
        }

        if (file.type.startsWith("video/")) {

            selectedVideo = file;
            selectedImage = null;
            selectedFile = null;

            showPreview(
                file,
                "video"
            );

            return;
        }

        selectedFile = file;
        selectedImage = null;
        selectedVideo = null;

        showPreview(
            file,
            "file"
        );
    }
);
/* =========================
   PREVIEW
========================= */

function showPreview(file, type) {

    imagePreview.innerHTML = "";

    const box =
        document.createElement("div");

    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.gap = "10px";
    box.style.padding = "8px";
    box.style.background = "#111827";
    box.style.borderRadius = "12px";


    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "10px";

        box.appendChild(img);
    }


    if (type === "video") {

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(file);

        video.muted = true;
        video.controls = true;

        video.style.width = "90px";
        video.style.height = "60px";
        video.style.objectFit = "cover";
        video.style.borderRadius = "10px";

        box.appendChild(video);
    }


    const name =
        document.createElement("span");

    name.textContent =
        type === "image"
            ? "🖼 " + file.name
            : type === "video"
                ? "🎥 " + file.name
                : "📄 " + file.name;

    name.style.color = "white";
    name.style.flex = "1";

    box.appendChild(name);


    const remove =
        document.createElement("button");

    remove.textContent = "✕";
    remove.type = "button";

    remove.style.border = "0";
    remove.style.background = "#374151";
    remove.style.color = "white";
    remove.style.borderRadius = "8px";
    remove.style.padding = "6px 9px";

    remove.onclick =
        clearAttachment;

    box.appendChild(remove);

    imagePreview.appendChild(box);
}


/* =========================
   CLEAR FILE
========================= */

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


/* =========================
   CAMERA BUTTON
========================= */

cameraBtn?.addEventListener(
    "click",
    async () => {

        closeMenu();

        cameraModal.classList.add("show");

        await startCamera();
    }
);


/* =========================
   START CAMERA
========================= */

async function startCamera() {

    stopCamera();

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        showCameraError(
            "Camera is not supported by this browser."
        );

        return;
    }


    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: {
                        ideal: cameraFacing
                    },
                    width: {
                        ideal: 1280
                    },
                    height: {
                        ideal: 720
                    }
                },

                audio: true
            });


        cameraVideo.srcObject =
            cameraStream;

        await cameraVideo.play();

        cameraError?.classList.remove(
            "show"
        );

    } catch (error) {

        console.error(
            "Camera:",
            error
        );

        showCameraError(
            getCameraError(error)
        );
    }
}


/* =========================
   CAMERA ERROR
========================= */

function showCameraError(message) {

    cameraError?.classList.add(
        "show"
    );

    if (cameraErrorText) {

        cameraErrorText.textContent =
            message;
    }
}


function getCameraError(error) {

    if (
        error?.name ===
        "NotAllowedError"
    ) {

        return "Camera permission was denied. Please allow camera access.";
    }

    if (
        error?.name ===
        "NotFoundError"
    ) {

        return "No camera was found on this device.";
    }

    if (
        error?.name ===
        "NotReadableError"
    ) {

        return "Camera is already being used by another app.";
    }

    return (
        error?.message ||
        "Unable to access the camera."
    );
}


/* =========================
   CLOSE CAMERA
========================= */

cameraClose?.addEventListener(
    "click",
    closeCamera
);


function closeCamera() {

    stopRecording();
    stopCamera();

    cameraModal?.classList.remove(
        "show"
    );
}


/* =========================
   STOP CAMERA
========================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        cameraStream = null;
    }

    if (cameraVideo) {

        cameraVideo.srcObject = null;
    }
}


/* =========================
   SWITCH CAMERA
========================= */

switchCamera?.addEventListener(
    "click",
    async () => {

        cameraFacing =
            cameraFacing === "user"
                ? "environment"
                : "user";

        await startCamera();
    }
);


/* =========================
   PHOTO MODE
========================= */

photoMode?.addEventListener(
    "click",
    async () => {

        photoMode.classList.add(
            "active"
        );

        videoMode.classList.remove(
            "active"
        );

        takePhoto.style.display =
            "inline-flex";

        startRecord.style.display =
            "none";

        stopRecord.style.display =
            "none";

        await startCamera();
    }
);


/* =========================
   VIDEO MODE
========================= */

videoMode?.addEventListener(
    "click",
    async () => {

        videoMode.classList.add(
            "active"
        );

        photoMode.classList.remove(
            "active"
        );

        takePhoto.style.display =
            "none";

        startRecord.style.display =
            "inline-flex";

        stopRecord.style.display =
            "none";

        await startCamera();
    }
);


/* =========================
   TAKE PHOTO
========================= */

takePhoto?.addEventListener(
    "click",
    capturePhoto
);


function capturePhoto() {

    if (!cameraStream) {

        addMessage(
            "⚠️ Camera is not ready."
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


    if (!ctx) return;


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


            const file =
                new File(
                    [blob],
                    `swiftcortex-photo-${Date.now()}.jpg`,
                    {
                        type:
                            "image/jpeg"
                    }
                );


            selectedImage = file;
            selectedVideo = null;
            selectedFile = null;


            showPreview(
                file,
                "image"
            );


            closeCamera();

        },
        "image/jpeg",
        0.92
    );
       }
/* =========================
   VIDEO RECORDING
========================= */

function getMimeType() {

    if (!window.MediaRecorder) {
        return "";
    }

    const types = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm"
    ];

    for (const type of types) {

        if (
            MediaRecorder.isTypeSupported(
                type
            )
        ) {
            return type;
        }
    }

    return "";
}


/* =========================
   START RECORD
========================= */

startRecord?.addEventListener(
    "click",
    startRecording
);


function startRecording() {

    if (!cameraStream) {

        addMessage(
            "⚠️ Camera is not ready."
        );

        return;
    }


    if (!window.MediaRecorder) {

        addMessage(
            "❌ Video recording is not supported."
        );

        return;
    }


    chunks = [];


    const mimeType =
        getMimeType();


    try {

        recorder =
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

        addMessage(
            "❌ Could not start recording."
        );

        return;
    }


    recorder.ondataavailable =
        event => {

            if (
                event.data &&
                event.data.size > 0
            ) {

                chunks.push(
                    event.data
                );
            }
        };


    recorder.onstop =
        finishRecording;


    recorder.start();


    recordingSeconds = 0;

    updateRecordTime();


    recordingTimer =
        setInterval(
            () => {

                recordingSeconds++;

                updateRecordTime();

            },
            1000
        );


    recordTime?.classList.add(
        "show"
    );


    startRecord.style.display =
        "none";


    stopRecord.style.display =
        "inline-flex";


    switchCamera.disabled =
        true;
}


/* =========================
   RECORD TIME
========================= */

function updateRecordTime() {

    if (!recordTime) return;


    const minutes =
        Math.floor(
            recordingSeconds / 60
        )
        .toString()
        .padStart(2, "0");


    const seconds =
        (recordingSeconds % 60)
        .toString()
        .padStart(2, "0");


    recordTime.textContent =
        `🔴 ${minutes}:${seconds}`;
}


/* =========================
   STOP RECORD
========================= */

stopRecord?.addEventListener(
    "click",
    stopRecording
);


function stopRecording() {

    if (recordingTimer) {

        clearInterval(
            recordingTimer
        );

        recordingTimer = null;
    }


    if (
        recorder &&
        recorder.state !==
            "inactive"
    ) {

        recorder.stop();
    }


    recordTime?.classList.remove(
        "show"
    );


    stopRecord.style.display =
        "none";


    if (
        videoMode?.classList.contains(
            "active"
        )
    ) {

        startRecord.style.display =
            "inline-flex";
    }


    if (switchCamera) {

        switchCamera.disabled =
            false;
    }
}


/* =========================
   FINISH VIDEO
========================= */

function finishRecording() {

    if (!chunks.length) {
        return;
    }


    const mimeType =
        recorder?.mimeType ||
        "video/webm";


    const blob =
        new Blob(
            chunks,
            {
                type:
                    mimeType
            }
        );


    const file =
        new File(
            [blob],
            `swiftcortex-video-${Date.now()}.webm`,
            {
                type:
                    mimeType
            }
        );


    selectedVideo = file;
    selectedImage = null;
    selectedFile = null;


    showPreview(
        file,
        "video"
    );


    if (mediaResult) {

        mediaResult.innerHTML = "";


        const video =
            document.createElement(
                "video"
            );


        video.src =
            URL.createObjectURL(
                file
            );


        video.controls = true;
        video.playsInline = true;


        mediaResult.appendChild(
            video
        );
    }


    chunks = [];
}


/* =========================
   THINK HARDER
========================= */

thinkBtn?.addEventListener(
    "click",
    () => {

        thinkHarder =
            !thinkHarder;


        if (thinkHarder) {

            thinkBtn.textContent =
                "🧠 Think Harder ✓";

            thinkBtn.style.background =
                "#00e5ff";

            thinkBtn.style.color =
                "#001018";

        } else {

            thinkBtn.textContent =
                "🧠 Think Harder";

            thinkBtn.style.background =
                "";

            thinkBtn.style.color =
                "";
        }


        closeMenu();
    }
);


/* =========================
   PLUGINS
========================= */

pluginBtn?.addEventListener(
    "click",
    () => {

        closeMenu();

        addMessage(
            "🧩 Plugins are ready to be connected."
        );
    }
);


/* =========================
   TEXT INPUT
========================= */

function resizeInput() {

    if (!userInput) return;

    userInput.style.height =
        "auto";

    userInput.style.height =
        Math.min(
            userInput.scrollHeight,
            150
        ) + "px";
}


userInput?.addEventListener(
    "input",
    resizeInput
);


/* =========================
   ENTER TO SEND
========================= */

userInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);
/* =========================
   SEND BUTTON
========================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    if (sending) return;


    const text =
        userInput?.value.trim() || "";


    if (
        !text &&
        !selectedImage &&
        !selectedVideo &&
        !selectedFile
    ) {
        return;
    }


    sending = true;

    sendBtn.disabled = true;


    let attachment = null;


    if (selectedImage) {

        attachment = {
            type: "image",
            url: URL.createObjectURL(
                selectedImage
            )
        };

    } else if (selectedVideo) {

        attachment = {
            type: "video",
            url: URL.createObjectURL(
                selectedVideo
            )
        };

    } else if (selectedFile) {

        attachment = {
            type: "file",
            name: selectedFile.name
        };
    }


    addMessage(
        text ||
        "Please analyze this attachment.",
        "user",
        attachment
    );


    const message =
        text ||
        "Please analyze this attachment.";


    userInput.value = "";

    resizeInput();

    clearAttachment();


    const thinking =
        addMessage(
            "Thinking...",
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

                        message:

                            message,

                        thinkHarder:

                            thinkHarder
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );
        }


        const data =
            await response.json();


        thinking?.remove();


        const reply =
            data.reply ||
            data.message ||
            data.text ||
            data.output;


        if (reply) {

            addMessage(
                reply,
                "ai"
            );

        } else {

            addMessage(
                "⚠️ AI returned an empty response.",
                "ai"
            );
        }


    } catch (error) {

        console.error(
            "SwiftCortex:",
/* =========================
   SEND BUTTON
========================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);


/* =========================
   ENTER TO SEND
========================= */

userInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


/* =========================
   FILE TO BASE64
========================= */

function fileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                resolve(
                    reader.result
                );
            };

            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Could not read file."
                        )
                    );

                };

            reader.readAsDataURL(file);
        }
    );
}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    if (sending) return;


    const text =
        userInput?.value.trim() || "";


    const hasImage =
        !!selectedImage;

    const hasVideo =
        !!selectedVideo;


    /*
     * IMPORTANT:
     *
     * If there is NO image/video,
     * send ONLY the text.
     *
     * This prevents large attachment
     * data from being accidentally sent
     * with news/text questions.
     */

    if (
        !text &&
        !hasImage &&
        !hasVideo &&
        !selectedFile
    ) {

        return;
    }


    sending = true;


    if (sendBtn) {
        sendBtn.disabled = true;
    }


    try {

        /* =========================
           SHOW USER MESSAGE
        ========================= */

        let attachment = null;


        if (hasImage) {

            attachment = {
                type: "image",
                url:
                    URL.createObjectURL(
                        selectedImage
                    )
            };

        }

        else if (hasVideo) {

            attachment = {
                type: "video",
                url:
                    URL.createObjectURL(
                        selectedVideo
                    )
            };

        }

        else if (selectedFile) {

            attachment = {
                type: "file",
                name:
                    selectedFile.name
            };

        }


        addMessage(
            text,
            "user",
            attachment
        );


        /* =========================
           BUILD REQUEST
        ========================= */

        const requestBody = {

            /*
             * ALWAYS send text.
             */

            message: text

        };


        /*
         * IMAGE
         *
         * Only send image when an image
         * is actually selected.
         */

        if (hasImage) {

            requestBody.image =
                await fileToBase64(
                    selectedImage
                );

        }


        /*
         * VIDEO
         *
         * Do NOT send the entire video.
         *
         * Instead create only a maximum
         * of 2 small preview frames.
         */

        if (hasVideo) {

            const frames =
                await createVideoFrames(
                    selectedVideo
                );

            if (frames.length > 0) {

                requestBody.videoFrames =
                    frames;

            }

        }


        /*
         * Think Harder
         */

        requestBody.thinkHarder =
            thinkHarder;


        /* =========================
           CLEAR INPUT
        ========================= */

        if (userInput) {

            userInput.value = "";

            userInput.style.height =
                "auto";
        }


        clearAttachment();


        /* =========================
           AI LOADING MESSAGE
        ========================= */

        const loading =
            addMessage(
                "Thinking...",
                "ai"
            );


        /* =========================
           API REQUEST
        ========================= */

        const response =
            await fetch(
                "/api/gemini",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    /*
                     * IMPORTANT:
                     *
                     * For normal text/news,
                     * this contains ONLY:
                     *
                     * {
                     *   message: "..."
                     * }
                     *
                     * No old image/video data.
                     */

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Invalid server response."
            );

        }


        /* =========================
           SERVER ERROR
        ========================= */

        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Server error: ${response.status}`
            );

        }


        /* =========================
           AI RESPONSE
        ========================= */

        const reply =
            data?.text ||
            "No response from AI.";


        if (loading) {

            loading.innerHTML = "";

            const textBox =
                document.createElement(
                    "div"
                );

            textBox.textContent =
                reply;

            loading.appendChild(
                textBox
            );

        }


        messages.scrollTop =
            messages.scrollHeight;


    } catch (error) {

        console.error(
            "SwiftCortex:",
            error
        );


        addMessage(
            "❌ Connection error: " +
            error.message,
            "ai"
        );

    } finally {

        sending = false;


        if (sendBtn) {
            sendBtn.disabled = false;
        }

    }

}


/* =========================
   VIDEO FRAME CREATOR
========================= */

function createVideoFrames(file) {

    return new Promise(
        resolve => {

            const video =
                document.createElement(
                    "video"
                );

            const url =
                URL.createObjectURL(
                    file
                );

            video.src = url;

            video.muted = true;

            video.playsInline = true;

            video.preload = "metadata";


            video.onloadedmetadata =
                () => {

                    const duration =
                        video.duration || 1;


                    /*
                     * Only TWO frames.
                     *
                     * This keeps request size
                     * much smaller.
                     */

                    const times = [

                        0,

                        Math.max(
                            0,
                            duration / 2
                        )

                    ];


                    const frames = [];

                    let index = 0;


                    function captureNext() {

                        if (
                            index >=
                            times.length
                        ) {

                            URL.revokeObjectURL(
                                url
                            );

                            resolve(
                                frames
                            );

                            return;
                        }


                        video.currentTime =
                            times[index];

                    }


                    video.onseeked =
                        () => {

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            /*
                             * Small resolution
                             * to prevent 413.
                             */

                            const maxWidth =
                                640;


                            const scale =
                                Math.min(
                                    1,
                                    maxWidth /
                                    video.videoWidth
                                );


                            canvas.width =
                                Math.max(
                                    1,
                                    Math.floor(
                                        video.videoWidth *
                                        scale
                                    )
                                );


                            canvas.height =
                                Math.max(
                                    1,
                                    Math.floor(
                                        video.videoHeight *
                                        scale
                                    )
                                );


                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            if (ctx) {

                                ctx.drawImage(
                                    video,
                                    0,
                                    0,
                                    canvas.width,
                                    canvas.height
                                );


                                frames.push(
                                    canvas.toDataURL(
                                        "image/jpeg",
                                        0.65
                                    )
                                );

                            }


                            index++;

                            captureNext();

                        };


                    captureNext();

                };


            video.onerror =
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                    resolve([]);

                };

        }
    );
}


/* =========================
   NEW CHAT
========================= */

const newChat =
    $("newChat");

const historyList =
    $("historyList");


newChat?.addEventListener(
    "click",
    () => {

        if (messages) {

            messages.innerHTML = "";

            addMessage(
                "👋 Hello! I am SwiftCortex AI. How can I help you?"
            );

        }

        clearAttachment();

        if (userInput) {

            userInput.value = "";

            userInput.style.height =
                "auto";
        }

    }
);


/* =========================
   THEME
========================= */

const themeBtn =
    $("themeBtn");


themeBtn?.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light-mode"
        );

    }
);


/* =========================
   INITIAL STATE
========================= */

console.log(
    "⚡ SwiftCortex AI Ultra loaded successfully."
);
