const path = require('path');

const sendView = (res, fileName) => res.sendFile(path.join(__dirname, '..', 'views', fileName));
const sendToolView = (res, fileName) => res.sendFile(path.join(__dirname, '..', 'views', 'tools', fileName));
const sendBlogView = (res, fileName) => res.sendFile(path.join(__dirname, '..', 'views', 'blog', fileName));
const sendSeoView = (res, fileName) => res.sendFile(path.join(__dirname, '..', 'views', 'seo', fileName));
const sendCategoryView = (res, fileName) => res.sendFile(path.join(__dirname, '..', 'views', 'categories', fileName));

const renderHomePage = (req, res) => sendView(res, 'index.html');
const renderToolPage = (req, res) => sendToolView(res, `${req.params.slug}.html`);
const renderBlogPage = (req, res) => sendBlogView(res, `${req.params.slug}.html`);
const renderSeoPage = (req, res) => sendSeoView(res, `${req.params.slug}.html`);
const renderCategoryPage = (req, res) => sendCategoryView(res, `${req.params.slug}.html`);

module.exports = {
  renderHomePage,
  renderToolPage,
  renderBlogPage,
  renderSeoPage,
  renderCategoryPage
};
