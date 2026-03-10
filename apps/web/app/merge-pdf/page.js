'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function MergePdfPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (files.length < 2) {
      setError('Please select at least two PDF files.');
      return;
    }

    setLoading(true);
    setError('');

    const form = new FormData();
    files.forEach((file) => form.append('files', file));

    try {
      const response = await fetch(`${API_URL}/api/pdf/merge`, {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        throw new Error('Unable to merge PDFs right now.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <a href="/" className="text-sm text-sky-400">← Back to tools</a>
      <h1 className="mt-4 text-3xl font-semibold">Merge PDF</h1>
      <p className="mt-2 text-slate-300">Upload PDFs, then download a single merged document.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
        />
        <p className="text-xs text-slate-400">{files.length} file(s) selected</p>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-slate-950 disabled:opacity-60"
        >
          {loading ? 'Merging...' : 'Merge and Download'}
        </button>
      </form>
    </main>
  );
}
