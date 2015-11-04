/**
 * Created by GXP on 2015/11/2.
 */
var _ = require('underscore');
var async = require('async');

var DBUtils = require('../../../db_utils');

var company = function CompanyModel() {
    this.name = 'CompanyModel';
};
module.exports = company;

_.extend(company.prototype, {
    getList: function(screeningArr) {
        //city,type,area,time,sort
    }
});