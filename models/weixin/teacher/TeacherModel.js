/**
 * Created by michel_feng on 15/10/22.
 */

var ProfileModel = require('./ProfileModel');
var UserModel = require('./UserModel');
var JobModel = require('./JobModel');
var ExperienceModel = require('./ExperienceModel');
var DiplomaModel = require('./DiplomaModel');
var CommonModel = require('./CommonModel');
var BaseModel = require('./BaseModel');

var TeacherModel = {
    createNew: function () {
        var teacherModel = {};
        var profileModel = ProfileModel.createNew();
        var jobModel = JobModel.createNew();
        var experienceModel = ExperienceModel.createNew();
        var diplomaModel = DiplomaModel.createNew();
        var userModel = UserModel.createNew();
        var commonModel = CommonModel.createNew();
        var baseModel = BaseModel.createNew();

        teacherModel.getWeiXinBaseUserInfo = baseModel.getWeiXinBaseUserInfo;
        teacherModel.getUserIds = baseModel.getUserIds;

        teacherModel.getWeiXinUser = userModel.getWeiXinUser;
        teacherModel.updateWeinXinUserByOpenId = userModel.updateWeinXinUserByOpenId;
        teacherModel.saveWeixinUser = userModel.saveWeixinUser;
        teacherModel.changeMobile = userModel.changeMobile;

        teacherModel.getProfilePercentage = profileModel.getProfilePercentage;
        teacherModel.getProfileBaseInfoByUserId = profileModel.getProfileBaseInfoByUserId;
        teacherModel.insertDefaultProfile = profileModel.insertDefaultProfile;
        teacherModel.saveProfile = profileModel.saveProfile;
        teacherModel.chageTeacherHeadImg = profileModel.chageTeacherHeadImg;

        teacherModel.getSignJobs = jobModel.getSignJobs;
        teacherModel.getSignJobsCount = jobModel.getSignJobsCount;
        teacherModel.getCollectJobs = jobModel.getCollectJobs;
        teacherModel.getCollectJobsCount = jobModel.getCollectJobsCount;

        teacherModel.getDiplomaList = diplomaModel.getDiplomaList;
        teacherModel.saveDiploma = diplomaModel.saveDiploma;
        teacherModel.deleteDiplomaById = diplomaModel.deleteDiplomaById;
        teacherModel.getDiplomaCount = diplomaModel.getDiplomaCount;

        teacherModel.getExperienceList = experienceModel.getExperienceList;
        teacherModel.saveExperience = experienceModel.saveExperience;
        teacherModel.deleteExperienceById = experienceModel.deleteExperienceById;
        teacherModel.getExperienceCount = experienceModel.getExperienceCount;

        teacherModel.getEducationList = commonModel.getEducationList;
        teacherModel.getMajorList = commonModel.getMajorList;
        teacherModel.getPeriodList = commonModel.getPeriodList;
        teacherModel.getCertTypeList = commonModel.getCertTypeList;

        return teacherModel;
    }
};
module.exports = TeacherModel;
