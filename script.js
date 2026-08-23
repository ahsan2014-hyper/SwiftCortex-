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
const takePhoto = $("takePhoto");
const switchCamera = $("switchCamera");

const photoMode = $("photoMode");
const videoMode = $("videoMode");
const startRecord = $("startRecord");
const stopRecord = $("stopRecord");
const recordTime = $("recordTime");
const mediaResult = $("mediaResult");

let selectedImage = null;
let selectedVideo = null;
let selectedFile = null;

let cameraStream = null;
let cameraFacing = "user";

let recorder = null;
let recordedChunks = [];
let recordingSeconds = 0;
let recordingTimer = null;

let thinkHarder = false;
let sending = false;


/* =========================
   SAFE TEXT
========================= */

function textOf(value) {
    return value == null ? "" : String(value);
}


/* =========================
   PLUS MENU
========================= */

plusBtn?.addEventListener("click", e => {

    e.preventDefault();
    e.stopPropagation();

    plusMenu?.classList.toggle("show");
});


document.addEventListener("click", e => {

    if (
        plusMenu &&
        !plusMenu.contains(e.target) &&
        e.target !== plusBtn
    ) {
        plusMenu.classList.remove("show");
    }
});


function closePlus() {
    plusMenu?.classList.remove("show");
}


/* =========================
   MESSAGE
========================= */

function addMessage(
    text = "",
    type = "ai",
    attachment = null
) {

    if (!messages) return null;

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

        img.alt = "Uploaded image";

        img.style.maxWidth = "280px";
        img.style.maxHeight = "280px";
        img.style.width = "auto";
        img.style.height = "auto";
        img.style.borderRadius = "14px";
        img.style.display = "block";
        img.style.marginTop = "8px";
        img.style.objectFit = "contain";

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
   PREVIEW
========================= */

function showPreview(file, type = "file") {

    if (!imagePreview) return;

    imagePreview.innerHTML = "";

    const box =
        document.createElement("div");

    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.gap = "10px";
    box.style.padding = "8px";
    box.style.borderRadius = "12px";


    /*
       IMAGE:
       DON'T SHOW FILE NAME
    */

    if (type === "image") {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.style.width = "64px";
        img.style.height = "64px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "10px";

        box.appendChild(img);

    } else {

        const name =
            document.createElement("span");

        name.textContent =
            type === "video"
                ? "🎥 Video ready"
                : "📄 " + file.name;

        name.style.color = "white";
        name.style.flex = "1";

        box.appendChild(name);
    }


    const remove =
        document.createElement("button");

    remove.type = "button";
    remove.textContent = "✕";

    remove.style.border = "0";
    remove.style.background = "#374151";
    remove.style.color = "white";
    remove.style.borderRadius = "8px";
    remove.style.padding = "6px 9px";

    remove.onclick = clearAttachments;

    box.appendChild(remove);

    imagePreview.appendChild(box);
}


/* =========================
   CLEAR ATTACHMENTS
========================= */

function clearAttachments() {

    selectedImage = null;
    selectedVideo = null;
    selectedFile = null;

    if (imageInput)
        imageInput.value = "";

    if (fileInput)
        fileInput.value = "";

    if (imagePreview)
        imagePreview.innerHTML = "";
}


/* =========================
   PHOTOS
========================= */

photoBtn?.addEventListener("click", () => {

    closePlus();

    if (!imageInput) return;

    imageInput.value = "";
    imageInput.click();
});


imageInput?.addEventListener("change", () => {

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

    showPreview(file, "image");
});


/* =========================
   FILES
========================= */

fileBtn?.addEventListener("click", () => {

    closePlus();

    if (!fileInput) return;

    fileInput.value = "";
    fileInput.click();
});


fileInput?.addEventListener("change", () => {

    const file =
        fileInput.files?.[0];

    if (!file) return;


    if (file.type.startsWith("image/")) {

        selectedImage = file;
        selectedVideo = null;
        selectedFile = null;

        showPreview(file, "image");

        return;
    }


    if (file.type.startsWith("video/")) {

        selectedVideo = file;
        selectedImage = null;
        selectedFile = null;

        showPreview(file, "video");

        return;
    }


    selectedFile = file;
    selectedImage = null;
    selectedVideo = null;

    showPreview(file, "file");
});


/* =========================
   CAMERA OPEN
========================= */

cameraBtn?.addEventListener("click", async () => {

    closePlus();

    if (!cameraModal) {

        addMessage(
            "❌ Camera is unavailable."
        );

        return;
    }

    cameraModal.classList.add("show");

    await startCamera();
});


/* =========================
   CAMERA
========================= */

async function startCamera() {

    stopCamera();

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        addMessage(
            "❌ Camera is not supported by this browser."
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


        if (cameraVideo) {

            cameraVideo.srcObject =
                cameraStream;

            await cameraVideo.play();
        }

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        addMessage(
            "❌ Camera permission or device error."
        );
    }
}


/* =========================
   STOP CAMERA
========================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => track.stop());

        cameraStream = null;
    }

    if (cameraVideo)
        cameraVideo.srcObject = null;
}


/* =========================
   CLOSE CAMERA
========================= */

cameraClose?.addEventListener(
    "click",
    closeCamera
);


function closeCamera() {

    if (recorder &&
        recorder.state !== "inactive") {

        try {
            recorder.stop();
        } catch {}
    }

    stopCamera();

    cameraModal?.classList.remove("show");
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

        photoMode.classList.add("active");
        videoMode?.classList.remove("active");

        if (takePhoto)
            takePhoto.style.display =
                "inline-flex";

        if (startRecord)
            startRecord.style.display =
                "none";

        if (stopRecord)
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

        videoMode.classList.add("active");
        photoMode?.classList.remove("active");

        if (takePhoto)
            takePhoto.style.display =
                "none";

        if (startRecord)
            startRecord.style.display =
                "inline-flex";

        if (stopRecord)
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

    if (!cameraVideo) return;

    if (!cameraStream) {

        addMessage(
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

            selectedImage =
                new File(
                    [blob],
                    "camera-photo.jpg",
                    {
                        type:
                            "image/jpeg"
                    }
                );

            selectedVideo = null;
            selectedFile = null;

            showPreview(
                selectedImage,
                "image"
            );

            closeCamera();

        },
        "image/jpeg",
        0.85
    );
}


/* =========================
   VIDEO MIME
========================= */

function getVideoMime() {

    if (!window.MediaRecorder)
        return "";

    const types = [

        "video/webm;codecs=vp9,opus",

        "video/webm;codecs=vp8,opus",

        "video/webm"

    ];

    for (const type of types) {

        if (
            MediaRecorder.isTypeSupported(type)
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


    recordedChunks = [];


    const mime =
        getVideoMime();


    try {

        recorder =
            mime
                ? new MediaRecorder(
                    cameraStream,
                    {
                        mimeType: mime
                    }
                )
                : new MediaRecorder(
                    cameraStream
                );

    } catch (error) {

        console.error(error);

        addMessage(
            "❌ Could not start video recording."
        );

        return;
    }


    recorder.ondataavailable =
        e => {

            if (
                e.data &&
                e.data.size > 0
            ) {

                recordedChunks.push(e.data);
            }
        };


    recorder.onstop =
        finishRecording;


    recorder.start(1000);


    recordingSeconds = 0;

    updateRecordTime();


    recordingTimer =
        setInterval(() => {

            recordingSeconds++;

            updateRecordTime();

        },1000);


    recordTime?.classList.add("show");


    if (startRecord)
        startRecord.style.display =
            "none";

    if (stopRecord)
        stopRecord.style.display =
            "inline-flex";


    if (switchCamera)
        switchCamera.disabled = true;
}


/* =========================
   RECORD TIMER
========================= */

function updateRecordTime() {

    if (!recordTime) return;

    const min =
        Math.floor(
            recordingSeconds / 60
        )
        .toString()
        .padStart(2,"0");


    const sec =
        (recordingSeconds % 60)
        .toString()
        .padStart(2,"0");


    recordTime.textContent =
        `🔴 ${min}:${sec}`;
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
        recorder.state !== "inactive"
    ) {

        recorder.stop();
    }


    recordTime?.classList.remove("show");


    if (stopRecord)
        stopRecord.style.display =
            "none";


    if (startRecord)
        startRecord.style.display =
            "inline-flex";


    if (switchCamera)
        switchCamera.disabled = false;
}


/* =========================
   FINISH RECORDING
========================= */

function finishRecording() {

    if (!recordedChunks.length)
        return;


    const type =
        recorder?.mimeType ||
        "video/webm";


    const blob =
        new Blob(
            recordedChunks,
            {
                type
            }
        );


    selectedVideo =
        new File(
            [blob],
            "swiftcortex-video.webm",
            {
                type
            }
        );


    selectedImage = null;
    selectedFile = null;


    showPreview(
        selectedVideo,
        "video"
    );


    if (mediaResult) {

        mediaResult.innerHTML = "";

        const video =
            document.createElement("video");

        video.src =
            URL.createObjectURL(
                selectedVideo
            );

        video.controls = true;
        video.playsInline = true;

        mediaResult.appendChild(video);
    }


    recordedChunks = [];
}
/* =========================
   IMAGE COMPRESSION
========================= */

function compressImage(file){

    return new Promise((resolve,reject)=>{

        const img=new Image();

        img.onload=()=>{

            const max=1000;

            let w=img.width;
            let h=img.height;

            if(w>max){

                h=Math.round(h*max/w);
                w=max;
            }

            if(h>max){

                w=Math.round(w*max/h);
                h=max;
            }

            const canvas=
                document.createElement("canvas");

            canvas.width=w;
            canvas.height=h;

            const ctx=
                canvas.getContext("2d");

            ctx.drawImage(
                img,
                0,
                0,
                w,
                h
            );

            resolve(
                canvas.toDataURL(
                    "image/jpeg",
                    0.65
                )
            );

            URL.revokeObjectURL(img.src);
        };

        img.onerror=reject;

        img.src=
            URL.createObjectURL(file);
    });
}


/* =========================
   VIDEO FRAME
========================= */

async function getVideoFrames(file){

    return new Promise(resolve=>{

        const video=
            document.createElement("video");

        const url=
            URL.createObjectURL(file);

        video.src=url;
        video.muted=true;
        video.playsInline=true;

        video.onloadedmetadata=()=>{

            const duration=
                video.duration || 1;

            const times=[
                0,
                duration/2,
                Math.max(0,duration-0.2)
            ];

            const frames=[];

            let index=0;

            function capture(){

                if(index>=times.length){

                    URL.revokeObjectURL(url);
                    resolve(frames);
                    return;
                }

                video.currentTime=
                    times[index];

                video.onseeked=()=>{

                    const canvas=
                        document.createElement("canvas");

                    const max=640;

                    let w=
                        video.videoWidth || 640;

                    let h=
                        video.videoHeight || 360;

                    if(w>max){

                        h=Math.round(h*max/w);
                        w=max;
                    }

                    canvas.width=w;
                    canvas.height=h;

                    const ctx=
                        canvas.getContext("2d");

                    ctx.drawImage(
                        video,
                        0,
                        0,
                        w,
                        h
                    );

                    frames.push(
                        canvas.toDataURL(
                            "image/jpeg",
                            0.55
                        )
                    );

                    index++;

                    capture();
                };
            }

            capture();
        };

        video.onerror=()=>{

            URL.revokeObjectURL(url);
            resolve([]);
        };
    });
}


/* =========================
   LANGUAGE
========================= */

function detectLanguage(text){

    if(!text)
        return "English";

    if(/[অ-হ]/.test(text))
        return "Bengali";

    if(/[ا-ي]/.test(text))
        return "Arabic";

    if(/[अ-ह]/.test(text))
        return "Hindi";

    if(/[ก-๙]/.test(text))
        return "Thai";

    if(/[一-龯]/.test(text))
        return "Chinese";

    if(/[ぁ-んァ-ン]/.test(text))
        return "Japanese";

    if(/[가-힣]/.test(text))
        return "Korean";

    return "English";
}


/* =========================
   SEND
========================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);


async function sendMessage(){

    if(sending)
        return;

    const text=
        userInput?.value.trim() || "";


    if(
        !text &&
        !selectedImage &&
        !selectedVideo &&
        !selectedFile
    ){
        return;
    }


    sending=true;


    if(sendBtn)
        sendBtn.disabled=true;


    let attachment=null;


    /* IMAGE */

    if(selectedImage){

        attachment={
            type:"image",
            url:
                URL.createObjectURL(
                    selectedImage
                )
        };
    }


    /* VIDEO */

    else if(selectedVideo){

        attachment={
            type:"video",
            url:
                URL.createObjectURL(
                    selectedVideo
                )
        };
    }


    /* FILE */

    else if(selectedFile){

        attachment={
            type:"file",
            name:selectedFile.name
        };
    }


    addMessage(
        text ||
        (
            selectedImage
                ? "🖼 Image"
                : selectedVideo
                    ? "🎥 Video"
                    : "📄 File"
        ),
        "user",
        attachment
    );


    if(userInput)
        userInput.value="";


    const thinkingMessage=
        addMessage(
            "Thinking...",
            "ai"
        );


    try{

        let image=null;
        let videoFrames=[];


        /*
         IMAGE
        */

        if(selectedImage){

            image=
                await compressImage(
                    selectedImage
                );
        }


        /*
         VIDEO
        */

        if(selectedVideo){

            videoFrames=
                await getVideoFrames(
                    selectedVideo
                );
        }


        /*
         FILE
        */

        let fileInfo=null;

        if(selectedFile){

            fileInfo={
                name:selectedFile.name,
                type:selectedFile.type,
                size:selectedFile.size
            };
        }


        const payload={

            message:text,

            image:image,

            videoFrames:videoFrames,

            file:fileInfo,

            thinkHarder:thinkHarder,

            language:
                detectLanguage(text),

            clientDate:
                new Date().toISOString(),

            timezone:
                Intl.DateTimeFormat()
                    .resolvedOptions()
                    .timeZone
        };


        const response=
            await fetch(
                "/api/gemini",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        let data=null;

        try{

            data=
                await response.json();

        }catch{

            throw new Error(
                "Invalid server response."
            );
        }


        if(!response.ok){

            throw new Error(
                data?.error ||
                `Server error: ${response.status}`
            );
        }


        let reply=
            data?.text ||
            data?.reply ||
            data?.message ||
            "No response from AI.";


        if(
            typeof reply!=="string"
        ){

            reply=
                JSON.stringify(reply);
        }


        if(thinkingMessage){

            thinkingMessage.textContent=
                reply;
        }


    }catch(error){

        console.error(
            "SwiftCortex:",
            error
        );


        if(thinkingMessage){

            thinkingMessage.textContent=
                "❌ Connection error: "+
                error.message;
        }
    }


    clearAttachments();


    if(userInput){

        userInput.style.height=
            "auto";
    }


    sending=false;


    if(sendBtn)
        sendBtn.disabled=false;
}


/* =========================
   ENTER SEND
========================= */

userInput?.addEventListener(
    "keydown",
    e=>{

        if(
            e.key==="Enter" &&
            !e.shiftKey
        ){

            e.preventDefault();

            sendMessage();
        }
    }
);


/* =========================
   TEXT RESIZE
========================= */

userInput?.addEventListener(
    "input",
    ()=>{

        userInput.style.height=
            "auto";

        userInput.style.height=
            Math.min(
                userInput.scrollHeight,
                150
            )+"px";
    }
);


/* =========================
   THINK HARDER
========================= */

thinkBtn?.addEventListener(
    "click",
    ()=>{

        thinkHarder=
            !thinkHarder;


        thinkBtn.textContent=
            thinkHarder
                ? "🧠 Think Harder ✓"
                : "🧠 Think Harder";


        closePlus();
    }
);


/* =========================
   PLUGINS
========================= */

pluginBtn?.addEventListener(
    "click",
    ()=>{

        closePlus();

        const existing=
            document.getElementById(
                "pluginPanel"
            );

        if(existing){

            existing.remove();
            return;
        }


        const panel=
            document.createElement("div");

        panel.id="pluginPanel";

        panel.style.position="fixed";
        panel.style.right="20px";
        panel.style.bottom="90px";
        panel.style.width="280px";
        panel.style.maxWidth="calc(100vw - 40px)";
        panel.style.background="#0f172a";
        panel.style.color="white";
        panel.style.padding="18px";
        panel.style.borderRadius="18px";
        panel.style.zIndex="10000";
        panel.style.boxShadow=
            "0 15px 50px rgba(0,0,0,.5)";


        panel.innerHTML=`

            <h3 style="margin-top:0">
                🧩 Plugins
            </h3>

            <button data-plugin="web">
                🌐 Web Search
            </button>

            <button data-plugin="news">
                📰 Real-time News
            </button>

            <button data-plugin="calculator">
                🧮 Calculator
            </button>

            <button data-plugin="weather">
                🌦️ Weather
            </button>

            <button data-plugin="files">
                📄 File Tools
            </button>

            <button data-plugin="image">
                🖼️ Image Tools
            </button>

        `;


        panel.querySelectorAll(
            "button"
        ).forEach(btn=>{

            btn.style.width="100%";
            btn.style.padding="11px";
            btn.style.marginTop="8px";
            btn.style.border="0";
            btn.style.borderRadius="10px";
            btn.style.background="#1e293b";
            btn.style.color="white";
            btn.style.cursor="pointer";


            btn.onclick=()=>{

                const name=
                    btn.dataset.plugin;

                if(name==="news"){

                    userInput.value=
                        "What are today's latest news?";

                }else if(name==="web"){

                    userInput.value=
                        "Search the web for the latest information about ";

                }else if(name==="calculator"){

                    userInput.value=
                        "Calculate ";

                }else if(name==="weather"){

                    userInput.value=
                        "What is the current weather in ";

                }else{

                    addMessage(
                        "🧩 "+name+
                        " plugin selected."
                    );
                }


                panel.remove();

                userInput?.focus();
            };
        });


        document.body.appendChild(panel);
    }
);


/* =========================
   NEW CHAT
========================= */

$("newChat")?.addEventListener(
    "click",
    ()=>{

        if(messages)
            messages.innerHTML="";


        addMessage(
            "👋 Hello! I am SwiftCortex AI. How can I help you?"
        );


        clearAttachments();

        if(userInput){

            userInput.value="";
            userInput.focus();
        }
    }
);


/* =========================
   SETTINGS
========================= */

function openSettings(){

    let panel=
        document.getElementById(
            "settingsPanel"
        );


    if(panel){

        panel.remove();
        return;
    }


    panel=
        document.createElement("div");

    panel.id="settingsPanel";


    panel.style.position="fixed";
    panel.style.inset="0";
    panel.style.background=
        "rgba(0,0,0,.75)";
    panel.style.zIndex="20000";
    panel.style.display="flex";
    panel.style.alignItems="center";
    panel.style.justifyContent="center";
    panel.style.padding="20px";


    panel.innerHTML=`

      <div style="
        width:min(500px,100%);
        max-height:85vh;
        overflow:auto;
        background:#0f172a;
        color:white;
        border-radius:22px;
        padding:22px;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
        ">

          <h2>⚙️ Settings</h2>

          <button id="closeSettings">
            ✕
          </button>

        </div>


        <hr>


        <h3>🎨 Appearance</h3>

        <button id="toggleTheme">
          🌙 Dark / ☀️ Light
        </button>


        <h3>🧠 AI</h3>

        <label>
          <input
            type="checkbox"
            id="memoryToggle"
            checked
          >
          Memory
        </label>

        <br><br>

        <label>
          <input
            type="checkbox"
            id="historyToggle"
            checked
          >
          Chat History
        </label>

        <br><br>

        <label>
          <input
            type="checkbox"
            id="webToggle"
            checked
          >
          Web Search
        </label>

        <br><br>

        <label>
          <input
            type="checkbox"
            id="newsToggle"
            checked
          >
          Real-time News
        </label>


        <h3>🔊 Voice</h3>

        <label>
          <input
            type="checkbox"
            id="voiceToggle"
          >
          Voice Features
        </label>


        <h3>🔔 Notifications</h3>

        <label>
          <input
            type="checkbox"
            id="notificationToggle"
          >
          Notifications
        </label>


        <h3>🔒 Privacy</h3>

        <button id="clearMemory">
          🧹 Clear Memory
        </button>

        <button id="clearHistory">
          🗑️ Clear Chat History
        </button>


        <h3>🤖 Model</h3>

        <select id="modelSelect">

          <option value="qwen">
            Qwen Vision
          </option>

          <option value="compound">
            Groq Compound
          </option>

        </select>


        <h3>ℹ️ About</h3>

        <p>
          SwiftCortex AI Ultra
        </p>

        <p>
          AI assistant with text,
          image, camera, video,
          web and news capabilities.
        </p>

      </div>
    `;


    document.body.appendChild(panel);


    $("closeSettings").onclick=
        ()=>panel.remove();


    $("toggleTheme").onclick=
        toggleTheme;


    $("clearMemory").onclick=
        ()=>{

            localStorage.removeItem(
                "swiftcortex_memory"
            );

            alert(
                "Memory cleared."
            );
        };


    $("clearHistory").onclick=
        ()=>{

            if(messages)
                messages.innerHTML="";

            alert(
                "Chat history cleared."
            );
        };
}


/* =========================
   SETTINGS BUTTON
========================= */

function createSettingsButton(){

    const sidebar=
        document.querySelector(
            ".side-bottom"
        );

    if(!sidebar)
        return;


    if(
        document.getElementById(
            "settingsBtn"
        )
    )
        return;


    const btn=
        document.createElement("button");

    btn.id="settingsBtn";

    btn.textContent=
        "⚙️ Settings";

    btn.onclick=
        openSettings;


    sidebar.appendChild(btn);
}


createSettingsButton();


/* =========================
   THEME
========================= */

function toggleTheme(){

    document.body.classList.toggle(
        "light-mode"
    );


    const light=
        document.body.classList.contains(
            "light-mode"
        );


    localStorage.setItem(
        "swiftcortex_theme",
        light
            ? "light"
            : "dark"
    );


    const themeBtn=
        $("themeBtn");


    if(themeBtn){

        themeBtn.textContent=
            light
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";
    }
}


/* =========================
   LOAD THEME
========================= */

if(
    localStorage.getItem(
        "swiftcortex_theme"
    )==="light"
){

    document.body.classList.add(
        "light-mode"
    );

    if($("themeBtn"))
        $("themeBtn").textContent=
            "☀️ Light Mode";
}


/* =========================
   EXISTING THEME BUTTON
========================= */

$("themeBtn")?.addEventListener(
    "click",
    toggleTheme
);


/* =========================
   READY
========================= */

console.log(
    "⚡ SwiftCortex AI Ultra loaded successfully"
);
