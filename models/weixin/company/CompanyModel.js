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
    //获取地区列表
    getAreaList: function(cityCode,callback) {
        var sql = "select id,area from sys_area where status = 1 and city_code = ?";
        DBUtils.getDBConnection().query(sql, [cityCode], callback);
    },
    //获取兼职详情
    getProfile: function(jobId,callback) {
        var sql = "select c.name as companyName,j.hire_count,j.publish_time,j.content,j.treatment,j.requirement,j.id,"
            + "j.start_time,j.end_time,j.title,j.address,j.gender,j.salary,j.treatment,j.position_id,p.name as typeName"
            + ",t.name as salaryName,s.name as settlementName from company_job as j join sys_salary_type as t on"
            + " j.salary_type = t.id join sys_position as p on j.position_id = p.id join sys_settlement as s on"
            + " j.settlement_id = s.id join company_infor as c on j.company_id = c.id where j.status = 1 and j.id = ?";
        DBUtils.getDBConnection().query(sql, [jobId], callback);
    },
    //获取兼职列表
    getJobList: function(conditions,callback) {
        //city,type,area,time,sort
        console.log(conditions);
        var sql = "select j.id,j.start_time,j.end_time,j.title,j.address,j.gender,j.salary,j.treatment,j.position_id,p.name"
                + " as typeName,t.name as salaryName,s.name as settlementName from company_job as j join sys_salary_type"
                + " as t on j.salary_type = t.id join sys_position as p on j.position_id = p.id join sys_settlement as"
                + " s on j.settlement_id = s.id where city = '" + conditions['city'] + "'";
        if(conditions['type']) {
            sql += " and position_id = " + conditions['type'];
        }
        if(conditions['area']) {
            sql += " and area = '" + conditions['area'] + "'";
        }
        if(conditions['time']) {
            sql += " and start_time < " + conditions['time'] + "and end_time > " + conditions['time'];
        }
        switch (conditions['sort']) {
            case "最新发布":
                sql += " order by publish_time desc";
                break;
            case "日结优先":
                sql += " order by settlement_id";
                break;
            default :
                sql += " order by sort desc";
                break;
        }
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    //添加报名记录
    insertSign: function(conditions,callback) {
        console.log(conditions);
        var sql = "insert into teacher_sign(job_id,teacher_id,add_time,progress,status) values(?,?,now(),1,1)";
        DBUtils.getDBConnection().query(sql, conditions, callback);
    },
    //查询是否有过收藏记录
    selectCollectionRecord: function(conditions,callback) {
        var sql = "select id from teacher_collection where job_id = ? and teacher_id = ?";
        DBUtils.getDBConnection().query(sql, conditions, callback);
    },
    //查询是否已收藏
    isCollection: function(conditions,callback) {
        var sql = "select id from teacher_collection where status = 1 and job_id = ? and teacher_id = ?";
        DBUtils.getDBConnection().query(sql, conditions, callback);
    },
    //添加新的收藏记录
    insertCollection: function(conditions,callback) {
        var sql = "insert into teacher_collection(job_id,teacher_id,add_time,status) values(?,?,now(),1)";
        DBUtils.getDBConnection().query(sql, conditions, callback);
    },
    //将失效的收藏记录设置为有效
    reviveCollection: function(conditions,callback) {
        var sql = "update teacher_collection set status = 1 where job_id = ? and teacher_id = ?";
        DBUtils.getDBConnection().query(sql, conditions, callback);
    },
    //将收藏状态设置为失效
    deleteCollection: function(conditions,callback) {
        var sql = "update teacher_collection set status = 0 where job_id = ? and teacher_id = ?";
        DBUtils.getDBConnection().query(sql, conditions, callback);
    },
    //查询是否已报名
    isSign: function(conditions,callback) {
        var sql = "select id from teacher_sign where status = 1 and job_id = ? and teacher_id = ? and progress > 0";
        DBUtils.getDBConnection().query(sql, conditions, callback);
    },
    //获取已报名兼职信息
    getSignJob: function(jobId,callback) {
        var sql = "select j.id,j.start_time,j.end_time,j.title,j.address,j.gender,j.salary,j.treatment,j.position_id,p.name"
            + " as typeName,t.name as salaryName,s.name as settlementName from company_job as j join sys_salary_type"
            + " as t on j.salary_type = t.id join sys_position as p on j.position_id = p.id join sys_settlement as"
            + " s on j.settlement_id = s.id where j.id = ?";
        DBUtils.getDBConnection().query(sql, [jobId], callback);
    },
    //获取报名进度
    getSignLog: function(signId,callback) {
        var sql = "select add_time from teacher_sign_log where sign_id = ? order by status";
        DBUtils.getDBConnection().query(sql, [signId], callback);
    }

});