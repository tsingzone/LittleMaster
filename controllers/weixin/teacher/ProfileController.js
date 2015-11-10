/**
 * Created by michel_feng on 15/11/6.
 */

var fs = require('fs');

var _ = require('underscore');
var captchapng = require('captchapng');

var BaseController = require('./BaseController');
var oss = require('../../../utils/Oss').createNew();
var sms = require('../../../utils/SmsUtil').createNew();
var Memcached = require('../../../utils/Memcached');

var ProfileController = {

    createNew: function (teacherModel) {
        var profileController = BaseController.createNew();
        var memCache = Memcached.createNew();

        var calPercentage = function calPercentage(data) {
            console.log(data);
            return Math.floor(100 * (_.filter(data, function (item) {
                    if (item || item === 0) {
                        return true;
                    }
                }).length) / 11);
        };

        profileController.getUserCenterData = function (req, res) {
            teacherModel.getUserCenterData(req.userIds, function (err, result) {
                if (err) {
                    res.status(404);
                }
                var percent = calPercentage(result[1][0]);
                res.render(profileController.getView('teacher'), {
                    user: result[0][0],
                    percent: percent,
                    signCount: result[2][0].signCount,
                    collectCount: result[3][0].collectCount,
                    userIds: req.userIds
                });
            });
        };
        profileController.getProfile = function (req, res) {
            teacherModel.getProfile(req.userIds, function (err, result) {
                if (err) {
                    res.redirect(profileController.getView('weixin/error'));
                } else {
                    var profile = result[0][0];
                    if (profile) {
                        if (profile.mobile) {
                            profile.mobile = profile.mobile.slice(0, 3) + '****' + profile.mobile.slice(-4);
                        }
                        if (profile.birthday) {
                            profile.birthday = new moment(profile.birthday).format('YYYY-MM-DD')
                        }
                        if (profile.entryYear) {
                            profile.entryYear = new moment(profile.entryYear).format('YYYY');
                        }
                    }
                    var diploma = result[2];
                    if (diploma) {
                        diploma = JSON.parse(JSON.stringify(diploma));
                        diploma = {
                            teacher: _.find(diploma, function (item) {
                                return item.kind === 0;
                            }),
                            other: _.find(diploma, function (item) {
                                return item.kind === 1;
                            })
                        };
                    }
                    else {
                        diploma = {
                            teacher: {
                                kindCount: 0
                            },
                            other: {
                                kindCount: 0
                            }
                        }
                    }

                    var experience = result[1];
                    if (experience) {
                        experience = JSON.parse(JSON.stringify(experience));
                        experience = {
                            social: _.find(experience, function (item) {
                                return item.kind === 0;
                            }),
                            parttime: _.find(experience, function (item) {
                                return item.kind === 1;
                            }),
                            school: _.find(experience, function (item) {
                                return item.kind === 2;
                            })
                        };
                    }
                    else {
                        experience = {
                            social: {
                                kindCount: 0
                            },
                            parttime: {
                                kindCount: 0
                            },
                            school: {
                                kindCount: 0
                            }
                        }
                    }

                    res.render(profileController.getView('profile'), {
                        profile: profile,
                        diplomaTeacher: diploma.teacher,
                        diplomaOther: diploma.other,
                        experienceSocial: experience.social,
                        experienceParttime: experience.parttime,
                        experienceSchool: experience.school,
                        userIds: req.userIds
                    });
                }
            });
        };
        profileController.saveProfile = function (req, res) {
            var teacher = req.body.teacher;
            var isParamsOk = profileController.validateParams(teacher);
            if (isParamsOk) {
                teacherModel.saveProfile(teacher, function (err, result) {
                    if (err) {
                        res.json({success: false, message: err});
                    } else {
                        res.json({success: true, message: "操作成功！"});
                    }
                });
            } else {
                res.json({success: false, message: isParamsOk});
            }
        };
        profileController.uploadHeadImg = function (req, res) {
            var form = profileController.getForm('head');
            form.parse(req, function (err, fields, files) {

                if (err) {
                    res.json({success: false, message: err});
                    return;
                }
                var extName = profileController.getExtName(files.fulAvatar.type);  //后缀名

                if (extName.length == 0) {
                    res.json({success: false, message: '只支持png和jpg格式图片'});
                    return;
                }

                var avatarName = req.userIds.teacherId + '-' + new Date().getTime() + '.' + extName;
                var newPath = form.uploadDir + avatarName;
                fs.rename(files.fulAvatar.path, newPath, function (err) {
                    if (err) {
                        res.json({success: false, message: err});
                        return;
                    }

                    oss.putObject({key: newPath},
                        function (err, data) {
                            if (err) {
                                console.log('error:', err);
                                return;
                            }

                            var source = {
                                teacherId: req.userIds.teacherId,
                                imgPath: newPath
                            };
                            teacherModel.chageTeacherHeadImg(source, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                res.json({success: true, message: "上传成功！"});
                            });
                        });

                });  //重命名
            });
        };
        profileController.getProfileHead = function (req, res) {
            res.render(profileController.getView('upload'), {title: 'Upload'});
        };
        profileController.getProfileMobile = function (req, res) {
            res.render(profileController.getView('bind'), {
                title: 'Bind',
                userIds: req.userIds
            });
        };
        profileController.getEducation = function (req, res) {
            teacherModel.getEducation(function (err, result) {
                console.log(result);
                res.render(profileController.getView('education'), {
                    educations: result,
                    userIds: req.userIds
                });
            });
        };

        profileController.bindMobile = function (req, res) {

            var mobile = req.body.mobile;
            var smsCode = req.body.smsCode;
            var picCode = req.body.picCode;
            var openId = req.userIds.openId;

            var reg = /1\d{10}/;
            if (mobile == '' || !reg.test(mobile)) {
                res.json({success: false, message: "请输入正确的手机号！"});
                return;
            }

            if (smsCode == '') {
                res.json({success: false, message: "请输入短信验证码！"});
                return;
            }

            if (picCode == '') {
                res.json({success: false, message: "请输入图片验证码！"});
                return;
            }

            memCache.getObject('RANDOM_CODE_' + openId, function (err, data) {
                if (err) {
                    console.log(err);
                    res.json({success: false, message: err});
                    return;
                }
                if (!data) {
                    res.json({success: false, message: "短信验证码已过期，请重新获取！"});
                    return;
                }
                if (smsCode != data) {
                    res.json({success: false, message: "短信验证码错误，请重新输入！"});
                    return;
                }
                memCache.getObject('RANDOM_CODE_PIC_' + openId, function (err, data) {
                    if (err) {
                        console.log(err);
                        res.json({success: false, message: err});
                        return;
                    }
                    if (picCode != data) {
                        res.json({
                            success: false,
                            message: "图片验证码错误，请重新输入！"
                        });
                        return;
                    }
                    var source = {
                        openId: openId,
                        mobile: mobile
                    }
                    teacherModel.changeMobile(source, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.json({success: false, message: err});
                            return;
                        }
                        res.json({success: true, message: "绑定成功！"});
                    })

                });
            });

        };

        var origin = '1234567890';
        var getRandCode = function () {
            var selected = [];
            for (var i = 0; i < 4; i++) {
                var index = Math.floor(Math.random() * 10);
                selected.push(origin.charAt(index));
            }
            console.log(selected);
            return selected.join('');
        };
        profileController.randomSmsCode = function (req, res) {
            memCache.getObject('SEND_' + req.userIds.openId, function (err, data) {
                if (err) {
                    console.log(err);
                    res.json({success: false, message: err});
                    return;
                }
                if (data) {
                    res.json({success: false, message: "您的短信已发送请耐心等待！"});
                }
                else {
                    var code = getRandCode();
                    memCache.putObject('SEND_' + req.userIds.openId, code, 61, function (err) {
                        if (err) {
                            console.log(err);
                            res.json({success: false, message: err});
                            return;
                        }

                        sms.sendMessage([req.body.mobile], '40816', [code, "5"], function (err, result) {
                            if (err) {
                                console.log(err);
                                res.json({success: false, message: err});
                                return;
                            }
                            console.log(result.toString());
                            memCache.putObject('RANDOM_CODE_' + req.userIds.openId, code, 300, function (err) {
                                if (err) {
                                    console.log(err);
                                    res.json({success: false, message: err});
                                    return;
                                }
                                res.json({
                                    success: true,
                                    message: "验证码已发送，请注意查收！"
                                });
                            })
                        });
                    });

                }
            });

        };

        profileController.randomCaptcha = function (req, res) {
            var randomCode = parseInt(Math.floor(Math.random() * 9000 + 1000));
            memCache.putObject('RANDOM_CODE_PIC_' + req.userIds.openId, randomCode, 300, function (err) {
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