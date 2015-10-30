/**
 * Created by William on 15/10/23.
 */

var DBUtils = require('../../db_utils');
var _ = require('underscore');
//var crypto = require('crypto');
var aesKey = 'tsingzone';

var AdminUser = function () {

}

AdminUser.findByName = function (username, callback) {
    var sql = "SELECT username, AES_DECRYPT(UNHEX(password), ?) as password FROM admins WHERE username = ?";
    DBUtils.getDBConnection().query(sql, [aesKey, username], function (err, results) {
        if (err) {
            callback(err);
        } else if (results && results.length > 0) {
            callback(null, AdminUser.deserialize(results[0]));
        } else {
            callback("No user found", null);
        }
    });
}

AdminUser.test = function () {
    var sql = "SELECT username FROM admins";
    DBUtils.getDBConnection().queryJson(sql, [], function (err, results) {

    });
}

AdminUser.deserialize = function (dbRecord) {
    var user = new AdminUser();
    user.username = dbRecord.username;
    user.password = dbRecord.password;
    //user.salt = dbRecord.salt;
    return user;
}


_.extend(AdminUser.prototype, {
    verifyPassword: function (password) {
        //var shasum = crypto.createHash('sha1');
        //shasum.update(this.salt + password);
        var crypt_pwd = password;//shasum.digest('hex');
        return this.password == crypt_pwd;
    }
});

module.exports = AdminUser;