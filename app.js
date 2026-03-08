// PDFMate Pro - App Init & Utilities

/* ─── HELPERS ──────────────────────────────────────────────────── */
function wrapText(text,font,size,maxW){if(!text||!text.trim())return[];const words=text.trim().split(' ');const lines=[];let line='';for(const w of words){const test=line?line+' '+w:w;if(font.widthOfTextAtSize(test,size)>maxW){lines.push(line);line=w;}else line=test;}if(line)lines.push(line);return lines;}
function hexToRgb(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return{r,g,b};}
function showToast(msg,type='ok'){const t=document.getElementById('toast'),led=document.getElementById('toastLed'),c={ok:'#059669',warn:'#d97706',err:'#dc2626'};document.getElementById('toastMsg').textContent=msg;led.style.background=c[type]||c.ok;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),4000);}

/* ─── INIT ─────────────────────────────────────────────────────── */
renderGrid('all');

function toggleMobileMenu(){
  const m=document.getElementById('mobileMenu');
  m.style.display=m.style.display==='block'?'none':'block';
}
// Close mobile menu on outside click
document.addEventListener('click',e=>{
  const m=document.getElementById('mobileMenu');
  const btn=document.getElementById('mobileMenuBtn');
  if(m&&btn&&!m.contains(e.target)&&!btn.contains(e.target)){m.style.display='none';}
});

// Keyboard: Escape = go home from tool page
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.getElementById('page-tool').classList.contains('active'))goHome();
});

// Hash-based deep linking e.g. index.html#merge
if(location.hash){
  const tid=location.hash.replace('#','');
  if(TOOLS.find(t=>t.id===tid))setTimeout(()=>openTool(tid),150);
}

// Intersection observer for hero stat counter animation
const sObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.opacity='1';
      e.target.style.transform='none';
      sObs.unobserve(e.target);
    }
  });
},{threshold:0.15});
document.querySelectorAll('.hstat').forEach((el,i)=>{
  el.style.cssText+=`;opacity:0;transform:translateY(12px);transition:opacity .5s ${i*.12}s,transform .5s ${i*.12}s`;
  sObs.observe(el);
});
