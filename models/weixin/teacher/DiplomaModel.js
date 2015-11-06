/**
 * Created by michel_feng on 15/11/6.
 */

var DBUtils = require('../../../db_utils');

var DiplomaModel = {
    createNew: function () {
        var diplomaModel = {};

        /**
         * 根据kind和teacher_id获取证书列表
         * @param source
         * @param callback
         */
        diplomaModel.getDiplomaList = function (source, callback) {
            var sql = 'select '
                + ' teacher_diploma.id as id, teacher_diploma.teacher_id as teacherId, '
                + ' teacher_diploma.number as number, teacher_diploma.achieve_time as achieveTime, '
                + ' sys_diploma.name as diplomaName, teacher_diploma.period as period, '
                + ' teacher_diploma.major as major, teacher_diploma.img_path as imgPath '
                + ' from teacher_diploma '
                + ' left join sys_diploma '
                + ' on sys_diploma.id = teacher_diploma.diploma_id '
                + ' where '
                + ' teacher_id = ? '
                + ' and teacher_diploma.kind = ? '
                + ' and teacher_diploma.status = 1 '
                + ' and sys_diploma.status = 1';
            DBUtils.getDBConnection().query(sql, [source.teacherId, source.kind], function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        /**
         * 添加证书记录
         * @param source
         * @param callback
         */
        diplomaModel.saveDiploma = function (source, callback) {
            var sql = 'insert into teacher_diploma( '
                + ' teacher_id, diploma_id, diploma_name, number, achieve_time, period, major, img_path, status, kind'
                + ' )'
                + ' values ('
                + ' ?, ?, ?, ?, ?, ?, ?, ?, ?, ?'
                + ' )';
            DBUtils.getDBConnection().query(sql, [
                source.teacherId,
                source.diplomaId,
                source.diplomaName,
                source.number,
                source.achieveDate,
                source.period,
                source.major,
                source.imgPath,
                source.status,
                source.kind
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
        diplomaModel.deleteDiploma = function (source, callback) {
            var sql = 'update teacher_diploma set status = -1 where id = ?';
            DBUtils.getDBConnection().query(
                sql,
                [source.diplomaId],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    callback(null, result);
                }
            );
        };

        /**
         * 获取教师资格证中的专业列表
         * @param callback
         */
        diplomaModel.getMajorList = function (callback) {
            var sql = 'select id, name from sys_major where status = 1';
            DBUtils.getDBConnection().query(sql, [],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    callback(null, result);
                });
        };

        /**
         * 获取教师资格证中的学段列表
         * @param callback
         */
        diplomaModel.getPeriodList = function (callback) {
            var sql = 'select id, name from sys_period where status = 1';
            DBUtils.getDBConnection().query(sql, [],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    callback(null, result);
                });
        };

        /**
         * 获取其他证书中的证书类型列表
         * @param callback
         */
        diplomaModel.getCertTypeList = function (callback) {
            var sql = 'select id, name from sys_diploma where status = 1 and id > 1';
            DBUtils.getDBConnection().query(sql, [],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    callback(null, result);
                });
        };
        return diplomaModel;
    }
};

module.exports = DiplomaModel;