/**
 * Created by michel_feng on 15/11/6.
 */

var DBUtils = require('../../../db_utils');
var logger = require('../../../logger').logger('JobModel');
var BaseModel = require('./BaseModel');

var JobModel = {
    createNew: function () {
        var jobModel = BaseModel.createNew();

        /**
         * 根据teacher_id获取报名的兼职信息列表
         * @param source
         * @param callback
         */
        jobModel.getSignJobs = function (source, callback) {
            var sql = 'select teacher_sign.id as id, teacher_sign.teacher_id as teacherId, company_job.title as title, '
                + ' sys_position.`name` as position, company_job.start_time as startTime, company_job.end_time as endTime, '
                + ' company_job.gender as gender, company_job.sallary as sallary, sys_sallary_type.`name` as sallaryType, '
                + ' sys_settlement.name as settlement, company_job.address '
                + ' FROM teacher_sign '
                + ' left join company_job on teacher_sign.job_id = company_job.id '
                + ' left join sys_position on sys_position.id = company_job.position_id '
                + ' left join sys_sallary_type on sys_sallary_type.id = company_job.sallary_type '
                + ' left join sys_settlement on sys_settlement.id = company_job.settlement_id '
                + ' where teacher_sign.teacher_id = ?';
            DBUtils.getDBConnection().query(sql, [source.teacherId],
                function (err, result) {
                    if (err) {
                        logger.error(err);
                        return;
                    }
                    callback(null, result);
                });
        };

        /**
         * 根据teacher_id获取收藏的兼职信息列表
         * @param source
         * @param callback
         */
        jobModel.getCollectJobs = function (source, callback) {
            var sql = 'select '
                + ' teacher_sign.id as id,'
                + ' teacher_sign.teacher_id as teacherId, '
                + ' company_job.title as title,'
                + ' sys_position.`name` as position,'
                + ' company_job.start_time as startTime,'
                + ' company_job.end_time as endTime,'
                + ' company_job.gender as gender,'
                + ' company_job.sallary as sallary,'
                + ' sys_sallary_type.`name` as sallaryType,'
                + ' sys_settlement.name as settlement,'
                + ' company_job.address'
                + ' FROM teacher_sign'
                + ' left join company_job'
                + ' on teacher_sign.job_id = company_job.id'
                + ' left join sys_position'
                + ' on sys_position.id = company_job.position_id'
                + ' left join sys_sallary_type'
                + ' on sys_sallary_type.id = company_job.sallary_type'
                + ' left join sys_settlement'
                + ' on sys_settlement.id = company_job.settlement_id'
                + ' where teacher_sign.teacher_id = ?';
            DBUtils.getDBConnection().query(sql, [source.teacherId],
                function (err, result) {
                    if (err) {
                        logger.error(err);
                        return;
                    }
                    callback(null, result);
                });
        };

        /**
         * 根据教师id获取报名兼职数量
         * @param teacherId
         * @param callback
         */
        jobModel.getSignJobsCount = function (teacherId, callback) {
            var sql = 'select ifnull(count(teacher_sign.id), 0) as signCount'
                + ' FROM teacher_sign '
                + ' left join company_job '
                + ' on teacher_sign.job_id = company_job.id '
                + ' left join sys_position '
                + ' on sys_position.id = company_job.position_id '
                + ' left join sys_sallary_type '
                + ' on sys_sallary_type.id = company_job.sallary_type '
                + ' left join sys_settlement '
                + ' on sys_settlement.id = company_job.settlement_id '
                + ' where teacher_sign.teacher_id = ? '
                + ' and company_job.`status` <> -1 '
                + ' and teacher_sign.`status` <> -1 '
                + ' and teacher_sign.progress <> 0 ';
            jobModel.queryDb({
                sql: sql,
                params: [teacherId]
            }, callback);
        };

        /**
         * 根据教师id获取收藏兼职数量
         * @param teacherId
         * @param callback
         */
        jobModel.getCollectJobsCount = function (teacherId, callback) {
            var sql = 'select  ifnull(count(teacher_sign.id), 0) as collectCount '
                + ' FROM teacher_sign '
                + ' left join company_job '
                + ' on teacher_sign.job_id = company_job.id '
                + ' left join sys_position '
                + ' on sys_position.id = company_job.position_id '
                + ' left join sys_sallary_type '
                + ' on sys_sallary_type.id = company_job.sallary_type '
                + ' left join sys_settlement '
                + ' on sys_settlement.id = company_job.settlement_id '
                + ' where teacher_sign.teacher_id = ? '
                + ' and company_job.`status` <> -1 '
                + ' and teacher_sign.`status` <> -1 '
                + ' and teacher_sign.progress = 0 '
                + ' and teacher_sign.collection = 1 ';
            jobModel.queryDb({
                sql: sql,
                params: [teacherId]
            }, callback);
        };

        return jobModel;
    }
};

module.exports = JobModel;