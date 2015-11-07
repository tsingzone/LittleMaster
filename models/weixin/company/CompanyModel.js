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
    getTypeList: function(callback) {
        var sql = "select id,name from sys_position where status = 1";
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    //获取城市列表
    getCityList: function(callback) {
        var sql = "select code,city from sys_city where status = 1";
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    getAreaList: function(cityCode,callback) {
        var sql = "select id,area from sys_area where status = 1 and city_code = ?";
        DBUtils.getDBConnection().query(sql, [cityCode], callback);
    },
    //获取兼职列表
    getJobList: function(screeningArr) {
        //city,type,area,time,sort
    }
});