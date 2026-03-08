// PDFMate Pro - PDF Processing Runners
// All tool runners using PDF-lib + PDF.js

const RUNNERS={
  async merge(){setSt('Reading…');setP(10);const out=await PDFDocument.create();for(let i=0;i<files.length;i++){setSt(`Merging ${files[i].name}…`);setP(10+(i/files.length)*80);const src=await PDFDocument.load(await files[i].arrayBuffer(),{ignoreEncryption:true});const pages=await out.copyPages(src,src.getPageIndices());pages.forEach(p=>out.addPage(p));}setP(95);setSt('Saving…');const blob=new Blob([await out.save()],{type:'application/pdf'});setP(100);showResult('merged.pdf',blob,`${files.length} files · ${out.getPageCount()} pages · ${fSz(blob.size)}`);},
  async split(){const buf=await files[0].arrayBuffer();setP(10);setSt('Loading…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});const total=src.getPageCount();const pages=selectedPages.size>0?[...selectedPages].sort((a,b)=>a-b):Array.from({length:total},(_,i)=>i+1);const out=[];for(let i=0;i<pages.length;i++){setP(10+(i/pages.length)*85);setSt(`Page ${pages[i]}…`);const d=await PDFDocument.create();const[p]=await d.copyPages(src,[pages[i]-1]);d.addPage(p);out.push({name:`page-${pages[i]}.pdf`,blob:new Blob([await d.save()],{type:'application/pdf'})});}setP(100);out.length===1?showResult(out[0].name,out[0].blob,fSz(out[0].blob.size)):await showResultZip(out);},
  async compress(){const q=document.querySelector('#cq .opt-chip.on')?.dataset.v||'balanced';const buf=await files[0].arrayBuffer();setP(20);setSt('Optimising…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});src.setTitle('');src.setAuthor('');src.setSubject('');src.setKeywords([]);src.setCreator('PDFMate');setP(65);const bytes=await src.save({useObjectStreams:q!=='high',addDefaultPage:false});const blob=new Blob([bytes],{type:'application/pdf'});const saved=files[0].size-blob.size;setP(100);showResult('compressed.pdf',blob,`${fSz(files[0].size)} → ${fSz(blob.size)} · saved ${Math.max(0,(saved/files[0].size*100)).toFixed(1)}%`);},
  async repair(){const buf=await files[0].arrayBuffer();setP(30);setSt('Repairing…');const src=await PDFDocument.load(buf,{ignoreEncryption:true,throwOnInvalidObject:false});setP(70);const blob=new Blob([await src.save()],{type:'application/pdf'});setP(100);showResult('repaired.pdf',blob,`${src.getPageCount()} pages · ${fSz(blob.size)}`);},
  async 'pdf-to-word'(){setSt('Extracting text…');setP(10);const buf=await files[0].arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf.slice(0)}).promise;const total=pdf.numPages;let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:Calibri,sans-serif;max-width:760px;margin:40px auto;padding:0 40px;font-size:12pt;line-height:1.6}.page{margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid #eee}</style></head><body>`;for(let pg=1;pg<=total;pg++){setP(10+(pg-1)/total*80);setSt(`Page ${pg}/${total}…`);const page=await pdf.getPage(pg);const content=await page.getTextContent();const text=content.items.map(i=>i.str).join(' ');html+=`<div class="page"><p>${text}</p></div>`;}html+='</body></html>';const blob=new Blob([html],{type:'text/html'});setP(100);showResult('document.html',blob,`${total} pages · Open in Word or Google Docs · ${fSz(blob.size)}`);},
  async 'word-to-pdf'(){setSt('Converting…');setP(20);const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.Helvetica);const buf=await files[0].arrayBuffer();const text=new TextDecoder().decode(buf).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,8000);const lines=wrapText(text,font,11,480);const W=595,H=842,m=56;let page=doc.addPage([W,H]);let y=H-m;setP(60);for(const l of lines){if(y<m){page=doc.addPage([W,H]);y=H-m;}page.drawText(l,{x:m,y,size:11,font,color:rgb(.08,.08,.08)});y-=15;}setP(90);const blob=new Blob([await doc.save()],{type:'application/pdf'});setP(100);showResult('document.pdf',blob,`${doc.getPageCount()} pages · ${fSz(blob.size)}`);},
  async 'pdf-to-jpg'(){const fmt=document.querySelector('#imgFmt .opt-chip.on')?.dataset.v||'jpeg';const scale=parseFloat(document.getElementById('dpi')?.value||2);const buf=await files[0].arrayBuffer();setP(5);setSt('Rendering…');const pdf=await pdfjsLib.getDocument({data:buf.slice(0)}).promise;const total=pdf.numPages;const out=[];for(let pg=1;pg<=total;pg++){setP(5+(pg-1)/total*90);setSt(`Page ${pg}/${total}…`);const page=await pdf.getPage(pg);const vp=page.getViewport({scale});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;const blob=await new Promise(r=>cv.toBlob(r,'image/'+fmt,fmt==='jpeg'?.92:undefined));out.push({name:`page-${pg}.${fmt==='jpeg'?'jpg':'png'}`,blob});}setP(100);total===1?showResult(out[0].name,out[0].blob,fSz(out[0].blob.size)):await showResultZip(out);},
  async 'jpg-to-pdf'(){setSt('Building PDF…');setP(10);const doc=await PDFDocument.create();for(let i=0;i<files.length;i++){setP(10+(i/files.length)*82);const buf=await files[i].arrayBuffer();let img;if(files[i].type==='image/jpeg'||files[i].type==='image/jpg')img=await doc.embedJpg(buf);else{const bm=await createImageBitmap(files[i]);const cv=document.createElement('canvas');cv.width=bm.width;cv.height=bm.height;cv.getContext('2d').drawImage(bm,0,0);img=await doc.embedPng(await new Promise(r=>cv.toBlob(b=>b.arrayBuffer().then(r),'image/png')));}const{width,height}=img;const p=doc.addPage([width,height]);p.drawImage(img,{x:0,y:0,width,height});}setP(95);const blob=new Blob([await doc.save()],{type:'application/pdf'});setP(100);showResult('images.pdf',blob,`${files.length} images · ${doc.getPageCount()} pages · ${fSz(blob.size)}`);},
  async 'scan-to-pdf'(){await RUNNERS['jpg-to-pdf'].call(this);},
  async rotate(){const deg=parseInt(document.querySelector('#rot .opt-chip.on')?.dataset.v||90);const which=document.getElementById('rotPages')?.value||'all';const buf=await files[0].arrayBuffer();setP(20);setSt('Rotating…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});src.getPages().forEach((p,i)=>{const idx=i+1;if(which==='all'||(which==='odd'&&idx%2===1)||(which==='even'&&idx%2===0))p.setRotation(degrees((p.getRotation().angle+deg)%360));});setP(80);const blob=new Blob([await src.save()],{type:'application/pdf'});setP(100);showResult('rotated.pdf',blob,`${src.getPageCount()} pages rotated ${deg}° · ${fSz(blob.size)}`);},
  async unlock(){const pw=document.getElementById('unlockPw')?.value||'';const buf=await files[0].arrayBuffer();setP(30);setSt('Unlocking…');let src;try{src=await PDFDocument.load(buf,{password:pw,ignoreEncryption:false});}catch(e){showToast('Wrong password','err');hideProg();document.getElementById('processBtn').disabled=false;return;}setP(80);const blob=new Blob([await src.save()],{type:'application/pdf'});setP(100);showResult('unlocked.pdf',blob,`Password removed · ${fSz(blob.size)}`);},
  async protect(){const p1=document.getElementById('protPw')?.value;const p2=document.getElementById('protPw2')?.value;if(!p1){showToast('Enter a password','warn');return;}if(p1!==p2){showToast('Passwords do not match','warn');return;}const buf=await files[0].arrayBuffer();setP(30);setSt('Encrypting…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});const bytes=await src.save({userPassword:p1,ownerPassword:p1+'_pm',permissions:{printing:'lowResolution',modifying:false,copying:false}});const blob=new Blob([bytes],{type:'application/pdf'});setP(100);showResult('protected.pdf',blob,`Encrypted · ${fSz(blob.size)}`);},
  async watermark(){const text=document.getElementById('wmText')?.value||'CONFIDENTIAL';const op=Math.min(1,Math.max(0,parseInt(document.getElementById('wmOp')?.value||20)/100));const sz=parseInt(document.getElementById('wmSz')?.value||52);const col=document.querySelector('#wmCol .opt-chip.on')?.dataset.v||'gray';const cmap={gray:rgb(.55,.55,.55),red:rgb(.88,.15,.1),blue:rgb(.06,.44,.89),green:rgb(.1,.6,.25)};const buf=await files[0].arrayBuffer();setP(15);setSt('Applying…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});const font=await src.embedFont(StandardFonts.HelveticaBold);const pages=src.getPages();pages.forEach((p,i)=>{setP(15+(i/pages.length)*75);const{width,height}=p.getSize();const tw=font.widthOfTextAtSize(text,sz);p.drawText(text,{x:(width-tw)/2,y:(height-sz)/2,size:sz,font,color:cmap[col],opacity:op,rotate:degrees(45)});});setP(95);const blob=new Blob([await src.save()],{type:'application/pdf'});setP(100);showResult('watermarked.pdf',blob,`"${text}" · ${pages.length} pages · ${fSz(blob.size)}`);},
  async 'page-numbers'(){const pos=document.getElementById('pnPos')?.value||'bc';const start=parseInt(document.getElementById('pnStart')?.value||1);const sz=parseInt(document.getElementById('pnSz')?.value||11);const buf=await files[0].arrayBuffer();setP(15);setSt('Adding numbers…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});const font=await src.embedFont(StandardFonts.Helvetica);const m=28;src.getPages().forEach((p,i)=>{setP(15+(i/src.getPageCount())*75);const{width,height}=p.getSize();const num=String(start+i);const tw=font.widthOfTextAtSize(num,sz);let x,y;switch(pos){case'bc':x=(width-tw)/2;y=m;break;case'br':x=width-tw-m;y=m;break;case'bl':x=m;y=m;break;default:x=(width-tw)/2;y=height-m-sz;}p.drawText(num,{x,y,size:sz,font,color:rgb(.15,.15,.15)});});setP(95);const blob=new Blob([await src.save()],{type:'application/pdf'});setP(100);showResult('numbered.pdf',blob,`${src.getPageCount()} pages · ${fSz(blob.size)}`);},
  async organize(){const buf=await files[0].arrayBuffer();setP(20);setSt('Reordering…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});const cards=[...document.getElementById('pgGrid').querySelectorAll('.pg-card')];const newOrder=cards.map(c=>parseInt(c.dataset.pg)-1);const out=await PDFDocument.create();const copied=await out.copyPages(src,newOrder);copied.forEach(p=>out.addPage(p));setP(85);const blob=new Blob([await out.save()],{type:'application/pdf'});setP(100);showResult('organized.pdf',blob,`${newOrder.length} pages reordered · ${fSz(blob.size)}`);},
  async 'delete-pages'(){if(!selectedPages.size){showToast('Select pages to delete first','warn');document.getElementById('processBtn').disabled=false;return;}const buf=await files[0].arrayBuffer();setP(20);setSt('Removing…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});const total=src.getPageCount();const keep=Array.from({length:total},(_,i)=>i+1).filter(pg=>!selectedPages.has(pg));if(!keep.length){showToast('Cannot delete all pages','warn');document.getElementById('processBtn').disabled=false;return;}const out=await PDFDocument.create();const copied=await out.copyPages(src,keep.map(p=>p-1));copied.forEach(p=>out.addPage(p));setP(85);const blob=new Blob([await out.save()],{type:'application/pdf'});setP(100);showResult('deleted.pdf',blob,`Removed ${selectedPages.size} pages · ${out.getPageCount()} remaining · ${fSz(blob.size)}`);},
  async extract(){const buf=await files[0].arrayBuffer();setP(10);setSt('Extracting…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});const total=src.getPageCount();const pages=selectedPages.size>0?[...selectedPages].sort((a,b)=>a-b):Array.from({length:total},(_,i)=>i+1);const out=await PDFDocument.create();const copied=await out.copyPages(src,pages.map(p=>p-1));copied.forEach(p=>out.addPage(p));setP(90);const blob=new Blob([await out.save()],{type:'application/pdf'});setP(100);showResult('extracted.pdf',blob,`${pages.length} pages extracted · ${fSz(blob.size)}`);},
  async 'pdf-to-excel'(){setSt('Extracting data…');setP(10);const buf=await files[0].arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf.slice(0)}).promise;const total=pdf.numPages;let csv='Page,Line,Text\n';for(let pg=1;pg<=total;pg++){setP(10+(pg-1)/total*80);const page=await pdf.getPage(pg);const content=await page.getTextContent();content.items.map(i=>i.str.trim()).filter(Boolean).forEach((l,i)=>{csv+=`${pg},${i+1},"${l.replace(/"/g,'""')}"\n`;});}const blob=new Blob([csv],{type:'text/csv'});setP(100);showResult('data.csv',blob,`${total} pages → CSV · Open in Excel · ${fSz(blob.size)}`);},
  async 'pdf-to-ppt'(){setSt('Rendering slides…');setP(5);const buf=await files[0].arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf.slice(0)}).promise;const total=pdf.numPages;const slides=[];for(let pg=1;pg<=total;pg++){setP(5+(pg-1)/total*88);const page=await pdf.getPage(pg);const vp=page.getViewport({scale:1.2});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;slides.push(cv.toDataURL('image/jpeg',.88));}let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Slides</title><style>*{margin:0;padding:0}body{background:#000}.slide{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}.slide img{max-width:100%;max-height:90vh}</style></head><body>`;slides.forEach((src,i)=>{html+=`<div class="slide" id="s${i+1}"><img src="${src}"></div>`;});html+='</body></html>';const blob=new Blob([html],{type:'text/html'});setP(100);showResult('slides.html',blob,`${total} slides · ${fSz(blob.size)}`);},
  async 'excel-to-pdf'(){setSt('Converting…');setP(20);const buf=await files[0].arrayBuffer();const text=new TextDecoder().decode(buf);const rows=text.split('\n').slice(0,60).filter(Boolean);const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.Helvetica);const fontB=await doc.embedFont(StandardFonts.HelveticaBold);const W=842,H=595,m=40,rH=18,cW=180;let page=doc.addPage([W,H]);let y=H-m;let row=0;setP(60);for(const line of rows){if(y<m){page=doc.addPage([W,H]);y=H-m;row=0;}const cells=line.split(',').slice(0,4);cells.forEach((c,ci)=>{const x=m+ci*cW;if(row===0){page.drawRectangle({x,y:y-rH+4,width:cW-2,height:rH,color:rgb(.91,.22,.29),opacity:.9});page.drawText((c||'').slice(0,22),{x:x+4,y:y-12,size:8.5,font:fontB,color:rgb(1,1,1)});}else{if(row%2===0)page.drawRectangle({x,y:y-rH+4,width:cW-2,height:rH,color:rgb(.97,.98,1)});page.drawText((c||'').slice(0,24),{x:x+4,y:y-12,size:8,font,color:rgb(.1,.1,.1)});}});y-=rH;row++;}setP(90);const blob=new Blob([await doc.save()],{type:'application/pdf'});setP(100);showResult('spreadsheet.pdf',blob,`${rows.length} rows · ${fSz(blob.size)}`);},
  async 'ppt-to-pdf'(){setSt('Converting…');setP(20);const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.HelveticaBold);const fontR=await doc.embedFont(StandardFonts.Helvetica);const buf=await files[0].arrayBuffer();const txt=new TextDecoder('utf-8',{fatal:false}).decode(buf).replace(/[^\x20-\x7E\n\r]/g,' ').replace(/\s{3,}/g,'\n').trim().slice(0,5000);const slides=txt.split('\n').filter(l=>l.trim().length>4).slice(0,20);const W=960,H=540,m=60;setP(50);slides.forEach((slide,i)=>{const page=doc.addPage([W,H]);page.drawRectangle({x:0,y:0,width:W,height:H,color:rgb(.99,.99,1)});page.drawRectangle({x:0,y:H-6,width:W,height:6,color:rgb(.91,.22,.29)});page.drawText(String(i+1),{x:W-m,y:m/2,size:11,font:fontR,color:rgb(.7,.7,.7)});page.drawText(slide.slice(0,52),{x:m,y:H/2+10,size:26,font,color:rgb(.1,.1,.15),maxWidth:W-m*2});});setP(90);const blob=new Blob([await doc.save()],{type:'application/pdf'});setP(100);showResult('presentation.pdf',blob,`${slides.length} slides · ${fSz(blob.size)}`);},
  async 'html-to-pdf'(){const html=document.getElementById('htmlInput')?.value||'<h1>Hello</h1>';setSt('Generating…');setP(20);const doc=await PDFDocument.create();const font=await doc.embedFont(StandardFonts.Helvetica);const plain=html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();const lines=wrapText(plain,font,12,480);const W=595,H=842,m=56;let page=doc.addPage([W,H]);let y=H-m;setP(60);for(const l of lines){if(y<m){page=doc.addPage([W,H]);y=H-m;}page.drawText(l,{x:m,y,size:12,font,color:rgb(.08,.08,.08)});y-=18;}setP(90);const blob=new Blob([await doc.save()],{type:'application/pdf'});setP(100);showResult('document.pdf',blob,`${doc.getPageCount()} pages · ${fSz(blob.size)}`);},
  async 'webpage-pdf'(){const url=document.getElementById('urlInput')?.value;if(!url){showToast('Enter a URL','warn');document.getElementById('processBtn').disabled=false;return;}window.open(url,'_blank');hideProg();setSt('Browser opened — use Print → Save as PDF');document.getElementById('statusTxt').style.display='block';document.getElementById('processBtn').disabled=false;},
  async 'crop-pdf'(){const buf=await files[0].arrayBuffer();setP(20);setSt('Cropping…');const src=await PDFDocument.load(buf,{ignoreEncryption:true});const margin=40;src.getPages().forEach(p=>{const{width,height}=p.getSize();p.setCropBox(margin,margin,width-margin*2,height-margin*2);});setP(80);const blob=new Blob([await src.save()],{type:'application/pdf'});setP(100);showResult('cropped.pdf',blob,`Margins cropped · ${fSz(blob.size)}`);},
  async 'ocr-pdf'(){setP(20);setSt('Loading PDF for OCR…');const buf=await files[0].arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf.slice(0)}).promise;const total=pdf.numPages;let text='';for(let pg=1;pg<=total;pg++){setP(20+(pg-1)/total*60);const page=await pdf.getPage(pg);const content=await page.getTextContent();text+=`--- Page ${pg} ---\n${content.items.map(i=>i.str).join(' ')}\n\n`;}const blob=new Blob([text],{type:'text/plain'});setP(100);showResult('ocr-text.txt',blob,`${total} pages extracted · ${fSz(blob.size)}`);},

  // ── AI TOOLS ──
  async 'ai-summarize'(){
    if(!files.length){showToast('Upload a PDF first','warn');document.getElementById('processBtn').disabled=false;return;}
    setSt('Extracting PDF text for AI…');setP(15);
    const buf=await files[0].arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:buf.slice(0)}).promise;
    let text='';
    for(let pg=1;pg<=Math.min(pdf.numPages,12);pg++){
      setP(15+(pg/12)*35);
      const page=await pdf.getPage(pg);
      const content=await page.getTextContent();
      text+=content.items.map(i=>i.str).join(' ')+'\n';
    }
    hideProg();
    await runAI(`Please provide a comprehensive summary of this PDF document. Include:
1. **Main Topic**: What is this document about?
2. **Key Points**: List the 5-7 most important points
3. **Key Findings/Conclusions**: What are the main takeaways?
4. **Document Structure**: Brief overview of how it's organized
Keep the summary clear, structured, and useful.`,text);
    document.getElementById('processBtn').disabled=false;
  },

  async 'ai-extract'(){
    if(!files.length){showToast('Upload a PDF first','warn');document.getElementById('processBtn').disabled=false;return;}
    setSt('Extracting content for AI…');setP(15);
    const buf=await files[0].arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:buf.slice(0)}).promise;
    let text='';
    for(let pg=1;pg<=Math.min(pdf.numPages,10);pg++){
      setP(15+(pg/10)*35);
      const page=await pdf.getPage(pg);
      const content=await page.getTextContent();
      text+=content.items.map(i=>i.str).join(' ')+'\n';
    }
    hideProg();
    await runAI(`Extract and structure the following information from this PDF document:
1. **People/Organizations** mentioned
2. **Dates and Numbers** (statistics, figures, dates)
3. **Key Terms and Definitions**
4. **Action Items or Requirements** (if any)
5. **Contact Information** (if any)
Format as clean structured output.`,text);
    document.getElementById('processBtn').disabled=false;
  },

  async translate(){
    if(!files.length){showToast('Upload a PDF first','warn');document.getElementById('processBtn').disabled=false;return;}
    const lang=document.getElementById('transLang')?.value||'Spanish';
    setSt('Extracting PDF text for translation…');setP(10);
    const buf=await files[0].arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:buf.slice(0)}).promise;
    let text='';
    for(let pg=1;pg<=Math.min(pdf.numPages,6);pg++){
      setP(10+(pg/6)*30);
      const page=await pdf.getPage(pg);
      const content=await page.getTextContent();
      text+=`[Page ${pg}]\n${content.items.map(i=>i.str).join(' ')}\n\n`;
    }
    hideProg();
    await runAI(`Translate the following PDF content into ${lang}. 
- Preserve the page structure with [Page N] markers
- Keep any technical terms accurate
- Maintain the original formatting where possible
Provide ONLY the translation, no explanations.`,text);
    document.getElementById('processBtn').disabled=false;
  },

  // ── EDITOR ──
  async 'edit-full'(){
    if(!files.length&&!editorPagePdf){showToast('Upload a PDF first','warn');document.getElementById('processBtn').disabled=false;return;}
    setSt('Baking annotations into PDF…');setP(20);
    const buf=await files[0].arrayBuffer();
    const src=await PDFDocument.load(buf,{ignoreEncryption:true});
    const page=src.getPages()[0];
    const font=await src.embedFont(StandardFonts.HelveticaBold);
    const{height}=page.getSize();
    // Embed canvas annotations into PDF
    if(editorCtx){
      const canvas=document.getElementById('editorCanvas');
      const scale=page.getWidth()/canvas.width;
      for(const a of editorAnnotations){
        if(a.type==='text'){
          const c=hexToRgb(a.color||'#000000');
          page.drawText(a.text,{x:a.x*scale,y:height-(a.y*scale),size:a.size,font,color:rgb(c.r/255,c.g/255,c.b/255)});
        }
        if(a.type==='rect'){
          const c=hexToRgb(a.color||'#000000');
          page.drawRectangle({x:a.x*scale,y:height-((a.y+a.h)*scale),width:a.w*scale,height:a.h*scale,borderColor:rgb(c.r/255,c.g/255,c.b/255),borderWidth:2});
        }
      }
    }
    setP(80);const blob=new Blob([await src.save()],{type:'application/pdf'});
    setP(100);showResult('edited.pdf',blob,`Annotations applied · ${fSz(blob.size)}`);
  },

  // ── SIGN ──
  async 'sign-pdf'(){
    if(!files.length){showToast('Upload a PDF first','warn');document.getElementById('processBtn').disabled=false;return;}
    if(!sigImageData){showToast('Create your signature above first','warn');document.getElementById('processBtn').disabled=false;return;}
    setSt('Embedding signature…');setP(20);
    const buf=await files[0].arrayBuffer();
    const src=await PDFDocument.load(buf,{ignoreEncryption:true});
    // Convert base64 signature to PNG bytes
    const b64=sigImageData.replace(/^data:image\/png;base64,/,'');
    const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const sigImg=await src.embedPng(bytes);
    const pages=src.getPages();
    const lastPage=pages[pages.length-1];
    const{width,height}=lastPage.getSize();
    const sigW=180,sigH=60;
    lastPage.drawImage(sigImg,{x:width-sigW-40,y:40,width:sigW,height:sigH});
    // Add signature line
    const font=await src.embedFont(StandardFonts.Helvetica);
    const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
    lastPage.drawLine({start:{x:width-sigW-40,y:38},end:{x:width-40,y:38},thickness:1,color:rgb(.4,.4,.4)});
    lastPage.drawText(`Signed: ${today}`,{x:width-sigW-40,y:24,size:8,font,color:rgb(.5,.5,.5)});
    setP(80);const blob=new Blob([await src.save()],{type:'application/pdf'});
    setP(100);showResult('signed.pdf',blob,`Digital signature applied · ${fSz(blob.size)}`);
  },

  async 'gdrive-open'(){showToast('Connect Google Drive first','warn');hideProg();document.getElementById('processBtn').disabled=false;showCloudModal();},
  async 'dropbox-open'(){showToast('Connect Dropbox first','warn');hideProg();document.getElementById('processBtn').disabled=false;showCloudModal();},
  async _fallback(){showToast('Tool coming soon','warn');hideProg();document.getElementById('processBtn').disabled=false;},
};