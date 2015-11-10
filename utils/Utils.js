/**
 * Created by William on 15/10/20.
 */
var crypto = require('crypto');
var _ = require('underscore');


var utils = {
    sha1: function sha1(plainText) {
        var sha = crypto.createHash('sha1').update(plainText);
        return sha.digest('hex');
    },

    md5: function md5(plainText) {
        var md = crypto.createHash('md5').update(plainText);
        return md.digest('hex');
    },

    base64: function base64(plainText) {
        return plainText.toString('base64');
    },

    strReplace: function (str, data) {
        return str.replace(/{\w+}/g, function (matchs) {
            return data[matchs.slice(1, -1)];
        });
    }
};


module.exports = utils;

