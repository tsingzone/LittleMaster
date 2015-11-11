/**
 * Created by michel_feng on 15/11/6.
 */

var fs = require('fs');

var BaseController = require('./BaseController');
var oss = require('../../../utils/Oss').createNew();
var logger = require('../../../logger').logger('DiplomaController');

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
                    logger.debug(result);
                    res.render(diplomaController.getView('diploma'), {
                        title: type,
                        userIds: req.userIds,
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
                res.render(diplomaController.getView('diploma_add_' + type), {
                    type:type,
                    userIds: req.userIds
                });
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

                        console.log(fields);

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

                        var avatarName = fields.teacherId + '-' + new Date().getTime() + '.' + extName;
                        var newPath = form.uploadDir + avatarName;
                        fs.rename(files.fulAvatar.path, newPath, function (err) {

                            oss.putObject({key: newPath},
                                function (err, data) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            message: err
                                        });
                                        return;
                                    }
                                    var source = {
                                        teacherId: fields.teacherId,
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
                                            logger.error(err);
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
                        console.log(req.userIds);
                        res.render(diplomaController.getView(type), {
                            type: type,
                            subList: result,
                            userIds: req.userIds
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
                            type: type,
                            subList: result,
                            userIds: req.userIds
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
                            type: type,
                            subList: result,
                            userIds: req.userIds
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