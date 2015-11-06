/**
 * Created by michel_feng on 15/11/6.
 */

var DBUtils = require('../../../db_utils');

var ExperienceModel = {
    createNew: function () {
        var experienceModel = {};

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
            DBUtils.getDBConnection().query(sql, [source.teacherId, source.kind], function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        /**
         * 添加经历记录
         * @param experience
         * @param callback
         */
        experienceModel.saveExperience = function (experience, callback) {
            var sql = "insert into teacher_experience(" +
                " teacher_id, title, start_time, end_time, description, kind, status)" +
                " values(?, ?, ?, ?, ?, ?, ?)";
            DBUtils.getDBConnection().query(sql, [
                experience.teacherId,
                experience.title,
                experience.startTime,
                experience.endTime,
                experience.description,
                experience.kind,
                experience.status
            ], function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        /**
         * 根据经历id将记录标记为删除
         * @param source
         * @param callback
         */
        experienceModel.deleteExperience = function (source, callback) {
            var sql = 'update teacher_experience set status = -1 where id = ?';
            DBUtils.getDBConnection().query(sql, [source.experienceId], function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        return experienceModel;
    }
};

module.exports = ExperienceModel;