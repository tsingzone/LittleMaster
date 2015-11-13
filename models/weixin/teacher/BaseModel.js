/**
 * Created by michel_feng on 15/11/12.
 */

var DBUtils = require('../../../db_utils');
var logger = require('../../../logger').logger('BaseModel');
var _ = require('underscore');

var BaseModel = {

    createNew: function () {
        var baseModel = {};

        /**
         * 根据args.sql和args.params操作数据库
         * @param args
         * @param callback
         */
        baseModel.queryDb = function queryDb(args, callback) {
            if (!args) {
                throw new Error('数据库查询对象不能为空！');
            }
            if (!args.sql || !_.isString(args.sql)) {
                throw new Error('sql属性必须为非空字符串！');
            }
            if (!args.params || !_.isArray(args.params)) {
                throw new Error('params属性必须为数组类型！');
            }
            DBUtils.getDBConnection().query(args.sql, args.params, function (err, result) {
                if (err) {
                    logger.error(err);
                    callback(err);
                    return;
                }
                callback(null, result);
            });
        };

        /**
         * 根据userId或openId获取微信基本信息
         * @param source
         * @param callback
         */
        baseModel.getWeiXinBaseUserInfo = function (source, callback) {
            var sql = 'select id, open_id as openId, nickname as nickName, head_img as headImg'
                + ' from weixin_user '
                + ' where (id = ? or open_id = ?) and status <> -1;';
            baseModel.queryDb({
                sql: sql,
                params: [
                    source.userId,
                    source.openId
                ]
            }, callback);
        };

        /**
         * 根据userId或openId获取userId、openId、teacherId组成的对象
         * @param source
         * @param callback
         */
        baseModel.getUserIds = function (source, callback) {
            var sql = 'select weixin_user.id as userId, weixin_user.open_id as openId, teacher_infor.id as teacherId'
                + ' from weixin_user '
                + ' left join teacher_infor '
                + ' on weixin_user.id = teacher_infor.user_id'
                + ' where weixin_user.id = ? or weixin_user.open_id = ?';
            baseModel.queryDb({
                sql: sql,
                params: [
                    source.userId,
                    source.openId
                ]
            }, callback);
        };

        return baseModel;
    }
};

module.exports = BaseModel;