/**
 * Created by michel_feng on 15/10/21.
 */

var teacher = function TeacherController(){
  this.name = "teacher";
};

module.exports = teacher;

teacher.prototype.getName = function(){
    return this.name;
}

