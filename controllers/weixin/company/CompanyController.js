/**
 * Created by michel_feng on 15/10/21.
 */
var path = require('path');

var _ = require('underscore');
var moment = require('moment');

var CompanyModel = require('../../../models/weixin/company/CompanyModel');
var Company = new CompanyModel();

var company = function CompanyController() {
};
var getView = function (view) {
    var dir = "weixin/company/";
    return path.join(dir, view);
};
module.exports = company;

_.extend(company.prototype, {
    getTypeList:function(req,res) {
        Company.getTypeList( function (err, result) {
            if (err) {
                res.status(404);
            }
            res.json(result);
        });
    },
    getCityList:function(req,res) {
        Company.getCityList(function (err, result) {
            if (err) {
                res.status(404);
            }
            res.render(getView('city'), {lists: result});
        });
    },
    getProfile:function(req,res) {
        var jobId = req.query.jobId;
        var sign = req.query.sign;
        Company.getProfile(jobId, function (err, result) {
            if (err) {
                res.status(404);
            }
            result[0].start_time = new moment(result[0].start_time).format('YYYY/MM/DD');
            result[0].end_time = new moment(result[0].end_time).format('YYYY/MM/DD');
            result[0].publish_time = new moment(result[0].publish_time).format('YYYY/MM/DD');
            res.render(getView('profile'), {profile: result[0],sign:sign});
        });
    },
    getAreaList:function(req,res) {
        var cityCode = req.query.cityCode;
        Company.getAreaList(cityCode, function (err, result) {
            if (err) {
                res.status(404);
            }
            res.json(result);
        });
    },
    getJobList:function(req,res) {
        var conditions = [];
        conditions['city'] = req.query.city;
        conditions['type'] = req.query.type;
        conditions['area'] = req.query.area;
        conditions['time'] = req.query.time;
        conditions['sort'] = req.query.sort;

        Company.getJobList(conditions, function (err, result) {
            if (err) {
                console.log(err);
                res.status(404);
            }
            res.json(result);
        });
    },
    insertSign:function(req,res) {
        var conditions = [];
        conditions['jobId'] = req.query.jobId;
        conditions['teacherId'] = req.query.teacherId;
        async.auto({
            insertSign: function (callback) {
                Company.insertSign(conditions, function (err, result) {
                    if(err) {
                        callback(err);
                        return;
                    } else {
                        callback(null, true);
                    }
                });
            },
            updateCollection: ['insertSign', function (callback, results) {
                Company.updateCollection(conditions, function (err, result) {
                    if(err) {
                        callback(err);
                        return;
                    } else {
                        callback(null, true);
                    }
                });
            }]
        }, function (err, results) {
            if (err) {
                logger.error(err);
                throw err;
                return;
            }
            res.json(results.updateCollection);
        });
    },
    isSign:function(req,res) {
        var conditions = [];
        conditions[0] = req.query.jobId;
        conditions[1] = req.query.teacherId;
        Company.isSign(conditions, function (err, result) {
            if(err) {
                res.status(404);
            }
            res.json(result);
        });
    }
});