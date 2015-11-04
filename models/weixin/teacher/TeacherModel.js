/**
 * Created by michel_feng on 15/10/22.
 */
var _ = require('underscore');
var async = require('async');

var DBUtils = require('../../../db_utils');

var teacher = function TeacherModel() {
    this.name = 'TeacherModel';
};
module.exports = teacher;

_.extend(teacher.prototype, {
    getUserCenterData: function (source, callback) {
        var sqlArray = [
            {
                // 获取微信信息
                sql: 'select id, open_id as openId, nickname as nickName, head_img as headImg'
                + ' from weixin_user '
                + ' where id = ? and status = 1;',
                params: [source.userId]
            },
            {
                // 获取简历完成度
                sql: 'select teacher_infor.img_path, teacher_infor.`name`, teacher_infor.gender, '
                + ' teacher_infor.birthday, teacher_infor.college, teacher_infor.majar, teacher_infor.education, '
                + ' teacher_infor.entry_year, diploma.diplomaCount, experience.experienceCount '
                + ' from teacher_infor '
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
    },
    getProfile: function (source, callback) {
        // TODO: 检查简历是否存在
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
                        + ' where teacher_infor.id = ?',
                        params: [source.teacherId]
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
                parallelFuncs(sqlArray, callback);
            };
            if (result.length !== 0) {
                searchFunc();
            } else {
                sql = "insert into teacher_infor(" +
                    "user_id, open_id, name, gender, img_path, birthday, college, majar, " +
                    "education, entry_year, add_time, update_time" +
                    ") values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
    },
    saveProfile: function (source, callback) {
        var teacher = JSON.parse(source);
        console.log(teacher.name);
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
        ], callback);
    },
    chageTeacherHeadImg: function (source, callback) {
        var sql = "update teacher_infor set img_path = ? " +
            " where id = ?";
        DBUtils.getDBConnection().query(sql, [source.imgPath, source.teacherId], callback);
    },
    getEducation: function (callback) {
        var sql = 'select id, name from sys_education where status = 1';
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    searchCollege: function (source, callback) {
        var sql = 'select id, name from sys_college where name like ? or province = ? limit 10';
        DBUtils.getDBConnection().query(sql, ['%' + source.searchText + '%', source.searchText], callback);
    },
    getSignJobs: function (source, callback) {
        var sql = 'select teacher_sign.id as id, teacher_sign.teacher_id as teacherId, company_job.title as title, '
            + ' sys_position.`name` as position, company_job.start_time as startTime, company_job.end_time as endTime, '
            + ' company_job.gender as gender, company_job.sallary as sallary, sys_sallary_type.`name` as sallaryType, '
            + ' sys_settlement.name as settlement, company_job.address '
            + ' FROM teacher_sign '
            + ' left join company_job on teacher_sign.job_id = company_job.id '
            + ' left join sys_position on sys_position.id = company_job.position_id '
            + ' left join sys_sallary_type on sys_sallary_type.id = company_job.sallary_type '
            + ' left join sys_settlement on sys_settlement.id = company_job.settlement_id '
            + ' where teacher_sign.teacher_id = ?';
        DBUtils.getDBConnection().query(sql, [source.teacherId], callback);
    },
    getCollectJobs: function (source, callback) {
        var sql = '\
        select \
            teacher_sign.id as id,\
            teacher_sign.teacher_id as teacherId, \
            company_job.title as title,\
            sys_position.`name` as position,\
            company_job.start_time as startTime,\
            company_job.end_time as endTime,\
            company_job.gender as gender,\
            company_job.sallary as sallary,\
            sys_sallary_type.`name` as sallaryType,\
            sys_settlement.name as settlement,\
            company_job.address\
        FROM teacher_sign\
        left join company_job\
        on teacher_sign.job_id = company_job.id\
        left join sys_position\
        on sys_position.id = company_job.position_id\
        left join sys_sallary_type\
        on sys_sallary_type.id = company_job.sallary_type\
        left join sys_settlement\
        on sys_settlement.id = company_job.settlement_id\
        where teacher_sign.teacher_id = ?';
        DBUtils.getDBConnection().query(sql, [source.teacherId], callback);
    },
    getDiploma: function (source, callback) {
        var sql = 'select '
            + ' teacher_diploma.id as id, teacher_diploma.teacher_id as teacherId, '
            + ' teacher_diploma.number as number, teacher_diploma.achieve_time as achieveTime, '
            + ' sys_diploma.name as diplomaName, teacher_diploma.period as period, '
            + ' teacher_diploma.major as major, teacher_diploma.img_path as imgPath '
            + ' from teacher_diploma '
            + ' left join sys_diploma '
            + ' on sys_diploma.id = teacher_diploma.diploma_id '
            + ' where '
            + ' teacher_id = ? '
            + ' and teacher_diploma.kind = ? '
            + ' and teacher_diploma.status = 1 '
            + ' and sys_diploma.status = 1';
        DBUtils.getDBConnection().query(sql, [source.teacherId, source.kind], callback);
    },
    saveDiploma: function (source, callback) {
        var sql = 'insert into teacher_diploma( '
            + ' teacher_id, diploma_id, diploma_name, number, achieve_time, period, major, img_path, status, kind'
            + ' )'
            + ' values ('
            + ' ?, ?, ?, ?, ?, ?, ?, ?, ?, ?'
            + ' )';
        DBUtils.getDBConnection().query(sql, [source.teacherId,
            source.diplomaId, source.diplomaName, source.number,
            source.achieveDate, source.period, source.major, source.imgPath,
            1, source.kind], callback);
    },
    deleteDiploma: function (source, callback) {
        var sql = 'update teacher_diploma set status = -1 where id = ?';
        DBUtils.getDBConnection().query(sql, [source.diplomaId], callback);
    },
    getMajorList: function (callback) {
        var sql = 'select id, name from sys_major where status = 1';
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    getPeriodList: function (callback) {
        var sql = 'select id, name from sys_period where status = 1';
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    getCertTypeList: function (callback) {
        var sql = 'select id, name from sys_diploma where status = 1 and id > 1';
        DBUtils.getDBConnection().query(sql, [], callback);
    },
    getExperienceList: function (source, callback) {
        var sql = 'select id, teacher_id as teacherId, title, start_time as startTime, end_time as endTime, description, kind '
            + ' from teacher_experience'
            + ' where teacher_id = ? '
            + ' and kind = ? '
            + ' and status = 1 ';
        DBUtils.getDBConnection().query(sql, [source.teacherId, source.kind], callback);
    },
    saveExperience: function (experience, callback) {
        var sql = "insert into teacher_experience(" +
            " teacher_id, title, start_time, end_time, description, kind, status)" +
            " values(?, ?, ?, ?, ?, ?, ?)";
        DBUtils.getDBConnection().query(sql, [
            experience.teacherId,
            experience.title,
            experience.startTime,
            experience.endTime,
            experience.description,
            experience.kind,
            experience.status
        ], callback);
    },
    deleteExperience: function (source, callback) {
        var sql = 'update teacher_experience set status = -1 where id = ?';
        DBUtils.getDBConnection().query(sql, [source.experienceId], callback);
    }
});

var queryDb = function queryDb(args, callback) {
    DBUtils.getDBConnection().query(args.sql, args.params, callback);
};
var dealWithData = function (callback) {
    return function (err, result) {
        if (err) {

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