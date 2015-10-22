/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();

var admin = require('../../controllers/admin/AdminController');

router.use(function (req, res, next) {
    console.log("admin verify...");
    next();
});

router.post('/login', function(req, res) {
    admin.login(req, res);
});

module.exports = router;