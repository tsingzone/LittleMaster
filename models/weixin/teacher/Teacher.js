/**
 * Created by michel_feng on 15/10/22.
 */
var DBUtils = require('../../../db_utils');
var _ = require('underscore');

var Teacher = {
    getUserCenterData: function (source, callback) {
        var sql = "select \
                        weixin_user.id as id,\
                        weixin_user.nickname as nickname,\
                        weixin_user.head_img as headImg,\
                        teacherSign.teacher_id as teacherId,\
                        teacherSign.signCount as signCount,\
                        teacherCollect.collectCount as collectCount\
                    from weixin_user\
                    left join (\
                        select id from teacher_infor\
                    ) as teacher\
                    on weixin_user.id = teacher.user_id\
                    left join (\
                        select count(id) as signCount, teacher_id from teacher_sign\
                        where teacher_sign.`status` = 1 and teacher_sign.progress <> 0\
                    ) as teacherSign\
                    on teacher.id = teacherSign.teacher_id\
                    left join (\
                        select count(id) as collectCount, teacher_id from teacher_sign\
                        where teacher_sign.`status` = 1 and teacher_sign.progress = 0 and teacher_sign.collection = 1\
                    ) as teacherCollect\
                    on teacher.id = teacherCollect.teacher_id\
                    where weixin_user.id = ?";
        DBUtils.getDBConnection().query(sql, [source.id], callback);
    },
    getProfile: function (source, callback) {
        var sql = "select 1+1 as result";
        DBUtils.getDBConnection().query(sql, [source.id], callback);
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
    }
};


module.exports = Teacher;