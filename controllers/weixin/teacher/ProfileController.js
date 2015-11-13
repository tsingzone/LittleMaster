/**
 * Created by michel_feng on 15/11/6.
 */

var fs = require('fs');

var _ = require('underscore');
var captchapng = require('captchapng');
var async = require('async');

var BaseController = require('./BaseController');
var oss = require('../../../utils/Oss').createNew();
var sms = require('../../../utils/SmsUtil').createNew();
var Memcached = require('../../../utils/Memcached');
var logger = require('../../../logger').logger('ProfileController');

var ProfileController = {

    createNew: function (teacherModel) {
        var profileController = BaseController.createNew();
        var memCache = Memcached.createNew();

        /**
         * 计算简历填写百分比
         * @param data
         * @returns {number}
         */
        var calPercentage = function calPercentage(data) {
            return Math.floor(100 * (_.filter(data, function (item) {
                    if (item || item === 0) {
                        return true;
                    }
                }).length) / 11);
        };

        /**
         * 根据userId获取简历是否填写完成，若填写百分比为100，表示填写完成
         * @param req
         * @param res
         */
        profileController.getProfilePercentage = function (req, res) {
            teacherModel.getProfilePercentage(req.userIds.userId, function (err, result) {
                if (err) {
                    logger.error(err);
                    throw err;
                    return;
                }
                var percent = calPercentage(result[0]);
                var isFull = percent == 100;
                res.json({
                    success: isFull,
                    message: isFull ? '操作成功！' : '简历尚未填写完成！'
                });
            })
        };

        /**
         * 获取用户个人中心首页信息
         * @param req
         * @param res
         */
        profileController.getUserCenterData = function (req, res) {
            async.parallel([
                function (callback) {
                    teacherModel.getWeiXinBaseUserInfo(req.userIds, function (err, result) {
                        if (err) {
                            logger.error(err);
                            callback(err);
                            return;
                        }
                        callback(null, result[0]);
                    });
                },
                function (callback) {
                    teacherModel.getProfilePercentage(req.userIds.userId, function (err, result) {
                        if (err) {
                            logger.error(err);
                            callback(err);
                            return;
                        }
                        callback(null, calPercentage(result[0]));
                    });
                },
                function (callback) {
                    teacherModel.getSignJobsCount(req.userIds.teacherId, function (err, result) {
                        if (err) {
                            logger.error(err);
                            callback(err);
                            return;
                        }
                        callback(null, result[0].signCount);
                    });
                },
                function (callback) {
                    teacherModel.getCollectJobsCount(req.userIds.teacherId, function (err, result) {
                        if (err) {
                            logger.error(err);
                            callback(err);
                            return;
                        }
                        callback(null, result[0].collectCount);
                    });
                }
            ], function (err, result) {
                if (err) {
                    logger.error(err);
                    throw err;
                    return;
                } else {
                    res.render(profileController.getView('teacher'), {
                        user: result[0],
                        percent: result[1],
                        signCount: result[2],
                        collectCount: result[3],
                        userIds: req.userIds
                    });
                }
            });
        };

        /**
         * 根据用户信息获取个人简历
         * @param req
         * @param res
         */
        profileController.getProfile = function (req, res) {
            async.auto({
                checkProfileIsExist: function (callback) {
                    if (req.userIds.teacherId) {
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }
                },
                insertProfileIfNotExist: ['checkProfileIsExist', function (callback, results) {
                    if (!results.checkProfileIsExist) {
                        teacherModel.insertDefaultProfile(req.userIds, function (err, result) {
                            if (err) {
                                logger.error(err);
                                callback(err);
                                return;
                            }
                            req.userIds.teacherId = result.insertId;
                            callback(null, req.userIds);
                        });
                    } else {
                        callback(null, req.userIds);
                    }
                }],
                getProfileBaseInfoById: ['insertProfileIfNotExist', function (callback, results) {
                    teacherModel.getProfileBaseInfoByUserId(results.insertProfileIfNotExist.userId, function (err, result) {
                        if (err) {
                            logger.error(err);
                            callback(err);
                            return;
                        }
                        var profileInfo = result[0];
                        if (profileInfo) {
                            if (profileInfo.mobile) {
                                profileInfo.mobile = profileInfo.mobile.slice(0, 3) + '****' + profileInfo.mobile.slice(-4);
                            }
                            if (profileInfo.birthday) {
                                profileInfo.birthday = new moment(profileInfo.birthday).format('YYYY-MM-DD')
                            }
                            if (profileInfo.entryYear) {
                                profileInfo.entryYear = new moment(profileInfo.entryYear).format('YYYY');
                            }
                        }
                        callback(null, profileInfo);
                    });
                }],
                getExperienceCount: ['insertProfileIfNotExist', function (callback, results) {
                    teacherModel.getExperienceCount(results.insertProfileIfNotExist.teacherId, function (err, experience) {
                        if (err) {
                            logger.error(err);
                            callback(err);
                            return;
                        }
                        if (experience) {
                            experience = JSON.parse(JSON.stringify(experience));
                            callback(null, {
                                social: _.find(experience, function (item) {
                                    return item.kind === 0;
                                }),
                                parttime: _.find(experience, function (item) {
                                    return item.kind === 1;
                                }),
                                school: _.find(experience, function (item) {
                                    return item.kind === 2;
                                })
                            });
                        }
                        else {
                            callback(null, {
                                social: {
                                    kindCount: 0
                                },
                                parttime: {
                                    kindCount: 0
                                },
                                school: {
                                    kindCount: 0
                                }
                            });
                        }
                    })
                }],
                getDiplomaCount: ['insertProfileIfNotExist', function (callback, results) {
                    teacherModel.getDiplomaCount(results.insertProfileIfNotExist.teacherId, function (err, diploma) {
                        if (err) {
                            logger.error(err);
                            callback(err);
                            return;
                        }
                        if (diploma) {
                            diploma = JSON.parse(JSON.stringify(diploma));
                            callback(null, {
                                teacher: _.find(diploma, function (item) {
                                    return item.kind === 0;
                                }),
                                other: _.find(diploma, function (item) {
                                    return item.kind === 1;
                                })
                            });
                        }
                        else {
                            callback(null, {
                                teacher: {
                                    kindCount: 0
                                },
                                other: {
                                    kindCount: 0
                                }
                            });
                        }
                    })
                }]
            }, function (err, results) {
                if (err) {
                    logger.error(err);
                    throw err;
                    return;
                }
                res.render(profileController.getView('profile'), {
                    profile: results.getProfileBaseInfoById,
                    diplomaTeacher: results.getDiplomaCount.teacher,
                    diplomaOther: results.getDiplomaCount.other,
                    experienceSocial: results.getExperienceCount.social,
                    experienceParttime: results.getExperienceCount.parttime,
                    experienceSchool: results.getExperienceCount.school,
                    userIds: req.userIds
                });
            });
        };

        /**
         * 更新简历信息
         * @param req
         * @param res
         */
        profileController.saveProfile = function (req, res) {
            var teacher = req.body.teacher;
            var isParamsOk = profileController.validateParams(teacher);
            if (isParamsOk) {
                teacherModel.saveProfile(teacher, function (err, result) {
                    if (err) {
                        logger.error(err);
                        throw err;
                        return;
                    }
                    res.json({success: true, message: '操作成功！'});
                });
            } else {
                res.json({success: false, message: '表单数据填写有误！'});
            }
        };

        /**
         * 更新简历头像
         * @param req
         * @param res
         */
        profileController.uploadHeadImg = function (req, res) {
            profileController.formParse(req, res, 'head', function (fields, files, uploadPath) {
                fs.rename(files.fulAvatar.path, uploadPath, function (err) {
                    if (err) {
                        logger.error(err);
                        throw err;
                        return;
                    }
                    oss.putObject({key: uploadPath},
                        function (err, data) {
                            if (err) {
                                logger.error(err);
                                res.json({success: false, message: '操作失败！'});
                                return;
                            }
                            teacherModel.chageTeacherHeadImg({
                                teacherId: req.userIds.teacherId,
                                imgPath: uploadPath
                            }, function (err, result) {
                                if (err) {
                                    logger.error(err);
                                    throw err;
                                    return;
                                }
                                res.json({success: true, message: '操作成功！'});
                            });
                        });

                });
            });
        };

        /**
         * 调整到更新头像的页面
         * @param req
         * @param res
         */
        profileController.getProfileHead = function (req, res) {
            res.render(profileController.getView('upload'), {
                userIds: req.userIds
            });
        };

        /**
         * 调整到更新手机绑定页面
         * @param req
         * @param res
         */
        profileController.getProfileMobile = function (req, res) {
            res.render(profileController.getView('bind'), {
                userIds: req.userIds
            });
        };

        /**
         * 调整到大学页面
         * @param req
         * @param res
         */
        profileController.getCollege = function (req, res) {
            res.render(profileController.getView('college'), {
                userIds: req.userIds
            });
        };

        /**
         * 获取学历列表，缓存到memcache
         * @param req
         * @param res
         */
        profileController.getEducation = function (req, res) {
            var render = function (result) {
                res.render(profileController.getView('education'), {
                    educations: result,
                    userIds: req.userIds
                });
            };
            memCache.getObject('EDUCATION_LIST', function (err, data) {
                if (err) {
                    logger.error(err);
                    throw err;
                    return;
                }
                if (data) {
                    render(data);
                } else {
                    teacherModel.getEducationList(function (err, result) {
                        if(err){
                            logger.error(err);
                            throw err;
                            return;
                        }
                        memCache.putObject('EDUCATION_LIST', result, 21600, function (err) {
                            if (err) {
                                logger.error(err);
                                throw err;
                                return;
                            }
                            render(result);
                        });
                    });
                }
            });
        };

        /**
         * 更新绑定手机号
         * @param req
         * @param res
         */
        profileController.bindMobile = function (req, res) {

            var mobile = req.body.mobile;
            var smsCode = req.body.smsCode;
            var picCode = req.body.picCode;
            var openId = req.userIds.openId;

            var reg = /1\d{10}/;
            if (mobile == '' || !reg.test(mobile)) {
                logger.error(new Error('手机号填写错误！'));
                res.json({success: false, message: '请输入正确的手机号！'});
                return;
            }

            if (smsCode == '') {
                logger.error(new Error('短信验证码填写错误！'));
                res.json({success: false, message: '请输入短信验证码！'});
                return;
            }

            if (picCode == '') {
                logger.error(new Error('图片验证码填写错误！'));
                res.json({success: false, message: '请输入图片验证码！'});
                return;
            }

            memCache.getObject('RANDOM_CODE_' + openId, function (err, data) {
                if (err) {
                    logger.error(err);
                    throw err;
                    return;
                }
                if (!data) {
                    logger.error(new Error('短信验证码已过期'));
                    res.json({success: false, message: '短信验证码已过期，请重新获取！'});
                    return;
                }
                if (smsCode != data) {
                    logger.error(new Error('短信验证码错误'));
                    res.json({success: false, message: '短信验证码错误，请重新输入！'});
                    return;
                }
                memCache.getObject('RANDOM_CODE_PIC_' + openId, function (err, data) {
                    if (err) {
                        logger.error(err);
                        throw err;
                        return;
                    }
                    if (picCode != data) {
                        res.json({
                            success: false,
                            message: '图片验证码错误，请重新输入！'
                        });
                        return;
                    }
                    teacherModel.changeMobile({
                        openId: openId,
                        mobile: mobile
                    }, function (err, result) {
                        if (err) {
                            logger.error(err);
                            throw err;
                            return;
                        }
                        res.json({success: true, message: '绑定成功！'});
                    });
                });
            });
        };

        var origin = '1234567890';
        /**
         * 产生length位随机数，默认length为4
         * @returns {string}
         */
        var getRandCode = function (length) {
            var len = length || 4;
            var selected = [];
            for (var i = 0; i < len; i++) {
                var index = Math.floor(Math.random() * 10);
                selected.push(origin.charAt(index));
            }
            return selected.join('');
        };

        /**
         * 发送短信验证码
         * @param req
         * @param res
         */
        profileController.randomSmsCode = function (req, res) {
            memCache.getObject('SEND_' + req.userIds.openId, function (err, data) {
                if (err) {
                    logger.error(err);
                    throw err;
                    return;
                }
                if (data) {
                    res.json({success: false, message: '您的短信已发送请耐心等待！'});
                }
                else {
                    var code = getRandCode();
                    memCache.putObject('SEND_' + req.userIds.openId, code, 61, function (err) {
                        if (err) {
                            logger.error(err);
                            throw err;
                            return;
                        }

                        sms.sendMessage([req.body.mobile], '40816', [code, '5'], function (err, result) {
                            if (err) {
                                logger.error(err);
                                throw err;
                                return;
                            }
                            console.log(result.toString());
                            memCache.putObject('RANDOM_CODE_' + req.userIds.openId, code, 300, function (err) {
                                if (err) {
                                    logger.error(err);
                                    throw err;
                                    return;
                                }
                                res.json({
                                    success: true,
                                    message: '验证码已发送，请注意查收！'
                                });
                            })
                        });
                    });
                }
            });
        };

        /**
         * 生成图片验证码，缓存到memcache，缓存5分钟
         * @param req
         * @param res
         */
        profileController.randomCaptcha = function (req, res) {
            var randomCode = parseInt(Math.floor(Math.random() * 9000 + 1000));
            memCache.putObject('RANDOM_CODE_PIC_' + req.userIds.openId, randomCode, 300, function (err) {
                if(err){
                    logger.error(err);
                    throw err;
                    return;
                }

                var p = new captchapng(80, 30, randomCode);
                p.color(0, 0, 0, 0);
                p.color(255, 255, 255, 255);

                var img = p.getBase64();
                var imgbase64 = new Buffer(img, 'base64');
                res.writeHead(200, {
                    'Content-Type': 'image/png'
                });

                res.end(imgbase64);
            });
        };
        return profileController;
    }
};

module.exports = ProfileController;