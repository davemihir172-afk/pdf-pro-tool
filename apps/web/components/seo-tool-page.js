import Link from 'next/link';
import { seoTools, siteUrl } from '../lib/seo-tools';

function longTailParagraphs(tool) {
  return [
    `If you are searching for "${tool.keyword}", you are usually trying to finish a task quickly without sacrificing quality. This page is built to answer exactly that intent with a practical, conversion-focused workflow that works in any modern browser.`,
    'Our product team designed Pro PDF Mate around real business and personal document tasks: job applications, client proposals, legal packets, invoices, training documents, and internal approvals. That is why every action on this page is designed for speed, trust, and clear outcomes.',
    'Unlike generic utility sites, this tool page combines tactical steps, use-case guidance, and best practices so you can finish your document workflow confidently the first time. You get better outcomes when tools are paired with useful guidance, not just a button.',
    'Long-tail keyword targeting matters because users do not just search for a tool—they search for a specific outcome. Queries like "merge pdf online free", "compress pdf without losing quality", "convert pdf to word editable", and "jpg to pdf converter free" describe intent that Pro PDF Mate is built to satisfy.',
    'The upload-to-download workflow is optimized for clarity. You can see what to do, how long it is taking, and what output to expect. This removes friction and makes document operations feel as reliable as any premium SaaS product.',
    'As teams become more distributed, browser-first PDF tooling is a strategic advantage. It removes dependence on local software versions and helps everyone collaborate with consistent document outputs across locations and devices.'
  ];
}

export function SeoToolPage({ slug }) {
  const tool = seoTools[slug];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: tool.h1, item: `${siteUrl}/${tool.slug}` }
    ]
  };

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.h1,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: tool.description,
    url: `${siteUrl}/${tool.slug}`
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 text-slate-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <h1 className="text-4xl font-bold text-white">{tool.h1}</h1>
      <p className="mt-4 text-lg text-slate-300">{tool.intro}</p>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold text-white">How to use {tool.h1}</h2>
        {tool.steps.map((step, idx) => (
          <div key={step}>
            <h3 className="text-lg font-semibold text-sky-300">Step {idx + 1}</h3>
            <p>{step} This step is intentionally streamlined so both beginners and advanced users can complete document tasks with minimal friction.</p>
          </div>
        ))}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Benefits of using this tool</h2>
        {tool.benefits.map((item) => (
          <p key={item}>{item} This benefit becomes especially important when you process files at scale and need consistency across repeated workflows.</p>
        ))}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Why Pro PDF Mate is better than competitors</h2>
        <p>{tool.competitors}</p>
        {longTailParagraphs(tool).map((p) => <p key={p}>{p}</p>)}
        {longTailParagraphs(tool).map((p, i) => <p key={`dup-${i}`}>{p}</p>)}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Security and privacy</h2>
        <p>{tool.security}</p>
        <p>Security is not an afterthought in Pro PDF Mate. We design upload and processing workflows around trust boundaries so your files are handled with care from upload to result delivery.</p>
        <p>For teams evaluating compliance posture, the predictable processing model and clear tool boundaries make internal adoption easier. It is practical security for real document operations.</p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Frequently asked questions</h2>
        {tool.faq.map(([q, a]) => (
          <div key={q} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="font-semibold text-sky-300">{q}</h3>
            <p className="mt-2">{a}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-white">Related tools</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {tool.related.map((relatedSlug) => (
            <Link key={relatedSlug} href={`/${relatedSlug}`} className="rounded-xl border border-white/10 bg-slate-900/60 p-4 hover:border-sky-400">
              {seoTools[relatedSlug]?.h1 || relatedSlug}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
