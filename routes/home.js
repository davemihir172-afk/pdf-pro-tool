const express = require('express');
const { renderHomePage } = require('../controllers/homeController');

const router = express.Router();

router.get('/', renderHomePage);

module.exports = router;
