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
    res.render(getView('company'), {title: "Company",userIds:req.userIds});
});

router.get('/profile', function (req, res) {
    companyController.getProfile(req, res);
});

router.get('/city', function (req, res) {
    companyController.getCityList(req, res);
});

router.get('/get', function (req, res) {
    console.log("company.js get");
    res.render(getView('company'), {title: "get"});
});

router.get('/type', function (req, res) {
    companyController.getTypeList(req, res);
});

router.get('/area', function (req, res) {
    companyController.getAreaList(req, res);
});

router.get('/jobList', function (req, res) {
    companyController.getJobList(req, res);
});

router.get('/insertSign', function (req, res) {
    companyController.insertSign(req, res);
});

router.get('/schedule', function (req, res) {
    companyController.getSchedule(req, res);
});

router.get('/isSign', function (req, res) {
    companyController.isSign(req, res);
});

router.get('/collection', function (req, res) {
    companyController.collection(req, res);
});

router.get('/deleteCollection', function (req, res) {
    companyController.deleteCollection(req, res);
});



module.exports = router;