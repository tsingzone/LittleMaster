/**
 * Created by michel_feng on 15/11/6.
 */

var formidable = require('formidable');
var path = require('path');
var Configs = require('../../../configs');

var BaseController = {
    createNew: function () {
        var baseController = {};

        baseController.ossconfig = Configs.getConfig().ossconfig;

        baseController.getForm = function (path) {
            var form = formidable.IncomingForm();
            form.encoding = 'utf-8';
            form.uploadDir = 'public/upload/' + path + '/';
            form.keepExtensions = true;
            form.maxFieldsSize = 2 * 1024 * 1024;
            return form;
        };

        baseController.getExtName = function (type) {
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

        baseController.getView = function getView(viewName) {
            var dir = 'weixin/teacher/';
            return path.join(dir, viewName);
        };

        var invalidReg = /select|drop|delete|insert|into|update|where|left|join|on|right/
        baseController.validData = function (text) {
            if (text.toLowerCase().match(invalidReg)) {
                return null;
            } else {
                return text.trim();
            }
        };

        baseController.validateParams = function (data) {
            var errList = [];
            for (var name in data) {
                if (!data[name]) {
                    errList.push(name + "不能为空！");
                }
            }
            return errList;
        };

        return baseController;
    }
};

module.exports = BaseController;