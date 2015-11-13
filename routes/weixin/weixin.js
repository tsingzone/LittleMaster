/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();

var async = require('async');

var teacher = require('./teacher/teacher');
var company = require('./company/company');
var weixinController = require('../../controllers/weixin/common/WeixinController').createNew();
var teacherController = require('../../controllers/weixin/teacher/TeacherController').createNew();
var logger = require('../../logger').logger('weixin');

// 路由拦截
router.use(function (req, res, next) {
    var code = req.query.code;
    if (code) {
        logger.debug('------ 点击微信菜单 -------');
        async.auto({
            getUserByCode: function (callback) {
                weixinController.getUserByCode(code, function (err, data) {
                    teacherController.errorHandler(err, res);
                    var userInfo = JSON.parse(data.toString());
                    userInfo.userIp = req.ip;
                    callback(null, userInfo);
                });
            },
            checkUserSubscribed: ['getUserByCode', function (callback, results) {
                if (results.getUserByCode && results.getUserByCode.subscribe) {
                    callback(null, true);
                } else {
                    callback(new Error('用户未关注！'));
                }
            }],
            checkIsUserExistInDb: ['checkUserSubscribed', function (callback, results) {
                if (results.checkUserSubscribed) {
                    teacherController.checkIsUserExistInDb({openId: results.getUserByCode.openid}, function (err, result) {
                        teacherController.errorHandler(err, res);
                        if (result.length > 0) {
                            callback(null, true);
                        } else {
                            callback(null, false);
                        }
                    });
                } else {
                    callback(null);
                }
            }],
            insertUser: ['checkIsUserExistInDb', function (callback, results) {
                if (!results.checkIsUserExistInDb) {
                    teacherController.insertWeixinUser(results.getUserByCode, function (err, result) {
                        teacherController.errorHandler(err, res);
                        callback(null);
                    });
                } else {
                    callback(null);
                }
            }],
            updateUser: ['checkIsUserExistInDb', function (callback, results) {
                if (results.checkIsUserExistInDb) {
                    teacherController.updateWeixinUser(results.getUserByCode, function (err, result) {
                        teacherController.errorHandler(err, res);
                        callback(null);
                    });
                } else {
                    callback(null);
                }
            }]
        }, function (err, results) {
            if (err) {
                logger.error(err);
                next(err);
            } else {
                if (results) {
                    teacherController.getUserIds({
                        openId: results.getUserByCode.openid
                    }, function (err, result) {
                        console.log(result);
                        req.userIds = result[0];
                        next();
                    });
                } else {
                    next();
                }
            }
        });
    }
    else {
        logger.debug('------ 点击页面链接 -------');
        var userId = req.query.userId;
        var openId = req.query.openId;
        if (userId || openId) {
            async.auto({
                getWeiXinUser: function (callback) {
                    teacherController.getUserIds({
                        userId: userId,
                        openId: openId
                    }, function (err, data) {
                        teacherController.errorHandler(err, res);
                        callback(null, data[0]);
                    })
                },
                getUserByOpenId: ['getWeiXinUser', function (callback, results) {
                    if (results.getWeiXinUser) {
                        openId = results.getWeiXinUser.openId;
                        weixinController.getUserByOpenId(openId, function (err, data) {
                            teacherController.errorHandler(err, res);
                            var userInfo = JSON.parse(data.toString());
                            userInfo.userIp = req.ip;
                            callback(null, userInfo);
                        });
                    } else {
                        callback(new Error('无法获取用户信息！'));
                    }
                }],
                checkUserSubscribed: ['getUserByOpenId', function (callback, results) {
                    if (results.getUserByOpenId && results.getUserByOpenId.subscribe) {
                        callback(null, true);
                    } else {
                        callback(new Error('用户未关注！'));
                    }
                }],
                checkIsUserExistInDb: ['checkUserSubscribed', function (callback, results) {
                    if (results.checkUserSubscribed) {
                        teacherController.checkIsUserExistInDb(results.getWeiXinUser, function (err, result) {
                            teacherController.errorHandler(err, res);
                            if (result.length > 0) {
                                callback(null, true);
                            } else {
                                callback(null, false);
                            }
                        });
                    }
                }],
                insertUser: ['checkIsUserExistInDb', function (callback, results) {
                    if (!results.checkIsUserExistInDb) {
                        teacherController.insertWeixinUser(results.getWeiXinUser, function (err, result) {
                            teacherController.errorHandler(err, res);
                            callback(null, result);
                        });
                    } else {
                        callback(null);
                    }
                }],
                updateUser: ['checkIsUserExistInDb', function (callback, results) {
                    if (results.checkIsUserExistInDb) {
                        teacherController.updateWeixinUser(results.getWeiXinUser, function (err, result) {
                            teacherController.errorHandler(err, res);
                            callback(null, result);
                        });
                    } else {
                        callback(null);
                    }
                }]
            }, function (err, results) {
                if (err) {
                    logger.error(err);
                    next(err);
                } else {
                    if (results) {
                        teacherController.getUserIds({
                            openId: results.getWeiXinUser.openId
                        }, function (err, result) {
                            req.userIds = result[0];
                            next();
                        });
                    } else {
                        next();
                    }
                }
            });
        } else {
            next();
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