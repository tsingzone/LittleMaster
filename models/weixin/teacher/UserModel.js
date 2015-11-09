/**
 * Created by michel_feng on 15/11/6.
 */

var DBUtils = require('../../../db_utils');

var UserModel = {
    createNew: function () {
        var userModel = {};

        userModel.getUserIds = function (source, callback) {
            console.log(source);
            var sql = 'select weixin_user.id as userId, weixin_user.open_id as openId, teacher_infor.id as teacherId'
                + ' from weixin_user '
                + ' left join teacher_infor '
                + ' on weixin_user.id = teacher_infor.user_id'
                + ' where weixin_user.id = ? or weixin_user.open_id = ?';
            DBUtils.getDBConnection().query(sql, [
                    source.userId,
                    source.openId
                ],
                function (err, result) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    callback(null, result);
                });
        };

        /**
         * 根据userId获取微信用户信息
         * @param userId
         * @param callback
         */
        userModel.getWeiXinUserByUserId = function (userId, callback) {
            var sql = 'select id as userId, open_id as openId, nickname as nickName, sex, '
                + ' email, mobile, add_time as addTime, user_ip as userIp, head_img as headImg, '
                + ' country, province, city, union_id as unionId, status'
                + ' from weixin_user'
                + ' where id = ?';
            DBUtils.getDBConnection().query(sql, [userId], function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        /**
         * 根据openId获取微信用户信息
         * @param openId
         * @param callback
         */
        userModel.getWeiXinUserByOpenId = function (openId, callback) {
            var sql = 'select id as userId, open_id as openId, nickname as nickName, sex, '
                + ' email, mobile, add_time as addTime, user_ip as userIp, head_img as headImg, '
                + ' country, province, city, union_id as unionId, status'
                + ' from weixin_user'
                + ' where open_id = ?';
            DBUtils.getDBConnection().query(sql, [openId], function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        /**
         * 根据openId更新微信用户的微信个人信息
         * @param userInfo
         * @param callback
         */
        userModel.updateWeinXinUserByOpenId = function (userInfo, callback) {
            var sql = 'update weixin_user set'
                + ' nickname = ?, head_img = ?, country = ?, province = ?, city = ?, union_id = ?, sex = ?'
                + ' where open_id = ?';
            DBUtils.getDBConnection().query(sql, [
                userInfo.nickname,
                userInfo.headimgurl,
                userInfo.country,
                userInfo.province,
                userInfo.city,
                userInfo.unionid,
                userInfo.sex,
                userInfo.openid
            ], function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        userModel.saveWeixinUser = function (userInfo, callback) {
            var sql = 'insert into weixin_user('
                + ' open_id, sex, nickname, add_time, user_ip, head_img, country, province, city, union_id, status, subscribe'
                + ' ) values ('
                + ' ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? '
                + ' )';
            DBUtils.getDBConnection().query(sql, [
                userInfo.openid,
                userInfo.sex,
                userInfo.nickname,
                new Date(),
                userInfo.userIp,
                userInfo.headimgurl,
                userInfo.country,
                userInfo.province,
                userInfo.city,
                userInfo.unionid,
                0,
                userInfo.subscribe
            ], function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            })
        };
        return userModel;
    }
};

module.exports = UserModel;