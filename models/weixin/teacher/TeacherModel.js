/**
 * Created by michel_feng on 15/10/22.
 */
var DBUtils = require('../../../db_utils');
var _ = require('underscore');
var async = require('async');

var teacher = function TeacherModel() {

};
module.exports = teacher;

_.extend(teacher.prototype, {
    getUserCenterData: function (source, callback) {

        var sqlArray = [
            {
                // 获取微信信息
                sql: "\
                    select \
                        id,\
                        open_id as openId,\
                        nickname as nickName,\
                        head_img as headImg\
                    from \
                        weixin_user\
                    where \
                        id = ?\
                        and status = 1",
                params: [source.userId]
            },
            {
                // 获取简历完成度
                sql: "select \
                        1 + 1 as result\
                     ",
                params: [source.userId]
            },
            {
                // 获取已报名兼职数
                sql: "",
                params: []
            },
            {
                // 获取已收藏兼职数
                sql: "",
                params: []
            }
        ];
        parallelFuncs([
                function (callback) {
                    DBUtils.getDBConnection().query(sqlArray[0].sql,
                        sqlArray[0].params,
                        function (err, result) {
                            callback(err, result)
                        });
                },
                function (callback) {
                    DBUtils.getDBConnection().query(sqlArray[1].sql,
                        sqlArray[1].params,
                        function (err, result) {
                            callback(err, result)
                        });
                }
            ], callback
        );
    },
    getProfile: function (source, callback) {
        var sql = "select 1+1 as result";
        DBUtils.getDBConnection().query(sql, [source.profileId], callback);
    },
    getEducation: function (callback) {
        var sql = "select id, name from sys_education where status = 1";
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    searchCollege: function (source, callback) {
        var sql = "select id, name from sys_college where name like ? or province = ? limit 10";
        DBUtils.getDBConnection().query(sql, ["%" + source.searchText + "%", source.searchText], callback);
    },
    getSignJobs: function (source, callback) {
        var sql = "\
        select \
            teacher_sign.id as id,\
            teacher_sign.teacher_id as teacherId, \
            company_job.title as title,\
            sys_position.`name` as position,\
            company_job.start_time as startTime,\
            company_job.end_time as endTime,\
            company_job.gender as gender,\
            company_job.sallary as sallary,\
            sys_sallary_type.`name` as sallaryType,\
            sys_settlement.name as settlement,\
            company_job.address\
        FROM teacher_sign\
        left join company_job\
        on teacher_sign.job_id = company_job.id\
        left join sys_position\
        on sys_position.id = company_job.position_id\
        left join sys_sallary_type\
        on sys_sallary_type.id = company_job.sallary_type\
        left join sys_settlement\
        on sys_settlement.id = company_job.settlement_id\
        where teacher_sign.teacher_id = ?";
        DBUtils.getDBConnection().query(sql, [source.teacherId], callback);
    },
    getCollectJobs: function (source, callback) {
        var sql = "\
        select \
            teacher_sign.id as id,\
            teacher_sign.teacher_id as teacherId, \
            company_job.title as title,\
            sys_position.`name` as position,\
            company_job.start_time as startTime,\
            company_job.end_time as endTime,\
            company_job.gender as gender,\
            company_job.sallary as sallary,\
            sys_sallary_type.`name` as sallaryType,\
            sys_settlement.name as settlement,\
            company_job.address\
        FROM teacher_sign\
        left join company_job\
        on teacher_sign.job_id = company_job.id\
        left join sys_position\
        on sys_position.id = company_job.position_id\
        left join sys_sallary_type\
        on sys_sallary_type.id = company_job.sallary_type\
        left join sys_settlement\
        on sys_settlement.id = company_job.settlement_id\
        where teacher_sign.teacher_id = ?";
        DBUtils.getDBConnection().query(sql, [source.teacherId], callback);
    },
    getDiploma: function (source, callback) {
        var sql = "select \
                teacher_diploma.id as id,\
                teacher_diploma.teacher_id as teacherId,\
                teacher_diploma.number as number,\
                teacher_diploma.achieve_time as achieveTime,\
                sys_diploma.name as diplomaName,\
                teacher_diploma.period as period,\
                teacher_diploma.major as major,\
                teacher_diploma.img_path as imgPath\
            from teacher_diploma\
            left join sys_diploma\
            on sys_diploma.id = teacher_diploma.diploma_id\
            where \
                teacher_id = ? \
                and kind = ?\
                and status <> -1";
        DBUtils.getDBConnection().query(sql, [source.teacherId, source.kind], callback);
    },
    deleteDiploma: function (source, callback) {
        var sql = "update teacher_diploma set status = -1 where id = ?";
        DBUtils.getDBConnection().query(sql, [source.diplomaId], callback);
    },

    deleteExperience: function (source, callback) {
        var sql = "update teacher_experience set status = -1 where id = ?";
        DBUtils.getDBConnection().query(sql, [source.experienceId], callback);
    },
    getMajorList: function (callback) {
        var sql = "select id, name from sys_major where status = 1";
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    getPeriodList: function (callback) {
        var sql = "select id, name from sys_period where status = 1";
        DBUtils.getDBConnection().query(sql, [], callback);
    }
});

var parallelFuncs = function (funcs, callback) {
    async.parallel(funcs,
        function (err, results) {
            callback(err, results);
        });
};