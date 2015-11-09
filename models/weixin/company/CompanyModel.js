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
    getJobList: function(conditions,callback) {
        //city,type,area,time,sort
        console.log(conditions);
        var sql = "select j.start_time,j.end_time,j.title,j.address,j.gender,j.salary,j.treatment,p.name as typeName,"
                + "t.name as salaryName,s.name as settlementName from company_job as j join sys_salary_type as t on "
                + "j.salary_type = t.id join sys_position as p on j.position_id = p.id join sys_settlement as s on "
                + "j.settlement_id = s.id where city = '" + conditions['city'] + "'";
        if(conditions['type']) {
            sql += "and position_id = " + conditions['type'];
        }
        if(conditions['area']) {
            sql += "and area = " + conditions['area'];
        }
        if(conditions['time']) {
            sql += "and start_time < " + conditions['time'] + "and end_time > " + conditions['time'];
        }
        if(conditions['sort']) {
            sql += "order by ";
        }
        DBUtils.getDBConnection().query(sql, [], callback);
    }
});