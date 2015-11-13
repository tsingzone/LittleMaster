/**
 * Created by michel_feng on 15/11/6.
 */

var BaseModel = require('./BaseModel');

var DiplomaModel = {
    createNew: function () {
        var diplomaModel = BaseModel.createNew();

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
            diplomaModel.queryDb({
                sql: sql,
                params: [source.teacherId, source.kind]
            }, callback);
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
            diplomaModel.queryDb({
                sql: sql,
                params: [
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
                ]
            }, callback);
        };

        /**
         * 根据经历id将记录标记为删除
         * @param source
         * @param callback
         */
        diplomaModel.deleteDiplomaById = function (source, callback) {
            var sql = 'update teacher_diploma set status = -1 where id = ?';

            diplomaModel.queryDb({
                sql: sql,
                params: [source.diplomaId]
            }, callback);
        };


        /**
         * 根据教师id获取各个类型的证书的数量
         * @param teacherId
         * @param callback
         */
        diplomaModel.getDiplomaCount = function (teacherId, callback) {
            var sql = 'select teacherId, kind, kindCount '
                + ' from '
                + ' ( select teacher_id as teacherId, kind, count(kind) as kindCount from teacher_diploma '
                + ' where status = 1 '
                + ' group by teacher_id, kind) diploma '
                + ' where diploma.teacherId = ?';
            diplomaModel.queryDb({
                sql: sql,
                params: [teacherId]
            }, callback);
        };
        return diplomaModel;
    }
};

module.exports = DiplomaModel;