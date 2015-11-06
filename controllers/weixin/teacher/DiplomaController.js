/**
 * Created by michel_feng on 15/11/6.
 */

var BaseController = require('./BaseController');
var oss = require('../../../utils/Oss');
var Configs = require('../../../configs');
var ossconfig = Configs.getConfig().ossconfig;
var fs = require('fs');

var DiplomaController = {

    createNew: function (teacherModel) {
        var diplomaController = BaseController.createNew();
        diplomaController.getDiplomaList = function (req, res) {
            var types = ['teacher', 'other'];
            var type = req.params.type;
            var index = types.indexOf(type);
            if (index != -1) {
                var source = {
                    teacherId: req.userIds.teacherId,
                    kind: index
                };
                teacherModel.getDiplomaList(source, function (err, result) {
                    if (err) {
                        res.status(404).end();
                        return;
                    }
                    console.log(result);
                    res.render(diplomaController.getView('diploma'), {
                        title: type,
                        user: req.userIds,
                        diplomaList: result
                    });
                });
            } else {
                res.status(404).end();
            }
        };
        diplomaController.getAddDiploma = function (req, res) {
            var types = ['teacher', 'other'];
            var type = req.params.type;
            if (types.indexOf(type) != -1) {
                res.render(diplomaController.getView('diploma_add_' + type), {title: type});
            } else {
                res.status(404).end();
            }
        };
        diplomaController.saveDiploma = function (req, res) {
            var types = ['teacher', 'other'];
            var type = req.params.type;
            var index = types.indexOf(type);
            if (index != -1) {
                var form = diplomaController.getForm('diploma');

                form.parse(req, function (err, fields, files) {
                        if (err) {
                            res.json({success: false, message: err});
                            return;
                        }

                        var isValid = diplomaController.validateParams(fields);
                        if (isValid.length > 0) {
                            res.json({success: false, message: isValid});
                            return;
                        }

                        var extName = diplomaController.getExtName(files.fulAvatar.type);  //后缀名

                        if (extName.length == 0) {
                            res.json({
                                success: false,
                                message: '只支持png和jpg格式图片'
                            });
                            return;
                        }

                        var avatarName = req.userIds.teacherId + '-' + new Date().getTime() + '.' + extName;
                        var newPath = form.uploadDir + avatarName;
                        fs.rename(files.fulAvatar.path, newPath, function (err) {

                            oss.putObject({
                                    Bucket: ossconfig.bucketName,
                                    Key: newPath,                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
                                    AccessControlAllowOrigin: '',
                                    ContentType: 'image/*',
                                    CacheControl: 'no-cache',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
                                    ContentDisposition: '',           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
                                    ContentEncoding: 'utf-8',         // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
                                    ServerSideEncryption: 'AES256',
                                    Expires: null
                                },
                                function (err, data) {

                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: err
                                        });
                                        return;
                                    }
                                    var source = {
                                        teacherId: req.userIds.teacherId,
                                        number: fields.number,
                                        achieveDate: fields.achieveDate,
                                        imgPath: newPath,
                                        status: 1,
                                        kind: index
                                    };
                                    if (index == 0) {
                                        source['diplomaId'] = 1;
                                        source['diplomaName'] = '教师资格证';
                                        source['period'] = fields.period;
                                        source['major'] = fields.major;
                                    }
                                    else {
                                        source['diplomaId'] = fields.diplomaId;
                                        source['diplomaName'] = fields.diplomaName;
                                    }
                                    teacherModel.saveDiploma(source, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            return;
                                        }
                                        res.json({
                                            success: true,
                                            message: "上传成功！"
                                        });
                                    });
                                });
                        });  //重命名
                    }
                );
            } else {
                res.status(404).end();
                return;
            }
        };
        diplomaController.getAddDiplomaSubType = function (req, res) {
            var types = ['major', 'period', 'cert'];
            var type = req.params.type;
            var index = types.indexOf(type);
            switch (index) {
                case 0:
                    teacherModel.getMajorList(function (err, result) {
                        if (err) {
                            res.status(404).end();
                            return;
                        }
                        res.render(diplomaController.getView(type), {
                            title: type,
                            subList: result
                        });
                    });
                    break;
                case 1:
                    teacherModel.getPeriodList(function (err, result) {
                        if (err) {
                            res.status(404).end();
                            return;
                        }
                        res.render(diplomaController.getView(type), {
                            title: type,
                            subList: result
                        });
                    });
                    break;
                case 2:
                    teacherModel.getCertTypeList(function (err, result) {
                        if (err) {
                            res.status(404).end();
                            return;
                        }
                        res.render(diplomaController.getView(type), {
                            title: type,
                            subList: result
                        });
                    });
                    break;
                default :
                    res.status(404).end();
            }
        };
        diplomaController.deleteDiplomaById = function (req, res) {
            var source = {
                diplomaId: req.body.diplomaId
            };
            teacherModel.deleteDiplomaById(source, function (err, result) {
                var resJson = {
                    success: true,
                    message: '操作成功！'
                };
                if (err) {
                    resJson[success] = false;
                    resJson[message] = err;
                }
                res.json(resJson);
            });
        };
        return diplomaController;
    }
};

module.exports = DiplomaController;