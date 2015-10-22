/**
 * Created by michel_feng on 15/10/22.
 */
var DBUtils = require('../../../db_utils');


var Teacher = {
    getUserCenterData: function(source) {
        var sql = "select * from weixin_user where id = ?";
        return DBUtils.getDBConnection().query(sql, [source.id], function(err, result){
            console.log('error: ' + err);
            console.log('result:' + JSON.stringify(result));

        });
    }
}

module.exports = Teacher;