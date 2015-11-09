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
    }
});