(function () {
  const root = document.getElementById('tool-root');
  if (!root) return;

  const mode = root.dataset.mode || 'pdf';
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

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => setFiles(Array.from(e.target.files || [])));
  ['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.classList.add('border-sky-400'); }));
  ['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.classList.remove('border-sky-400'); }));
  dropZone.addEventListener('drop', (e) => setFiles(Array.from(e.dataTransfer.files || [])));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    error.textContent = '';
    result.classList.add('hidden');
    previewFrame.classList.add('hidden');
    previewImage.classList.add('hidden');
    previewText.classList.add('hidden');
    progress.style.width = '0%';

    if (files.length === 0 || (!multiple && files.length !== 1) || (tool === 'merge' && files.length < 2)) {
      error.textContent = tool === 'merge' ? 'Please add at least two files.' : 'Please add a file.';
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (showRange) formData.append('range', document.getElementById('page-range').value || '1-1');
    if (showAngle) formData.append('angle', document.getElementById('angle').value || '90');

    const endpointBase = mode === 'convert' ? 'convert' : 'pdf';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://localhost:4000/api/${endpointBase}/${tool}`);
    xhr.responseType = 'blob';

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) progress.style.width = `${Math.round((event.loaded / event.total) * 100)}%`;
    };

    xhr.onload = async () => {
      progress.style.width = '100%';
      if (xhr.status !== 200) {
        try {
          const failureBlob = xhr.response;
          const failureText = await failureBlob.text();
          const failureJson = JSON.parse(failureText);
          error.textContent = failureJson.error || 'Processing failed. Please try again.';
        } catch (_err) {
          error.textContent = 'Processing failed. Please try again.';
        }
        return;
      }

      const blob = xhr.response;
      const url = URL.createObjectURL(blob);
      const disposition = xhr.getResponseHeader('Content-Disposition') || '';
      const nameMatch = disposition.match(/filename="?([^";]+)"?/i);
      download.href = url;
      download.download = nameMatch ? nameMatch[1] : `${tool}-output`;

      if (previewType === 'image') {
        previewImage.src = url;
        previewImage.classList.remove('hidden');
      } else if (previewType === 'text') {
        previewText.textContent = await blob.text();
        previewText.classList.remove('hidden');
      } else if (previewType === 'doc') {
        previewText.textContent = `Conversion complete: ${download.download}. Use Download Output to open the converted file.`;
        previewText.classList.remove('hidden');
      } else {
        previewFrame.src = url;
        previewFrame.classList.remove('hidden');
      }

      result.classList.remove('hidden');
    };

    xhr.onerror = () => { error.textContent = 'Network error while processing file.'; };
    xhr.send(formData);
  });
})();
