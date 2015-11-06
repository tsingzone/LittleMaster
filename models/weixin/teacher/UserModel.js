/**
 * Created by michel_feng on 15/11/6.
 */

var DBUtils = require('../../../db_utils');

var UserModel = {
    createNew: function () {
        var userModel = {};
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
                console.log(result);
                callback(result);
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
                console.log(result);
                callback(result);
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
        return userModel;
    }
};

module.exports = UserModel;