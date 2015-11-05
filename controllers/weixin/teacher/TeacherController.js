/**
 * Created by michel_feng on 15/10/21.
 */
var path = require('path');
var fs = require('fs');

var formidable = require('formidable');
var _ = require('underscore');
var moment = require('moment');

var oss = require('../../../utils/Oss');
var Configs = require('../../../configs');
var ossconfig = Configs.getConfig().ossconfig;
var TeacherModel = require('../../../models/weixin/teacher/TeacherModel');
var Teacher = new TeacherModel();

var teacher = function TeacherController() {
};

module.exports = teacher;

_.extend(teacher.prototype, {
    getUserCenterData: function (req, res) {
        var sourceMap = {
            userId: req.userId,
            teacherId: req.teacherId
        };

        Teacher.getUserCenterData(sourceMap, function (err, result) {
            if (err) {
                res.status(404);
            }
            var percent = calPercentage(result[1][0]);
            res.render(getView('teacher'), {
                user: result[0][0],
                percent: percent,
                signCount: result[2][0].signCount,
                collectCount: result[3][0].collectCount
            });
        });
    },
    getProfile: function (req, res) {
        var sourceMap = {
            teacherId: req.teacherId,
            userId: req.userId,
            openId: req.openId
        };
        Teacher.getProfile(sourceMap, function (err, result) {
            if (err) {
                res.redirect(getView('weixin/error'));
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

                res.render(getView('profile'), {
                    profile: profile,
                    diplomaTeacher: diploma.teacher,
                    diplomaOther: diploma.other,
                    experienceSocial: experience.social,
                    experienceParttime: experience.parttime,
                    experienceSchool: experience.school
                });
            }
        });
    },
    saveProfile: function (req, res) {
        var teacher = req.body.teacher;
        var isParamsOk = validateParams(teacher);
        if (isParamsOk) {
            Teacher.saveProfile(teacher, function (err, result) {
                if (err) {
                    res.json({success: false, message: err});
                } else {
                    res.json({success: true, message: "操作成功！"});
                }
            });
        } else {
            res.json({success: false, message: isParamsOk});
        }
    },
    uploadHeadImg: function (req, res) {
        var form = getForm('head');
        form.parse(req, function (err, fields, files) {

            if (err) {
                res.json({success: false, message: err});
                return;
            }
            var extName = getExtName(files.fulAvatar.type);  //后缀名

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

                oss.putObject({
                        Bucket: ossconfig.bucketName,
                        Key: newPath,                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
                        AccessControlAllowOrigin: '',
                        ContentType: 'image/*',
                        CacheControl: 'no-cache',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
                        ContentDisposition: '',           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
                        ContentEncoding: 'utf-8',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
                        ServerSideEncryption: 'AES256',
                        Expires: null
                    },
                    function (err, data) {
                        if (err) {
                            console.log('error:', err);
                            return;
                        }

                        var source = {
                            teacherId: req.userIds.teacherId,
                            imgPath: newPath
                        };
                        Teacher.chageTeacherHeadImg(source, function (err, result) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            res.json({success: true, message: "上传成功！"});
                        });
                    });

            });  //重命名
        });
    },
    getProfileHead: function (req, res) {
        res.render(getView('upload'), {title: 'Upload'});
    },
    getProfileMobile: function (req, res) {
        res.render(getView('bind'), {title: 'Bind'});
    },
    getSignJobs: function (req, res) {
        var source = {
            teacherId: req.teacherId
        };

        Teacher.getSignJobs(source, function (err, result) {
            if (err) {

            }
            res.render(getView('sign'), {jobList: result[0]});
        });
    },
    getCollectJobs: function (req, res) {
        var source = {
            teacherId: req.teacherId
        };
        Teacher.getCollectJobs(source, function (err, result) {
            if (err) {

            }
            res.render(getView('collect'), {jobList: result[0]});
        });
    },
    getDiploma: function (req, res) {
        var types = ['teacher', 'other'];
        var type = req.params.type;
        var index = types.indexOf(type);
        if (index != -1) {
            var source = {
                teacherId: req.userIds.teacherId,
                kind: index
            };
            Teacher.getDiploma(source, function (err, result) {
                if (err) {
                    res.status(404).end();
                    return;
                }
                console.log(result);
                res.render(getView('diploma'), {
                    title: type,
                    user: req.userIds,
                    diplomaList: result
                });
            });
        } else {
            res.status(404).end();
        }
    },
    getAddDiploma: function (req, res) {
        var types = ['teacher', 'other'];
        var type = req.params.type;
        if (types.indexOf(type) != -1) {
            res.render(getView('diploma_add_' + type), {title: type});
        } else {
            res.status(404).end();
        }
    },
    saveDiploma: function (req, res) {
        var types = ['teacher', 'other'];
        var type = req.params.type;
        var index = types.indexOf(type);
        if (index != -1) {
            var form = getForm('diploma');

            form.parse(req, function (err, fields, files) {
                    if (err) {
                        res.json({success: false, message: err});
                        return;
                    }

                    var isValid = validateParams(fields);
                    if (isValid.length > 0) {
                        res.json({success: false, message: isValid});
                        return;
                    }

                    var extName = getExtName(files.fulAvatar.type);  //后缀名

                    if (extName.length == 0) {
                        res.json({success: false, message: '只支持png和jpg格式图片'});
                        return;
                    }

                    var avatarName = req.userIds.teacherId + '-' + new Date().getTime() + '.' + extName;
                    var newPath = form.uploadDir + avatarName;
                    fs.rename(files.fulAvatar.path, newPath, function (err) {

                        oss.putObject({
                                Bucket: ossconfig.bucketName,
                                Key: newPath,                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
                                AccessControlAllowOrigin: '',
                                ContentType: 'image/*',
                                CacheControl: 'no-cache',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
                                ContentDisposition: '',           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
                                ContentEncoding: 'utf-8',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
                                ServerSideEncryption: 'AES256',
                                Expires: null
                            },
                            function (err, data) {

                                if (err) {
                                    res.json({
                                        success: false,
                                        message: err
                                    });
                                    return;
                                }
                                var source = {
                                    teacherId: req.userIds.teacherId,
                                    number: fields.number,
                                    achieveDate: fields.achieveDate,
                                    imgPath: newPath,
                                    kind: index
                                };
                                if (index == 0) {
                                    source['diplomaId'] = 1;
                                    source['diplomaName'] = '教师资格证';
                                    source['period'] = fields.period;
                                    source['major'] = fields.major;
                                }
                                else {
                                    source['diplomaId'] = fields.diplomaId;
                                    source['diplomaName'] = fields.diplomaName;
                                }
                                Teacher.saveDiploma(source, function (err, result) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    res.json({
                                        success: true,
                                        message: "上传成功！"
                                    });
                                });
                            });
                    });  //重命名
                }
            );
        } else {
            res.status(404).end();
            return;
        }
    },
    getAddDiplomaSubType: function (req, res) {
        var types = ['major', 'period', 'cert'];
        var type = req.params.type;
        var index = types.indexOf(type);
        switch (index) {
            case 0:
                Teacher.getMajorList(function (err, result) {
                    if (err) {
                        res.status(404).end();
                        return;
                    }
                    res.render(getView(type), {title: type, subList: result});
                });
                break;
            case 1:
                Teacher.getPeriodList(function (err, result) {
                    if (err) {
                        res.status(404).end();
                        return;
                    }
                    res.render(getView(type), {title: type, subList: result});
                });
                break;
            case 2:
                Teacher.getCertTypeList(function (err, result) {
                    if (err) {
                        res.status(404).end();
                        return;
                    }
                    res.render(getView(type), {title: type, subList: result});
                });
                break;
            default :
                res.status(404).end();
        }
    }
    ,
    deleteDiplomaById: function (req, res) {
        var source = {
            diplomaId: req.body.diplomaId
        };
        Teacher.deleteDiploma(source, function (err, result) {
            var resJson = {
                success: true,
                message: '操作成功！',
            };
            if (err) {
                resJson[success] = false;
                resJson[message] = err;
            }
            res.json(resJson);
        });
    }
    ,
    getExperience: function (req, res) {
        var type = req.params.type;
        var index = ['social', 'parttime', 'school'].indexOf(type);
        if (index != -1) {

            var source = {
                kind: index,
                teacherId: req.userIds.teacherId
            };
            Teacher.getExperienceList(source, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(JSON.stringify(result));
                    res.render(getView('experience'), {
                        title: type,
                        user: req.userIds,
                        experienceList: result
                    });
                }
            });

        } else {
            res.status(404).end();
        }
    }
    ,
    getAddExperience: function (req, res) {
        var type = req.params.type;
        var index = ['social', 'parttime', 'school'].indexOf(type);
        if (index != -1) {
            res.render(getView('experience_add'), {
                kind: index,
                user: req.userIds
            });
        } else {
            res.status(404).end();
        }
    }
    ,
    saveExperience: function (req, res) {
        var experience = {
            title: req.body.name,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            description: req.body.description,
            kind: req.body.kind,
            status: 1,
            teacherId: req.userIds.teacherId
        };
        Teacher.saveExperience(experience, function (err, result) {
            if (err) {
                console.log(err);
                res.json({success: false, message: err});
                return;
            } else {
                var types = ['social', 'parttime', 'school'];
                console.log(types[experience.kind]);
                res.json({
                    success: true,
                    message: "操作成功！",
                    entity: types[experience.kind]
                });
            }
        });
    }
    ,
    deleteExperienceById: function (req, res) {
        var source = {
            experienceId: req.body.experienceId
        };
        Teacher.deleteExperience(source, function (err, result) {
            var resJson = {
                success: true,
                message: '操作成功！'
            };
            if (err) {
                resJson[success] = false;
                resJson[message] = err;
            }
            res.json(resJson);
        });
    }
    ,
    getCollege: function (req, res) {
        res.render(getView('college'), {title: 'College'});
    }
    ,
    searchCollege: function (req, res) {
        var sourceMap = {
            searchText: validData(req.body.college)
        };

        Teacher.searchCollege(sourceMap, function (err, result) {
            res.json({colleges: result});
        });
    }
    ,
    getEducation: function (req, res) {
        Teacher.getEducation(function (err, result) {
            console.log(result);
            res.render(getView('education'), {educations: result});
        });
    }
})
;


var getView = function getView(viewName) {
    var dir = 'weixin/teacher/';
    return path.join(dir, viewName);
};

var invalidReg = /select|drop|delete|insert|into|update|where|left|join|on|right/
var validData = function (text) {
    if (text.toLowerCase().match(invalidReg)) {
        return null;
    } else {
        return text.trim();
    }
};

var validateParams = function (data) {
    var errList = [];
    for (var name in data) {
        if (!data[name]) {
            errList.push(name + "不能为空！");
        }
    }
    return errList;
};


var getForm = function (path) {
    var form = formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = 'public/upload/' + path + '/';
    form.keepExtensions = true;
    form.maxFieldsSize = 2 * 1024 * 1024;
    return form;
};

var getExtName = function (type) {
    var extName = '';
    switch (type) {
        case 'image/pjpeg':
            extName = 'jpg';
            break;
        case 'image/jpeg':
            extName = 'jpg';
            break;
        case 'image/png':
            extName = 'png';
            break;
        case 'image/x-png':
            extName = 'png';
            break;
    }
    return extName;
};


var calPercentage = function calPercentage(data) {
    return Math.floor(100 * (_.filter(data, function (item) {
            if (item || item === 0) {
                return true;
            }
        }).length + 1) / 11);
};