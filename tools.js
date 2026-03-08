// PDFMate Pro - Tool Registry
// All 32 tools defined here

const TOOLS = [
  // ORGANIZE
  {id:'merge',        cat:'organize',  name:'Merge PDF',        icon:'📎',bg:'#fff4ee',tc:'var(--c-org)', desc:'Combine PDFs in any order.',         accept:'.pdf',    multi:true,  btn:'Merge PDFs',        steps:['Upload PDFs','Order','Merge'],hot:true},
  {id:'split',        cat:'organize',  name:'Split PDF',         icon:'✂️',bg:'#fff4ee',tc:'var(--c-org)', desc:'Separate pages into individual files.',accept:'.pdf',    multi:false, btn:'Split PDF',         steps:['Upload PDF','Select pages','Split']},
  {id:'delete-pages', cat:'organize',  name:'Delete Pages',      icon:'🗑️',bg:'#fff4ee',tc:'var(--c-org)', desc:'Remove specific pages from your PDF.', accept:'.pdf',    multi:false, btn:'Delete & Save',     steps:['Upload PDF','Select pages','Delete']},
  {id:'extract',      cat:'organize',  name:'Extract Pages',     icon:'📤',bg:'#fff4ee',tc:'var(--c-org)', desc:'Pull pages into a new PDF file.',      accept:'.pdf',    multi:false, btn:'Extract Pages',     steps:['Upload PDF','Select pages','Extract']},
  {id:'organize',     cat:'organize',  name:'Organize PDF',      icon:'🗂️',bg:'#fff4ee',tc:'var(--c-org)', desc:'Drag & drop to reorder pages.',        accept:'.pdf',    multi:false, btn:'Save New Order',    steps:['Upload PDF','Drag pages','Save'],    badge:'New'},
  {id:'scan-to-pdf',  cat:'organize',  name:'Scan to PDF',       icon:'📷',bg:'#fff4ee',tc:'var(--c-org)', desc:'Convert scanned images to PDF.',       accept:'image/*', multi:true,  btn:'Create Scanned PDF',steps:['Upload scans','Process','Download']},
  // OPTIMIZE
  {id:'compress',     cat:'optimize',  name:'Compress PDF',      icon:'⚡',bg:'#eaf4fb',tc:'var(--c-opt)', desc:'Reduce file size, preserve quality.',  accept:'.pdf',    multi:false, btn:'Compress',          steps:['Upload PDF','Set quality','Compress'],hot:true},
  {id:'repair',       cat:'optimize',  name:'Repair PDF',        icon:'🔧',bg:'#eaf4fb',tc:'var(--c-opt)', desc:'Fix damaged PDFs and recover data.',   accept:'.pdf',    multi:false, btn:'Repair PDF',        steps:['Upload PDF','Repair','Download']},
  {id:'ocr-pdf',      cat:'optimize',  name:'OCR PDF',           icon:'🔍',bg:'#eaf4fb',tc:'var(--c-opt)', desc:'Make scanned PDFs searchable.',        accept:'.pdf',    multi:false, btn:'Run OCR',           steps:['Upload PDF','Process','Download']},
  // CONVERT
  {id:'pdf-to-word',  cat:'convert',   name:'PDF to Word',       icon:'📝',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Convert to editable DOC/DOCX.',        accept:'.pdf',    multi:false, btn:'Convert to Word',   steps:['Upload PDF','Convert','Download'],   hot:true},
  {id:'pdf-to-ppt',   cat:'convert',   name:'PDF to PowerPoint', icon:'📽️',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Turn PDFs into editable PPTX.',        accept:'.pdf',    multi:false, btn:'Convert to PPTX',   steps:['Upload PDF','Convert','Download']},
  {id:'pdf-to-excel', cat:'convert',   name:'PDF to Excel',      icon:'📊',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Extract data into spreadsheets.',      accept:'.pdf',    multi:false, btn:'Export to Excel',   steps:['Upload PDF','Extract','Download']},
  {id:'pdf-to-jpg',   cat:'convert',   name:'PDF to JPG',        icon:'🖼️',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Render pages as JPG or PNG images.',   accept:'.pdf',    multi:false, btn:'Export Images',     steps:['Upload PDF','Set quality','Export']},
  {id:'jpg-to-pdf',   cat:'convert',   name:'JPG to PDF',        icon:'🌄',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Pack images into a polished PDF.',     accept:'image/*', multi:true,  btn:'Create PDF',        steps:['Upload images','Order','Create PDF']},
  {id:'word-to-pdf',  cat:'convert',   name:'Word to PDF',       icon:'📄',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Turn DOCX into shareable PDF.',        accept:'.doc,.docx',multi:false,btn:'Convert to PDF',   steps:['Upload DOCX','Convert','Download']},
  {id:'excel-to-pdf', cat:'convert',   name:'Excel to PDF',      icon:'📈',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Make spreadsheets easy to share.',     accept:'.xls,.xlsx,.csv',multi:false,btn:'Convert to PDF',steps:['Upload Excel','Convert','Download']},
  {id:'ppt-to-pdf',   cat:'convert',   name:'PowerPoint to PDF', icon:'🎞️',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Convert PPTX slides to PDF.',          accept:'.ppt,.pptx',multi:false,btn:'Convert to PDF',  steps:['Upload PPTX','Convert','Download']},
  {id:'html-to-pdf',  cat:'convert',   name:'HTML to PDF',       icon:'🌐',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Paste HTML and download as PDF.',       accept:null,      multi:false, btn:'Generate PDF',      steps:['Paste HTML','Preview','Download']},
  {id:'webpage-pdf',  cat:'convert',   name:'Webpage to PDF',    icon:'🔗',bg:'#f5eeff',tc:'var(--c-conv)',desc:'Enter URL to save page as PDF.',        accept:null,      multi:false, btn:'Capture Page',      steps:['Enter URL','Capture','Download'],    badge:'New'},
  // EDIT
  {id:'edit-full',    cat:'edit',      name:'Full PDF Editor',   icon:'🖊️',bg:'#eafaf4',tc:'var(--c-edit)',desc:'Text, draw, shapes and annotations.',   accept:'.pdf',    multi:false, btn:'Open in Editor',    steps:['Upload PDF','Edit','Save'],          badge:'New'},
  {id:'rotate',       cat:'edit',      name:'Rotate PDF',        icon:'🔃',bg:'#eafaf4',tc:'var(--c-edit)',desc:'Rotate all or selected pages.',          accept:'.pdf',    multi:false, btn:'Rotate Pages',      steps:['Upload PDF','Set angle','Apply']},
  {id:'watermark',    cat:'edit',      name:'Add Watermark',     icon:'💧',bg:'#eafaf4',tc:'var(--c-edit)',desc:'Stamp text watermarks on pages.',        accept:'.pdf',    multi:false, btn:'Apply Watermark',   steps:['Upload PDF','Configure','Apply']},
  {id:'page-numbers', cat:'edit',      name:'Page Numbers',      icon:'🔢',bg:'#eafaf4',tc:'var(--c-edit)',desc:'Add page numbers with custom styling.',  accept:'.pdf',    multi:false, btn:'Add Numbers',       steps:['Upload PDF','Set style','Apply']},
  {id:'crop-pdf',     cat:'edit',      name:'Crop PDF',          icon:'🔲',bg:'#eafaf4',tc:'var(--c-edit)',desc:'Trim margins and crop page areas.',      accept:'.pdf',    multi:false, btn:'Crop & Save',       steps:['Upload PDF','Set margins','Apply']},
  // SECURITY
  {id:'sign-pdf',     cat:'security',  name:'Sign PDF',          icon:'✍️',bg:'#fff0f0',tc:'var(--c-sec)', desc:'Draw, type or upload digital signature.',accept:'.pdf',   multi:false, btn:'Apply Signature',   steps:['Upload PDF','Create signature','Apply'],badge:'New'},
  {id:'protect',      cat:'security',  name:'Protect PDF',       icon:'🔐',bg:'#fff0f0',tc:'var(--c-sec)', desc:'Encrypt with AES password protection.', accept:'.pdf',    multi:false, btn:'Encrypt PDF',       steps:['Upload PDF','Set password','Encrypt']},
  {id:'unlock',       cat:'security',  name:'Unlock PDF',        icon:'🔓',bg:'#fff0f0',tc:'var(--c-sec)', desc:'Remove password protection instantly.',  accept:'.pdf',    multi:false, btn:'Remove Password',   steps:['Upload PDF','Enter password','Unlock']},
  // AI
  {id:'ai-summarize', cat:'ai',        name:'AI Summarize PDF',  icon:'🤖',bg:'#f3f0ff',tc:'var(--c-ai)',  desc:'Get AI-generated document summaries.',  accept:'.pdf',    multi:false, btn:'Summarize with AI', steps:['Upload PDF','AI reads','Get summary'],badge:'AI'},
  {id:'ai-extract',   cat:'ai',        name:'AI Extract Text',   icon:'✨',bg:'#f3f0ff',tc:'var(--c-ai)',  desc:'AI-powered structured data extraction.', accept:'.pdf',    multi:false, btn:'Extract with AI',   steps:['Upload PDF','AI extracts','Copy text'],badge:'AI'},
  {id:'translate',    cat:'ai',        name:'Translate PDF',     icon:'🌍',bg:'#f3f0ff',tc:'var(--c-ai)',  desc:'Translate to 50+ languages with AI.',   accept:'.pdf',    multi:false, btn:'Translate',         steps:['Upload PDF','Choose language','Download'],badge:'AI'},
  // CLOUD
  {id:'gdrive-open',  cat:'cloud',     name:'Open from Drive',   icon:'🔵',bg:'#f0f9ff',tc:'var(--c-cloud)',desc:'Open PDFs directly from Google Drive.',accept:'.pdf',    multi:false, btn:'Open from Drive',   steps:['Connect Drive','Select file','Open'],badge:'Cloud'},
  {id:'dropbox-open', cat:'cloud',     name:'Open from Dropbox', icon:'📦',bg:'#f0f9ff',tc:'var(--c-cloud)',desc:'Access your Dropbox PDFs instantly.',  accept:'.pdf',    multi:false, btn:'Open from Dropbox', steps:['Connect Dropbox','Select file','Open'],badge:'Cloud'},
];