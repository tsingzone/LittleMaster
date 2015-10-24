/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

// 获取视图路径
var getView = function (view) {
    var dir = "weixin/company/";
    return path.join(dir, view);
};


router.get('/', function (req, res) {
    console.log("company.js /")
    res.render(getView('company'), {title: "Company"});
});

router.get('/profile', function (req, res) {
    console.log("company.js profile");
    res.render(getView('profile'), {title: "Profile"});
});

router.get('/get', function (req, res) {
    console.log("company.js get");
    res.render(getView('company'), {title: "get"});
});



module.exports = router;