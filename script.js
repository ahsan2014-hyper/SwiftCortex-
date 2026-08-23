"use strict";

const $=id=>document.getElementById(id);

const plusBtn=$("plusBtn"),plusMenu=$("plusMenu");
const cameraBtn=$("cameraBtn"),photoBtn=$("photoBtn"),fileBtn=$("fileBtn");
const pluginBtn=$("pluginBtn"),thinkBtn=$("thinkBtn");
const imageInput=$("imageInput"),fileInput=$("fileInput");
const userInput=$("userInput"),sendBtn=$("sendBtn");
const messages=$("messages"),imagePreview=$("imagePreview");

let selectedImage=null,selectedVideo=null,selectedFile=null;
let sending=false,thinkHarder=false;
let stream=null,facing="user";

function msg(text,type="ai",file=null){
 const b=document.createElement("div");
 b.className=type==="user"?"user-message":"ai-message";
 if(text){
  const t=document.createElement("div");
  t.textContent=text;
  b.appendChild(t);
 }
 if(file?.type==="image"){
  const i=document.createElement("img");
  i.src=file.url;
  i.style.cssText="max-width:280px;max-height:280px;border-radius:14px;display:block;margin-top:8px";
  b.appendChild(i);
 }
 if(file?.type==="video"){
  const v=document.createElement("video");
  v.src=file.url;
  v.controls=true;
  v.playsInline=true;
  v.style.cssText="max-width:300px;max-height:280px;border-radius:14px;display:block;margin-top:8px";
  b.appendChild(v);
 }
 if(file?.type==="file"){
  const f=document.createElement("div");
  f.textContent="📄 "+file.name;
  b.appendChild(f);
 }
 messages.appendChild(b);
 messages.scrollTop=messages.scrollHeight;
 return b;
}

function closeMenu(){
 if(plusMenu)plusMenu.classList.remove("show");
}

plusBtn?.addEventListener("click",e=>{
 e.stopPropagation();
 plusMenu?.classList.toggle("show");
});

document.addEventListener("click",e=>{
 if(plusMenu&&!plusMenu.contains(e.target)&&e.target!==plusBtn)
  closeMenu();
});

photoBtn?.addEventListener("click",()=>{
 closeMenu();
 if(imageInput){
  imageInput.value="";
  imageInput.click();
 }
});

imageInput?.addEventListener("change",()=>{
 const f=imageInput.files?.[0];
 if(!f)return;
 if(!f.type.startsWith("image/")){
  msg("⚠️ Please select an image.");
  return;
 }
 selectedImage=f;
 selectedVideo=null;
 selectedFile=null;
 preview(f,"image");
});

fileBtn?.addEventListener("click",()=>{
 closeMenu();
 if(fileInput){
  fileInput.value="";
  fileInput.click();
 }
});

fileInput?.addEventListener("change",()=>{
 const f=fileInput.files?.[0];
 if(!f)return;

 selectedImage=null;
 selectedVideo=null;
 selectedFile=null;

 if(f.type.startsWith("image/")){
  selectedImage=f;
  preview(f,"image");
 }else if(f.type.startsWith("video/")){
  selectedVideo=f;
  preview(f,"video");
 }else{
  selectedFile=f;
  preview(f,"file");
 }
});

function preview(file,type){
 if(!imagePreview)return;

 imagePreview.innerHTML="";

 const box=document.createElement("div");
 box.style.cssText="display:flex;align-items:center;gap:10px;padding:8px;background:#111827;border-radius:12px";

 if(type==="image"){
  const i=document.createElement("img");
  i.src=URL.createObjectURL(file);
  i.style.cssText="width:60px;height:60px;object-fit:cover;border-radius:10px";
  box.appendChild(i);
 }

 if(type==="video"){
  const v=document.createElement("video");
  v.src=URL.createObjectURL(file);
  v.controls=true;
  v.style.cssText="width:90px;height:60px;object-fit:cover;border-radius:10px";
  box.appendChild(v);
 }

 const n=document.createElement("span");
 n.textContent=type==="image"?"🖼 "+file.name:
              type==="video"?"🎥 "+file.name:
              "📄 "+file.name;
 n.style.cssText="color:white;flex:1";
 box.appendChild(n);

 const x=document.createElement("button");
 x.textContent="✕";
 x.type="button";
 x.onclick=clearFile;
 x.style.cssText="border:0;background:#374151;color:white;border-radius:8px;padding:6px 9px";
 box.appendChild(x);

 imagePreview.appendChild(box);
}

function clearFile(){
 selectedImage=null;
 selectedVideo=null;
 selectedFile=null;
 if(imageInput)imageInput.value="";
 if(fileInput)fileInput.value="";
 if(imagePreview)imagePreview.innerHTML="";
}

thinkBtn?.addEventListener("click",()=>{
 thinkHarder=!thinkHarder;
 thinkBtn.textContent=thinkHarder?"🧠 Think Harder ✓":"🧠 Think Harder";
 closeMenu();
});

pluginBtn?.addEventListener("click",()=>{
 closeMenu();
 msg("🧩 Plugins are ready to be connected.");
});

userInput?.addEventListener("input",()=>{
 userInput.style.height="auto";
 userInput.style.height=Math.min(userInput.scrollHeight,150)+"px";
});

userInput?.addEventListener("keydown",e=>{
 if(e.key==="Enter"&&!e.shiftKey){
  e.preventDefault();
  sendMessage();
 }
});
function file64(file){
 return new Promise((ok,no)=>{
  const r=new FileReader();
  r.onload=()=>ok(r.result);
  r.onerror=no;
  r.readAsDataURL(file);
 }
}

sendBtn?.addEventListener("click",sendMessage);

async function sendMessage(){
 if(sending)return;

 const text=userInput?.value.trim()||"";

 if(!text&&!selectedImage&&!selectedVideo&&!selectedFile)return;

 sending=true;
 if(sendBtn)sendBtn.disabled=true;

 let att=null;

 if(selectedImage)
  att={type:"image",url:URL.createObjectURL(selectedImage)};
 else if(selectedVideo)
  att={type:"video",url:URL.createObjectURL(selectedVideo)};
 else if(selectedFile)
  att={type:"file",name:selectedFile.name};

 msg(text||"📎 Attachment","user",att);

 const ai=msg("Thinking...","ai");

 try{
  let image=null;

  if(selectedImage)
   image=await file64(selectedImage);

  const r=await fetch("/api/gemini",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
    message:text,
    image:image,
    thinkHarder:thinkHarder,
    clientDate:new Date().toISOString(),
    timezone:Intl.DateTimeFormat().resolvedOptions().timeZone
   })
  });

  const d=await r.json();

  if(!r.ok)
   throw new Error(d.error||"Server error: "+r.status);

  ai.textContent=d.text||"No response from AI.";

 }catch(e){
  console.error("SwiftCortex:",e);
  ai.textContent="❌ Connection error: "+e.message;
 }

 clearFile();

 if(userInput){
  userInput.value="";
  userInput.style.height="auto";
 }

 sending=false;
 if(sendBtn)sendBtn.disabled=false;
}


/* CAMERA */

cameraBtn?.addEventListener("click",async()=>{
 closeMenu();

 const modal=$("cameraModal");
 const video=$("cameraVideo");

 if(!modal||!video){
  msg("📷 Camera is not available.");
  return;
 }

 modal.classList.add("show");

 try{
  stream=await navigator.mediaDevices.getUserMedia({
   video:{facingMode:{ideal:facing}},
   audio:false
  });

  video.srcObject=stream;
  await video.play();

 }catch(e){
  msg("❌ Camera permission is required.");
 }
});


$("cameraClose")?.addEventListener("click",closeCamera);

function closeCamera(){
 if(stream){
  stream.getTracks().forEach(t=>t.stop());
  stream=null;
 }

 const video=$("cameraVideo");
 if(video)video.srcObject=null;

 $("cameraModal")?.classList.remove("show");
}


/* TAKE PHOTO */

$("takePhoto")?.addEventListener("click",()=>{
 const video=$("cameraVideo");

 if(!video||!stream){
  msg("⚠️ Camera is not ready.");
  return;
 }

 const canvas=document.createElement("canvas");

 canvas.width=video.videoWidth||1280;
 canvas.height=video.videoHeight||720;

 canvas.getContext("2d").drawImage(
  video,0,0,canvas.width,canvas.height
 );

 canvas.toBlob(blob=>{
  if(!blob)return;

  selectedImage=new File(
   [blob],
   "swiftcortex-photo.jpg",
   {type:"image/jpeg"}
  );

  selectedVideo=null;
  selectedFile=null;

  preview(selectedImage,"image");
  closeCamera();

 },"image/jpeg",.9);
});


/* SWITCH CAMERA */

$("switchCamera")?.addEventListener("click",async()=>{
 facing=facing==="user"?"environment":"user";

 if(!stream)return;

 closeCamera();

 $("cameraModal")?.classList.add("show");

 try{
  stream=await navigator.mediaDevices.getUserMedia({
   video:{facingMode:{ideal:facing}},
   audio:false
  });

  const video=$("cameraVideo");
  video.srcObject=stream;
  await video.play();

 }catch(e){
  msg("❌ Unable to switch camera.");
 }
});


/* PHOTO MODE */

$("photoMode")?.addEventListener("click",()=>{
 $("photoMode")?.classList.add("active");
 $("videoMode")?.classList.remove("active");

 if($("takePhoto"))$("takePhoto").style.display="inline-flex";
 if($("startRecord"))$("startRecord").style.display="none";
 if($("stopRecord"))$("stopRecord").style.display="none";
});


/* VIDEO MODE */

$("videoMode")?.addEventListener("click",()=>{
 $("videoMode")?.classList.add("active");
 $("photoMode")?.classList.remove("active");

 if($("takePhoto"))$("takePhoto").style.display="none";
 if($("startRecord"))$("startRecord").style.display="inline-flex";
});


/* DARK MODE */

const themeBtn=$("themeBtn");

themeBtn?.addEventListener("click",()=>{
 document.body.classList.toggle("light-mode");

 const light=document.body.classList.contains("light-mode");

 themeBtn.textContent=light?"☀️ Light Mode":"🌙 Dark Mode";

 localStorage.setItem("swiftTheme",light?"light":"dark");
});

if(localStorage.getItem("swiftTheme")==="light"){
 document.body.classList.add("light-mode");
 if(themeBtn)themeBtn.textContent="☀️ Light Mode";
}


/* NEW CHAT */

$("newChat")?.addEventListener("click",()=>{
 if(messages)
  messages.innerHTML="";

 msg("👋 New chat started. How can I help you?","ai");
 clearFile();

 if(userInput){
  userInput.value="";
  userInput.focus();
 }
});
