/**
 * Created by michel_feng on 15/11/9.
 */

var Memcached = require('memcached');
var _ = require('underscore');

var Configs = require('../configs');
var config = Configs.getConfig().memcachedconfig;

var MemCache = {
    createNew: function () {
        var memcached = {};
        var server = config["server1"];
        var options = server["options"];
        console.log(options);
        var serverUrl = [server["server"], ":", server["port"]].join('');
        var keyPrefix = server['keyPrefix'];
        console.log(serverUrl);
        var mem = new Memcached(serverUrl, options);

        memcached.getObject = function (key, callback) {
            mem.get(keyPrefix + key, function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        memcached.getObjects = function (keyArray, callback) {
            if (!_.isArray(keyArray)) {
                keyArray = _.toArray(keyArray);
            }
            keyArray = _.map(keyArray, function (item) {
                return keyPrefix + item;
            });
            console.log(keyArray);
            mem.getMulti(keyArray, function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };

        memcached.putObject = function (key, value, lifetime, callback) {
            if (!_.isNumber(lifetime)) {
                lifetime = 10;
            }
            mem.set(keyPrefix + key, value, lifetime, function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null);
            });
        };

        memcached.replaceObject = function (key, value, lifetime, callback) {
            if (!_.isNumber(lifetime)) {
                lifetime = 10;
            }
            mem.replace(keyPrefix + key, value, lifetime, function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null);
            });
        };

        memcached.deleteObject = function (key, callback) {
            mem.del(keyPrefix + key, function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null);
            });
        };

        return memcached;
    }
};

module.exports = MemCache;
