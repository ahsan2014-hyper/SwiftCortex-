/* =========================================================
   SwiftCortex AI Ultra
   NEW COMPLETE script.js
   Text + Image + Video + Camera + Plus Menu
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

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


    /* =====================================================
       STATE
    ===================================================== */

    let selectedImage = null;
    let selectedVideo = null;

    let cameraStream = null;

    let mediaRecorder = null;

    let recordedChunks = [];

    let facingMode = "user";

    let recordingSeconds = 0;

    let recordingTimer = null;

    let isSending = false;

    let thinkHarder = false;


    /* =====================================================
       CHECK ELEMENTS
    ===================================================== */

    console.log("================================");
    console.log("⚡ SwiftCortex AI Ultra");
    console.log("================================");

    console.log("messages:", !!messages);
    console.log("userInput:", !!userInput);
    console.log("sendBtn:", !!sendBtn);
    console.log("plusBtn:", !!plusBtn);
    console.log("plusMenu:", !!plusMenu);
    console.log("cameraBtn:", !!cameraBtn);
    console.log("photoBtn:", !!photoBtn);
    console.log("fileBtn:", !!fileBtn);


    /* =====================================================
       PLUS MENU
    ===================================================== */

    if (plusBtn && plusMenu) {

        plusBtn.addEventListener("click", (event) => {

            event.preventDefault();

            event.stopPropagation();

            plusMenu.classList.toggle("show");

        });

    }


    document.addEventListener("click", (event) => {

        if (!plusMenu || !plusBtn) {
            return;
        }

        if (
            !plusMenu.contains(event.target) &&
            event.target !== plusBtn
        ) {

            plusMenu.classList.remove("show");

        }

    });


    /* =====================================================
       PHOTO BUTTON
    ===================================================== */

    if (photoBtn && imageInput) {

        photoBtn.addEventListener("click", () => {

            plusMenu?.classList.remove("show");

            imageInput.click();

        });

    }


    /* =====================================================
       IMAGE INPUT
    ===================================================== */

    if (imageInput) {

        imageInput.addEventListener("change", () => {

            const file = imageInput.files?.[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {

                addMessage(
                    "⚠️ Please select an image.",
                    "ai"
                );

                return;
            }

            selectedImage = file;

            selectedVideo = null;

            showAttachment(file, "image");

        });

    }


    /* =====================================================
       FILE BUTTON
    ===================================================== */

    if (fileBtn && fileInput) {

        fileBtn.addEventListener("click", () => {

            plusMenu?.classList.remove("show");

            fileInput.click();

        });

    }


    /* =====================================================
       FILE INPUT
    ===================================================== */

    if (fileInput) {

        fileInput.addEventListener("change", () => {

            const file = fileInput.files?.[0];

            if (!file) {
                return;
            }


            if (file.type.startsWith("image/")) {

                selectedImage = file;

                selectedVideo = null;

                showAttachment(
                    file,
                    "image"
                );

            }

            else if (file.type.startsWith("video/")) {

                selectedVideo = file;

                selectedImage = null;

                showAttachment(
                    file,
                    "video"
                );

            }

            else {

                addMessage(
                    "📄 File selected: " + file.name,
                    "user"
                );

            }

        });

    }


    /* =====================================================
       CAMERA BUTTON
    ===================================================== */

    if (cameraBtn) {

        cameraBtn.addEventListener(
            "click",
            async () => {

                plusMenu?.classList.remove("show");

                await openCamera();

            }
        );

    }


    /* =====================================================
       OPEN CAMERA
    ===================================================== */

    async function openCamera() {

        if (!cameraModal) {
            return;
        }

        cameraModal.classList.add("show");

        hideCameraError();

        try {

            await startCamera();

        }

        catch (error) {

            console.error(
                "Camera error:",
                error
            );

            showCameraError(error);

        }

    }


    /* =====================================================
       START CAMERA
    ===================================================== */

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


        if (cameraVideo) {

            cameraVideo.srcObject =
                cameraStream;

            await cameraVideo.play();

        }

    }


    /* =====================================================
       CAMERA ERROR
    ===================================================== */

    function showCameraError(error) {

        if (!cameraError) {
            return;
        }

        cameraError.classList.add("show");


        let message =
            "Camera permission is required.";


        if (
            error?.name ===
            "NotAllowedError"
        ) {

            message =
                "Camera permission was denied. Please allow camera access.";

        }

        else if (
            error?.name ===
            "NotFoundError"
        ) {

            message =
                "No camera was found.";

        }

        else if (
            error?.name ===
            "NotReadableError"
        ) {

            message =
                "Camera is already being used.";

        }

        else if (error?.message) {

            message =
                error.message;

        }


        if (cameraErrorText) {

            cameraErrorText.textContent =
                message;

        }

    }


    function hideCameraError() {

        cameraError?.classList.remove("show");

    }


    /* =====================================================
       CLOSE CAMERA
    ===================================================== */

    if (cameraClose) {

        cameraClose.addEventListener(
            "click",
            closeCamera
        );

    }


    function closeCamera() {

        stopRecording();

        stopCamera();

        cameraModal?.classList.remove("show");

    }


    /* =====================================================
       STOP CAMERA
    ===================================================== */

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


    /* =====================================================
       PHOTO MODE
    ===================================================== */

    if (photoMode) {

        photoMode.addEventListener(
            "click",
            async () => {

                photoMode.classList.add("active");

                videoMode?.classList.remove(
                    "active"
                );


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


                try {

                    await startCamera();

                }

                catch (error) {

                    showCameraError(error);

                }

            }
        );

    }


    /* =====================================================
       VIDEO MODE
    ===================================================== */

    if (videoMode) {

        videoMode.addEventListener(
            "click",
            async () => {

                videoMode.classList.add("active");

                photoMode?.classList.remove(
                    "active"
                );


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


                try {

                    await startCamera();

                }

                catch (error) {

                    showCameraError(error);

                }

            }
        );

    }


    /* =====================================================
       TAKE PHOTO
    ===================================================== */

    if (takePhoto) {

        takePhoto.addEventListener(
            "click",
            takePhotoNow
        );

    }


    function takePhotoNow() {

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
            document.createElement("canvas");


        canvas.width =
            cameraVideo.videoWidth ||
            1280;


        canvas.height =
            cameraVideo.videoHeight ||
            720;


        const context =
            canvas.getContext("2d");


        context.drawImage(
            cameraVideo,
            0,
            0,
            canvas.width,
            canvas.height
        );


        canvas.toBlob(
            (blob) => {

                if (!blob) {
                    return;
                }


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


                showAttachment(
                    file,
                    "image"
                );


                closeCamera();

            },
            "image/jpeg",
            0.92
        );

    }


    /* =====================================================
       START RECORD
    ===================================================== */

    if (startRecord) {

        startRecord.addEventListener(
            "click",
            startRecording
        );

    }


    function startRecording() {

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

        }

        catch (error) {

            addMessage(
                "❌ Video recording is not supported.",
                "ai"
            );

            return;

        }


        mediaRecorder.ondataavailable =
            (event) => {

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
            finishRecording;


        mediaRecorder.start();


        startRecord.style.display =
            "none";


        stopRecord.style.display =
            "inline-flex";


        recordingSeconds = 0;


        if (recordTime) {

            recordTime.classList.add(
                "show"
            );

        }


        updateRecordTime();


        recordingTimer =
            setInterval(
                () => {

                    recordingSeconds++;

                    updateRecordTime();

                },
                1000
            );

    }


    /* =====================================================
       STOP RECORD
    ===================================================== */

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


    /* =====================================================
       FINISH RECORDING
    ===================================================== */

    function finishRecording() {

        if (
            !recordedChunks.length
        ) {

            addMessage(
                "⚠️ No video recorded.",
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
                `swiftcortex-video-${Date.now()}.webm`,
                {
                    type:
                        blob.type
                }
            );


        selectedVideo = file;

        selectedImage = null;


        showAttachment(
            file,
            "video"
        );


        closeCamera();

    }


    function updateRecordTime() {

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
            String(minutes)
                .padStart(2, "0") +
            ":" +
            String(seconds)
                .padStart(2, "0");

    }


    /* =====================================================
       SWITCH CAMERA
    ===================================================== */

    if (switchCamera) {

        switchCamera.addEventListener(
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

                    showCameraError(
                        error
                    );

                }

            }
        );

    }


    /* =====================================================
       ATTACHMENT PREVIEW
    ===================================================== */

    function showAttachment(
        file,
        type
    ) {

        if (!imagePreview) {
            return;
        }


        imagePreview.innerHTML = "";


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.style.display =
            "flex";

        wrapper.style.alignItems =
            "center";

        wrapper.style.gap =
            "10px";


        if (type === "image") {

            const img =
                document.createElement(
                    "img"
                );


            img.src =
                URL.createObjectURL(
                    file
                );


            img.style.width =
                "80px";


            img.style.height
