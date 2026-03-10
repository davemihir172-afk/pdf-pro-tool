const express = require('express');
const {
  renderHomePage,
  renderToolPage,
  renderBlogPage,
  renderSeoPage,
  renderCategoryPage
} = require('../controllers/pagesController');

const router = express.Router();

const toolPages = ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word', 'jpg-to-pdf'];
const blogPages = [
  'how-to-merge-pdf',
  'how-to-compress-pdf',
  'how-to-convert-pdf-to-word',
  'how-to-edit-pdf-online',
  'reduce-pdf-size-free'
];
const seoPages = ['best-pdf-tools', 'free-pdf-tools', 'online-pdf-editor', 'compress-large-pdf', 'convert-pdf-fast'];
const categoryPages = ['convert-pdf', 'edit-pdf', 'optimize-pdf', 'security-pdf'];

router.get('/', renderHomePage);
router.get('/:slug', (req, res, next) => {
  if (toolPages.includes(req.params.slug)) return renderToolPage(req, res);
  if (seoPages.includes(req.params.slug)) return renderSeoPage(req, res);
  if (categoryPages.includes(req.params.slug)) return renderCategoryPage(req, res);
  return next();
});
router.get('/blog/:slug', (req, res, next) => {
  if (blogPages.includes(req.params.slug)) return renderBlogPage(req, res);
  return next();
});

module.exports = router;
