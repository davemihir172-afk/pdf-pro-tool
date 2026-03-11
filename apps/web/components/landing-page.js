'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { categories, toolCatalog } from './tool-catalog';

export function LandingPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTools = useMemo(() => {
    return toolCatalog.filter((tool) => {
      const matchCategory = activeCategory === 'All' || tool.category === activeCategory;
      const q = query.toLowerCase();
      const matchQuery = !q || tool.title.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [query, activeCategory]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#1d4ed8_0,_transparent_55%)] opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Pro PDF Mate</p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">Premium PDF workspace for modern teams.</h1>
          <p className="mt-4 max-w-2xl text-slate-300">Merge, convert, optimize, secure, and run AI workflows in one elegant SaaS experience.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#tools" className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950">Start Free</a>
            <a href="/tools/ai-summarize-pdf" className="rounded-xl border border-white/20 px-5 py-3 font-semibold">Try AI Tools</a>
          </div>
        </motion.section>

        <section id="tools" className="mt-12 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-sky-400"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {['All', ...categories].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-3 py-1 text-sm ${activeCategory === category ? 'bg-sky-500 text-slate-950' : 'bg-white/10 text-slate-200'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <motion.a
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                whileHover={{ y: -6, scale: 1.01 }}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
              >
                <div className="text-2xl">{tool.icon}</div>
                <h3 className="mt-3 text-lg font-semibold">{tool.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{tool.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-sky-300">{tool.category}</p>
              </motion.a>
            ))}
          </motion.div>
        </section>
      </div>
    </main>
  );
}
