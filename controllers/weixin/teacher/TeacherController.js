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
    getProfile: function(req, res){
        var id = req.id;
        var sourceMap = {"id": id};
        Teacher.getProfile(sourceMap, function(err, result){
            res.render(getView("profile"), {title: "profile"});
        });
    }
});


var getView = function getView(viewName){
    var dir = "weixin/teacher/";
    return path.join(dir, viewName);
};