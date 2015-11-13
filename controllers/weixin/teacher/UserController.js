/**
 * Created by michel_feng on 15/11/6.
 */

var BaseController = require('./BaseController');
var logger = require('../../../logger').logger('UserController');
var Memcached = require('../../../utils/Memcached');

var UserController = {

    createNew: function (teacherModel) {
        var userController = BaseController.createNew();
        var memCache = Memcached.createNew();
        userController.getUserIds = function (source, callback) {
            teacherModel.getUserIds(source, function (err, result) {
                if (err) {
                    return;
                }
                callback(null, result);
            });
        };

        userController.getWeiXinUser = function (source, callback) {
            teacherModel.getWeiXinUser(source, function (err, result) {
                if (err) {
                    return;
                }
                callback(null, result);
            });
        };
        userController.updateWeinXinUserByOpenId = function (userInfo, callback) {
            teacherModel.updateWeinXinUserByOpenId(userInfo, function (err, result) {
                if (err) {
                    return;
                }
                callback(null, result);
            });
        };

        userController.saveWeixinUser = function (userInfo, callback) {
            teacherModel.saveWeixinUser(userInfo, function (err, result) {
                if (err) {
                    logger.error(err);
                    return;
                }
                callback(null, result);
            })
        };

        userController.checkIsUserExistInDb = function (userInfo, callback) {
            userController.getWeiXinUser(userInfo, function (err, result) {
                if (err) {
                    logger.error(err);
                    return;
                }
                callback(null, result);
            });
        };

        userController.updateWeixinUser = function (userInfo, callback) {
            userController.updateWeinXinUserByOpenId(userInfo, function (err, result) {
                if (err) {
                    logger.error(err);
                    return;
                }
                callback(null, result);
            });
        };

        userController.insertWeixinUser = function (userInfo, callback) {
            userController.saveWeixinUser(userInfo, function (err, result) {
                if (err) {
                    logger.error(err);
                    return;
                }
                callback(null, result);
            });
        };

        return userController;
    }
};

module.exports = UserController;