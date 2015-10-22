/**
 * Created by michel_feng on 15/10/21.
 */

var path = require('path');
var express = require('express');
var router = express.Router();
var TeacherController = require('../../../controllers/weixin/teacher/TeacherController');
var teacherController = new TeacherController();
var _ = require('underscore');

// 获取视图路径
var getView = function (view) {
    var dir = "weixin/teacher/";
    return path.join(dir, view);
};

// 个人中心首页
router.get("/", function (req, res) {
    console.log("个人中心首页");
    var id = req.id;
    var sourceMap = {"id": id};
    res.render(getView("teacher"), teacherController.getUserCenterData(sourceMap));
});


// 我的简历
router.get("/profile", function (req, res) {
    console.log("我的简历");
    res.render(getView("teacher"), {title: "get"});
});

// 已报名兼职
router.get("/sign", function (req, res) {
    console.log("已报名兼职");
    res.render(getView("teacher"), {title: "get"});
});

// 已收藏兼职
router.get("/collect", function (req, res) {
    console.log("已收藏兼职");
    res.render(getView("teacher"), {title: "get"});
});

// 证书
router.get("/diploma/:type", function (req, res) {
    console.log("证书");
    var types = ["teacher", "other"];
    var type = req.params.type;
    if (types.indexOf(type) != -1) {
        res.send(type);
    } else {
        res.status(404).end();
    }
});

// 大学
router.get("/college", function (req, res) {
    console.log("大学");

});

// 学历
router.get("/education", function (req, res) {
    console.log("学历");

});

// 经历
router.get('/experience/:type', function (req, res, next) {
    console.log("经历");
    var types = ["social", "parttime", "school"];
    var type = req.params.type;
    if (types.indexOf(type) != -1) {
        res.send(type);
    } else {
        res.status(404).end();
    }
});


module.exports = router;