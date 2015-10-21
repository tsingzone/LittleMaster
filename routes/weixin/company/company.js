/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    console.log("company.js /")
    res.render('company', {title: "Company"});
});

router.get('/get', function (req, res) {
    console.log("company.js get");
    res.render('company', {title: "get"});
});

module.exports = router;