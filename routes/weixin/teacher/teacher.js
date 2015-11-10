/**
 * Created by michel_feng on 15/10/21.
 */

var express = require('express');
var router = express.Router();

var TeacherController = require('../../../controllers/weixin/teacher/TeacherController');
var teacherController = TeacherController.createNew();

// 个人中心首页
router.get('/', function (req, res) {
    console.log('个人中心首页');
    teacherController.getUserCenterData(req, res);
});

// 我的简历
router.get('/profile', function (req, res) {
    console.log('我的简历');
    teacherController.getProfile(req, res);
});

router.post('/profile/save', function (req, res) {
    console.log("保存简历");
    teacherController.saveProfile(req, res);
});

// 上传头像
router.get('/upload', function (req, res) {
    console.log('上传头像');
    teacherController.getProfileHead(req, res);
});

router.post('/upload', function (req, res) {
    console.log('上传头像 post');
    teacherController.uploadHeadImg(req, res);

});

// 绑定手机号
router.get('/bind', function (req, res) {
    console.log('绑定手机号');
    teacherController.getProfileMobile(req, res);
});

router.post('/bind', function (req, res) {
    console.log('绑定手机号');
    teacherController.bindMobile(req, res);
});

router.post('/smsCode', function (req, res) {
    console.log('发送手机验证码');
    teacherController.randomSmsCode(req, res);
});

router.get('/random', function (req, res) {
    console.log('图形验证码');
    teacherController.randomCaptcha(req, res);
});

// 已报名兼职
router.get('/sign', function (req, res) {
    console.log('已报名兼职');
    teacherController.getSignJobs(req, res);
});

// 已收藏兼职
router.get('/collect', function (req, res) {
    console.log('已收藏兼职');
    teacherController.getCollectJobs(req, res);
});

// 证书
router.get('/diploma/:type', function (req, res) {
    console.log('证书');
    teacherController.getDiploma(req, res);
});

router.get('/diploma/:type/add', function (req, res) {
    console.log('证书 添加');
    teacherController.getAddDiploma(req, res);
});

router.post('/diploma/:type/save', function (req, res) {
    console.log('证书 保存');
    teacherController.saveDiploma(req, res);
});

router.get('/diploma/teacher/add/:type', function (req, res) {
    console.log('证书 添加 学段/专业');
    teacherController.getAddDiplomaSubType(req, res);
});

router.get('/diploma/other/add/:type', function (req, res) {
    console.log('证书 添加 证书类型');
    teacherController.getAddDiplomaSubType(req, res);
});

router.post('/diploma/delete', function (req, res) {
    console.log('证书 删除');
    teacherController.deleteDiplomaById(req, res);
});

// 大学
router.get('/college', function (req, res) {
    console.log('大学');
    teacherController.getCollege(req, res);
});

// 学历
router.get('/education', function (req, res) {
    console.log('学历');
    teacherController.getEducation(req, res);
});

// 经历
router.get('/experience/:type', function (req, res) {
    console.log('经历');
    teacherController.getExperience(req, res);
});

router.get('/experience/:type/add', function (req, res) {
    console.log('添加经历');
    teacherController.getAddExperience(req, res);
});

router.post('/experience/save', function (req, res) {
    console.log('保存经历');
    teacherController.saveExperience(req, res);
});

router.post('/experience/delete', function (req, res) {
    console.log('经历 删除');
    teacherController.deleteExperienceById(req, res);
});


module.exports = router;