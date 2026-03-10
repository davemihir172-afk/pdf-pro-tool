const siteUrl = 'https://propdfmate.com';

const seoTools = {
  'merge-pdf': {
    slug: 'merge-pdf',
    title: 'Merge PDF Online Free – Combine PDF Files Fast',
    description: 'Merge PDF online free with secure cloud processing. Combine multiple PDF files in seconds with Pro PDF Mate.',
    h1: 'Merge PDF Online Free with Pro PDF Mate',
    keyword: 'merge pdf online free',
    intro: 'Need to combine contracts, reports, invoices, or class notes into one clean document? Pro PDF Mate gives you a fast, browser-based workflow to merge PDF files in a few clicks. Whether you are handling one-time homework uploads or daily business packets, this tool is designed for speed, quality, and reliability.',
    steps: ['Upload two or more PDF files in your preferred order.', 'Click process to start cloud-based merge processing.', 'Preview and verify your merged output.', 'Download your new single PDF file instantly.'],
    benefits: ['Combine scattered documents into one professional file.', 'Keep pages in the exact order you define.', 'Reduce upload friction for HR, legal, and finance teams.', 'Use on desktop or mobile without software installation.'],
    competitors: 'Unlike many tools that throttle free usage or force heavy compression, Pro PDF Mate is built for performance-first workflows with a transparent process and clean output.',
    security: 'Files are processed over secure connections, handled in isolated jobs, and removed after processing windows. We do not train AI models on your file contents.',
    faq: [
      ['How do I merge PDF online free?', 'Upload files, click process, preview the output, and download. The flow is optimized for quick, secure execution.'],
      ['Can I merge large PDFs?', 'Yes. For very large batches, process in segments for the fastest experience.'],
      ['Does merge quality change?', 'No visual quality loss is introduced because pages are combined rather than recompressed by default.']
    ],
    related: ['split-pdf', 'compress-pdf', 'rotate-pdf']
  },
  'split-pdf': {
    slug: 'split-pdf',
    title: 'Split PDF Online – Extract Pages in Seconds',
    description: 'Split PDF online and extract pages quickly with secure cloud processing and instant download.',
    h1: 'Split PDF Online for Fast Page Extraction',
    keyword: 'split pdf online extract pages',
    intro: 'When one long document becomes hard to share, splitting is the fastest fix. Pro PDF Mate helps you extract specific pages so you can send only what matters.',
    steps: ['Upload your PDF file.', 'Run split processing in one click.', 'Preview generated output.', 'Download the focused file.'],
    benefits: ['Share smaller files with clients.', 'Improve workflow clarity by sending only relevant pages.', 'Prepare clean packets for legal, HR, and academic use.', 'Save time in repetitive document handling.'],
    competitors: 'Many split tools hide page controls behind paywalls. Pro PDF Mate keeps essential split operations straightforward and production-ready.',
    security: 'All split operations run in isolated processing jobs with short-lived artifacts and secure transfer.',
    faq: [['Can I split confidential PDFs?', 'Yes, use the secure upload and short-retention workflow for sensitive files.'], ['Is this mobile friendly?', 'Yes, the interface is responsive for phone and tablet use.'], ['Do I need software?', 'No installation is required.']],
    related: ['merge-pdf', 'compress-pdf', 'pdf-to-jpg']
  },
  'compress-pdf': {
    slug: 'compress-pdf',
    title: 'Compress PDF Without Losing Quality Online',
    description: 'Compress PDF without losing quality for email, web upload, and fast sharing.',
    h1: 'Compress PDF Without Losing Quality',
    keyword: 'compress pdf without losing quality',
    intro: 'Large PDFs slow down approvals, uploads, and email delivery. Pro PDF Mate helps you optimize size while preserving readability for business and personal workflows.',
    steps: ['Upload your PDF file.', 'Start compression processing.', 'Review optimized result.', 'Download and share immediately.'],
    benefits: ['Send files faster by email.', 'Meet strict upload limits on portals.', 'Improve loading speed for shared docs.', 'Keep document text and layout practical for review.'],
    competitors: 'Some compressors aggressively degrade output. Pro PDF Mate is tuned for practical quality retention in real-world workflows.',
    security: 'Compression jobs run in isolated processing steps with secure transport and disposable storage windows.',
    faq: [['Will text stay readable?', 'Yes, the goal is practical optimization while preserving readability.'], ['Can I compress contracts?', 'Yes, common legal and business PDFs are supported.'], ['Is this free to try?', 'Yes, core flow is available in browser.']],
    related: ['merge-pdf', 'split-pdf', 'pdf-to-png']
  },
  'pdf-to-word': {
    slug: 'pdf-to-word',
    title: 'Convert PDF to Word Editable Document Online',
    description: 'Convert PDF to Word editable format with secure processing and clean output for editing.',
    h1: 'Convert PDF to Word Editable Files',
    keyword: 'convert pdf to word editable',
    intro: 'Need to update contracts, revise reports, or edit old handbooks? Convert PDF to Word and regain editing control while preserving structure.',
    steps: ['Upload your PDF.', 'Run conversion.', 'Preview status and output details.', 'Download DOCX and edit in Word-compatible tools.'],
    benefits: ['Edit legacy PDFs quickly.', 'Reuse content instead of retyping.', 'Collaborate with tracked changes.', 'Accelerate admin and content workflows.'],
    competitors: 'Pro PDF Mate emphasizes predictable conversion flow and transparent processing status, not just one-click black-box output.',
    security: 'Uploaded files are processed securely and not used for model training.',
    faq: [['Will formatting always match perfectly?', 'Complex layouts may vary slightly; most business documents convert well.'], ['Can I use this for reports?', 'Yes, reports and contracts are common use cases.'], ['Does it work in browser only?', 'Yes.']],
    related: ['pdf-to-jpg', 'word-to-pdf', 'merge-pdf']
  },
  'pdf-to-jpg': {
    slug: 'pdf-to-jpg',
    title: 'PDF to JPG Converter Online – Fast Page Export',
    description: 'Convert PDF pages to JPG images online for presentations, websites, and sharing.',
    h1: 'Convert PDF to JPG Online',
    keyword: 'pdf to jpg converter free',
    intro: 'Turn document pages into shareable images for slides, social, and support tickets. PDF to JPG gives flexible visual outputs from static files.',
    steps: ['Upload your PDF.', 'Process conversion.', 'Preview result state.', 'Download JPG output.'],
    benefits: ['Great for visual sharing.', 'Use pages in slides and docs.', 'Simplify asset workflows.', 'Quick export for support and training.'],
    competitors: 'Pro PDF Mate combines conversion speed with clear status feedback and predictable download paths.',
    security: 'Data is encrypted in transit and processed in short-lived job containers.',
    faq: [['Is this a jpg to pdf converter free alternative?', 'It is the opposite direction, but we also provide JPG to PDF.'], ['Do I need desktop software?', 'No.'], ['Can I process one page?', 'Yes, single-file workflows are supported.']],
    related: ['jpg-to-pdf', 'pdf-to-png', 'compress-pdf']
  },
  'jpg-to-pdf': {
    slug: 'jpg-to-pdf',
    title: 'JPG to PDF Converter Free – Convert Images to PDF',
    description: 'JPG to PDF converter free for receipts, forms, and image bundles with quick download.',
    h1: 'JPG to PDF Converter Free',
    keyword: 'jpg to pdf converter free',
    intro: 'Convert photos, scanned pages, and screenshots into one PDF for cleaner sharing and archiving.',
    steps: ['Upload JPG image files.', 'Start conversion job.', 'Wait for processing completion.', 'Download PDF result.'],
    benefits: ['Bundle images into one file.', 'Improve document consistency.', 'Share receipts and proofs professionally.', 'Use on any device.'],
    competitors: 'Our flow gives clear progress and direct outputs without heavy interface clutter.',
    security: 'Uploads are processed securely and removed after job completion windows.',
    faq: [['Can I merge many JPGs?', 'Yes, upload multiple images and convert.'], ['Is this mobile compatible?', 'Yes, fully responsive.'], ['Do you add watermarks?', 'No default watermarking in standard flow.']],
    related: ['pdf-to-jpg', 'merge-pdf', 'png-to-pdf']
  },
  'word-to-pdf': {
    slug: 'word-to-pdf',
    title: 'Word to PDF Online – Export DOCX to PDF Quickly',
    description: 'Convert Word to PDF online for contracts, resumes, and polished sharing formats.',
    h1: 'Word to PDF Online Converter',
    keyword: 'word to pdf online converter',
    intro: 'When document fidelity matters, PDF is still the safest way to share. Convert Word files into consistent PDF output instantly.',
    steps: ['Upload DOC or DOCX file.', 'Run conversion.', 'Track processing progress.', 'Download final PDF.'],
    benefits: ['Preserve formatting across devices.', 'Create print-friendly versions.', 'Share final docs with confidence.', 'Reduce accidental edits.'],
    competitors: 'Pro PDF Mate focuses on practical conversion reliability with transparent progress and secure handling.',
    security: 'Files are handled in isolated processing and purged after retention windows.',
    faq: [['Can I convert resumes?', 'Yes, this is a common use case.'], ['Does this support docx?', 'Yes.'], ['Any install needed?', 'No, browser-based workflow only.']],
    related: ['pdf-to-word', 'merge-pdf', 'compress-pdf']
  },
  'pdf-to-png': {
    slug: 'pdf-to-png',
    title: 'PDF to PNG Converter Online – Clear Image Output',
    description: 'Convert PDF to PNG online for transparent-friendly and crisp image export workflows.',
    h1: 'Convert PDF to PNG Online',
    keyword: 'pdf to png converter online',
    intro: 'Need crisp visual exports from documents? PDF to PNG is ideal for design handoffs, annotations, and web use.',
    steps: ['Upload your PDF file.', 'Start conversion.', 'Track progress and completion.', 'Download PNG output.'],
    benefits: ['High clarity image output.', 'Useful for UI docs and support guides.', 'Simple web-ready assets.', 'No software installation.'],
    competitors: 'Unlike overly basic converters, Pro PDF Mate offers a complete flow with progress and secure processing.',
    security: 'Transport encryption and isolated processing protect file confidentiality.',
    faq: [['Is PNG better than JPG for documents?', 'PNG can preserve sharper lines for graphics-heavy pages.'], ['Can I convert invoices?', 'Yes.'], ['Can I use this free?', 'Yes, browser flow is available.']],
    related: ['png-to-pdf', 'pdf-to-jpg', 'compress-pdf']
  },
  'png-to-pdf': {
    slug: 'png-to-pdf',
    title: 'PNG to PDF Online – Convert Images to Shareable PDF',
    description: 'Convert PNG to PDF online for reports, screenshots, and image packs with secure processing.',
    h1: 'PNG to PDF Online Converter',
    keyword: 'png to pdf converter online',
    intro: 'When you need consistent file sharing from screenshots or design exports, PNG to PDF creates one universal document format.',
    steps: ['Upload PNG files.', 'Start conversion job.', 'Monitor progress.', 'Download your PDF.'],
    benefits: ['Combine screenshots in one PDF.', 'Standardize image sharing.', 'Improve upload compatibility.', 'Keep workflow simple.'],
    competitors: 'Pro PDF Mate emphasizes secure conversion and clear job-state visibility from upload to download.',
    security: 'Files are encrypted in transit and managed in short-retention processing paths.',
    faq: [['Can I convert multiple PNG files?', 'Yes.'], ['Will quality be preserved?', 'Yes, designed for practical quality retention.'], ['Any account needed?', 'No account required for basic flow.']],
    related: ['pdf-to-png', 'jpg-to-pdf', 'merge-pdf']
  }
};

function buildMetadata(tool) {
  const url = `${siteUrl}/${tool.slug}`;
  return {
    title: tool.title,
    description: tool.description.slice(0, 158),
    alternates: { canonical: url },
    openGraph: {
      title: tool.title,
      description: tool.description,
      url,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.description
    }
  };
}

module.exports = { seoTools, buildMetadata, siteUrl };
