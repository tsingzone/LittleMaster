/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();

var Config = require('../../configs');
var wx_config = Config.getConfig().weixinconfig;
var teacher = require('./teacher/teacher');
var company = require('./company/company');
var weixinController = require('../../controllers/weixin/WeixinController').createNew();
var TeacherController = require('../../controllers/weixin/teacher/TeacherController');
var teacherController = TeacherController.createNew();

// 路由拦截
router.use(function (req, res, next) {
    console.log('Weixin verify....');

    var openId = req.query.openId;
    var userId = req.query.userId;

    var code = req.query.code;
    if (code) {
        console.log('------ By Code -------')
        weixinController.getUserByCode(code, function (err, data) {
            var userInfo = JSON.parse(data.toString());
            if (!userInfo.subscribe) {
                // TODO: 用户未关注，跳转到提示关注的页面
                return;
            }
            // TODO: 查询用户信息是否存在
            teacherController.getWeiXinUserByOpenId(userInfo, function (err, result) {

            });
            // TODO: 更新数据库中weixin_user的信息
            teacherController.updateWeinXinUserByOpenId(userInfo);

            // TODO: 根据openid 获取用户的userId, openId, teacherId

            req.userId = req.query.userId || 1;
            req.openId = req.query.openId || userInfo.openid;
            req.teacherId = req.query.teacherId || 5;
            next();
        });
    } else {
        console.log('------ No Code -------');
        req.userId = req.query.userId || 1;
        //req.openId = req.query.openId || req.accessToken.openid || 'osWbGwS5BHkGvhhnvIV8nTlMNYWw';
        req.openId = 'osWbGwS5BHkGvhhnvIV8nTlMNYWw';
        req.teacherId = req.query.teacherId || 5;
        req.userIds = {
            userId: req.userId,
            openId: req.openId,
            teacherId: req.teacherId
        };
        next();
    }
});

router.get('/', weixinController.checkSign);
router.post('/', weixinController.replyInfo);

// 分发教师相关的路由信息
router.use('/teacher', teacher);

// 分发企业相关的路由信息
router.use('/company', company);

module.exports = router;