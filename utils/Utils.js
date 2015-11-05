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


};


module.exports = utils;

