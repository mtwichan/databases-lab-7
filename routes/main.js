const express = require('express');
const router = express.Router();
const sql = require('mssql');
const fs = require('fs');

router.get('/', function (req, res, next) {
    res.render('index', {
      title: "BankRank Shop Page"
    });
  })

module.exports = router;
