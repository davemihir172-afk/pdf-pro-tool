// PDFMate Pro - UI Logic
// Rendering, navigation, search, file handling



/* ─── RENDER GRID ─────────────────────────────────────────── */
function cardHTML(t) {
  const badge = t.badge === 'AI' ? '<div class="tc-badge badge-ai">✦ AI</div>'
    : t.badge === 'Cloud' ? '<div class="tc-badge badge-cloud">☁ Cloud</div>'
    : t.badge === 'New' ? '<div class="tc-badge badge-new">New</div>'
    : t.hot ? '<div class="tc-badge badge-hot">🔥 Popular</div>'
    : '';
  const overlay = (t.locked) ? `<div class="tc-pro-overlay"><div class="tc-pro-label">🔒 Premium</div><button class="tc-pro-btn">Upgrade</button></div>` : '';
  return `<div class="tc" style="--tc-color:${t.tc}" onclick="openTool('${t.id}')">
    ${badge}${overlay}
    <div class="tc-icon" style="background:${t.bg};border-radius:15px;width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:24px">${t.icon}</div>
    <div class="tc-name">${t.name}</div>
    <div class="tc-desc">${t.desc}</div>
  </div>`;
}

function renderGrid(f = 'all') {
  const list = f === 'all' ? TOOLS : TOOLS.filter(t => t.cat === f);
  // hide/show banners
  document.getElementById('aiBanner').style.display   = (f==='all'||f==='ai') ? '' : 'none';
  document.getElementById('cloudBanner').style.display = (f==='all'||f==='cloud') ? '' : 'none';
  const grid = document.getElementById('toolsGrid');
  grid.innerHTML = list.map(cardHTML).join('');
  grid.querySelectorAll('.tc').forEach((c, i) => {
    c.style.opacity='0'; c.style.transform='translateY(12px)';
    c.style.transition=`opacity .3s ${i*.025}s,transform .3s ${i*.025}s cubic-bezier(.16,1,.3,1),border-color .2s,box-shadow .25s`;
    requestAnimationFrame(()=>setTimeout(()=>{c.style.opacity='1';c.style.transform='none';},30+i*22));
  });
}
function filterGrid(f) {
  document.querySelectorAll('.ftab').forEach(b => b.classList.toggle('on', b.dataset.f === f));
  renderGrid(f);
}

/* ─── SEARCH ────────────────────────────────────────────────── */
const si=document.getElementById('si'),sd=document.getElementById('sdrop');
si.addEventListener('input',()=>{
  const q=si.value.toLowerCase().trim();
  if(!q){sd.classList.remove('on');return;}
  const m=TOOLS.filter(t=>t.name.toLowerCase().includes(q)||t.cat.includes(q)||t.desc.toLowerCase().includes(q)).slice(0,9);
  sd.innerHTML=m.map(t=>`<div class="sitem" onclick="openTool('${t.id}');si.value='';sd.classList.remove('on')"><div class="sitem-ic" style="background:${t.bg}">${t.icon}</div><div><div class="sitem-name">${t.name}</div><div class="sitem-cat">${t.cat}</div></div></div>`).join('');
  sd.classList.toggle('on',m.length>0);
});
document.addEventListener('click',e=>{if(!e.target.closest('.hero-search-wrap'))sd.classList.remove('on');});
function doSearch(){sd.classList.remove('on');}

/* ─── PAGE NAV ───────────────────────────────────────────────── */
function goHome(){document.getElementById('page-home').classList.add('active');document.getElementById('page-tool').classList.remove('active');window.scrollTo({top:0,behavior:'smooth'});document.title='PDFMate Pro — Every PDF Tool You Need';}
function goTool(){document.getElementById('page-home').classList.remove('active');document.getElementById('page-tool').classList.add('active');window.scrollTo({top:0,behavior:'smooth'});if(currentTool)document.title=currentTool.name+' — PDFMate Pro';}

/* ─── CLOUD MODAL ────────────────────────────────────────────── */
const cloudConnections={gdrive:false,dropbox:false};
function showCloudModal(){document.getElementById('cloudModal').classList.add('on');}
function closeCloudModal(){document.getElementById('cloudModal').classList.remove('on');}
function closeModal(e){if(e.target===document.getElementById('cloudModal'))closeCloudModal();}

function connectCloud(service){
  closeCloudModal();
  showToast(`Connecting to ${service==='gdrive'?'Google Drive':'Dropbox'}…`,'ok');
  setTimeout(()=>{
    cloudConnections[service]=true;
    document.getElementById(service+'-status').textContent='Connected';
    document.getElementById(service+'-status').className='cloud-status-indicator connected';
    showToast(`${service==='gdrive'?'Google Drive':'Dropbox'} connected!`,'ok');
  },1800);
}

function openFromCloud(service){
  if(!cloudConnections[service]){showCloudModal();return;}
  showToast(`Opening ${service==='gdrive'?'Google Drive':'Dropbox'} picker…`,'ok');
}

function saveToCloud(){
  if(cloudConnections.gdrive||cloudConnections.dropbox){
    showToast('File saved to cloud storage!','ok');
  } else {
    showCloudModal();
  }
}

/* ─── OPEN TOOL ─────────────────────────────────────────────── */
let currentTool=null,files=[],selectedPages=new Set();
let sigCtx=null,sigDrawing=false,sigColor='#1a1b2e';
let editorCtx=null,editorTool='select',editorDrawing=false,editorStartX=0,editorStartY=0;
let sigImageData=null;

function openTool(id){
  const t=TOOLS.find(x=>x.id===id);if(!t)return;
  currentTool=t;resetTool(false);

  const iconEl=document.getElementById('tp-icon');
  iconEl.textContent=t.icon;iconEl.style.cssText=`width:66px;height:66px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:18px;background:${t.bg}`;
  document.getElementById('tp-title').textContent=t.name;
  document.getElementById('tp-desc').textContent=t.desc;
  document.getElementById('tp-steps').innerHTML=t.steps.map((s,i)=>`<div class="tp-step"><div class="tp-step-n">${i+1}</div><span class="tp-step-l">${s}</span></div>${i<t.steps.length-1?'<span class="tp-step-sep">›</span>':''}`).join('');

  // Special handling
  const dz=document.getElementById('dropzone');
  const sigUI=document.getElementById('sigUI');
  const editorUI=document.getElementById('editorUI');
  const aiPanel=document.getElementById('aiOutputPanel');
  dz.style.display='';sigUI.style.display='none';editorUI.style.display='none';aiPanel.style.display='none';
  document.getElementById('special-ui').innerHTML='';

  if(id==='sign-pdf'){sigUI.style.display='block';initSigPad();}
  else if(id==='edit-full'){editorUI.style.display='block';}
  else if(id==='ai-summarize'||id==='ai-extract'||id==='translate'){aiPanel.style.display='none';}
  else if(id==='html-to-pdf'){
    dz.style.display='none';
    document.getElementById('special-ui').innerHTML=`<div class="opts-panel" style="margin-top:0"><div class="opts-title">Paste HTML Code</div><textarea id="htmlInput" class="opt-input" rows="10" style="width:100%;resize:vertical;font-family:monospace;font-size:13px" placeholder="&lt;h1&gt;Hello World&lt;/h1&gt;"></textarea></div>`;
    document.getElementById('processBtn').disabled=false;
  }
  else if(id==='webpage-pdf'){
    dz.style.display='none';
    document.getElementById('special-ui').innerHTML=`<div class="opts-panel" style="margin-top:0"><div class="opts-title">Enter URL</div><input id="urlInput" class="opt-input" type="url" placeholder="https://example.com" style="width:100%"><p style="margin-top:8px;font-size:13px;color:var(--text3)">Opens page and prompts to Print → Save as PDF.</p></div>`;
    document.getElementById('processBtn').disabled=false;
  }

  if(t.accept){
    const fi=document.getElementById('fileInput');fi.accept=t.accept;fi.multiple=t.multi;
    document.getElementById('dzIcon').textContent=t.icon;
    document.getElementById('dzSub').textContent=t.multi?'Multiple files OK':'One file at a time';
  } else dz.style.display='none';

  document.getElementById('btnLbl').textContent=t.btn;
  document.getElementById('btnIc').textContent=t.icon;
  buildOpts(id);
  goTool();
}

/* ─── SIGNATURE PAD ──────────────────────────────────────────── */
function initSigPad(){
  const canvas=document.getElementById('sigCanvas');
  if(!canvas)return;
  const w=canvas.parentElement?.offsetWidth||500;
  canvas.width=Math.max(w-32,300);canvas.height=160;
  sigCtx=canvas.getContext('2d');
  sigCtx.strokeStyle=sigColor;sigCtx.lineWidth=2.5;sigCtx.lineCap='round';sigCtx.lineJoin='round';
  canvas.addEventListener('pointerdown',e=>{sigDrawing=true;sigCtx.beginPath();sigCtx.moveTo(e.offsetX,e.offsetY);});
  canvas.addEventListener('pointermove',e=>{if(!sigDrawing)return;sigCtx.strokeStyle=sigColor;sigCtx.lineTo(e.offsetX,e.offsetY);sigCtx.stroke();});
  canvas.addEventListener('pointerup',()=>sigDrawing=false);
  canvas.addEventListener('pointerleave',()=>sigDrawing=false);
}

function setSigTab(tab){
  document.getElementById('sigTabDraw').classList.toggle('on',tab==='draw');
  document.getElementById('sigTabType').classList.toggle('on',tab==='type');
  document.getElementById('sigTabUpload').classList.toggle('on',tab==='upload');
  document.getElementById('sigDraw').style.display=tab==='draw'?'block':'none';
  document.getElementById('sigType').style.display=tab==='type'?'block':'none';
  document.getElementById('sigUpload').style.display=tab==='upload'?'block':'none';
  if(tab==='draw')setTimeout(initSigPad,50);
}
function clearSig(){if(sigCtx){const c=document.getElementById('sigCanvas');sigCtx.clearRect(0,0,c.width,c.height);}}
function renderTypeSig(){
  const text=document.getElementById('sigTypeInput').value;
  const c=document.getElementById('sigTypeCanvas');c.width=c.offsetWidth||480;c.height=80;
  const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
  ctx.font=`40px Georgia,serif`;ctx.fillStyle='#1a1b2e';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(text,c.width/2,c.height/2);
}
function applySig(){
  const c=document.getElementById('sigCanvas');
  sigImageData=c.toDataURL('image/png');
  showToast('Signature captured! Now place it on your PDF.','ok');
}
function applyTypeSig(){
  const c=document.getElementById('sigTypeCanvas');
  sigImageData=c.toDataURL('image/png');
  showToast('Typed signature ready! Processing PDF…','ok');
}
function loadSigImage(input){
  if(!input.files[0])return;
  const reader=new FileReader();
  reader.onload=e=>{sigImageData=e.target.result;showToast('Signature image loaded!','ok');};
  reader.readAsDataURL(input.files[0]);
}

/* ─── FULL PDF EDITOR ─────────────────────────────────────────── */
let editorAnnotations=[],editorPagePdf=null;

function setEditorTool(tool){
  editorTool=tool;
  document.querySelectorAll('.editor-tool-btn').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById('btn-'+tool);
  if(btn)btn.classList.add('active');
  const cv=document.getElementById('editorCanvas');
  if(cv){const cursors={select:'default',text:'text',draw:'crosshair',rect:'crosshair',highlight:'crosshair'};cv.style.cursor=cursors[tool]||'crosshair';}
}

function clearEditorCanvas(){
  if(!editorCtx)return;
  editorAnnotations=[];
  renderEditorPage();
}

async function initEditor(file){
  const buf=await file.arrayBuffer();
  editorPagePdf=await pdfjsLib.getDocument({data:buf}).promise;
  renderEditorPage();
}

async function renderEditorPage(){
  if(!editorPagePdf)return;
  const page=await editorPagePdf.getPage(1);
  const vp=page.getViewport({scale:1.2});
  const canvas=document.getElementById('editorCanvas');
  canvas.width=vp.width;canvas.height=vp.height;
  editorCtx=canvas.getContext('2d');
  await page.render({canvasContext:editorCtx,viewport:vp}).promise;
  // redraw annotations
  editorAnnotations.forEach(a=>drawAnnotation(a));
  setupEditorEvents(canvas);
}

function setupEditorEvents(canvas){
  canvas.onpointerdown=null;canvas.onpointermove=null;canvas.onpointerup=null;
  canvas.onpointerdown=e=>{
    editorDrawing=true;editorStartX=e.offsetX;editorStartY=e.offsetY;
    if(editorTool==='draw'){editorCtx.beginPath();editorCtx.moveTo(e.offsetX,e.offsetY);}
    if(editorTool==='text'){
      const text=prompt('Enter text:');
      if(text){
        const ann={type:'text',x:e.offsetX,y:e.offsetY,text,color:document.getElementById('editorColor').value,size:parseInt(document.getElementById('editorSize').value)||14};
        editorAnnotations.push(ann);drawAnnotation(ann);
      }
    }
  };
  canvas.onpointermove=e=>{
    if(!editorDrawing)return;
    if(editorTool==='draw'){
      editorCtx.strokeStyle=document.getElementById('editorColor').value;
      editorCtx.lineWidth=2.5;editorCtx.lineCap='round';
      editorCtx.lineTo(e.offsetX,e.offsetY);editorCtx.stroke();
    }
    if(editorTool==='highlight'){
      editorCtx.fillStyle='rgba(255,255,0,.3)';
      editorCtx.fillRect(editorStartX,editorStartY,e.offsetX-editorStartX,20);
    }
  };
  canvas.onpointerup=e=>{
    if(!editorDrawing){editorDrawing=false;return;}
    editorDrawing=false;
    if(editorTool==='rect'){
      const ann={type:'rect',x:editorStartX,y:editorStartY,w:e.offsetX-editorStartX,h:e.offsetY-editorStartY,color:document.getElementById('editorColor').value};
      editorAnnotations.push(ann);drawAnnotation(ann);
    }
  };
}

function drawAnnotation(a){
  if(!editorCtx)return;
  if(a.type==='text'){
    editorCtx.fillStyle=a.color;editorCtx.font=`${a.size}px 'Plus Jakarta Sans',sans-serif`;
    editorCtx.fillText(a.text,a.x,a.y);
  }
  if(a.type==='rect'){
    editorCtx.strokeStyle=a.color;editorCtx.lineWidth=2;
    editorCtx.strokeRect(a.x,a.y,a.w,a.h);
  }
}

/* ─── FILE HANDLING ─────────────────────────────────────────── */
const dz=document.getElementById('dropzone'),fi=document.getElementById('fileInput');
dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('over');});
dz.addEventListener('dragleave',()=>dz.classList.remove('over'));
dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('over');handleFiles([...e.dataTransfer.files]);});
fi.addEventListener('change',()=>handleFiles([...fi.files]));

function handleFiles(inc){
  if(!currentTool)return;
  currentTool.multi?files.push(...inc):(files=inc.slice(0,1));
  renderFiles();
  if(['split','delete-pages','extract','organize'].includes(currentTool.id)&&files.length)loadPreviews(currentTool.id==='organize');
  if(currentTool.id==='edit-full'&&files.length)initEditor(files[0]);
  document.getElementById('processBtn').disabled=files.length===0;
}

function renderFiles(){
  document.getElementById('fileList').innerHTML=files.map((f,i)=>`<div class="fitem"><span class="fitem-ic">${f.type==='application/pdf'?'📄':f.type.startsWith('image/')?'🖼️':'📁'}</span><span class="fitem-name">${f.name}</span><span class="fitem-sz">${fSz(f.size)}</span><button class="fitem-del" onclick="rmFile(${i})">✕</button></div>`).join('');
}
function rmFile(i){files.splice(i,1);renderFiles();document.getElementById('processBtn').disabled=files.length===0;if(!files.length)document.getElementById('pgSection').style.display='none';}
function fSz(b){return b<1048576?(b/1024).toFixed(1)+'KB':(b/1048576).toFixed(2)+'MB';}

/* ─── PAGE PREVIEWS (drag-reorder) ───────────────────────────── */
async function loadPreviews(drag=false){
  const f=files[0];if(!f||f.type!=='application/pdf')return;
  const sec=document.getElementById('pgSection');sec.style.display='block';
  document.getElementById('pgLbl').textContent=drag?'Drag pages to reorder (hold & drag)':'Click pages to select';
  const grid=document.getElementById('pgGrid');grid.innerHTML='<div style="color:var(--text3);font-size:13px;grid-column:1/-1;padding:6px">Loading pages…</div>';
  selectedPages.clear();
  const buf=await f.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;
  const total=pdf.numPages;grid.innerHTML='';
  for(let pg=1;pg<=total;pg++){
    const page=await pdf.getPage(pg);const vp=page.getViewport({scale:.38});
    const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;
    await page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;
    const card=document.createElement('div');card.className='pg-card';card.dataset.pg=pg;
    card.innerHTML='<div class="pg-chk">✓</div>';card.insertBefore(cv,card.querySelector('.pg-chk'));
    const lbl=document.createElement('div');lbl.className='pg-num';lbl.textContent=`p.${pg}`;card.appendChild(lbl);
    card.addEventListener('click',()=>{
      if(selectedPages.has(pg)){selectedPages.delete(pg);card.classList.remove('sel');}
      else{selectedPages.add(pg);card.classList.add('sel');}
    });
    if(drag){card.draggable=true;}
    grid.appendChild(card);
  }
  if(drag){
    let dragged=null;
    grid.querySelectorAll('.pg-card').forEach(c=>{
      c.addEventListener('dragstart',e=>{dragged=c;c.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
      c.addEventListener('dragend',()=>{c.classList.remove('dragging');dragged=null;});
      c.addEventListener('dragover',e=>{
        e.preventDefault();
        if(!dragged||dragged===c)return;
        const rect=c.getBoundingClientRect();
        const next=(e.clientX-rect.left)>(rect.width/2);
        grid.insertBefore(dragged,next?c.nextSibling:c);
      });
    });
  }
}

/* ─── OPTIONS ─────────────────────────────────────────────────── */
function buildOpts(id){
  const panel=document.getElementById('optsPanel'),grid=document.getElementById('optsGrid');
  const chips=(gid,items)=>`<div class="opt-chips" id="${gid}">${items.map((x,i)=>`<div class="opt-chip${i===0?' on':''}" data-v="${x.v}" onclick="setChip('${gid}',this)">${x.l}</div>`).join('')}</div>`;
  let html='';
  if(id==='compress')html=`<div class="opt-field" style="grid-column:1/-1"><div class="opt-lbl">Quality</div>${chips('cq',[{v:'high',l:'High quality'},{v:'balanced',l:'Balanced'},{v:'low',l:'Max compression'}])}</div>`;
  else if(id==='rotate')html=`<div class="opt-field" style="grid-column:1/-1"><div class="opt-lbl">Rotation</div>${chips('rot',[{v:'90',l:'↻ 90° Right'},{v:'180',l:'↕ 180°'},{v:'270',l:'↺ 90° Left'}])}</div><div class="opt-field"><div class="opt-lbl">Apply to</div><select class="opt-select" id="rotPages"><option value="all">All pages</option><option value="odd">Odd pages</option><option value="even">Even pages</option></select></div>`;
  else if(id==='watermark')html=`<div class="opt-field" style="grid-column:1/-1"><div class="opt-lbl">Watermark text</div><input class="opt-input" id="wmText" value="CONFIDENTIAL"></div><div class="opt-field"><div class="opt-lbl">Opacity (1–100)</div><input class="opt-input" id="wmOp" type="number" min="5" max="100" value="20"></div><div class="opt-field"><div class="opt-lbl">Font size</div><input class="opt-input" id="wmSz" type="number" min="12" max="120" value="52"></div><div class="opt-field"><div class="opt-lbl">Colour</div>${chips('wmCol',[{v:'gray',l:'Gray'},{v:'red',l:'Red'},{v:'blue',l:'Blue'},{v:'green',l:'Green'}])}</div>`;
  else if(id==='protect')html=`<div class="opt-field"><div class="opt-lbl">Password</div><input class="opt-input" id="protPw" type="password" placeholder="Enter password"></div><div class="opt-field"><div class="opt-lbl">Confirm</div><input class="opt-input" id="protPw2" type="password" placeholder="Repeat password"></div>`;
  else if(id==='unlock')html=`<div class="opt-field" style="grid-column:1/-1"><div class="opt-lbl">Current password</div><input class="opt-input" id="unlockPw" type="password" placeholder="PDF's existing password"></div>`;
  else if(id==='pdf-to-jpg')html=`<div class="opt-field"><div class="opt-lbl">Format</div>${chips('imgFmt',[{v:'jpeg',l:'JPEG'},{v:'png',l:'PNG'}])}</div><div class="opt-field"><div class="opt-lbl">Resolution</div><div style="margin-top:4px"><input type="range" id="dpi" min="1" max="4" step=".5" value="2"><div class="range-lbls"><span>Low</span><span>Standard</span><span>High</span></div></div></div>`;
  else if(id==='page-numbers')html=`<div class="opt-field"><div class="opt-lbl">Position</div><select class="opt-select" id="pnPos"><option value="bc">Bottom centre</option><option value="br">Bottom right</option><option value="bl">Bottom left</option><option value="tc">Top centre</option></select></div><div class="opt-field"><div class="opt-lbl">Start from</div><input class="opt-input" id="pnStart" type="number" min="1" value="1"></div><div class="opt-field"><div class="opt-lbl">Font size</div><input class="opt-input" id="pnSz" type="number" min="8" max="36" value="11"></div>`;
  else if(id==='translate')html=`<div class="opt-field" style="grid-column:1/-1"><div class="opt-lbl">Target Language</div><select class="opt-select" id="transLang"><option>Spanish</option><option>French</option><option>German</option><option>Hindi</option><option>Chinese (Simplified)</option><option>Japanese</option><option>Portuguese</option><option>Arabic</option><option>Russian</option><option>Italian</option><option>Korean</option><option>Turkish</option></select></div>`;
  if(html){grid.innerHTML=html;panel.style.display='block';}else panel.style.display='none';
}
function setChip(gid,el){document.querySelectorAll(`#${gid} .opt-chip`).forEach(c=>c.classList.remove('on'));el.classList.add('on');}

/* ─── PROGRESS ────────────────────────────────────────────────── */
function setP(v){document.getElementById('progFill').style.width=v+'%';}
function setSt(m){const s=document.getElementById('statusTxt');s.textContent=m;s.style.display='block';}
function showProg(){document.getElementById('progBar').style.display='block';setSt('Starting…');setP(0);}
function hideProg(){document.getElementById('progBar').style.display='none';document.getElementById('statusTxt').style.display='none';}
function showResult(fname,blob,meta=''){
  hideProg();
  const url=URL.createObjectURL(blob);
  const dl=document.getElementById('dlBtn');dl.href=url;dl.download=fname;
  document.getElementById('rzTitle').textContent='Your file is ready!';
  document.getElementById('rzMeta').innerHTML=`<strong>${fname}</strong><br>${meta}`;
  const rz=document.getElementById('resultZone');rz.classList.add('on');
  rz.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function showResultZip(items){
  hideProg();
  const zip=new JSZip();items.forEach(({name:n,blob})=>zip.file(n,blob));
  const zb=await zip.generateAsync({type:'blob'});
  const url=URL.createObjectURL(zb);
  const dl=document.getElementById('dlBtn');dl.href=url;dl.download='pdfmate-files.zip';
  document.getElementById('rzTitle').textContent=`${items.length} files ready!`;
  document.getElementById('rzMeta').textContent=`ZIP · ${fSz(zb.size)}`;
  document.getElementById('resultZone').classList.add('on');
}

/* ─── RUN TOOL ────────────────────────────────────────────────── */
async function runTool(){
  if(!currentTool)return;
  document.getElementById('processBtn').disabled=true;
  document.getElementById('resultZone').classList.remove('on');
  showProg();
  try{await(RUNNERS[currentTool.id]||RUNNERS._fallback)();}
  catch(e){console.error(e);showToast('Error: '+e.message,'err');hideProg();}
  const noFile = ['html-to-pdf','webpage-pdf'].includes(currentTool.id);
  document.getElementById('processBtn').disabled = !noFile && files.length===0;
}

function resetTool(nav=true){
  files=[];selectedPages.clear();sigImageData=null;editorAnnotations=[];editorPagePdf=null;
  document.getElementById('fileList').innerHTML='';
  document.getElementById('pgSection').style.display='none';
  document.getElementById('pgGrid').innerHTML='';
  document.getElementById('optsPanel').style.display='none';
  document.getElementById('resultZone').classList.remove('on');
  document.getElementById('aiOutputPanel').style.display='none';
  document.getElementById('processBtn').disabled=true;
  hideProg();setP(0);
  document.getElementById('fileInput').value='';
  if(nav)goHome();
}

/* ─── AI RUNNER HELPER (Claude API) ──────────────────────────── */
async function runAI(prompt, pdfText){
  const aiPanel=document.getElementById('aiOutputPanel');
  const aiContent=document.getElementById('aiOutputContent');
  aiPanel.style.display='block';
  aiContent.innerHTML=`<div class="ai-loading"><div class="ai-loading-dots"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div></div><span>Claude AI is thinking…</span></div>`;

  try{
    const response=await fetch('/api/ai',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6',
        max_tokens:1500,
        messages:[{role:'user',content:`${prompt}\n\n---PDF CONTENT---\n${pdfText.slice(0,6000)}`}]
      })
    });
    const data=await response.json();
    const result=data.content?.map(c=>c.text||'').join('')||'No response received.';
    aiContent.innerHTML=`<div class="ai-output-text">${result.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button onclick="copyAI()" style="padding:7px 14px;border-radius:8px;background:var(--purple);color:#fff;border:none;font-size:12.5px;font-weight:700">📋 Copy Result</button>
        <button onclick="downloadAI('${currentTool.id}')" style="padding:7px 14px;border-radius:8px;background:var(--bg);border:1.5px solid var(--border);color:var(--text2);font-size:12.5px;font-weight:700">⬇ Download as TXT</button>
      </div>`;
    return result;
  }catch(e){
    aiContent.innerHTML=`<div style="color:var(--amber);background:var(--amber-l);padding:16px;border-radius:10px;font-size:13.5px;line-height:1.6"><strong>⚠️ AI Key Required</strong><br>To use AI features, add your Anthropic API key to the code. See the deployment guide for instructions.</div>`;
    return '';
  }
}

function copyAI(){
  const text=document.querySelector('.ai-output-text')?.textContent||'';
  navigator.clipboard.writeText(text).then(()=>showToast('Copied to clipboard!','ok'));
}
function downloadAI(id){
  const text=document.querySelector('.ai-output-text')?.textContent||'';
  const blob=new Blob([text],{type:'text/plain'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=id+'-result.txt';a.click();
}

/* ─── TOOL RUNNERS ────────────────────────────────────────────── */
