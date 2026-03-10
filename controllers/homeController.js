const path = require('path');

const renderHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
};

module.exports = {
  renderHomePage
};
