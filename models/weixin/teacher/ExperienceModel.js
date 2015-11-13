/**
 * Created by michel_feng on 15/11/6.
 */

var BaseModel = require('./BaseModel');

var ExperienceModel = {
    createNew: function () {
        var experienceModel = BaseModel.createNew();

        /**
         * 根据kind和teacher_id获取经历列表
         * @param source
         * @param callback
         */
        experienceModel.getExperienceList = function (source, callback) {
            var sql = 'select id, teacher_id as teacherId, title, start_time as startTime, end_time as endTime, description, kind '
                + ' from teacher_experience'
                + ' where teacher_id = ? '
                + ' and kind = ? '
                + ' and status = 1 ';
            experienceModel.queryDb({
                sql: sql,
                params: [source.teacherId, source.kind]
            }, callback);
        };

        /**
         * 添加经历记录
         * @param experience
         * @param callback
         */
        experienceModel.saveExperience = function (experience, callback) {
            var sql = 'insert into teacher_experience( '
                + ' teacher_id, title, start_time, end_time, description, kind, status) '
                + ' values(?, ?, ?, ?, ?, ?, ?) ';
            experienceModel.queryDb({
                sql: sql,
                params: [
                    experience.teacherId,
                    experience.title,
                    experience.startTime,
                    experience.endTime,
                    experience.description,
                    experience.kind,
                    experience.status
                ]
            }, callback);
        };

        /**
         * 根据经历id将记录标记为删除
         * @param source
         * @param callback
         */
        experienceModel.deleteExperienceById = function (source, callback) {
            var sql = 'update teacher_experience set status = -1 where id = ?';
            experienceModel.queryDb({
                sql: sql,
                params: [source.experienceId]
            }, callback);
        };

        /**
         * 根据教师id获取各个类型的经历数量
         * @param teacherId
         * @param callback
         */
        experienceModel.getExperienceCount = function (teacherId, callback) {
            var sql = 'select teacherId, kind, kindCount '
                + ' from '
                + ' (select teacher_id as teacherId, kind, count(kind) as kindCount from teacher_experience '
                + ' where status = 1 '
                + ' group by teacher_id, kind  ) experience '
                + ' where experience.teacherId = ?';
            experienceModel.queryDb({
                sql: sql,
                params: [teacherId]
            }, callback);
        };

        return experienceModel;
    }
};

module.exports = ExperienceModel;