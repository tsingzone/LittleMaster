/**
 * Created by michel_feng on 15/11/6.
 */

var _ = require('underscore');
var fs = require('fs');

var BaseController = require('./BaseController');
var oss = require('../../../utils/Oss').createNew();

var ProfileController = {

    createNew: function (teacherModel) {
        var profileController = BaseController.createNew();

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
            res.render(profileController.getView('bind'), {title: 'Bind'});
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
        profileController.getCollege = function (req, res) {
            res.render(profileController.getView('college'), {userIds: req.userIds});
        };
        return profileController;
    }
};

module.exports = ProfileController;