/**
 * Created by michel_feng on 15/11/6.
 */
var _ = require('underscore');

var BaseModel = require('./BaseModel');

var ProfileModel = {
    createNew: function () {
        var profileModel = BaseModel.createNew();

        /**
         * 根据userId获取用于计算简历填写比例的数据，包括简历基本信息、经历数量和证书数量
         * @param userId
         * @param callback
         */
        profileModel.getProfilePercentage = function (userId, callback) {
            var sql = 'select weixin_user.mobile, teacher_infor.img_path, teacher_infor.`name`, teacher_infor.gender, '
                + ' teacher_infor.birthday, teacher_infor.college, teacher_infor.majar, teacher_infor.education, '
                + ' teacher_infor.entry_year, diploma.diplomaCount, experience.experienceCount '
                + ' from teacher_infor '
                + ' left join weixin_user '
                + ' on weixin_user.id = teacher_infor.user_id'
                + ' left join (select count(id) as diplomaCount, teacher_id from teacher_diploma where kind = 0) as diploma '
                + ' on teacher_infor.id = diploma.teacher_id '
                + ' left join (select count(id) as experienceCount, teacher_id from teacher_experience) experience '
                + ' on teacher_infor.id = experience.teacher_id '
                + ' where teacher_infor.user_id = ?';
            profileModel.queryDb({
                sql: sql,
                params: [userId]
            }, callback);
        };

        /**
         * 根据userId获取教师简历的基本信息
         * @param userId
         * @param callback
         */
        profileModel.getProfileBaseInfoByUserId = function (userId, callback) {
            var sql = 'select teacher_infor.id, weixin_user.id as userId, weixin_user.open_id as openId, weixin_user.mobile, '
                + ' teacher_infor.img_path as headImg, teacher_infor.`name`, teacher_infor.gender, teacher_infor.birthday, '
                + ' teacher_infor.college, teacher_infor.majar, teacher_infor.education, teacher_infor.entry_year as entryYear '
                + ' from teacher_infor '
                + ' left join weixin_user on teacher_infor.user_id = weixin_user.id '
                + ' where teacher_infor.user_id = ?';
            profileModel.queryDb({
                sql: sql,
                params: [userId]
            }, callback);
        };

        /**
         * 添加空的教师简历信息
         * @param source
         * @param callback
         */
        profileModel.insertDefaultProfile = function (source, callback) {
            var sql = 'insert into teacher_infor( '
                + ' user_id, open_id, name, gender, img_path, birthday, college, majar, '
                + ' education, entry_year, add_time, update_time '
                + ' ) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';
            profileModel.queryDb({
                sql: sql,
                params: [source.userId, source.openId, '', 0, '', now, '', '', '', '', now, now]
            }, callback);
        };

        /**
         * 更新教师简历信息
         * @param source
         * @param callback
         */
        profileModel.saveProfile = function (source, callback) {
            var teacher = JSON.parse(source);
            var sql = 'update teacher_infor set ' +
                'name=?, ' +
                'gender=?, ' +
                'birthday=?, ' +
                'college=?, ' +
                'majar=?, ' +
                'education=?, ' +
                'entry_year=?, ' +
                'update_time=? ' +
                ' where id = ? ';
            profileModel.queryDb({
                sql: sql,
                params: [
                    teacher.name,
                    teacher.gender,
                    teacher.birthday,
                    teacher.college,
                    teacher.major,
                    teacher.education,
                    teacher.entryYear,
                    new Date(),
                    teacher.id
                ]
            }, callback);
        };

        /**
         * 根据教师id修改简历头像路径
         * @param source
         * @param callback
         */
        profileModel.chageTeacherHeadImg = function (source, callback) {
            var sql = 'update teacher_infor set img_path = ? ' +
                ' where id = ?';
            profileModel.queryDb({
                sql: sql,
                params: [source.imgPath, source.teacherId]
            }, callback);
        };

        return profileModel;
    }
};

module.exports = ProfileModel;