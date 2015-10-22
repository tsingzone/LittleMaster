/**
 * Created by William on 15/10/20.
 */
var Configs = require('./configs');
var DBHandler = require('./db_handler');
var logger = require('./logger');
var utils = require("./utils/utils");

var DBUtils = {
    getDBConnection: function() {
        var dbconfig = Configs.getConfig().dbconfig;
        this.dbhandler = new DBHandler();
        this.dbhandler.init(dbconfig);
    },
    getSlaveDBConnection: function() {
        var slaveDBConfig = Configs.getConfig().dbconfigslave;
        this.slavedbhandler = new DBHandler();
        this.slavedbhandler.init(slaveDBConfig);
    }
}

module.exports = DBUtils;