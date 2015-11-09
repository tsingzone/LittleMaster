/**
 * Created by michel_feng on 15/10/21.
 */
var path = require('path');
var fs = require('fs');

var formidable = require('formidable');
var moment = require('moment');
var async = require('async');

var oss = require('../../../utils/Oss');
var Configs = require('../../../configs');
var ossconfig = Configs.getConfig().ossconfig;
var TeacherModel = require('../../../models/weixin/teacher/TeacherModel');

var ProfileController = require('./ProfileController');
var DiplomaController = require('./DiplomaController');
var ExperienceController = require('./ExperienceController');
var JobController = require('./JobController');
var UserController = require('./UserController');

var TeacherController = {
    createNew: function () {
        var teacherController = {};
        var teacherModel = TeacherModel.createNew();
        var profileController = ProfileController.createNew(teacherModel);
        var diplomaController = DiplomaController.createNew(teacherModel);
        var experienceController = ExperienceController.createNew(teacherModel);
        var jobController = JobController.createNew(teacherModel);
        var userController = UserController.createNew(teacherModel);

        teacherController.getWeiXinUserByUserId = userController.getWeiXinUserByUserId;
        teacherController.getWeiXinUserByOpenId = userController.getWeiXinUserByOpenId;
        teacherController.updateWeinXinUserByOpenId = userController.updateWeinXinUserByOpenId;
        teacherController.checkIsUserExistInDb = userController.checkIsUserExistInDb;
        teacherController.updateWeixinUser = userController.updateWeixinUser;
        teacherController.insertWeixinUser = userController.insertWeixinUser;
        teacherController.getUserIds = userController.getUserIds;

        teacherController.getUserCenterData = profileController.getUserCenterData;
        teacherController.getProfile = profileController.getProfile;
        teacherController.saveProfile = profileController.saveProfile;
        teacherController.uploadHeadImg = profileController.uploadHeadImg;
        teacherController.getProfileHead = profileController.getProfileHead;
        teacherController.getProfileMobile = profileController.getProfileMobile;
        teacherController.getCollege = profileController.getCollege;
        teacherController.getEducation = profileController.getEducation;

        teacherController.getSignJobs = jobController.getSignJobs;
        teacherController.getCollectJobs = jobController.getCollectJobs;

        teacherController.getDiploma = diplomaController.getDiplomaList;
        teacherController.getAddDiploma = diplomaController.getAddDiploma;
        teacherController.saveDiploma = diplomaController.saveDiploma;
        teacherController.getAddDiplomaSubType = diplomaController.getAddDiplomaSubType;
        teacherController.deleteDiplomaById = diplomaController.deleteDiplomaById;

        teacherController.getExperience = experienceController.getExperienceList;
        teacherController.getAddExperience = experienceController.getAddExperience;
        teacherController.saveExperience = experienceController.saveExperience;
        teacherController.deleteExperienceById = experienceController.deleteExperienceById;

        return teacherController;
    }
};

module.exports = TeacherController;
