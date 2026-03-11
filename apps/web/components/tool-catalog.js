export const toolCatalog = [
  { slug: 'merge-pdf', title: 'Merge PDF', description: 'Combine documents into one file.', category: 'Organize', icon: '🧩', mode: 'pdf', endpoint: '/api/pdf/merge' },
  { slug: 'split-pdf', title: 'Split PDF', description: 'Split pages into separate outputs.', category: 'Organize', icon: '✂️', mode: 'pdf', endpoint: '/api/pdf/split' },
  { slug: 'extract-pages', title: 'Extract Pages', description: 'Extract selected pages quickly.', category: 'Organize', icon: '📄', mode: 'pdf', endpoint: '/api/pdf/extract-pages' },
  { slug: 'pdf-to-word', title: 'PDF to Word', description: 'Convert PDFs into DOCX files.', category: 'Convert', icon: '📝', mode: 'convert', endpoint: '/api/convert/pdf-to-word' },
  { slug: 'pdf-to-excel', title: 'PDF to Excel', description: 'Convert tables to spreadsheets.', category: 'Convert', icon: '📊', mode: 'convert', endpoint: '/api/convert/pdf-to-excel' },
  { slug: 'pdf-to-powerpoint', title: 'PDF to PowerPoint', description: 'Create editable slides.', category: 'Convert', icon: '📽️', mode: 'convert', endpoint: '/api/convert/pdf-to-powerpoint' },
  { slug: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Export pages as JPG images.', category: 'Convert', icon: '🖼️', mode: 'convert', endpoint: '/api/convert/pdf-to-jpg' },
  { slug: 'pdf-to-png', title: 'PDF to PNG', description: 'Export pages as PNG images.', category: 'Convert', icon: '🌆', mode: 'convert', endpoint: '/api/convert/pdf-to-png' },
  { slug: 'pdf-to-txt', title: 'PDF to TXT', description: 'Extract plain text from PDFs.', category: 'Convert', icon: '🔤', mode: 'convert', endpoint: '/api/convert/pdf-to-txt' },
  { slug: 'compress-pdf', title: 'Compress PDF', description: 'Reduce size for sharing.', category: 'Optimize', icon: '🗜️', mode: 'pdf', endpoint: '/api/pdf/compress' },
  { slug: 'rotate-pdf', title: 'Rotate PDF', description: 'Rotate pages to correct orientation.', category: 'Edit', icon: '🔄', mode: 'pdf', endpoint: '/api/pdf/rotate' },
  { slug: 'delete-pages', title: 'Delete Pages', description: 'Remove unwanted pages.', category: 'Edit', icon: '🧹', mode: 'pdf', endpoint: '/api/pdf/delete-pages' },
  { slug: 'html-to-pdf', title: 'HTML to PDF', description: 'Generate polished PDFs from HTML.', category: 'Security', icon: '🔒', mode: 'convert', endpoint: '/api/convert/html-to-pdf' },
  { slug: 'ai-summarize-pdf', title: 'AI Summarize PDF', description: 'Create concise AI summaries.', category: 'AI Tools', icon: '✨', mode: 'ai', endpoint: '/api/ai/summarize' },
  { slug: 'ai-translate-pdf', title: 'AI Translate PDF', description: 'Translate PDF content with AI.', category: 'AI Tools', icon: '🌍', mode: 'ai', endpoint: '/api/ai/translate' },
  { slug: 'ai-extract-tables', title: 'AI Extract Tables', description: 'Extract tabular data with AI.', category: 'AI Tools', icon: '🧠', mode: 'ai', endpoint: '/api/ai/extract-tables' }
];

export const categories = ['Organize', 'Convert', 'Optimize', 'Edit', 'Security', 'AI Tools'];

export const toolMap = Object.fromEntries(toolCatalog.map((tool) => [tool.slug, tool]));
