/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var CompanyController = require('../../../controllers/weixin/company/CompanyController');
var companyController = new CompanyController();
// 获取视图路径
var getView = function (view) {
    var dir = "weixin/company/";
    return path.join(dir, view);
};


router.get('/', function (req, res) {
    console.log("company.js /");
    res.render(getView('company'), {title: "Company",userIds:{openId: 'osWbGwcT24U7YgP1AmBZc6b5Wmtg',teacherId: 1}});
});

router.get('/profile', function (req, res) {
    console.log("company.js profile");
    companyController.getProfile(req, res);
});

router.get('/city', function (req, res) {
    console.log("company.js city");
    companyController.getCityList(req, res);
});

router.get('/get', function (req, res) {
    console.log("company.js get");
    res.render(getView('company'), {title: "get"});
});

router.get('/type', function (req, res) {
    console.log("company.js type");
    companyController.getTypeList(req, res);
});

router.get('/area', function (req, res) {
    console.log("company.js area");
    companyController.getAreaList(req, res);
});

router.get('/jobList', function (req, res) {
    console.log("company.js jobList");
    companyController.getJobList(req, res);
});

router.get('/schedule', function (req, res) {
    console.log("company.js schedule");
    res.render(getView('schedule'));
});

router.get('/isSign', function (req, res) {
    console.log("company.js isSign");
    companyController.isSign(req, res);
});



module.exports = router;