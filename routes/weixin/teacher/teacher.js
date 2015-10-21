/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

// 获取视图路径
var getView = function(view){
    var dir = "weixin/teacher/";
    return path.join(dir, view);
};

router.get('/', function (req, res) {
    console.log("teacher.js /");
    res.render(getView("teacher"), {title: "Teacher"});
});

router.get('/get', function (req, res) {
    console.log("teacher.js get");
    res.render(getView("teacher"), {title: "get"});
});

module.exports = router;