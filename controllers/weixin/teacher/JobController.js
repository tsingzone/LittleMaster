/**
 * Created by michel_feng on 15/11/6.
 */

var BaseController = require('./BaseController');

var JobController = {

    createNew: function (teacherModel) {
        var jobController = BaseController.createNew();
        jobController.getSignJobs = function (req, res) {
            var source = {
                teacherId: req.teacherId
            };

            teacherModel.getSignJobs(source, function (err, result) {
                if (err) {

                }
                res.render(jobController.getView('sign'), {
                    jobList: result[0],
                    userIds: req.userIds
                });
            });
        };
        jobController.getCollectJobs = function (req, res) {
            var source = {
                teacherId: req.teacherId
            };
            teacherModel.getCollectJobs(source, function (err, result) {
                if (err) {

                }
                res.render(jobController.getView('collect'), {
                    jobList: result[0],
                    userIds: req.userIds
                });
            });
        };
        return jobController;
    }
};

module.exports = JobController;