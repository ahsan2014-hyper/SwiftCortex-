"use strict";

const $=id=>document.getElementById(id);

const plusBtn=$("plusBtn");
const plusMenu=$("plusMenu");
const cameraBtn=$("cameraBtn");
const photoBtn=$("photoBtn");
const fileBtn=$("fileBtn");
const pluginBtn=$("pluginBtn");
const thinkBtn=$("thinkBtn");

const imageInput=$("imageInput");
const fileInput=$("fileInput");
const userInput=$("userInput");
const sendBtn=$("sendBtn");
const messages=$("messages");
const imagePreview=$("imagePreview");

const cameraModal=$("cameraModal");
const cameraClose=$("cameraClose");
const cameraVideo=$("cameraVideo");
const takePhoto=$("takePhoto");
const photoMode=$("photoMode");
const videoMode=$("videoMode");
const switchCamera=$("switchCamera");

let selectedImage=null;
let selectedVideo=null;
let selectedFile=null;

let cameraStream=null;
let cameraFacing="user";
let thinkHarder=false;
let sending=false;


/* PLUS */

plusBtn?.addEventListener("click",e=>{
 e.stopPropagation();
 plusMenu?.classList.toggle("show");
});

document.addEventListener("click",e=>{
 if(
  plusMenu &&
  !plusMenu.contains(e.target) &&
  e.target!==plusBtn
 ){
  plusMenu.classList.remove("show");
 }
});

function closeMenu(){
 plusMenu?.classList.remove("show");
}


/* MESSAGE */

function addMessage(text,type="ai",attachment=null){

 const box=document.createElement("div");

 box.className=
  type==="user"
   ?"user-message"
   :"ai-message";

 if(text){
  const p=document.createElement("div");
  p.textContent=text;
  box.appendChild(p);
 }

 if(attachment?.type==="image"){
  const img=document.createElement("img");
  img.src=attachment.url;
  img.style.maxWidth="280px";
  img.style.borderRadius="14px";
  box.appendChild(img);
 }

 if(attachment?.type==="video"){
  const v=document.createElement("video");
  v.src=attachment.url;
  v.controls=true;
  v.playsInline=true;
  v.style.maxWidth="300px";
  v.style.borderRadius="14px";
  box.appendChild(v);
 }

 if(attachment?.type==="file"){
  const f=document.createElement("div");
  f.textContent="📄 "+attachment.name;
  box.appendChild(f);
 }

 messages?.appendChild(box);

 if(messages)
  messages.scrollTop=messages.scrollHeight;

 return box;
}


/* PHOTOS */

photoBtn?.addEventListener("click",()=>{
 closeMenu();
 imageInput.value="";
 imageInput.click();
});

imageInput?.addEventListener("change",()=>{

 const file=imageInput.files?.[0];

 if(!file)return;

 if(!file.type.startsWith("image/")){
  addMessage("⚠️ Please select an image.");
  return;
 }

 selectedImage=file;
 selectedVideo=null;
 selectedFile=null;

 showPreview(file,"image");
});


/* FILES */

fileBtn?.addEventListener("click",()=>{
 closeMenu();
 fileInput.value="";
 fileInput.click();
});

fileInput?.addEventListener("change",()=>{

 const file=fileInput.files?.[0];

 if(!file)return;

 selectedImage=null;
 selectedVideo=null;
 selectedFile=null;

 if(file.type.startsWith("image/")){
  selectedImage=file;
  showPreview(file,"image");
 }
 else if(file.type.startsWith("video/")){
  selectedVideo=file;
  showPreview(file,"video");
 }
 else{
  selectedFile=file;
  showPreview(file,"file");
 }
});


/* PREVIEW */

function showPreview(file,type){

 if(!imagePreview)return;

 imagePreview.innerHTML="";

 const box=document.createElement("div");

 box.style.display="flex";
 box.style.alignItems="center";
 box.style.gap="10px";
 box.style.padding="8px";

 if(type==="image"){

  const img=document.createElement("img");

  img.src=URL.createObjectURL(file);
  img.style.width="60px";
  img.style.height="60px";
  img.style.objectFit="cover";
  img.style.borderRadius="10px";

  box.appendChild(img);
 }

 if(type==="video"){

  const v=document.createElement("video");

  v.src=URL.createObjectURL(file);
  v.controls=true;
  v.style.width="90px";
  v.style.height="60px";

  box.appendChild(v);
 }

 const name=document.createElement("span");

 name.textContent=
  type==="image"
   ?"🖼 "+file.name
   :type==="video"
    ?"🎥 "+file.name
    :"📄 "+file.name;

 name.style.color="white";
 name.style.flex="1";

 box.appendChild(name);

 const remove=document.createElement("button");

 remove.textContent="✕";
 remove.type="button";
 remove.onclick=clearAttachment;

 box.appendChild(remove);

 imagePreview.appendChild(box);
}


/* CLEAR */

function clearAttachment(){

 selectedImage=null;
 selectedVideo=null;
 selectedFile=null;

 if(imageInput)imageInput.value="";
 if(fileInput)fileInput.value="";
 if(imagePreview)imagePreview.innerHTML="";
}


/* THINK HARDER */

thinkBtn?.addEventListener("click",()=>{

 thinkHarder=!thinkHarder;

 thinkBtn.textContent=
  thinkHarder
   ?"🧠 Think Harder ✓"
   :"🧠 Think Harder";

 closeMenu();
});


/* PLUGINS */

pluginBtn?.addEventListener("click",()=>{

 closeMenu();

 addMessage(
  "🧩 Plugins are ready to be connected.",
  "ai"
 );
});


/* TEXT */

userInput?.addEventListener("input",()=>{

 userInput.style.height="auto";

 userInput.style.height=
  Math.min(userInput.scrollHeight,150)+"px";
});


userInput?.addEventListener("keydown",e=>{

 if(e.key==="Enter"&&!e.shiftKey){

  e.preventDefault();

  sendMessage();
 }
});
/* =========================
   CAMERA
========================= */

cameraBtn?.addEventListener("click",async()=>{
 closeMenu();

 if(!cameraModal)return;

 cameraModal.classList.add("show");

 await startCamera();
});


async function startCamera(){

 stopCamera();

 if(!navigator.mediaDevices?.getUserMedia){
  addMessage("❌ Camera is not supported.");
  return;
 }

 try{

  cameraStream=
   await navigator.mediaDevices.getUserMedia({
    video:{
     facingMode:{
      ideal:cameraFacing
     }
    },
    audio:false
   });

  cameraVideo.srcObject=cameraStream;

  await cameraVideo.play();

 }catch(e){

  console.error(e);

  addMessage(
   "❌ Camera permission was denied or unavailable."
  );
 }
}


function stopCamera(){

 if(cameraStream){

  cameraStream
   .getTracks()
   .forEach(t=>t.stop());

  cameraStream=null;
 }

 if(cameraVideo)
  cameraVideo.srcObject=null;
}


cameraClose?.addEventListener(
 "click",
 ()=>{
  stopCamera();
  cameraModal?.classList.remove("show");
 }
);


/* SWITCH CAMERA */

switchCamera?.addEventListener(
 "click",
 async()=>{

  cameraFacing=
   cameraFacing==="user"
    ?"environment"
    :"user";

  await startCamera();
 }
);


/* PHOTO MODE */

photoMode?.addEventListener(
 "click",
 ()=>{

  photoMode.classList.add("active");
  videoMode.classList.remove("active");

  takePhoto.style.display="inline-flex";
 }
);


/* VIDEO MODE */

videoMode?.addEventListener(
 "click",
 ()=>{

  videoMode.classList.add("active");
  photoMode.classList.remove("active");

  takePhoto.style.display="none";
 }
);


/* TAKE PHOTO */

takePhoto?.addEventListener(
 "click",
 ()=>{

  if(!cameraStream){

   addMessage(
    "⚠️ Camera is not ready."
   );

   return;
  }

  const canvas=
   document.createElement("canvas");

  canvas.width=
   cameraVideo.videoWidth||1280;

  canvas.height=
   cameraVideo.videoHeight||720;

  const ctx=
   canvas.getContext("2d");

  ctx.drawImage(
   cameraVideo,
   0,
   0,
   canvas.width,
   canvas.height
  );

  canvas.toBlob(blob=>{

   if(!blob)return;

   selectedImage=
    new File(
     [blob],
     "camera-photo.jpg",
     {type:"image/jpeg"}
    );

   selectedVideo=null;
   selectedFile=null;

   showPreview(
    selectedImage,
    "image"
   );

   stopCamera();

   cameraModal.classList.remove("show");

  },"image/jpeg",0.9);
 });


/* =========================
   SEND
========================= */

sendBtn?.addEventListener(
 "click",
 sendMessage
);


async function sendMessage(){

 if(sending)return;

 const text=
  userInput?.value.trim()||"";

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


 if(selectedImage){

  attachment={
   type:"image",
   url:URL.createObjectURL(
    selectedImage
   )
  };

 }

 else if(selectedVideo){

  attachment={
   type:"video",
   url:URL.createObjectURL(
    selectedVideo
   )
  };

 }

 else if(selectedFile){

  attachment={
   type:"file",
   name:selectedFile.name
  };
 }


 addMessage(
  text||"📎 Attachment",
  "user",
  attachment
 );


 const ai=
  addMessage(
   "Thinking...",
   "ai"
  );


 try{

  let image=null;

  if(selectedImage){

   image=
    await fileToBase64(
     selectedImage
    );
  }


  const response=
   await fetch(
    "/api/gemini",
    {
     method:"POST",

     headers:{
      "Content-Type":
       "application/json"
     },

     body:JSON.stringify({

      message:text,

      image:image,

      thinkHarder:
       thinkHarder,

      clientDate:
       new Date().toISOString(),

      timezone:
       Intl.DateTimeFormat()
       .resolvedOptions()
       .timeZone

     })
    }
   );


  const data=
   await response.json();


  if(!response.ok){

   throw new Error(
    data.error||
    "Server error: "+
    response.status
   );
  }


  ai.textContent=
   data.text||
   "No response from AI.";


 }catch(error){

  console.error(
   "SwiftCortex error:",
   error
  );

  ai.textContent=
   "❌ Connection error: "+
   error.message;

 }


 clearAttachment();


 if(userInput){

  userInput.value="";

  userInput.style.height=
   "auto";
 }


 sending=false;

 if(sendBtn)
  sendBtn.disabled=false;
}


/* =========================
   BASE64
========================= */

function fileToBase64(file){

 return new Promise(
  (resolve,reject)=>{

   const reader=
    new FileReader();

   reader.onload=
    ()=>resolve(
     reader.result
    );

   reader.onerror=
    reject;

   reader.readAsDataURL(file);
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
   "👋 New chat started. How can I help you?",
   "ai"
  );

  clearAttachment();

  userInput?.focus();
 }
);


/* =========================
   DARK MODE
========================= */

$("themeBtn")?.addEventListener(
 "click",
 ()=>{

  document.body.classList.toggle(
   "light-mode"
  );

  const light=
   document.body.classList.contains(
    "light-mode"
   );

  $("themeBtn").textContent=
   light
    ?"☀️ Light Mode"
    :"🌙 Dark Mode";
 }
);


console.log(
 "⚡ SwiftCortex AI Ultra Ready"
);
