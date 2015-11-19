/**
 * Created by michel_feng on 15/10/21.
 */
var path = require('path');

var _ = require('underscore');
var moment = require('moment');
var async = require('async');

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
        var conditions = [];
        conditions[0] = req.query.jobId;
        conditions[1] = req.query.teacherId;
        var sign = req.query.sign;
        async.parallel({
            getProfile: function (callback) {
                Company.getProfile(conditions[0], function (err, result) {
                    result[0].start_time = new moment(result[0].start_time).format('YYYY/MM/DD');
                    result[0].end_time = new moment(result[0].end_time).format('YYYY/MM/DD');
                    result[0].publish_time = new moment(result[0].publish_time).format('YYYY/MM/DD');
                    if (err) {
                        res.status(404);
                    } else {
                        callback(null, result[0]);
                    }

                });
            },
            isCollection: function (callback, results) {
                Company.isCollection(conditions, function (err, result) {
                    if (err) {
                        res.status(404);
                    } else {
                        if(result.length > 0) {
                            callback(null, true);
                        } else {
                            callback(null, false);
                        }

                    }
                });
            }
        }, function (err, results) {
            if (err) {
                logger.error(err);
                throw err;
                return;
            }
            res.render(getView('profile'), {profile: results.getProfile,sign:sign,collection:results.isCollection});
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
        conditions[0] = req.query.jobId;
        conditions[1] = req.query.teacherId;
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
            deleteCollection: ['insertSign', function (callback, results) {
                Company.deleteCollection(conditions, function (err, result) {
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
            res.json(results.deleteCollection);
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
    },
    collection:function(req,res) {
        var conditions = [];
        conditions[0] = req.query.jobId;
        conditions[1] = req.query.teacherId;
        async.auto({
            selectCollectionRecord: function (callback) {
                Company.selectCollectionRecord(conditions, function (err, result) {
                    if(result.length > 0) {
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }
                });
            },
            setCollection: ['selectCollectionRecord', function (callback, results) {
                if(results.selectCollectionRecord) {
                    Company.reviveCollection(conditions, function (err, result) {
                        if(err) {
                            callback(err);
                            return;
                        } else {
                            callback(null, true);
                        }
                    });
                } else {
                    Company.insertCollection(conditions, function (err, result) {
                        if(err) {
                            callback(err);
                            return;
                        } else {
                            callback(null, true);
                        }
                    });
                }
            }]
        }, function (err, results) {
            if (err) {
                logger.error(err);
                throw err;
                return;
            }
                res.json(results.setCollection);
        });
    },
    deleteCollection: function (req,res) {
        var conditions = [];
        conditions[0] = req.query.jobId;
        conditions[1] = req.query.teacherId;
        Company.deleteCollection(conditions, function (err, result) {
            if(err) {
                res.status(404);
            }
            res.json(result);
        });
    },
    getSchedule: function (req,res) {
        var jobId = req.query.jobId;
        var signId = req.query.signId;
        async.parallel({
            getSignJob: function (callback, results) {
                Company.getSignJob(jobId, function (err, result) {
                    if(err) {
                        callback(err);
                        return;
                    } else {
                        callback(null, result);
                    }
                });

            },
            getSignLog: function (callback, results) {
                Company.getSignLog(signId, function (err, result) {
                    if(err) {
                        callback(err);
                        return;
                    } else {
                        callback(null, result);
                    }
                });
            }
        }, function (err, results) {
            if (err) {
                logger.error(err);
                throw err;
                return;
            }
            results.getSignJob[0].start_time = new moment(results.getSignJob[0].start_time).format('YYYY/MM/DD');
            results.getSignJob[0].end_time = new moment(results.getSignJob[0].end_time).format('YYYY/MM/DD');
            results.getSignJob[0].publish_time = new moment(results.getSignJob[0].publish_time).format('YYYY/MM/DD');
            res.render(getView('schedule'), {job: results.getSignJob[0],log: results.getSignLog});
        });
    }
});