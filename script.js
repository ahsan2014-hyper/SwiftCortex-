/* =========================================================
   SwiftCortex AI Ultra
   Complete script.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ================= ELEMENTS ================= */

    const messages = document.getElementById("messages");
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

    const switchCamera =
        document.getElementById("switchCamera");

    const recordTime =
        document.getElementById("recordTime");

    const mediaResult =
        document.getElementById("mediaResult");


    /* ================= STATE ================= */

    let selectedImage = null;
    let selectedVideo = null;

    let cameraStream = null;
    let mediaRecorder = null;
    let recordedChunks = [];

    let facingMode = "user";

    let recordingSeconds = 0;
    let recordingTimer = null;

    let sending = false;

    let thinkHarder = false;


    /* =========================================================
       PLUS MENU
    ========================================================= */

    plusBtn?.addEventListener("click", (e) => {

        e.stopPropagation();

        plusMenu?.classList.toggle("show");

    });


    document.addEventListener("click", (e) => {

        if (
            plusMenu &&
            !plusMenu.contains(e.target) &&
            e.target !== plusBtn
        ) {

            plusMenu.classList.remove("show");

        }

    });


    /* =========================================================
       PHOTO BUTTON
    ========================================================= */

    photoBtn?.addEventListener("click", () => {

        plusMenu?.classList.remove("show");

        imageInput?.click();

    });


    /* =========================================================
       IMAGE SELECT
    ========================================================= */

    imageInput?.addEventListener("change", () => {

        const file = imageInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            showAIMessage(
                "⚠️ Please select a valid image."
            );

            return;

        }

        selectedImage = file;
        selectedVideo = null;

        showSelectedMedia(file, "image");

    });


    /* =========================================================
       FILE BUTTON
    ========================================================= */

    fileBtn?.addEventListener("click", () => {

        plusMenu?.classList.remove("show");

        fileInput?.click();

    });


    /* =========================================================
       FILE SELECT
    ========================================================= */

    fileInput?.addEventListener("change", () => {

        const file = fileInput.files?.[0];

        if (!file) return;


        if (file.type.startsWith("image/")) {

            selectedImage = file;
            selectedVideo = null;

            showSelectedMedia(file, "image");

        }

        else if (file.type.startsWith("video/")) {

            selectedVideo = file;
            selectedImage = null;

            showSelectedMedia(file, "video");

        }

        else {

            showAIMessage(
                "📄 File selected: " + file.name
            );

        }

    });


    /* =========================================================
       CAMERA BUTTON
    ========================================================= */

    cameraBtn?.addEventListener("click", async () => {

        plusMenu?.classList.remove("show");

        await openCamera();

    });


    /* =========================================================
       OPEN CAMERA
    ========================================================= */

    async function openCamera() {

        if (!cameraModal) return;

        cameraModal.classList.add("show");

        hideCameraError();

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
                    facingMode: facingMode,
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
                "No camera was found on this device.";

        }

        else if (error?.name === "NotReadableError") {

            text =
                "Camera is being used by another application.";

        }

        else if (error?.message) {

            text = error.message;

        }

        if (cameraErrorText) {

            cameraErrorText.textContent = text;

        }

    }


    function hideCameraError() {

        cameraError?.classList.remove("show");

    }


    /* =========================================================
       CLOSE CAMERA
    ========================================================= */

    cameraClose?.addEventListener("click", () => {

        closeCamera();

    });


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

            cameraStream
                .getTracks()
                .forEach(track => track.stop());

            cameraStream = null;

        }

        if (cameraVideo) {

            cameraVideo.srcObject = null;

        }

    }


    /* =========================================================
       PHOTO MODE
    ========================================================= */

    photoMode?.addEventListener("click", async () => {

        photoMode.classList.add("active");
        videoMode?.classList.remove("active");

        takePhoto.style.display = "inline-flex";

        startRecord.style.display = "none";

        stopRecord.style.display = "none";

        try {

            await startCamera();

        }

        catch (error) {

            showCameraError(error);

        }

    });


    /* =========================================================
       VIDEO MODE
    ========================================================= */

    videoMode?.addEventListener("click", async () => {

        videoMode.classList.add("active");
        photoMode?.classList.remove("active");

        takePhoto.style.display = "none";

        startRecord.style.display = "inline-flex";

        stopRecord.style.display = "none";

        try {

            await startCamera();

        }

        catch (error) {

            showCameraError(error);

        }

    });


    /* =========================================================
       TAKE PHOTO
    ========================================================= */

    takePhoto?.addEventListener("click", () => {

        if (!cameraVideo || !cameraStream) {

            showAIMessage(
                "⚠️ Camera is not ready."
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


        canvas.toBlob(blob => {

            if (!blob) return;


            const file =
                new File(
                    [blob],
                    `swiftcortex-photo-${Date.now()}.jpg`,
                    {
                        type: "image/jpeg"
                    }
                );


            selectedImage = file;
            selectedVideo = null;

            showSelectedMedia(
                file,
                "image"
            );


            closeCamera();

        }, "image/jpeg", 0.92);

    });


    /* =========================================================
       START RECORDING
    ========================================================= */

    startRecord?.addEventListener("click", () => {

        if (!cameraStream) {

            showAIMessage(
                "⚠️ Camera is not ready."
            );

            return;

        }


        recordedChunks = [];


        let mimeType = "video/webm;codecs=vp9";


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

        }

        catch (error) {

            console.error(error);

            showAIMessage(
                "❌ Video recording is not supported."
            );

            return;

        }


        mediaRecorder.ondataavailable =
            event => {

                if (event.data?.size > 0) {

                    recordedChunks.push(
                        event.data
                    );

                }

            };


        mediaRecorder.onstop =
            finishRecording;


        mediaRecorder.start();


        startRecord.style.display = "none";

        stopRecord.style.display =
            "inline-flex";


        recordingSeconds = 0;

        updateRecordTime();

        recordTime?.classList.add("show");


        recordingTimer =
            setInterval(() => {

                recordingSeconds++;

                updateRecordTime();

            }, 1000);

    });


    /* =========================================================
       STOP RECORDING
    ========================================================= */

    stopRecord?.addEventListener("click", () => {

        stopRecording();

    });


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

            startRecord.style.display =
                "inline-flex";

        }


        if (stopRecord) {

            stopRecord.style.display =
                "none";

        }

    }


    function finishRecording() {

        if (!recordedChunks.length) {

            showAIMessage(
                "⚠️ No video was recorded."
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
                `swiftcortex-video-${Date.now()}.webm`,
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


    function updateRecordTime() {

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
       SWITCH CAMERA
    ========================================================= */

    switchCamera?.addEventListener(
        "click",
        async () => {

            facingMode =
                facingMode === "user"
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


    /* =========================================================
       SELECTED MEDIA PREVIEW
    ========================================================= */

    function showSelectedMedia(
        file,
        type
    ) {

        if (!imagePreview) return;

        imagePreview.innerHTML = "";


        const wrapper =
            document.createElement("div");


        wrapper.className =
            "selected-media";


        if (type === "image") {

            const img =
                document.createElement("img");

            img.src =
                URL.createObjectURL(file);

            img.style.maxWidth = "180px";

            img.style.maxHeight = "140px";

            img.style.borderRadius = "12px";

            wrapper.appendChild(img);

        }


        if (type === "video") {

            const video =
                document.createElement("video");

            video.src =
                URL.createObjectURL(file);

            video.controls = true;

            video.style.maxWidth = "220px";

            video.style.maxHeight = "140px";

            video.style.borderRadius = "12px";

            wrapper.appendChild(video);

        }


        const name =
            document.createElement("span");

        name.textContent =
            "📎 " + file.name;


        const remove =
            document.createElement("button");

        remove.textContent = "✕";

        remove.type = "button";


        remove.onclick = () => {

            clearAttachment();

        };


        wrapper.appendChild(name);

        wrapper.appendChild(remove);


        imagePreview.appendChild(wrapper);

    }


    /* =========================================================
       CLEAR MEDIA
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
       FILE TO BASE64
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
                        typeof result !==
                        "string"
                    ) {

                        reject(
                            new Error(
                                "Could not read file."
                            )
                        );

                        return;

                    }


                    resolve(
                        result
                    );

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


        await new Promise(
            (resolve, reject) => {

                video.onloadedmetadata =
                    resolve;

                video.onerror =
                    () =>
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


        const count =
            Math.min(
                6,
                Math.max(
                    1,
                    Math.ceil(
                        duration / 5
                    )
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
       
