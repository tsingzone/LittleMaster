/**
 * Created by michel_feng on 15/10/21.
 */
var _ = require('underscore');
var Teacher = require('../../../models/weixin/teacher/Teacher');
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
        res.render(getView("sign"), {title: "Sign"});
    },
    getCollectJobs: function (req, res) {
        res.render(getView("collect"), {title: "Collect"});
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
    getExperience: function (req, res) {
        var types = ["social", "parttime", "school"];
        var type = req.params.type;
        if (types.indexOf(type) != -1) {
            res.render(getView('experience'), {title: type});
        } else {
            res.status(404).end();
        }
    },
    getCollege: function (req, res) {
        res.render(getView("college"), {title: "College"});
    },
    getEducation: function (req, res) {
        res.render("weixin/teacher/education", {title: "Education"});
    }
});


var getView = function getView(viewName) {
    var dir = "weixin/teacher/";
    return path.join(dir, viewName);
};