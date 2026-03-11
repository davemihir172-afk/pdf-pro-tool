import { ToolGrid } from '../components/tool-grid';

const tools = [
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one in the exact order you choose.',
    href: '/merge-pdf'
  },
  {
    title: 'Split PDF',
    description: 'Extract selected pages into a new document.',
    href: '#'
  },
  {
    title: 'Compress PDF',
    description: 'Reduce file size while keeping quality readable.',
    href: '#'
  },
  {
    title: 'PDF to Word',
    description: 'Convert portable docs into editable text files.',
    href: '#'
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Pro PDF Mate</p>
      <h1 className="mt-3 text-4xl font-bold text-white">All PDF tools in one workspace.</h1>
      <p className="mt-4 max-w-2xl text-slate-300">
        Fast document workflows powered by a distributed queue and worker architecture.
      </p>
      <ToolGrid tools={tools} />
    </main>
  );
}
