'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function ToolWorkbench({ tool }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Ready');
  const [result, setResult] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const endpoint = useMemo(() => `${API_URL}${tool.endpoint}`, [tool.endpoint]);

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    setFiles(Array.from(event.dataTransfer.files || []));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!files.length) return setError('Please upload at least one file.');

    setError('');
    setProgress(15);
    setStatus('Uploading...');
    setResult('');
    setDownloadUrl('');

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      setProgress(70);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Processing failed.');

      if (tool.mode === 'ai') {
        setResult(payload.result);
        const blob = new Blob([payload.result], { type: 'text/plain' });
        setDownloadUrl(URL.createObjectURL(blob));
      } else {
        const jobId = payload.jobId;
        setStatus(`Queued job ${jobId}`);
        let job;
        do {
          await new Promise((resolve) => setTimeout(resolve, 900));
          const jobRes = await fetch(`${API_URL}/api/job/${jobId}`);
          job = await jobRes.json();
          setProgress(job.progress || 0);
          setStatus(job.status);
        } while (job.status !== 'completed' && job.status !== 'failed');

        if (job.status === 'failed') throw new Error(job.error || 'Job failed');

        const finalUrl = `${API_URL}${job.downloadUrl}`;
        setDownloadUrl(finalUrl);
        setResult('Processing complete. Preview available below.');
      }

      setProgress(100);
      setStatus('Completed');
    } catch (submitError) {
      setError(submitError.message);
      setStatus('Failed');
      setProgress(0);
    }
  };

  return (
    <motion.main initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto min-h-screen max-w-4xl px-6 py-16 text-white">
      <a href="/" className="text-sm text-sky-300">← Back to tools</a>
      <h1 className="mt-4 text-4xl font-bold">{tool.title}</h1>
      <p className="mt-2 text-slate-300">{tool.description}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`rounded-2xl border-2 border-dashed p-10 text-center ${dragging ? 'border-sky-400 bg-sky-500/10' : 'border-white/20'}`}
        >
          <p>Drag and drop files here or use browse.</p>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="mt-4" />
        </div>
        <p className="text-sm text-slate-300">{files.length} file(s) selected</p>

        <div className="h-2 rounded-full bg-slate-800">
          <motion.div className="h-2 rounded-full bg-sky-400" animate={{ width: `${progress}%` }} />
        </div>
        <div className="text-sm text-slate-300">Status: {status}</div>
        {error && <div className="text-sm text-rose-400">{error}</div>}

        <button className="rounded-xl bg-sky-500 px-5 py-2 font-semibold text-slate-950">Process</button>
      </form>

      {(result || downloadUrl) && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold">Result Preview</h2>
          <p className="mt-3 whitespace-pre-wrap text-slate-200">{result}</p>
          {downloadUrl && <a href={downloadUrl} className="mt-4 inline-block rounded-xl bg-emerald-500 px-4 py-2 font-semibold">Download</a>}
        </motion.section>
      )}
    </motion.main>
  );
}
