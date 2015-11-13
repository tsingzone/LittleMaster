/**
 * Created by michel_feng on 15/11/6.
 */

var fs = require('fs');

var BaseController = require('./BaseController');
var oss = require('../../../utils/Oss').createNew();
var logger = require('../../../logger').logger('DiplomaController');
var Memcached = require('../../../utils/Memcached');

var DiplomaController = {

    createNew: function (teacherModel) {
        var diplomaController = BaseController.createNew();
        var memCache = Memcached.createNew();

        var diplomaTypes = ['teacher', 'other'];
        var subTypes = ['major', 'period', 'cert'];

        var checkType = function (req, res, isSub) {
            var type = req.params.type;
            var index = isSub ? subTypes.indexOf(type) : diplomaTypes.indexOf(type);
            if (index == -1) {
                diplomaController.errorHandler(new Error('选择类型不合法！'), res);
            }
            return {type: type, index: index};
        };

        /**
         * 获取不同类型的证书列表
         * @param req
         * @param res
         */
        diplomaController.getDiplomaList = function (req, res) {
            var valid = checkType(req, res);
            teacherModel.getDiplomaList({
                teacherId: req.userIds.teacherId,
                kind: valid.index
            }, function (err, result) {
                diplomaController.errorHandler(err, res);
                res.render(diplomaController.getView('diploma'), {
                    title: valid.type,
                    userIds: req.userIds,
                    diplomaList: result
                });
            });
        };

        /**
         * 跳转到添加证书的页面
         * @param req
         * @param res
         */
        diplomaController.getAddDiploma = function (req, res) {
            var valid = checkType(req, res);
            res.render(diplomaController.getView('diploma_add_' + valid.type), {
                type: valid.type,
                userIds: req.userIds
            });
        };

        /**
         * 保存证书信息
         * @param req
         * @param res
         */
        diplomaController.saveDiploma = function (req, res) {
            var valid = checkType(req, res);
            diplomaController.formParse(req, res, 'diploma', function (fields, files, uploadPath) {
                    var isValid = diplomaController.validateParams(fields);
                    if (!isValid) {
                        diplomaController.errorHandler(new Error('证书属性填写有误！'), res, true);
                    }
                    fs.rename(files.fulAvatar.path, uploadPath, function (err) {
                        oss.putObject(
                            {
                                key: uploadPath
                            },
                            function (err, data) {
                                diplomaController.errorHandler(err, res, true);
                                var source = {
                                    teacherId: fields.teacherId,
                                    number: fields.number,
                                    achieveDate: fields.achieveDate,
                                    imgPath: uploadPath,
                                    status: 1,
                                    kind: valid.index
                                };
                                if (valid.index == 0) {
                                    source.diplomaId = 1;
                                    source.diplomaName = '教师资格证';
                                    source.period = fields.period;
                                    source.major = fields.major;
                                }
                                else {
                                    source.diplomaId = fields.diplomaId;
                                    source.diplomaName = fields.diplomaName;
                                }
                                teacherModel.saveDiploma(source, function (err, result) {
                                    diplomaController.errorHandler(err, res, true);
                                    res.json({
                                        success: true,
                                        message: "操作成功！"
                                    });
                                });
                            });
                    });
                }
            );
        };

        /**
         * 获取填写证书需要的专业、学段、证书类型列表，并存入memcache，过期时间为6小时
         * @param req
         * @param res
         */
        diplomaController.getAddDiplomaSubType = function (req, res) {
            var expireTime = 21600;
            var valid = checkType(req, res, true);
            logger.debug(valid);
            var renderView = function (result) {
                res.render(diplomaController.getView(valid.type), {
                    type: valid.type,
                    subList: result,
                    userIds: req.userIds
                });
            };
            var callback = function (err, result, inMem) {
                diplomaController.errorHandler(err, res);
                if (!inMem) {
                    memCache.putObject('DIPLOMA_SUB_TYPE_' + valid.type, result, expireTime, function (err) {
                        diplomaController.errorHandler(err, res);
                        renderView(result);
                    });
                } else {
                    renderView(result);
                }
            };

            memCache.getObject('DIPLOMA_SUB_TYPE_' + valid.type, function (err, data) {
                logger.debug(err, data);
                diplomaController.errorHandler(err, res);
                if (data) {
                    callback(null, data, true);
                } else {
                    switch (valid.index) {
                        case 0:
                            teacherModel.getMajorList(callback);
                            break;
                        case 1:
                            teacherModel.getPeriodList(callback);
                            break;
                        case 2:
                            teacherModel.getCertTypeList(callback);
                            break;
                    }
                }
            });
        };

        /**
         * 根据证书id删除证书信息
         * @param req
         * @param res
         */
        diplomaController.deleteDiplomaById = function (req, res) {
            teacherModel.deleteDiplomaById({
                diplomaId: req.body.diplomaId
            }, function (err, result) {
                diplomaController.errorHandler(err, res, true);
                res.json({success: true, message: "操作成功！"});
            });
        };
        return diplomaController;
    }
};

module.exports = DiplomaController;