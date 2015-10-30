/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
//var urllib = require('urllib');

var router = express.Router();
var teacher = require('./teacher/teacher');
var company = require('./company/company');

var util = require('../../utils/Utils');

var wx_config = {
    token: 'TsingZone2015',
    AppId: 'wxbd6f3476bedbb55f',
    AppSecret: 'a8d342199c246fbaac755c7c47ea5041'
};

// 路由拦截
router.use(function (req, res, next) {
    console.log('Weixin verify....');
    req.userId = req.query.userId || 1;
    req.openId = req.query.openId || req.accessToken.openid || 'osWbGwS5BHkGvhhnvIV8nTlMNYWw';
    req.teacherId = req.query.teacherId || 1;

    next();
    //var code = req.query.code;
    //
    //if (code) {
    //    getUserByCode(code, function (err, data) {
    //        req.accessToken = JSON.parse(data.toString());
    //        console.log(req.accessToken);
    //        req.userId = req.query.userId || 1;
    //        req.openId = req.query.openId || req.accessToken.openid || '1';
    //        console.log('openId=' + req.openId);
    //        req.teacherId = req.query.teacherId || 1;
    //        next();
    //    });
    //}
});

// 获取access_token
function getAccessToken(code, callback) {
    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + wx_config.AppId +
        '&secret=' + wx_config.AppSecret + '&code=' + code + '&grant_type=authorization_code';
    urllib.request(url, callback);
}

// 获取用户信息
function getUser(accessToken, openId, callback) {
    var url = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + accessToken + '&openid=' + openId + '&lang=zh_CN';
    urllib.request(url, callback);
}

// 根据Code获取用户信息
function getUserByCode(code, callback){
    getAccessToken(code, function (err, data) {
        if(err){
            return callback(err);
        }
        var accessToken = JSON.parse(data.toString());
        getUser(accessToken.accessToken, accessToken.openId, callback);
    });
}

router.get('/', function (req, res) {
    var signatrue = req.query.signatrue;
    var nonce = req.query.nonce;
    var timestamp = req.query.timestamp;
    var echostr = req.query.echostr;
    var plainText = [wx_config.token, nonce, timestamp].sort().join('');
    var sign = util.sha1(plainText);
    console.log(plainText);
    console.log(sign);
    if (sign != signatrue) {
        res.status(400).send('Bad Request');
    } else {
        res.send(echostr);
    }
});

var sendJson = {
    FromUserName: 'uid',
    ToUserName: 'sp',
    CreateTime: 'createTime',
    MsgType: 'type',
    Content: 'text',
    MediaId: '',
    Title: '',
    Description: '',
    MusicURL: '',
    HQMusicUrl: '',
    ThumbMediaId: ''
};

router.post('/', function (req, res) {
    util.parse2Json(req, function (err, data) {
        sendJson.FromUserName = data.ToUserName;
        sendJson.ToUserName = data.FromUserName;
        sendJson.CreateTime = Math.floor(Date.now() / 1000);

        // 业务处理
        sendJson.MsgType = 'text';

        sendJson.Content = 'SOS';

        // 返回信息
        res.send(util.parse2Xml(sendJson));
    });
});


// 分发教师相关的路由信息
router.use('/teacher', teacher);

// 分发企业相关的路由信息
router.use('/company', company);

module.exports = router;