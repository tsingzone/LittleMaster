/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();
var teacher = require('./teacher/teacher');
var company = require('./company/company');

// 路由拦截
router.use(function (req, res, next) {
    console.log("Weixin verify....");
    req.id = "1";
    next();
});

// 分发教师相关的路由信息
router.use('/teacher', teacher);

// 分发企业相关的路由信息
router.use('/company', company);

module.exports = router;