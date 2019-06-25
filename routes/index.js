const express = require('express');
const clova = require('../clova');
const bot = require('../bot');
const api = require('../api');
const setting = require('../setting');
const router = express.Router();

router.post(`/clova`, clova);
module.exports = router;
