/**
 * Created by michel_feng on 15/11/6.
 */

var BaseModel = require('./BaseModel');

var UserModel = {
    createNew: function () {
        var userModel = BaseModel.createNew();

        /**
         * 根据userId或openId获取微信用户信息
         * @param source
         * @param callback
         */
        userModel.getWeiXinUser = function (source, callback) {
            var sql = 'select id as userId, open_id as openId, nickname as nickName, sex, '
                + ' email, mobile, add_time as addTime, user_ip as userIp, head_img as headImg, '
                + ' country, province, city, union_id as unionId, status'
                + ' from weixin_user'
                + ' where id = ? or open_id = ?';
            userModel.queryDb({
                sql: sql,
                params: [source.userId, source.openId]
            }, callback);
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
            userModel.queryDb({
                sql: sql,
                params: [
                    userInfo.nickname,
                    userInfo.headimgurl,
                    userInfo.country,
                    userInfo.province,
                    userInfo.city,
                    userInfo.unionid,
                    userInfo.sex,
                    userInfo.openid
                ]
            }, callback);
        };

        /**
         * 保存微信用户信息
         * @param userInfo
         * @param callback
         */
        userModel.saveWeixinUser = function (userInfo, callback) {
            var sql = 'insert into weixin_user'
                + ' ( open_id, sex, nickname, add_time, user_ip, head_img, country, province, city, union_id, status, subscribe ) '
                + ' values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )';
            userModel.queryDb({
                sql: sql,
                params: [
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
                ]
            }, callback);
        };

        /**
         * 根据openId更新微信用户绑定的手机号
         * @param source
         * @param callback
         */
        userModel.changeMobile = function (source, callback) {
            var sql = 'update weixin_user set mobile = ? where open_id = ?';
            userModel.queryDb({
                sql: sql,
                params: [source.mobile, source.openId]
            }, callback);
        };
        return userModel;
    }
};

module.exports = UserModel;