/**
 * Created by michel_feng on 15/11/6.
 */

var BaseController = require('./BaseController');

var UserController = {

    createNew: function (teacherModel) {
        var userController = BaseController.createNew();
        userController.getWeixinUserByUserId = function (userId, callback) {
            teacherModel.getWeiXinUserByUserId(userId, function (err, result) {
                if (err) {
                    res.status(404);
                    return;
                }
                callback(result);
            });
        };
        userController.getWeiXinUserByOpenId = function (openId, callback) {
            teacherModel.getWeiXinUserByOpenId(openId, function (err, result) {
                if (err) {
                    res.status(404);
                    return;
                }
                callback(result);
            });
        };
        userController.updateWeinXinUserByOpenId = function (userInfo, callback) {
            teacherModel.updateWeinXinUserByOpenId(userInfo, function (err, result) {
                if (err) {
                    res.status(404);
                    return;
                }
                callback(result);
            });
        };

        return userController;
    }
};

module.exports = UserController;