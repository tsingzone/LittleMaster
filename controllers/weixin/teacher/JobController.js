/**
 * Created by michel_feng on 15/11/6.
 */

var BaseController = require('./BaseController');
var logger = require('../../../logger').logger('JobController');

var JobController = {
    createNew: function (teacherModel) {
        var jobController = BaseController.createNew();

        /**
         * 根据教师id获取报名的兼职信息列表
         * @param req
         * @param res
         */
        jobController.getSignJobs = function (req, res) {
            teacherModel.getSignJobs({
                teacherId: req.userIds.teacherId
            }, function (err, result) {
                if(err){
                    logger.error(err);
                    throw err;
                    return;
                }
                res.render(jobController.getView('sign'), {
                    jobList: result,
                    userIds: req.userIds
                });
            });
        };

        /**
         * 根据教师id获取收藏的兼职信息列表
         * @param req
         * @param res
         */
        jobController.getCollectJobs = function (req, res) {
            teacherModel.getCollectJobs({
                teacherId: req.userIds.teacherId
            }, function (err, result) {
                if(err){
                    logger.error(err);
                    throw err;
                    return;
                }
                res.render(jobController.getView('collect'), {
                    jobList: result,
                    userIds: req.userIds
                });
            });
        };
        return jobController;
    }
};

module.exports = JobController;