/**
 * Created by William on 15/10/20.
 */
"use strict"
var mysql = require('mysql');
var logger = require('./logger').logger();
var _ = require('underscore');

var DBHandler = function() {

}

_.extend(DBHandler.prototype, {
    init: function (dbconfig) {
        this.pool = mysql.createPool(dbconfig);
    },

    queryDB: function (sql, values, responseFormat, callback) {
        if (!sql || sql.length <= 0) {
            logger.error("Invalid sql statement: " + sql);
            return;
        }
        if (typeof values !== "object") {
            logger.error("query values should be an array");
            return;
        }
        this.pool.getConnection(function (err, connection) {
            if (err) {
                logger.error("Failed to get connection:", err);
                if (callback) {
                    callback(err);
                }
                return;
            }
            connection.query(sql, values, function (err, results) {
                connection.release();
                if (err) {
                    logger.error("Error in query, " + sql + " " + JSON.stringify(err));
                }
                if (callback) {
                    if(responseFormat == 'json') {
                        var jsonResult = JSON.parse(JSON.stringify(results));
                        callback(err, jsonResult);
                    } else {
                        callback(err, results);
                    }
                }
            });
        });
    },

    query: function (sql, values, callback) {
        this.queryDB(sql, values, 'array', callback);
    },

    queryJson: function (sql, values, callback) {
        this.queryDB(sql, values, 'json', callback);
    }
});

module.exports = DBHandler;