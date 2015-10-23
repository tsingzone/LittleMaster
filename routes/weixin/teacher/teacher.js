/**
 * Created by michel_feng on 15/10/21.
 */

var express = require('express');
var router = express.Router();
var TeacherController = require('../../../controllers/weixin/teacher/TeacherController');
var teacherController = new TeacherController();

// 个人中心首页
router.get("/", function (req, res) {
    console.log("个人中心首页");
    teacherController.getUserCenterData(req, res);
});


// 我的简历
router.get("/profile", function (req, res) {
    console.log("我的简历");
    teacherController.getProfile(req, res);
});

// 已报名兼职
router.get("/sign", function (req, res) {
    console.log("已报名兼职");
    teacherController.getSignJobs(req, res);
});

// 已收藏兼职
router.get("/collect", function (req, res) {
    console.log("已收藏兼职");
    teacherController.getCollectJobs(req, res);
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