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
const switchCamera=$("switchCamera");

let selectedImage=null;
let selectedFile=null;
let cameraStream=null;
let facing="user";
let thinking=false;
let busy=false;


/* MENU */

plusBtn.onclick=e=>{
 e.stopPropagation();
 plusMenu.classList.toggle("show");
};

document.onclick=e=>{
 if(!plusMenu.contains(e.target)&&e.target!==plusBtn)
  plusMenu.classList.remove("show");
};


/* MESSAGE */

function addMessage(text,type="ai",file=null){

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

 if(file?.type==="image"){
  const img=document.createElement("img");
  img.src=file.url;
  img.style.maxWidth="280px";
  img.style.borderRadius="14px";
  img.style.display="block";
  box.appendChild(img);
 }

 if(file?.type==="file"){
  const p=document.createElement("div");
  p.textContent="📄 "+file.name;
  box.appendChild(p);
 }

 messages.appendChild(box);
 messages.scrollTop=messages.scrollHeight;

 return box;
}


/* PHOTO */

photoBtn.onclick=()=>{
 plusMenu.classList.remove("show");
 imageInput.value="";
 imageInput.click();
};

imageInput.onchange=()=>{

 const f=imageInput.files[0];

 if(!f)return;

 if(!f.type.startsWith("image/")){
  addMessage("⚠️ Please select an image.");
  return;
 }

 selectedImage=f;
 selectedFile=null;

 showPreview(f);
};


/* FILE */

fileBtn.onclick=()=>{
 plusMenu.classList.remove("show");
 fileInput.value="";
 fileInput.click();
};

fileInput.onchange=()=>{

 const f=fileInput.files[0];

 if(!f)return;

 selectedFile=f;
 selectedImage=null;

 showPreview(f);
};


/* PREVIEW */

function showPreview(file){

 imagePreview.innerHTML="";

 const box=document.createElement("div");

 box.style.display="flex";
 box.style.alignItems="center";
 box.style.gap="10px";
 box.style.padding="8px";

 if(file.type.startsWith("image/")){

  const img=document.createElement("img");

  img.src=URL.createObjectURL(file);
  img.style.width="60px";
  img.style.height="60px";
  img.style.objectFit="cover";
  img.style.borderRadius="10px";

  box.appendChild(img);
 }

 const name=document.createElement("span");

 name.textContent="📎 "+file.name;
 name.style.color="white";
 name.style.flex="1";

 box.appendChild(name);

 const x=document.createElement("button");

 x.textContent="✕";
 x.onclick=clearFile;

 box.appendChild(x);

 imagePreview.appendChild(box);
}


/* CLEAR */

function clearFile(){

 selectedImage=null;
 selectedFile=null;

 imageInput.value="";
 fileInput.value="";
 imagePreview.innerHTML="";
}


/* THINK */

thinkBtn.onclick=()=>{

 thinking=!thinking;

 thinkBtn.textContent=
  thinking
   ?"🧠 Think Harder ✓"
   :"🧠 Think Harder";

 plusMenu.classList.remove("show");
};


/* PLUGIN */

pluginBtn.onclick=()=>{

 plusMenu.classList.remove("show");

 addMessage(
  "🧩 Plugins are ready to be connected."
 );
};


/* TEXT */

userInput.oninput=()=>{
 userInput.style.height="auto";
 userInput.style.height=
  Math.min(userInput.scrollHeight,150)+"px";
};

userInput.onkeydown=e=>{

 if(e.key==="Enter"&&!e.shiftKey){

  e.preventDefault();
  sendMessage();
 }
};
/* CAMERA */

cameraBtn.onclick=async()=>{

 plusMenu.classList.remove("show");

 if(!cameraModal){
  addMessage("📷 Camera unavailable.");
  return;
 }

 cameraModal.classList.add("show");

 try{

  cameraStream=
   await navigator.mediaDevices.getUserMedia({
    video:{
     facingMode:{ideal:facing}
    },
    audio:false
   });

  cameraVideo.srcObject=cameraStream;
  await cameraVideo.play();

 }catch(e){

  console.error(e);

  addMessage(
   "❌ Camera permission denied."
  );
 }
};


/* CLOSE CAMERA */

cameraClose.onclick=()=>{

 if(cameraStream){

  cameraStream.getTracks()
   .forEach(t=>t.stop());

  cameraStream=null;
 }

 cameraVideo.srcObject=null;

 cameraModal.classList.remove("show");
};


/* SWITCH CAMERA */

switchCamera.onclick=async()=>{

 facing=
  facing==="user"
   ?"environment"
   :"user";

 if(cameraStream)
  cameraStream.getTracks()
   .forEach(t=>t.stop());

 try{

  cameraStream=
   await navigator.mediaDevices.getUserMedia({
    video:{
     facingMode:{ideal:facing}
    },
    audio:false
   });

  cameraVideo.srcObject=cameraStream;
  await cameraVideo.play();

 }catch(e){

  addMessage("❌ Cannot switch camera.");
 }
};


/* TAKE PHOTO */

takePhoto.onclick=()=>{

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

  selectedFile=null;

  showPreview(selectedImage);

  cameraClose.click();

 },"image/jpeg",.9);
};


/* BASE64 */

function toBase64(file){

 return new Promise((resolve,reject)=>{

  const reader=
   new FileReader();

  reader.onload=
   ()=>resolve(reader.result);

  reader.onerror=reject;

  reader.readAsDataURL(file);
 });
}


/* SEND */

sendBtn.onclick=sendMessage;

async function sendMessage(){

 if(busy)return;

 const text=
  userInput.value.trim();

 if(!text&&!selectedImage&&!selectedFile)
  return;

 busy=true;
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

 if(selectedFile&&!selectedImage){

  attachment={
   type:"file",
   name:selectedFile.name
  };
 }

 addMessage(
  text||"📎 File",
  "user",
  attachment
 );

 const replyBox=
  addMessage(
   "Thinking...",
   "ai"
  );

 try{

  let image=null;

  if(selectedImage)
   image=await toBase64(
    selectedImage
   );

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

      thinkHarder:thinking,

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

  if(!response.ok)
   throw new Error(
    data.error||
    "Server error "+response.status
   );

  replyBox.textContent=
   data.text||
   "No response from AI.";

 }catch(error){

  console.error(error);

  replyBox.textContent=
   "❌ Connection error: "+
   error.message;

 }

 clearFile();

 userInput.value="";
 userInput.style.height="auto";

 busy=false;
 sendBtn.disabled=false;
}


/* NEW CHAT */

$("newChat").onclick=()=>{

 messages.innerHTML="";

 addMessage(
  "👋 Hello! I am SwiftCortex AI. How can I help you?"
 );

 clearFile();

 userInput.focus();
};


/* DARK MODE */

$("themeBtn").onclick=()=>{

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
};


console.log(
 "⚡ SwiftCortex AI Ultra is ready"
);
