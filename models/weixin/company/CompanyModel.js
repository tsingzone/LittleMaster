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
    //获取类型列表
    getTypeList: function(item,callback) {
        var sql = "select id,name from sys_position where status = 1";
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    //获取兼职列表
    getJobList: function(screeningArr) {
        //city,type,area,time,sort
    }
});