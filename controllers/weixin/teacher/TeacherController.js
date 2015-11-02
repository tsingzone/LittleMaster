/**
 * Created by michel_feng on 15/10/21.
 */
var path = require('path');

var _ = require('underscore');
var moment = require('moment');

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

        var calPercentage = function calPercentage(data) {
            return Math.floor(100 * (_.filter(data, function (item) {
                    if (item) {
                        return true;
                    }
                }).length + 1) / 11);
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
                var diploma = result[1];
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

                var experience = result[2];
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
                    res.json({success: true, message: ""});
                }
            });
        } else {
            res.json({success: false, message: isParamsOk});
        }
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
        if (types.indexOf(type) != -1) {
            res.render(getView('diploma'), {title: type});
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
    getAddDiplomaSubType: function (req, res) {
        var types = ['major', 'period'];
        var type = req.params.type;
        var index = types.indexOf(type);
        switch (index) {
            case 0:
                Teacher.getMajorList(function (err, result) {
                    res.render(getView(type), {title: type, subList: result});
                });
                break;
            case 1:
                Teacher.getPeriodList(function (err, result) {
                    res.render(getView(type), {title: type, subList: result});
                });
                break;
            default :
                res.status(404).end();
        }
    },
    deleteDiplomaById: function (req, res) {
        var source = {
            diplomaId: req.params.diplomaId
        };
        Teacher.deleteDiploma(source, function (err, result) {
            var resJson = {
                success: true,
                message: '',
                entity: ''
            };
            if (err) {
                resJson[success] = false;
                resJson[message] = err;
            }
            res.json(resJson);
        });
    },
    getExperience: function (req, res) {
        var types = ['social', 'parttime', 'school'];
        var type = req.params.type;
        if (types.indexOf(type) != -1) {
            res.render(getView('experience'), {title: type});
        } else {
            res.status(404).end();
        }
    },
    getAddExperience: function (req, res) {
        var types = ['social', 'parttime', 'school'];
        var type = req.params.type;
        if (types.indexOf(type) != -1) {
            res.render(getView('experience_add'), {title: type});
        } else {
            res.status(404).end();
        }
    },
    deleteExperienceById: function (req, res) {
        var source = {
            experienceId: req.params.experienceId
        };
        Teacher.deleteExperience(source, function (err, result) {
            var resJson = {
                success: true,
                message: '',
                entity: ''
            };
            if (err) {
                resJson[success] = false;
                resJson[message] = err;
            }
            res.json(resJson);
        });
    },
    getCollege: function (req, res) {
        res.render(getView('college'), {title: 'College'});
    },
    searchCollege: function (req, res) {
        var sourceMap = {
            searchText: validData(req.body.college)
        };

        Teacher.searchCollege(sourceMap, function (err, result) {
            res.json({colleges: result});
        });
    },
    getEducation: function (req, res) {
        Teacher.getEducation(function (err, result) {
            console.log(result);
            res.render(getView('education'), {educations: result});
        });
    }
});


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
