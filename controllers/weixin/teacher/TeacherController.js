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
    searchCollege: function (req, res) {
        var sourceMap = {
            searchText: validData(req.body.college)
        };
        var collegesMap = {
            '北京':{
                1: '北大',
                2: '清华'
            },
            '山东':{
                3: '山大',
                4: '山师'
            }
        };
        var tmp = collegesMap[sourceMap.searchText];
        res.json({colleges: tmp});
        //Teacher.searchCollege(sourceMap, function (err, result) {
        //    if(err){
        //
        //    }
        //    var collegesMap = {
        //        '北京':{
        //            1: '北大',
        //            2: '清华'
        //        },
        //        '山东':{
        //            3: '山大',
        //            4: '山师'
        //        }
        //    };
        //    var tmp = collegesMap[sourceMap.searchText];
        //    res.send({colleges: tmp});
        //});
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

var invalidReg =  /select|drop|delete|insert|into|update|where|left|join|on|right/
var validData = function (text) {
    if(text.toLowerCase().match(invalidReg)){
        return null;
    }else{
        return text.trim();
    }
}