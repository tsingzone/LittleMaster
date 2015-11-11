/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();

var async = require('async');

var teacher = require('./teacher/teacher');
var company = require('./company/company');
var weixinController = require('../../controllers/weixin/WeixinController').createNew();
var teacherController = require('../../controllers/weixin/teacher/TeacherController').createNew();

var logger = require('../../logger').logger('weixin');

// 路由拦截
router.use(function (req, res, next) {
    var code = req.query.code;
    if (code) {
        logger.info('------ 点击微信菜单 -------');
        async.waterfall([
            function getUserByCode(callback) {
                weixinController.getUserByCode(code, function (err, data) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    var userInfo = JSON.parse(data.toString());
                    userInfo.userIp = req.ip;
                    callback(null, userInfo);
                })
            },
            function checkUserSubscribed(result, callback) {
                console.log(result.subscribe);

                if (result.subscribe) {
                    console.log('-----');
                    callback(null, result);
                } else {
                    // TODO: 用户未关注，跳转到提示关注的页面
                    console.log('用户未关注');
                    throw '用户未关注！';
                }
            },
            function checkIsUserExistInDb(userInfo, callback) {
                teacherController.checkIsUserExistInDb(userInfo, function (err, result) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log(result);
                    if (result.length > 0) {
                        // TODO: 已存在，更新用户信息，并返回最新记录信息
                        teacherController.updateWeixinUser(userInfo, function (err, result) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            callback(null, result);
                        });
                    } else {
                        // TODO: 不存在，插入用户信息，并返回最新记录信息
                        teacherController.insertWeixinUser(userInfo, function (err, result) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            callback(null, result);
                        });
                    }
                });
            }
        ], function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            if (result) {
                teacherController.getUserIds({
                    userId: result[0].userId,
                    openId: result[0].openId
                }, function (err, result) {
                    req.userIds = result[0];
                    next();
                });
            } else {
                next();
            }
        });
    }
    else {
        logger.info('------ 点击页面链接 -------');
        var userId = req.query.userId;
        var openId = req.query.openId;
        if (openId) {
            console.log(openId);
            updateDb(openId);
        } else if (userId) {
            console.log(userId);
            teacherController.getWeiXinUserByUserId(userId, function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                }
                updateDb(data[0].openId);
            });
        } else {
            console.log('None');
            next();
        }
        var updateDb = function (openId) {
            async.waterfall([
                function getAccessToken(callback) {
                    weixinController.getUserByOpenId(openId, function (err, data) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        var userInfo = JSON.parse(data.toString());
                        userInfo.userIp = req.ip;
                        callback(null, userInfo);
                    });
                },
                function checkUserSubscribed(result, callback) {

                    if (result.subscribe) {
                        callback(null, result);
                    } else {
                        // TODO: 用户未关注，跳转到提示关注的页面
                        console.log('用户未关注');
                        throw '用户未关注！';
                    }
                },
                function checkIsUserExistInDb(userInfo, callback) {
                    teacherController.checkIsUserExistInDb(userInfo, function (err, result) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        if (result.length > 0) {
                            // TODO: 已存在，更新用户信息，并返回最新记录信息
                            teacherController.updateWeixinUser(userInfo, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                callback(null, result);
                            });
                        } else {
                            // TODO: 不存在，插入用户信息，并返回最新记录信息
                            teacherController.insertWeixinUser(userInfo, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                callback(null, result);
                            });
                        }
                    });
                }
            ], function (err, result) {
                console.log(result);
                if (err) {
                    console.log(err);
                    return;
                }
                if (result) {
                    teacherController.getUserIds({
                        userId: result[0].userId,
                        openId: result[0].openId
                    }, function (err, result) {
                        req.userIds = result[0];
                        next();
                    });
                } else {
                    next();
                }
            });
        }
    }
});

// 分发教师相关的路由信息
router.use('/teacher', teacher);

// 分发企业相关的路由信息
router.use('/company', company);

// 微信消息回复
router.get('/', weixinController.checkSign);
router.post('/', weixinController.replyInfo);

module.exports = router;