"use strict";

const $=id=>document.getElementById(id);

const plus=$("plusBtn");
const menu=$("plusMenu");
const input=$("userInput");
const send=$("sendBtn");
const messages=$("messages");

let image=null;
let video=null;
let file=null;
let sending=false;

function addMsg(text,type="ai"){
 const d=document.createElement("div");
 d.className=type==="user"?"user-message":"ai-message";
 d.textContent=text;
 messages.appendChild(d);
 messages.scrollTop=messages.scrollHeight;
 return d;
}

/* PLUS */

plus.onclick=e=>{
 e.stopPropagation();
 menu.classList.toggle("show");
};

document.onclick=e=>{
 if(!menu.contains(e.target)&&e.target!==plus)
  menu.classList.remove("show");
};

/* PHOTO */

$("photoBtn").onclick=()=>{
 menu.classList.remove("show");
 $("imageInput").click();
};

$("imageInput").onchange=e=>{
 const f=e.target.files[0];
 if(!f)return;

 image=f;
 video=null;
 file=null;

 addMsg("🖼 "+f.name,"user");
};

/* FILE */

$("fileBtn").onclick=()=>{
 menu.classList.remove("show");
 $("fileInput").click();
};

$("fileInput").onchange=e=>{
 const f=e.target.files[0];
 if(!f)return;

 if(f.type.startsWith("image/")) image=f;
 else if(f.type.startsWith("video/")) video=f;
 else file=f;

 addMsg("📎 "+f.name,"user");
};

/* PLUGIN */

$("pluginBtn").onclick=()=>{
 menu.classList.remove("show");
 addMsg("🧩 Plugins are ready to be connected.");
};

/* THINK */

$("thinkBtn").onclick=()=>{
 menu.classList.remove("show");
 addMsg("🧠 Think Harder enabled.");
};
/* ================= SEND ================= */

send.onclick=sendMessage;

input.onkeydown=e=>{
 if(e.key==="Enter"&&!e.shiftKey){
  e.preventDefault();
  sendMessage();
 }
};

async function sendMessage(){

 if(sending)return;

 const text=input.value.trim();

 if(!text&&!image&&!video&&!file)return;

 sending=true;
 send.disabled=true;

 const userText=text||"📎 Attachment";
 addMsg(userText,"user");

 input.value="";

 const loading=addMsg("⏳ Thinking...");

 try{

  const body={message:text};

  if(image){
   body.image=await base64(image);
  }

  if(video){
   body.video=await base64(video);
  }

  const response=await fetch("/api/gemini",{
   method:"POST",
   headers:{
    "Content-Type":"application/json"
   },
   body:JSON.stringify(body)
  });

  const data=await response.json();

  loading.remove();

  if(!response.ok){
   addMsg("❌ Server error: "+response.status);
   return;
  }

  addMsg(
   data.text||
   data.reply||
   data.message||
   "No response from AI."
  );

 }catch(error){

  loading.remove();

  addMsg(
   "❌ Connection error: "+
   error.message
  );

 }finally{

  sending=false;
  send.disabled=false;

  image=null;
  video=null;
  file=null;

  $("imageInput").value="";
  $("fileInput").value="";
 }
}


/* ================= FILE TO BASE64 ================= */

function base64(file){

 return new Promise((resolve,reject)=>{

  const reader=new FileReader();

  reader.onload=()=>{
   resolve(reader.result);
  };

  reader.onerror=reject;

  reader.readAsDataURL(file);
 });
}


/* ================= CAMERA ================= */

$("cameraBtn").onclick=async()=>{

 menu.classList.remove("show");

 $("cameraModal").classList.add("show");

 try{

  window.cameraStream=
   await navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
   });

  $("cameraVideo").srcObject=
   window.cameraStream;

 }catch(error){

  $("cameraError").classList.add("show");

  $("cameraErrorText").textContent=
   "Camera permission is required.";

 }
};


/* ================= CLOSE CAMERA ================= */

$("cameraClose").onclick=()=>{

 if(window.cameraStream){

  window.cameraStream
   .getTracks()
   .forEach(track=>track.stop());

  window.cameraStream=null;
 }

 $("cameraVideo").srcObject=null;

 $("cameraModal").classList.remove("show");
};
/* ================= PHOTO ================= */

$("takePhoto").onclick=()=>{

 const v=$("cameraVideo");

 if(!window.cameraStream)return;

 const c=document.createElement("canvas");

 c.width=v.videoWidth;
 c.height=v.videoHeight;

 c.getContext("2d").drawImage(v,0,0);

 c.toBlob(blob=>{

  image=new File(
   [blob],
   "camera-photo.jpg",
   {type:"image/jpeg"}
  );

  video=null;
  file=null;

  $("cameraClose").click();

 },"image/jpeg",.9);
};


/* ================= VIDEO MODE ================= */

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


/* ================= RECORD VIDEO ================= */

$("startRecord").onclick=()=>{

 if(!window.cameraStream)return;

 window.chunks=[];

 window.recorder=new MediaRecorder(
  window.cameraStream
 );

 window.recorder.ondataavailable=e=>{

  if(e.data.size)
   window.chunks.push(e.data);
 };

 window.recorder.onstop=()=>{

  const blob=new Blob(
   window.chunks,
   {type:"video/webm"}
  );

  video=new File(
   [blob],
   "camera-video.webm",
   {type:"video/webm"}
  );

  image=null;
  file=null;

  $("startRecord").style.display="inline-flex";
  $("stopRecord").style.display="none";
 };

 window.recorder.start();

 $("startRecord").style.display="none";
 $("stopRecord").style.display="inline-flex";
};


/* ================= STOP VIDEO ================= */

$("stopRecord").onclick=()=>{

 if(window.recorder)
  window.recorder.stop();

};


/* ================= SWITCH CAMERA ================= */

$("switchCamera").onclick=async()=>{

 if(window.cameraStream){

  window.cameraStream
   .getTracks()
   .forEach(track=>track.stop());
 }

 try{

  window.cameraStream=
   await navigator.mediaDevices.getUserMedia({

    video:{
     facingMode:"environment"
    },

    audio:true

   });

  $("cameraVideo").srcObject=
   window.cameraStream;

 }catch(e){

  console.error(e);

 }
};


/* ================= NEW CHAT ================= */

const newChat=$("newChat");

if(newChat){

 newChat.onclick=()=>{

  messages.innerHTML="";

  input.value="";

  image=null;
  video=null;
  file=null;

  addMsg("👋 New chat started.");

 };
}
/* ================= READY ================= */

console.log(
 "⚡ SwiftCortex AI Ultra is ready"
);
