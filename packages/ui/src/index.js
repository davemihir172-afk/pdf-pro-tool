function ToolCard({ title, description, href }) {
  return (
    <a
      href={href}
      className="block rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:-translate-y-1 hover:border-sky-400"
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </a>
  );
}

module.exports = {
  ToolCard
};
