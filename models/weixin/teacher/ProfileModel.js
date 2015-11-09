/**
 * Created by michel_feng on 15/11/6.
 */
var async = require('async');
var _ = require('underscore');

var DBUtils = require('../../../db_utils');

var ProfileModel = {
    createNew: function () {
        var profileModel = {};

        var queryDb = function queryDb(args, callback) {
            DBUtils.getDBConnection().query(args.sql, args.params, callback);
        };
        var dealWithData = function (callback) {
            return function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            };
        };

        var getFuncsArray = function (sqlArray) {
            return _.map(sqlArray, function (item) {
                return function (callback) {
                    queryDb(item, dealWithData(callback));
                };
            }, []);
        };

        var parallelFuncs = function (sqlArray, callback) {
            async.parallel(getFuncsArray(sqlArray),
                function (err, results) {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }
                    console.log(JSON.parse(JSON.stringify(results)));
                    callback(null, results);
                });
        };

        profileModel.getUserCenterData = function (source, callback) {
            var sqlArray = [
                {
                    // 获取微信信息
                    sql: 'select id, open_id as openId, nickname as nickName, head_img as headImg'
                    + ' from weixin_user '
                    + ' where id = ? and status <> -1;',
                    params: [source.userId]
                },
                {
                    // 获取简历完成度
                    sql: 'select weixin_user.mobile, teacher_infor.img_path, teacher_infor.`name`, teacher_infor.gender, '
                    + ' teacher_infor.birthday, teacher_infor.college, teacher_infor.majar, teacher_infor.education, '
                    + ' teacher_infor.entry_year, diploma.diplomaCount, experience.experienceCount '
                    + ' from teacher_infor '
                    + ' left join weixin_user '
                    + ' on weixin_user.id = teacher_infor.user_id'
                    + ' left join (select count(id) as diplomaCount, teacher_id from teacher_diploma where kind = 0) as diploma '
                    + ' on teacher_infor.id = diploma.teacher_id '
                    + ' left join (select count(id) as experienceCount, teacher_id from teacher_experience) experience '
                    + ' on teacher_infor.id = experience.teacher_id '
                    + ' where teacher_infor.user_id = ?',
                    params: [source.userId]
                },
                {
                    // 获取已报名兼职数
                    sql: 'select ifnull(count(teacher_sign.id), 0) as signCount'
                    + ' FROM teacher_sign '
                    + ' left join company_job '
                    + ' on teacher_sign.job_id = company_job.id '
                    + ' left join sys_position '
                    + ' on sys_position.id = company_job.position_id '
                    + ' left join sys_sallary_type '
                    + ' on sys_sallary_type.id = company_job.sallary_type '
                    + ' left join sys_settlement '
                    + ' on sys_settlement.id = company_job.settlement_id '
                    + ' where teacher_sign.teacher_id = ? '
                    + ' and company_job.`status` <> -1 '
                    + ' and teacher_sign.`status` <> -1 '
                    + ' and teacher_sign.progress <> 0 ',
                    params: [source.teacherId]
                },
                {
                    // 获取已收藏兼职数
                    sql: 'select  ifnull(count(teacher_sign.id), 0) as collectCount '
                    + ' FROM teacher_sign '
                    + ' left join company_job '
                    + ' on teacher_sign.job_id = company_job.id '
                    + ' left join sys_position '
                    + ' on sys_position.id = company_job.position_id '
                    + ' left join sys_sallary_type '
                    + ' on sys_sallary_type.id = company_job.sallary_type '
                    + ' left join sys_settlement '
                    + ' on sys_settlement.id = company_job.settlement_id '
                    + ' where teacher_sign.teacher_id = ? '
                    + ' and company_job.`status` <> -1 '
                    + ' and teacher_sign.`status` <> -1 '
                    + ' and teacher_sign.progress = 0 '
                    + ' and teacher_sign.collection = 1 ',
                    params: [source.teacherId]
                }
            ];
            parallelFuncs(sqlArray, callback);
        };
        profileModel.getProfile = function (source, callback) {
            console.log(source);
            var sql = "select id from teacher_infor "
                + " where user_id = ?";
            DBUtils.getDBConnection().query(sql, [source.userId], function (err, result) {
                if (err) {
                    console.log(err);
                }
                var searchFunc = function () {
                    var sqlArray = [
                        {
                            sql: 'select teacher_infor.id, weixin_user.id as userId, weixin_user.open_id as openId, weixin_user.mobile, '
                            + ' teacher_infor.img_path as headImg, teacher_infor.`name`, teacher_infor.gender, teacher_infor.birthday, '
                            + ' teacher_infor.college, teacher_infor.majar, teacher_infor.education, teacher_infor.entry_year as entryYear '
                            + ' from teacher_infor '
                            + ' left join weixin_user on teacher_infor.user_id = weixin_user.id '
                            + ' where teacher_infor.user_id = ?',
                            params: [source.userId]
                        },
                        {
                            sql: 'select teacherId, kind, kindCount '
                            + ' from '
                            + ' (select teacher_id as teacherId, kind, count(kind) as kindCount from teacher_experience '
                            + ' where status = 1 '
                            + ' group by teacher_id, kind  ) experience '
                            + ' where experience.teacherId = ?',
                            params: [source.teacherId]
                        },
                        {
                            sql: 'select teacherId, kind, kindCount '
                            + ' from '
                            + ' ( select teacher_id as teacherId, kind, count(kind) as kindCount from teacher_diploma '
                            + ' where status = 1 '
                            + ' group by teacher_id, kind) diploma '
                            + ' where diploma.teacherId = ?',
                            params: [source.teacherId]
                        }
                    ];
                    parallelFuncs(sqlArray, function (err, result) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log(result);
                        callback(null, result);
                    });
                };
                if (result.length !== 0) {
                    searchFunc();
                } else {
                    sql = "insert into teacher_infor(" +
                        " user_id, open_id, name, gender, img_path, birthday, college, majar, " +
                        " education, entry_year, add_time, update_time" +
                        " ) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    var now = new Date();
                    DBUtils.getDBConnection().query(sql,
                        [source.userId, source.openId, "", 0, "", now, "", "", "", "", now, now],
                        function (err, result) {
                            if (err) {
                                return console.log(err);
                            }
                            source.teacherId = result.insertId;
                            searchFunc();
                        });
                }
            });
        };
        profileModel.saveProfile = function (source, callback) {
            var teacher = JSON.parse(source);
            console.log(teacher);
            var sql = "update teacher_infor set " +
                "name=?, " +
                "gender=?, " +
                "birthday=?, " +
                "college=?, " +
                "majar=?, " +
                "education=?, " +
                "entry_year=?, " +
                "update_time=? " +
                " where id = ? ";
            DBUtils.getDBConnection().query(sql, [
                teacher["name"],
                teacher["gender"],
                teacher["birthday"],
                teacher["college"],
                teacher.major,
                teacher.education,
                teacher.entryYear,
                new Date(),
                teacher.id
            ], function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                callback(null, result);
            });
        };
        profileModel.chageTeacherHeadImg = function (source, callback) {
            var sql = "update teacher_infor set img_path = ? " +
                " where id = ?";
            DBUtils.getDBConnection().query(sql, [source.imgPath, source.teacherId], callback);
        };
        profileModel.getEducation = function (callback) {
            var sql = 'select id, name from sys_education where status = 1';
            DBUtils.getDBConnection().query(sql, [], callback);
        };
        profileModel.searchCollege = function (source, callback) {
            var sql = 'select id, name from sys_college where name like ? or province = ? limit 10';
            DBUtils.getDBConnection().query(sql, ['%' + source.searchText + '%', source.searchText], callback);
        };

        return profileModel;
    }
};

module.exports = ProfileModel;