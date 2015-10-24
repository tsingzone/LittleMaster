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

router.get("/upload", function (req, res) {
    console.log("上传头像");
    teacherController.getProfileHead(req, res);
});

router.get("/bind", function (req, res) {
    console.log("绑定手机号");
    teacherController.getProfileMobile(req, res);
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
    teacherController.getDiploma(req, res);

});

// 大学
router.get("/college", function (req, res) {
    console.log("大学");
    teacherController.getCollege(req, res);
});

router.post("/college", function (req, res) {
    console.log("大学 post")
    teacherController.searchCollege(req, res);
});

// 学历
router.get("/education", function (req, res) {
    console.log("学历");
    teacherController.getEducation(req, res);
});

router.post("/education", function (req, res) {
    console.log("学历 post");
    res.status(200).end();
})

// 经历
router.get('/experience/:type', function (req, res) {
    console.log("经历");
    teacherController.getExperience(req, res);
});


module.exports = router;