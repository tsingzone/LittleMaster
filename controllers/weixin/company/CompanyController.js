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

module.exports = company;

_.extend(company.prototype, {
    getTypeList:function(req,res) {
        var item = req.query.item;
        Company.getTypeList(item, function (err, result) {
            if (err) {
                res.status(404);
            }
            res.json(result);
        });
    }
});