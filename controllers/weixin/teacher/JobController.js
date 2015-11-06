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
                res.render(getView('sign'), {jobList: result[0]});
            });
        };
        jobController.getCollectJobs = function (req, res) {
            var source = {
                teacherId: req.teacherId
            };
            teacherModel.getCollectJobs(source, function (err, result) {
                if (err) {

                }
                res.render(getView('collect'), {jobList: result[0]});
            });
        };
        return jobController;
    }
};

module.exports = JobController;