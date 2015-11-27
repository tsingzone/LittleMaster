/**
 * Created by michel_feng on 15/11/6.
 */

var path = require('path');

var formidable = require('formidable');
var _ = require('underscore');

var Configs = require('../../../configs');
var logger = require('../../../logger').logger('BaseController');

var BaseController = {
    createNew: function () {
        var baseController = {};

        baseController.ossconfig = Configs.getConfig().ossconfig;

        var getForm = function (path) {
            var form = formidable.IncomingForm();
            form.encoding = 'utf-8';
            form.uploadDir = 'public/upload/' + path + '/';
            form.keepExtensions = true;
            form.maxFieldsSize = 2 * 1024 * 1024;
            return form;
        };

        var getExtName = function (type) {
            var extName = '';
            switch (type) {
                case 'image/pjpeg':
                    extName = 'jpg';
                    break;
                case 'image/jpeg':
                    extName = 'jpg';
                    break;
                case 'image/png':
                    extName = 'png';
                    break;
                case 'image/x-png':
                    extName = 'png';
                    break;
            }
            return extName;
        };

        baseController.formParse = function (req, res, path, callback) {
            var form = getForm(path);
            form.parse(req, function (err, fields, files) {
                // baseController.errorHandler(err, res, true);
                var extName = getExtName(files.fulAvatar.type);  //后缀名
                if (!extName) {
                    // baseController.errorHandler(new Error('只支持png和jpg格式图片！'), res, true);
                }
                var fileName = fields.teacherId + '-' + new Date().getTime() + '.' + extName;
                var filePath = form.uploadDir + fileName;
                callback(fields, files, filePath);
            })
        };

        baseController.getView = function getView(viewName) {
            var dir = 'weixin/teacher/';
            return path.join(dir, viewName);
        };

        var invalidReg = /select|drop|delete|insert|into|update|where|left|join|on|right|from/
        var avoidSqlInject = function (text) {
            if (!_.isString(text)) {
                return text;
            }
            if (text.toLowerCase().match(invalidReg)) {
                return null;
            } else {
                return text.trim();
            }
        };

        baseController.validateParams = function (data) {
            for (var name in data) {
                var param = data[name];
                if (!param || !avoidSqlInject(param)) {
                    return false;
                }
            }
            return true;
        };

        return baseController;
    }
};

module.exports = BaseController;