/**
 * Created by michel_feng on 15/10/21.
 */
var _ = require('underscore');
var Teacher = require('../../../models/weixin/teacher/Teacher');

var teacher = function TeacherController() {
    this.name = "teacher";
};

module.exports = teacher;

teacher.prototype.getName = function () {
    return this.name;
}

_.extend(teacher.prototype, {
    getUserCenterData: function (sourceMap, callback) {
        Teacher.getUserCenterData(sourceMap, function (err, result) {
            callback(result[0]);
        });
    },
});

