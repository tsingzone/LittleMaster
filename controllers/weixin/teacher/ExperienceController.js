/**
 * Created by michel_feng on 15/11/6.
 */

var BaseController = require('./BaseController');
var logger = require('../../../logger').logger('ExperienceController');

var ExperienceController = {
    createNew: function (teacherModel) {
        var experienceController = BaseController.createNew();
        experienceController.getExperienceList = function (req, res) {
            var type = req.params.type;
            var index = ['social', 'parttime', 'school'].indexOf(type);
            if (index != -1) {
                var source = {
                    kind: index,
                    teacherId: req.userIds.teacherId
                };
                teacherModel.getExperienceList(source, function (err, result) {
                    if (err) {
                        logger.error(err);
                    } else {
                        console.log(JSON.stringify(result));
                        res.render(experienceController.getView('experience'), {
                            title: type,
                            userIds: req.userIds,
                            experienceList: result
                        });
                    }
                });

            } else {
                res.status(404).end();
            }
        };
        experienceController.getAddExperience = function (req, res) {
            var type = req.params.type;
            var index = ['social', 'parttime', 'school'].indexOf(type);
            if (index != -1) {
                res.render(experienceController.getView('experience_add'), {
                    kind: index,
                    userIds: req.userIds
                });
            } else {
                res.status(404).end();
            }
        };
        experienceController.saveExperience = function (req, res) {
            var experience = {
                title: req.body.name,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                description: req.body.description,
                kind: req.body.kind,
                status: 1,
                teacherId: req.body.teacherId
            };
            teacherModel.saveExperience(experience, function (err, result) {
                if (err) {
                    logger.error(err);
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
        };
        experienceController.deleteExperienceById = function (req, res) {
            var source = {
                experienceId: req.body.experienceId
            };
            teacherModel.deleteExperienceById(source, function (err, result) {
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
        };
        return experienceController;
    }
};

module.exports = ExperienceController;