/**
 * Created by michel_feng on 15/10/21.
 */

var DBUtils = require('../../db_utils');

var AdminController = {
    login: function(req, res) {
        var sql = "select * from people where id = ?";
        DBUtils.getDBConnection().query(sql, [1], function(err, result){
            console.log('error: ' + err);
            console.log('result:' + result);
        });
    }
}

module.exports = AdminController;