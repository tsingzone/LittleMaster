/**
 * Created by michel_feng on 15/11/4.
 */

var ALY = require('aliyun-sdk');

var oss = new ALY.OSS({
    "accessKeyId": "AYHqWkRssXm6pqCv",
    "secretAccessKey": "QRTLrPqWDrqPgoNErniALChTZ1DuGL",
    endpoint: 'http://oss-cn-hangzhou.aliyuncs.com',
    // 注意：如果你是\\
    // 在 ECS 上连接 OSS，可以使用内网地址，速度快，没有带宽限制。
    //endpoint: 'http://oss-cn-hangzhou-internal.aliyuncs.com',
    // 这是 oss sdk 目前支持最新的 api 版本, 不需要修改
    apiVersion: '2013-10-15'
});

module.exports = oss;