/**
 * Created by michel_feng on 15/11/6.
 */

var BaseController = require('./BaseController');

var UserController = {

    createNew: function (teacherModel) {
        var userController = BaseController.createNew();
        userController.getUserIds = function (source, callback) {
            teacherModel.getUserIds(source, function (err, result) {
                if (err) {
                    return;
                }
                callback(null, result);
            });
        };

        userController.getWeiXinUserByUserId = function (userId, callback) {
            teacherModel.getWeiXinUserByUserId(userId, function (err, result) {
                if (err) {
                    return;
                }
                callback(null, result);
            });
        };
        userController.getWeiXinUserByOpenId = function (openId, callback) {
            teacherModel.getWeiXinUserByOpenId(openId, function (err, result) {
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
                    console.log(err);
                    return;
                }
                callback(null, result);
            })
        };

        userController.checkIsUserExistInDb = function (userInfo, callback) {
            userController.getWeiXinUserByOpenId(userInfo.openid, function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        userController.updateWeixinUser = function (userInfo, callback) {
            userController.updateWeinXinUserByOpenId(userInfo, function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                userController.getWeiXinUserByOpenId(userInfo.openid, function (err, data) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    callback(null, data);
                });
            });
        };

        userController.insertWeixinUser = function (userInfo, callback) {
            userController.saveWeixinUser(userInfo, function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                userController.getWeiXinUserByOpenId(userInfo.openid, function (err, data) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    callback(null, data);
                });
            });
        };

        return userController;
    }
};

module.exports = UserController;