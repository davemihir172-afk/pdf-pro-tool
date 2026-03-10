(function () {
  const root = document.getElementById('tool-root');
  if (!root) return;

  const mode = root.dataset.mode || 'pdf';

  if (mode === 'ai') {
    const aiTask = root.dataset.aiTask;
    const accept = root.dataset.accept || 'application/pdf';
    const showLanguage = root.dataset.showLanguage === 'true';

    root.innerHTML = `
      <form id="tool-form" class="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div id="drop-zone" class="rounded-xl border-2 border-dashed border-slate-700 p-8 text-center cursor-pointer">
          <p class="text-slate-300">Drag & drop a PDF here or click to browse.</p>
          <input id="file-input" type="file" accept="${accept}" class="hidden" />
        </div>
        <p id="file-count" class="text-sm text-slate-400">No file selected</p>
        ${showLanguage ? '<input id="language" type="text" value="Spanish" class="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm" placeholder="Target language" />' : ''}
        <div class="h-2 w-full overflow-hidden rounded bg-slate-800"><div id="progress" class="h-full w-0 bg-violet-400 transition-all"></div></div>
        <p id="status" class="text-sm text-slate-300">Waiting for upload</p>
        <button class="rounded-lg bg-violet-500 px-4 py-2 font-medium text-white">Process with AI</button>
        <p id="error" class="text-sm text-rose-400"></p>
      </form>
      <section id="result" class="mt-6 hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 class="text-xl font-semibold">Result</h2>
        <pre id="result-text" class="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-4 text-sm text-slate-200"></pre>
        <div class="mt-4 flex gap-3">
          <button id="copy-btn" class="rounded bg-sky-500 px-4 py-2 text-sm font-medium">Copy</button>
          <a id="download-btn" class="rounded bg-emerald-500 px-4 py-2 text-sm font-medium" download="ai-result.txt">Download</a>
        </div>
      </section>
    `;

    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const fileCount = document.getElementById('file-count');
    const form = document.getElementById('tool-form');
    const progress = document.getElementById('progress');
    const statusEl = document.getElementById('status');
    const errorEl = document.getElementById('error');
    const resultEl = document.getElementById('result');
    const resultText = document.getElementById('result-text');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    let selectedFile = null;

    function setFile(file) {
      selectedFile = file || null;
      fileCount.textContent = selectedFile ? `${selectedFile.name} selected` : 'No file selected';
    }

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => setFile(e.target.files?.[0]));
    ['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.classList.add('border-violet-400'); }));
    ['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.classList.remove('border-violet-400'); }));
    dropZone.addEventListener('drop', (e) => setFile((e.dataTransfer.files || [])[0]));

    copyBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(resultText.textContent || '');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';
      resultEl.classList.add('hidden');
      progress.style.width = '15%';
      statusEl.textContent = 'Extracting and sending text to OpenAI...';

      if (!selectedFile) {
        errorEl.textContent = 'Please select a PDF file.';
        progress.style.width = '0%';
        statusEl.textContent = 'Waiting for upload';
        return;
      }

      try {
        const formData = new FormData();
        formData.append('files', selectedFile);
        if (showLanguage) formData.append('language', document.getElementById('language').value || 'Spanish');

        const response = await fetch(`http://localhost:4000/api/ai/${aiTask}`, {
          method: 'POST',
          body: formData
        });

        progress.style.width = '75%';
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'AI request failed.');

        resultText.textContent = payload.result;
        const blob = new Blob([payload.result], { type: 'text/plain' });
        downloadBtn.href = URL.createObjectURL(blob);
        downloadBtn.download = `${aiTask}-result.txt`;

        progress.style.width = '100%';
        statusEl.textContent = 'Completed';
        resultEl.classList.remove('hidden');
      } catch (error) {
        errorEl.textContent = error.message;
        statusEl.textContent = 'Failed';
        progress.style.width = '0%';
      }
    });

    return;
  }

  const tool = root.dataset.tool;
  const multiple = root.dataset.multiple === 'true';
  const showRange = root.dataset.showRange === 'true';
  const showAngle = root.dataset.showAngle === 'true';
  const accept = root.dataset.accept || 'application/pdf';
  const previewType = root.dataset.preview || 'pdf';

  root.innerHTML = `
    <form id="tool-form" class="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div id="drop-zone" class="rounded-xl border-2 border-dashed border-slate-700 p-8 text-center cursor-pointer">
        <p class="text-slate-300">Drag & drop ${multiple ? 'files' : 'a file'} here or click to browse.</p>
        <input id="file-input" type="file" ${multiple ? 'multiple' : ''} accept="${accept}" class="hidden" />
      </div>
      <p id="file-count" class="text-sm text-slate-400">No files selected</p>
      ${showRange ? '<input id="page-range" type="text" placeholder="Page range (e.g. 1-3)" class="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm" />' : ''}
      ${showAngle ? '<select id="angle" class="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select>' : ''}
      <div class="h-2 w-full overflow-hidden rounded bg-slate-800"><div id="progress" class="h-full w-0 bg-sky-400 transition-all"></div></div>
      <p id="status" class="text-sm text-slate-300">Waiting for upload</p>
      <button class="rounded-lg bg-sky-500 px-4 py-2 font-medium text-slate-950">Process document</button>
      <p id="error" class="text-sm text-rose-400"></p>
    </form>
    <section id="result" class="mt-6 hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 class="text-xl font-semibold">Preview Result</h2>
      <iframe id="preview-frame" class="mt-4 hidden h-[520px] w-full rounded bg-white"></iframe>
      <img id="preview-image" class="mt-4 hidden max-h-[520px] rounded" alt="Converted preview" />
      <pre id="preview-text" class="mt-4 hidden max-h-[520px] overflow-auto rounded bg-slate-950 p-4 text-sm text-slate-200"></pre>
      <a id="download" class="mt-4 inline-block rounded-lg bg-emerald-400 px-4 py-2 font-medium text-slate-950" download="output.bin">Download Output</a>
    </section>
  `;

  const fileInput = document.getElementById('file-input');
  const dropZone = document.getElementById('drop-zone');
  const fileCount = document.getElementById('file-count');
  const statusEl = document.getElementById('status');
  const form = document.getElementById('tool-form');
  const error = document.getElementById('error');
  const progress = document.getElementById('progress');
  const result = document.getElementById('result');
  const previewFrame = document.getElementById('preview-frame');
  const previewImage = document.getElementById('preview-image');
  const previewText = document.getElementById('preview-text');
  const download = document.getElementById('download');

  let files = [];

  function setFiles(newFiles) {
    files = newFiles;
    fileCount.textContent = `${files.length} file(s) selected`;
  }

  async function pollJob(jobId) {
    while (true) {
      const response = await fetch(`http://localhost:4000/api/job/${jobId}`);
      const job = await response.json();
      progress.style.width = `${Math.max(1, job.progress || 0)}%`;
      statusEl.textContent = `Status: ${job.status} (${job.progress || 0}%)`;
      if (job.status === 'completed') return job;
      if (job.status === 'failed') throw new Error(job.error || 'Job failed');
      await new Promise((r) => setTimeout(r, 900));
    }
  }

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => setFiles(Array.from(e.target.files || [])));
  ['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.classList.add('border-sky-400'); }));
  ['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.classList.remove('border-sky-400'); }));
  dropZone.addEventListener('drop', (e) => setFiles(Array.from(e.dataTransfer.files || [])));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.textContent = '';
    result.classList.add('hidden');
    previewFrame.classList.add('hidden');
    previewImage.classList.add('hidden');
    previewText.classList.add('hidden');
    progress.style.width = '0%';
    statusEl.textContent = 'Uploading...';

    if (files.length === 0 || (!multiple && files.length !== 1) || (tool === 'merge' && files.length < 2)) {
      error.textContent = tool === 'merge' ? 'Please add at least two files.' : 'Please add a file.';
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (showRange) formData.append('range', document.getElementById('page-range').value || '1-1');
    if (showAngle) formData.append('angle', document.getElementById('angle').value || '90');

    const endpointBase = mode === 'convert' ? 'convert' : 'pdf';

    try {
      const createResponse = await fetch(`http://localhost:4000/api/${endpointBase}/${tool}`, { method: 'POST', body: formData });
      const created = await createResponse.json();
      if (!createResponse.ok) throw new Error(created.error || 'Unable to queue job.');

      progress.style.width = `${created.progress || 5}%`;
      statusEl.textContent = `Queued: ${created.jobId}`;

      const completed = await pollJob(created.jobId);
      const url = `http://localhost:4000${completed.downloadUrl}`;
      download.href = url;
      download.download = `${tool}-output`;

      if (previewType === 'image') {
        previewImage.src = url;
        previewImage.classList.remove('hidden');
      } else if (previewType === 'text' || previewType === 'doc') {
        previewText.textContent = previewType === 'text'
          ? 'Text output ready. Click Download Output to fetch file.'
          : 'Document conversion complete. Click Download Output.';
        previewText.classList.remove('hidden');
      } else {
        previewFrame.src = url;
        previewFrame.classList.remove('hidden');
      }

      result.classList.remove('hidden');
      statusEl.textContent = 'Completed';
    } catch (err) {
      error.textContent = err.message;
      statusEl.textContent = 'Failed';
    }
  });
})();
