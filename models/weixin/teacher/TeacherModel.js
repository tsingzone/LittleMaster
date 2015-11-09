/**
 * Created by michel_feng on 15/10/22.
 */

var ProfileModel = require('./ProfileModel');
var UserModel = require('./UserModel');
var JobModel = require('./JobModel');
var ExperienceModel = require('./ExperienceModel');
var DiplomaModel = require('./DiplomaModel');

var TeacherModel = {
    createNew: function () {
        var teacherModel = {};
        var profileModel = ProfileModel.createNew();
        var jobModel = JobModel.createNew();
        var experienceModel = ExperienceModel.createNew();
        var diplomaModel = DiplomaModel.createNew();
        var userModel = UserModel.createNew();

        teacherModel.getWeiXinUserByUserId = userModel.getWeiXinUserByUserId;
        teacherModel.getWeiXinUserByOpenId = userModel.getWeiXinUserByOpenId;
        teacherModel.updateWeinXinUserByOpenId = userModel.updateWeinXinUserByOpenId;
        teacherModel.saveWeixinUser = userModel.saveWeixinUser;
        teacherModel.getUserIds = userModel.getUserIds;

        teacherModel.getUserCenterData = profileModel.getUserCenterData;
        teacherModel.getProfile = profileModel.getProfile;
        teacherModel.saveDefaultProfile = profileModel.saveDefaultProfile;
        teacherModel.saveProfile = profileModel.saveProfile;
        teacherModel.chageTeacherHeadImg = profileModel.chageTeacherHeadImg;
        teacherModel.getEducation = profileModel.getEducation;

        teacherModel.getSignJobs = jobModel.getSignJobs;
        teacherModel.getCollectJobs = jobModel.getCollectJobs;

        teacherModel.getDiplomaList = diplomaModel.getDiplomaList;
        teacherModel.saveDiploma = diplomaModel.saveDiploma;
        teacherModel.deleteDiplomaById = diplomaModel.deleteDiplomaById;
        teacherModel.getMajorList = diplomaModel.getMajorList;
        teacherModel.getPeriodList = diplomaModel.getPeriodList;
        teacherModel.getCertTypeList = diplomaModel.getCertTypeList;

        teacherModel.getExperienceList = experienceModel.getExperienceList;
        teacherModel.saveExperience = experienceModel.saveExperience;
        teacherModel.deleteExperienceById = experienceModel.deleteExperienceById;

        return teacherModel;
    }
};
module.exports = TeacherModel;
