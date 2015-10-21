/**
 * Created by michel_feng on 15/10/21.
 */
var express = require('express');
var router = express.Router();
var teacherController = require('../../controllers/TeacherController');

router.get('/', function (req, res) {
    console.log("teacher.js /")
    res.render('teacher', {title: "Teacher"});
});

router.get('/get', function (req, res) {
    console.log("teacher.js get");
    res.render('teacher', {title: "get"});
});

module.exports = router;