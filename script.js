"use strict";

const $=id=>document.getElementById(id);

const plusBtn=$("plusBtn"),plusMenu=$("plusMenu");
const cameraBtn=$("cameraBtn"),photoBtn=$("photoBtn");
const fileBtn=$("fileBtn"),pluginBtn=$("pluginBtn");
const thinkBtn=$("thinkBtn");
const imageInput=$("imageInput"),fileInput=$("fileInput");
const input=$("userInput"),send=$("sendBtn"),messages=$("messages");
const preview=$("imagePreview");

let image=null,video=null,file=null;
let thinking=false,sending=false;
let stream=null,recorder=null,chunks=[];

function msg(text,type="ai",media=null){
 const b=document.createElement("div");
 b.className=type==="user"?"user-message":"ai-message";
 if(text)b.textContent=text;
 if(media){
  const x=document.createElement(media.type==="video"?"video":"img");
  x.src=media.url;
  if(media.type==="video")x.controls=true;
  x.style.maxWidth="280px";
  x.style.borderRadius="14px";
  b.appendChild(x);
 }
 messages.appendChild(b);
 messages.scrollTop=messages.scrollHeight;
 return b;
}

plusBtn.onclick=e=>{
 e.stopPropagation();
 plusMenu.classList.toggle("show");
};

document.onclick=e=>{
 if(!plusMenu.contains(e.target)&&e.target!==plusBtn)
  plusMenu.classList.remove("show");
};

function clear(){
 image=video=file=null;
 preview.innerHTML="";
 imageInput.value="";
 fileInput.value="";
}

function show(file,type){
 preview.innerHTML="";
 const name=document.createElement("span");
 name.textContent=(type==="image"?"🖼 ":type==="video"?"🎥 ":"📄 ")+file.name;
 name.style.color="white";
 preview.appendChild(name);
}

photoBtn.onclick=()=>{
 plusMenu.classList.remove("show");
 imageInput.click();
};

imageInput.onchange=()=>{
 const f=imageInput.files[0];
 if(!f)return;
 image=f;video=file=null;
 show(f,"image");
};

fileBtn.onclick=()=>{
 plusMenu.classList.remove("show");
 fileInput.click();
};

fileInput.onchange=()=>{
 const f=fileInput.files[0];
 if(!f)return;
 if(f.type.startsWith("image/"))image=f;
 else if(f.type.startsWith("video/"))video=f;
 else file=f;
 show(f,f.type.startsWith("image/")?"image":f.type.startsWith("video/")?"video":"file");
};

pluginBtn.onclick=()=>{
 plusMenu.classList.remove("show");
 msg("🧩 Plugins are ready to be connected.");
};

thinkBtn.onclick=()=>{
 thinking=!thinking;
 thinkBtn.textContent=thinking?"🧠 Think Harder ✓":"🧠 Think Harder";
 plusMenu.classList.remove("show");
};

function previewMedia(f,type){
 return {type,url:URL.createObjectURL(f)};
}
/* ================= SEND ================= */

async function sendMessage(){
 if(sending)return;

 const text=input.value.trim();

 if(!text&&!image&&!video&&!file)return;

 sending=true;
 send.disabled=true;

 let media=null;

 if(image)media=previewMedia(image,"image");
 if(video)media=previewMedia(video,"video");

 msg(text||"📎 Attachment","user",media);

 input.value="";
 clear();

 const loading=msg("⏳ Thinking...");

 try{
  const body={message:text};

  if(image){
   body.image=await toBase64(image);
  }

  if(video){
   body.video=await toBase64(video);
  }

  const r=await fetch("/api/gemini",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify(body)
  });

  const data=await r.json();

  loading.remove();

  if(!r.ok){
   msg("❌ Server error: "+r.status);
   return;
  }

  msg(data.text||data.reply||"No response.");
 }
 catch(e){
  loading.remove();
  msg("❌ Connection error: "+e.message);
 }
 finally{
  sending=false;
  send.disabled=false;
 }
}

function toBase64(f){
 return new Promise((resolve,reject)=>{
  const r=new FileReader();
  r.onload=()=>resolve(r.result);
  r.onerror=reject;
  r.readAsDataURL(f);
}

send.onclick=sendMessage;

input.onkeydown=e=>{
 if(e.key==="Enter"&&!e.shiftKey){
  e.preventDefault();
  sendMessage();
 }
};


/* ================= CAMERA ================= */

cameraBtn.onclick=async()=>{
 plusMenu.classList.remove("show");
 $("cameraModal").classList.add("show");

 try{
  stream=await navigator.mediaDevices.getUserMedia({
   video:true,
   audio:true
  });

  $("cameraVideo").srcObject=stream;
 }
 catch(e){
  $("cameraError").classList.add("show");
  $("cameraErrorText").textContent="Camera permission denied.";
 }
};

$("cameraClose").onclick=closeCamera;

function closeCamera(){
 if(stream){
  stream.getTracks().forEach(t=>t.stop());
  stream=null;
 }
 $("cameraVideo").srcObject=null;
 $("cameraModal").classList.remove("show");
}


/* ================= TAKE PHOTO ================= */

$("takePhoto").onclick=()=>{
 const v=$("cameraVideo");

 if(!stream)return;

 const c=document.createElement("canvas");

 c.width=v.videoWidth;
 c.height=v.videoHeight;

 c.getContext("2d").drawImage(v,0,0);

 c.toBlob(b=>{
  image=new File(
   [b],
   "camera-photo.jpg",
   {type:"image/jpeg"}
  );

  video=file=null;
  show(image,"image");
  closeCamera();
 },"image/jpeg",.9);
};


/* ================= VIDEO ================= */

$("startRecord").onclick=()=>{
 if(!stream)return;

 chunks=[];

 recorder=new MediaRecorder(stream);

 recorder.ondataavailable=e=>{
  if(e.data.size)chunks.push(e.data);
 };

 recorder.onstop=()=>{
  const b=new Blob(chunks,{type:"video/webm"});

  video=new File(
   [b],
   "camera-video.webm",
   {type:"video/webm"}
  );

  image=file=null;
  show(video,"video");
 };

 recorder.start();

 $("startRecord").style.display="none";
 $("stopRecord").style.display="inline-flex";
};

$("stopRecord").onclick=()=>{
 if(recorder)recorder.stop();

 $("startRecord").style.display="inline-flex";
 $("stopRecord").style.display="none";
};


/* ================= SWITCH CAMERA ================= */

$("switchCamera").onclick=async()=>{
 closeCamera();

 stream=await navigator.mediaDevices.getUserMedia({
  video:{
   facingMode:"environment"
  },
  audio:true
 });

 $("cameraModal").classList.add("show");
 $("cameraVideo").srcObject=stream;
};


/* ================= CAMERA MODE ================= */

$("photoMode").onclick=()=>{
 $("photoMode").classList.add("active");
 $("videoMode").classList.remove("active");

 $("takePhoto").style.display="inline-flex";
 $("startRecord").style.display="none";
 $("stopRecord").style.display="none";
};

$("videoMode").onclick=()=>{
 $("videoMode").classList.add("active");
 $("photoMode").classList.remove("active");

 $("takePhoto").style.display="none";
 $("startRecord").style.display="inline-flex";
 $("stopRecord").style.display="none";
};


/* ================= NEW CHAT ================= */

const newChat=$("newChat");

if(newChat){
 newChat.onclick=()=>{
  messages.innerHTML="";
  input.value="";
  clear();
  msg("👋 New chat started.");
 };
}


/* ================= START ================= */

console.log("⚡ SwiftCortex AI Ultra loaded");
