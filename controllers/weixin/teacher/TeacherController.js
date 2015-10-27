/**
 * Created by michel_feng on 15/10/21.
 */
var _ = require('underscore');
var TeacherModel = require('../../../models/weixin/teacher/TeacherModel');
var Teacher = new TeacherModel();
var path = require('path');

var teacher = function TeacherController() {
};

module.exports = teacher;

_.extend(teacher.prototype, {
    getUserCenterData: function (req, res) {
        var id = req.id;
        var sourceMap = {"id": id};
        Teacher.getUserCenterData(sourceMap, function (err, result) {
            console.log(result);
            res.render(getView("teacher"), {title: result});
        });
    },
    getProfile: function (req, res) {
        var id = req.id;
        var sourceMap = {"id": id};
        Teacher.getProfile(sourceMap, function (err, result) {
            res.render(getView("profile"), {title: "profile"});
        });
    },
    getProfileHead: function (req, res) {
        res.render(getView("upload"), {title: "Upload"});
    },
    getProfileMobile: function (req, res) {
        res.render(getView("bind"), {title: "Bind"});
    },
    getSignJobs: function (req, res) {
        var source = {
            teacherId: req.teacherId
        };
        var jobList = [{
            id: 1,
            teacherId: req.teacherId,
            title: "Title",
            position: "批改",
            startTime: "2015-10-10",
            endTime: "2015-10-11",
            gender: 0,
            sallary: 100,
            sallaryType: "元/天",
            settlement: "日结",
            address: "网络"
        }];
        Teacher.getSignJobs(source, function (err, result) {
            res.render(getView("sign"), {jobList: jobList});
        });

    },
    getCollectJobs: function (req, res) {
        var source = {
            teacherId: req.teacherId
        };
        var jobList = [{
            id: 1,
            teacherId: req.teacherId,
            title: "Title",
            position: "批改",
            startTime: "2015-10-10",
            endTime: "2015-10-11",
            gender: 0,
            sallary: 100,
            sallaryType: "元/天",
            settlement: "日结",
            address: "网络"
        }];
        Teacher.getCollectJobs(source, function (err, result) {
            res.render(getView("collect"), {jobList: jobList});
        });
    },
    getDiploma: function (req, res) {
        var types = ["teacher", "other"];
        var type = req.params.type;
        if (types.indexOf(type) != -1) {
            res.render(getView('diploma'), {title: type});
        } else {
            res.status(404).end();
        }
    },
    getAddDiploma: function (req, res) {
        var types = ["teacher", "other"];
        var type = req.params.type;
        if (types.indexOf(type) != -1) {
            res.render(getView('diploma_add_' + type), {title: type});
        } else {
            res.status(404).end();
        }
    },
    getAddDiplomaSubType: function (req, res) {
        var types = ["major", "period"];
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
                message: "",
                entity: ""
            };
            if (err) {
                resJson[success] = false;
                resJson[message] = err;
            }
            res.json(resJson);
        });
    },
    getExperience: function (req, res) {
        var types = ["social", "parttime", "school"];
        var type = req.params.type;
        if (types.indexOf(type) != -1) {
            res.render(getView('experience'), {title: type});
        } else {
            res.status(404).end();
        }
    },
    getAddExperience: function (req, res) {
        var types = ["social", "parttime", "school"];
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
                message: "",
                entity: ""
            };
            if (err) {
                resJson[success] = false;
                resJson[message] = err;
            }
            res.json(resJson);
        });
    },
    getCollege: function (req, res) {
        res.render(getView("college"), {title: "College"});
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
            res.render(getView("education"), {educations: result});
        });
    }
});


var getView = function getView(viewName) {
    var dir = "weixin/teacher/";
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

