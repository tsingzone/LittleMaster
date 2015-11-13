/**
 * Created by michel_feng on 15/11/6.
 */

var BaseController = require('./BaseController');
var logger = require('../../../logger').logger('ExperienceController');

var ExperienceController = {
    createNew: function (teacherModel) {
        var experienceController = BaseController.createNew();

        var experienceTypes = ['social', 'parttime', 'school'];

        var checkType = function (req, res) {
            var type = req.params.type;
            var index = experienceTypes.indexOf(type);
            if (index == -1) {
                experienceController.errorHandler(new Error('选择类型不合法！'), res);
            }
            return {type: type, index: index};
        };

        /**
         * 根据教师id和类型获取对应的经历列表
         * @param req
         * @param res
         */
        experienceController.getExperienceList = function (req, res) {
            var valid = checkType(req, res);
            teacherModel.getExperienceList({
                kind: valid.index,
                teacherId: req.userIds.teacherId
            }, function (err, result) {
                experienceController.errorHandler(err, res);
                res.render(experienceController.getView('experience'), {
                    title: valid.type,
                    userIds: req.userIds,
                    experienceList: result
                });
            });
        };

        /**
         * 跳转到添加经历页面
         * @param req
         * @param res
         */
        experienceController.getAddExperience = function (req, res) {
            var valid = checkType(req, res);
            res.render(experienceController.getView('experience_add'), {
                kind: valid.index,
                userIds: req.userIds
            });
        };

        /**
         * 保存经历信息
         * @param req
         * @param res
         */
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

            var isValid = experienceController.validateParams(experience);
            if (!isValid) {
                experienceController.errorHandler(new Error('经历信息填写有误！'), res, true);
            }

            teacherModel.saveExperience(experience, function (err, result) {
                experienceController.errorHandler(err, res, true);
                res.json({
                    success: true,
                    message: "操作成功！",
                    entity: experienceTypes[experience.kind]
                });
            });
        };

        /**
         * 根据经历id删除对应的经历信息
         * @param req
         * @param res
         */
        experienceController.deleteExperienceById = function (req, res) {
            teacherModel.deleteExperienceById({
                experienceId: req.body.experienceId
            }, function (err, result) {
                experienceController.errorHandler(err, res, true);
                res.json({
                    success: true,
                    message: '操作成功！'
                });
            });
        };
        return experienceController;
    }
};

module.exports = ExperienceController;