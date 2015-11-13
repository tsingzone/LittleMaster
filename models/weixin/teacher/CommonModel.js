/**
 * Created by michel_feng on 15/11/12.
 */

var BaseModel = require('./BaseModel');

var CommonModel = {
    createNew: function () {
        var commonModel = BaseModel.createNew();

        /**
         * 获取所有的学历信息
         * @param callback
         */
        commonModel.getEducationList = function (callback) {
            var sql = 'select id, name from sys_education where status = 1';
            commonModel.queryDb({
                sql: sql,
                params: []
            }, callback);
        };

        /**
         * 获取教师资格证中的专业列表
         * @param callback
         */
        commonModel.getMajorList = function (callback) {
            var sql = 'select id, name from sys_major where status = 1';
            commonModel.queryDb({
                sql: sql,
                params: []
            }, callback);
        };

        /**
         * 获取教师资格证中的学段列表
         * @param callback
         */
        commonModel.getPeriodList = function (callback) {
            var sql = 'select id, name from sys_period where status = 1';
            commonModel.queryDb({
                sql: sql,
                params: []
            }, callback);
        };

        /**
         * 获取其他证书中的证书类型列表
         * @param callback
         */
        commonModel.getCertTypeList = function (callback) {
            var sql = 'select id, name from sys_diploma where status = 1 and id > 1';
            commonModel.queryDb({
                sql: sql,
                params: []
            }, callback);
        };
        return commonModel;
    }
};

module.exports = CommonModel;