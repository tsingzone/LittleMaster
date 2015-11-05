/**
 * Created by michel_feng on 15/11/4.
 */

var ALY = require('aliyun-sdk');

var Configs = require('../configs');
var ossconfig = Configs.getConfig().ossconfig;

var oss = new ALY.OSS({
    "accessKeyId": ossconfig.accessKeyId,
    "secretAccessKey": ossconfig.secretAccessKey,
    endpoint: ossconfig.endpoint,
    // 注意：如果你是\\
    // 在 ECS 上连接 OSS，可以使用内网地址，速度快，没有带宽限制。
    //endpoint: 'http://oss-cn-hangzhou-internal.aliyuncs.com',
    // 这是 oss sdk 目前支持最新的 api 版本, 不需要修改
    apiVersion: ossconfig.apiVersion
});

module.exports = oss;