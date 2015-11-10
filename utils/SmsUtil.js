/**
 * Created by michel_feng on 15/11/9.
 */

var urllib = require('urllib');
var moment = require('moment');

var Config = require('../configs');
var smsconfig = Config.getConfig().smsconfig;
var util = require('./Utils');

var SmsUtil = {
    createNew: function () {
        var sms = {};

        var server = smsconfig['server'];
        var template = '{IP}:{Port}/{version}/Accounts/{accountSid}/SMS/TemplateSMS?sig={sigParameter}';

        var getSigParameter = function () {
            var timestamp = moment().format('YYYYMMDDHHmmss');
            var plainText = smsconfig['accountSid']
                + smsconfig['accountToken']
                + timestamp;
            return util.md5(plainText).toUpperCase();
        };
        var getAuthorization = function () {
            var timestamp = moment().format('YYYYMMDDHHmmss');
            return util.base64(new Buffer([
                smsconfig['accountSid'],
                ":",
                timestamp
            ].join('')));
        };
        sms.sendMessage = function (toMobiles,
                                    templateId,
                                    datas,
                                    callback) {
            var sigParameter = getSigParameter();

            var url = util.strReplace(template, {
                IP: server['IP'],
                Port: server['Port'],
                version: smsconfig['softVersion'],
                accountSid: smsconfig['accountSid'],
                sigParameter: sigParameter
            });
            var authorization = getAuthorization();

            var data = {
                to: toMobiles.join(),
                appId: smsconfig['appId'],
                templateId: templateId,
                datas: datas
            };

            var headers = {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json',
                'Content-Length': JSON.stringify(data).length,
                'Authorization': authorization
            };

            var args = {
                method: 'POST',
                headers: headers,
                data: JSON.stringify(data)
            };

            urllib.request(url, args, function (err, result) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    var json = JSON.parse(result);
                    if (json['statusCode'] == '000000') {
                        callback(null, json);
                    }
                    else {
                        callback('短信发送失败！', json);
                    }
                }
            )
            ;
        };
        return sms;
    }
};

module.exports = SmsUtil;