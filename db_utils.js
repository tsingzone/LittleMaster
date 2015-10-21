/**
 * Created by William on 15/10/20.
 */
var Configs = require('./configs');
var DBHandler = require('./db_handler');
var logger = require('./logger');
var utils = require("./utils/utils");

var DBUtils = {
    getDBConnection: function() {
        if(this.dbhandler == null) {
            var dbconfig = Configs.getConfig().dbconfig;
            this.dbhandler = new DBHandler();
            this.dbhandler.init(dbconfig);
        }
        return this.dbhandler;
    },
    getSlaveDBConnection: function() {
        if(this.slavedbhandler == null) {
            var slaveDBConfig = Configs.getConfig().dbconfigslave;
            this.slavedbhandler = new DBHandler();
            this.slavedbhandler.init(slaveDBConfig);
        }
        return this.slavedbhandler;
    }
}

module.exports = DBUtils;