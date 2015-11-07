/**
 * Created by michel_feng on 15/11/4.
 */

var ALY = require('aliyun-sdk');

var Configs = require('../configs');
var ossconfig = Configs.getConfig().ossconfig;


var Oss = {
    createNew: function () {
        var oss = {};
        oss.obj = new ALY.OSS({
            "accessKeyId": ossconfig.accessKeyId,
            "secretAccessKey": ossconfig.secretAccessKey,
            endpoint: ossconfig.endpoint,
            // 注意：如果你是\\
            // 在 ECS 上连接 OSS，可以使用内网地址，速度快，没有带宽限制。
            //endpoint: 'http://oss-cn-hangzhou-internal.aliyuncs.com',
            // 这是 oss sdk 目前支持最新的 api 版本, 不需要修改
            apiVersion: ossconfig.apiVersion
        });

        oss.putObject = function (params, callback) {
            oss.obj.pubObject({
                Bucket: params[bucketName] ? params[bucketName] : ossconfig.bucketName,
                Key: params[key],                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
                AccessControlAllowOrigin: '',
                ContentType: 'image/*',
                CacheControl: 'no-cache',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
                ContentDisposition: '',           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
                ContentEncoding: 'utf-8',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
                ServerSideEncryption: 'AES256',
                Expires: null
            }, callback);
        };
        return oss;
    }
};

module.exports = Oss;