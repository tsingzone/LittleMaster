/**
 * Created by michel_feng on 15/10/22.
 */
var DBUtils = require('../../../db_utils');


var Teacher = {
    getUserCenterData: function (source, callback) {
        var sql = "select * from weixin_user where id = ?";
        DBUtils.getDBConnection().query(sql, [source.id], callback);
    }
}

module.exports = Teacher;