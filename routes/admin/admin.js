/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();
var session = require('express-session');

router.use(session({ secret: 'tsingzone', resave: false, saveUninitialized: true }));
var admin = require('../../controllers/admin/AdminController');

router.post('/login', function (req, res) {
    console.log("admin login...");
    admin.login(req, res);
});

router.get('/login', function (req, res) {
    res.render('admin/login');
});

router.all('*', function (req, res) {
    admin.checkAuth(req, res);
});

router.post('/logout', function (req, res) {
    console.log("admin logout...");
    admin.logout(req, res);
});

router.get('/', function (req, res) {
    admin.index(req, res);
});

module.exports = router;