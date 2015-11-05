/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var urllib = require('urllib');
var router = express.Router();


var Config = require('../../configs');
var wx_config = Config.getConfig().weixinconfig;
var teacher = require('./teacher/teacher');
var company = require('./company/company');
var weixinController = require('../../controllers/weixin/WeixinController').createNew();


// 路由拦截
router.use(function (req, res, next) {
    console.log('Weixin verify....');

    var code = req.query.code;
    if (code) {
        console.log('------ By Code -------')
        getUserByCode(code, function (err, data) {
            var userInfo = JSON.parse(data.toString());
            // TODO: 更新数据库中weixin_user的信息

            // TODO: 根据openid 获取用户的userId, openId, teacherId

            req.userId = req.query.userId || 1;
            req.openId = req.query.openId || userInfo.openid || 'osWbGwS5BHkGvhhnvIV8nTlMNYWw';
            req.teacherId = req.query.teacherId || 5;
            next();
        });
    } else {
        console.log('------ No Code -------')
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

// 获取access_token
function getAccessToken(openId, callback) {
    var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + wx_config.appId + '&secret=' + wx_config.appSecret;
    urllib.request(url, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        var result = {
            access_token: JSON.parse(data.toString()).access_token,
            openid: openId
        }
        callback(null, result);
    });
}
// 通过用户授权code获取access_token
function getAccessTokenByCode(code, callback) {
    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + wx_config.appId +
        '&secret=' + wx_config.appSecret + '&code=' + code + '&grant_type=authorization_code';
    urllib.request(url, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        getAccessToken(JSON.parse(data.toString()).openid, callback);
    });
}


function validAccessToken(accessToken, openId, callback) {
    var url = 'https://api.weixin.qq.com/sns/auth?access_token=' + accessToken + '&openid=' + openId;
    urllib.request(url, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        callback(null, data);
    });
}

// 获取用户信息
function getUser(accessToken, openId, callback) {
    var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + accessToken + '&openid=' + openId + '&lang=zh_CN'
    console.log(url);
    urllib.request(url, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        callback(null, data);
    });
}

// 根据Code获取用户信息
function getUserByCode(code, callback) {
    getAccessTokenByCode(code, function (err, data) {
        console.log(data)
        getUser(data.access_token, data.openid, callback);
    });
}

router.get('/', weixinController.checkSign);
router.post('/', weixinController.replyInfo);

// 分发教师相关的路由信息
router.use('/teacher', teacher);

// 分发企业相关的路由信息
router.use('/company', company);

module.exports = router;